import { Camera } from "./camera.js";
import { Color } from "./math/color.js";
import { Mat4, Vec3, Vec4, Vec2 } from "./math/math.js";
import { Model } from "./model.js";
import { Scene } from "./scene.js";

class Shader {

    scene;
    model;
    rederer;

    // Uniform constant is wriiten in updateUniform
    /**
     * @type {Mat4}
     */
    Uni_ModelMat;
    /**
     * @type {Mat4}
     */
    Uni_ViewMat;
    /**
     * @type {Mat4}
     */
    Uni_ProjectionMat;
    /**
     * @type {Mat4}
     */
    Uni_ViewPortMat;
    /**
     * @type {Mat4}
     */
    Uni_MVP;
    /**
     * @type {Mat4}
     */
    Uni_MVPViewPort;

    Var_Vertex_World = new Array(3);    // written in the vertex shader
    Var_Vertex_Screen = new Array(3);  // written in the vertex shader
    Var_UV = new Array(3);            // written in the vertex shader
    Var_Normal = new Array(3);       // written in the vertex shader

    /**
     * @param {Scene} scene - the scene to be rendered
     * @param {Model} model - the model to be rendered
     */
    constructor(scene, model, renderer) {
        this.scene = scene;
        this.model = model;
        this.renderer = renderer;
    }

    /**
     * Called once a frame by renderer
     */
    updateUniforms() {

        this.Uni_ModelMat = this.model.modelMatrix;
        this.Uni_ViewMat = this.scene.camera.viewMatrix();
        this.Uni_ProjectionMat = this.scene.camera.projectionMatrix();
        this.Uni_ViewPortMat = this.scene.camera.viewportMatrix();

        this.Uni_MVP = this.Uni_ProjectionMat.multiply(this.Uni_ViewMat).multiply(this.Uni_ModelMat);
        this.Uni_MVPViewPort = this.Uni_ViewPortMat.multiply(this.Uni_MVP);
    }

    /**
     * @param {number} iface the index of the face
     * @param {number} ivertex the index of the vertex in the triangle [0, 1, 2]
     * @param {Vec4} coords the coordinates of the vertex from the model space
     * @returns {Vec4} the coordinates of the vertex in the screen space, presented by vec4
     */
    vertex(iface, ivertex, coords) {

        // Transform the vertex coordinates from model space to screen space
        /*
            model space --[ModelMat]--> world space --[ViewMat]--> camera space 
                --[ProjectionMat]--> clip space --[ViewportMat]--> screen space 
        */
        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        
        return transformedCoords;
    }

    /**
     * @param {Vec3} baryCentric the barycentric coordinates of the point in the triangle, from the world space
     * @param {Color} color the color of the vertex, should be written in the fragment shader
     * 
     * @returns {boolean} false if this pixel should be discarded, true if it should be drawn
     */
    fragment(baryCentric, color) {

        color.set(Color.Blue);
        return true;

    }

}

class DepthShader extends Shader {

    /**
     * @param {number} iface
     * @param {number} ivertex
     * @param {Vec4} coords
     */
    vertex(iface, ivertex, coords) {
        
        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        this.Var_Vertex_Screen[ivertex] = transformedCoords;
        return transformedCoords;

    }

    /**
     * @param {Vec3} baryCentric
     * @param {Color} color
     */
    fragment(baryCentric, color) {
        // Interpolate the z value of the vertex based on the barycentric coordinates
        let z = -this.Var_Vertex_Screen[0].z * baryCentric.x +
                -this.Var_Vertex_Screen[1].z * baryCentric.y +
                -this.Var_Vertex_Screen[2].z * baryCentric.z;
        
        z = (1 - z);

        color.setRGBA(z * 255, z * 255, z * 255, 255);

        return true;
    }

}

class TextureShader extends Shader {


    Var_iface;
    /**
     * @param {number} iface
     * @param {number} ivertex
     * @param {Vec4} coords
     */
    vertex(iface, ivertex, coords) {
        
        this.Var_UV[ivertex] = this.model.getUV(iface, ivertex);
        this.Var_iface = iface;

        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        return transformedCoords;

    }

    /**
     * @param {Vec3} baryCentric
     * @param {Color} color
     */
    fragment(baryCentric, color) {

        // Interpolate uv
        let uv = this.Var_UV[0].multiply(baryCentric.x)
                .add(this.Var_UV[1].multiply(baryCentric.y))
                .add(this.Var_UV[2].multiply(baryCentric.z));

        color.set(this.model.sampleTexture(uv, this.Var_iface));

        return true;

    }

}

class GouradShader extends Shader {

    Uni_lightDir;

    Var_intensity = new Array(3);

    updateUniforms() {
        super.updateUniforms();
        this.Uni_lightDir = this.scene.lights[0].normalize();
    }

    /**
     * @param {number} iface
     * @param {number} ivertex
     * @param {Vec4} coords
     */
    vertex(iface, ivertex, coords) {

        //this.Var_UV[ivertex] = this.model.getUV(iface, ivertex);

        let transformedNormal = this.Uni_ModelMat.multiplyVec4(this.model.getNormal(iface, ivertex).toVec4(0)).truncToVec3();
        //let transformedNormal = this.model.getNormal(iface, ivertex);
        this.Var_intensity[ivertex] = Math.max(0, transformedNormal.normalize().dot(this.Uni_lightDir));
        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        return transformedCoords;
    
    }

    /**
     * @param {Vec3} baryCentric
     * @param {Color} color
     */
    fragment(baryCentric, color) {
    
        // Interpolate the intensity of the vertex based on the barycentric coordinates
        let intensity = this.Var_intensity[0] * baryCentric.x +
                        this.Var_intensity[1] * baryCentric.y +
                        this.Var_intensity[2] * baryCentric.z;
        
        // if (intensity < 0.2) {
        //     intensity = 0.3;
        // } else if (intensity < 0.4) {
        //     intensity = 0.5;
        // } else if (intensity < 0.6) {
        //     intensity = 0.7;
        // } else if (intensity < 0.8) {
        //     intensity = 0.9;
        // } else {
        //     intensity = 1;
        // }

        // if (intensity < 0.3) {
        //     intensity = 0.3;
        // }

        // let uv = this.Var_UV[0].multiply(baryCentric.x)
        //         .add(this.Var_UV[1].multiply(baryCentric.y))
        //         .add(this.Var_UV[2].multiply(baryCentric.z));

        // color.set(this.model.sampleTexture(uv));

        color.setRGBA(intensity * 255, intensity * 255, intensity * 255, 255);
        return true;

    }

}

class PhongShader extends Shader {

    /** @type {Vec3} */
    Uni_lightDir;

    /** @type {Vec3} */
    Uni_eyePos;

    Uni_specular_intensity;

    Var_intensity = new Array(3);

    Var_iface;

    updateUniforms() {
        super.updateUniforms();
        this.Uni_lightDir = this.scene.lights[0].normalize();
        this.Uni_eyePos = this.scene.camera.position;
    }

    vertex(iface, ivertex, coords) {

        let world_coords = this.Uni_ModelMat.multiplyVec4(coords).truncToVec3();
        this.Var_Vertex_World[ivertex] = world_coords; 
        
        let transformedNormal = this.Uni_ModelMat.multiplyVec4(this.model.getNormal(iface, ivertex).toVec4(0)).truncToVec3().normalize();

        this.Var_Normal[ivertex] = transformedNormal;
        //this.Var_intensity[ivertex] = Math.max(0, transformedNormal.normalize().dot(this.Uni_lightDir));
        
        this.Var_UV[ivertex] = this.model.getUV(iface, ivertex);
        this.Var_iface = iface;
        
        this.Uni_specular_intensity = this.renderer.specular_intensity;

        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        return transformedCoords;
    }

    fragment(baryCentric, color) {

        // interpolate eyeDir
        let eyeDir = this.Var_Vertex_World[0].multiply(baryCentric.x)
                    .add((this.Var_Vertex_World[1]).multiply(baryCentric.y))
                    .add((this.Var_Vertex_World[2]).multiply(baryCentric.z))
                    .sub((this.Uni_eyePos).multiply(-1).normalize());
        
        // interpolate normal
        let normal = this.Var_Normal[0].multiply(baryCentric.x)
                    .add((this.Var_Normal[1]).multiply(baryCentric.y))
                    .add((this.Var_Normal[2]).multiply(baryCentric.z)).normalize()
        
        // interpolate uv
        let uv = this.Var_UV[0].multiply(baryCentric.x)
                .add(this.Var_UV[1].multiply(baryCentric.y))
                .add(this.Var_UV[2].multiply(baryCentric.z));

        
        let half = eyeDir.add(this.Uni_lightDir).normalize()

        let ambience = 0.3
        let diffuse = Math.max(0, normal.dot(this.Uni_lightDir));

        let specular = Math.max(0, normal.dot(half));

        specular = Math.pow(specular, this.Uni_specular_intensity);

        let factor = Math.min(1, ambience + diffuse * 0.5 + specular);
        
        color.set(this.model.sampleTexture(uv, this.Var_iface));
        color.setRGBA(factor * color.r, factor * color.g, factor * color.b, 255);

        return true;

    }
}

class TextureWithShadowShader extends TextureShader {  
    
    Uni_eyePos;
    Uni_lightDir;
    Uni_lightDirInverse;
    Uni_lightPos;
    
    Uni_Screen_to_Shadow;

    Uni_Shaow_Z_Bias;
    Uni_specular_intensity;

    updateUniforms() {
        super.updateUniforms();
        this.Uni_lightDir = this.scene.lights[0].multiply(-1).normalize();
        this.Uni_lightDirInverse = this.Uni_lightDir.multiply(-1);
        this.Uni_lightPos = this.scene.lights[0];

        /** @type {Camera} */
        const shadowCamera = this.renderer.shadowCamera;
        const shadow_ViewMat = shadowCamera.viewMatrix();
        const shadow_ProjectionMat = shadowCamera.projectionMatrix();

        const ShadowMVPViewPort = this.Uni_ViewPortMat.multiply(
                        shadow_ProjectionMat.multiply(shadow_ViewMat).multiply(this.Uni_ModelMat));
        
        this.Uni_Screen_to_Shadow = ShadowMVPViewPort.multiply(this.Uni_MVPViewPort.inverse());

        this.Uni_eyePos = this.scene.camera.position;
        this.Uni_Shaow_Z_Bias = this.renderer.shadow_z_bias;
        this.Uni_specular_intensity = this.renderer.specular_intensity;

    }

    vertex(iface, ivertex, coords) {        

        this.Var_UV[ivertex] = this.model.getUV(iface, ivertex);
        this.Var_iface = iface;
        
        let world_coords = this.Uni_ModelMat.multiplyVec4(coords).truncToVec3();
        this.Var_Vertex_World[ivertex] = world_coords; 
        
        let transformedNormal = this.Uni_ModelMat.multiplyVec4(this.model.getNormal(iface, ivertex).toVec4(0)).truncToVec3().normalize();
        this.Var_Normal[ivertex] = transformedNormal;
        
        let transformedCoords = this.Uni_MVPViewPort.multiplyVec4(coords);
        this.Var_Vertex_Screen[ivertex] = transformedCoords;
        return transformedCoords;

    }

    fragment(baryCentric, color) {

        // interpolate uv
        let uv = this.Var_UV[0].multiply(baryCentric.x)
                .add(this.Var_UV[1].multiply(baryCentric.y))
                .add(this.Var_UV[2].multiply(baryCentric.z));

        color.set(this.model.sampleTexture(uv, this.Var_iface));

        // interpolate screen coords
        let screen_coords = this.Var_Vertex_Screen[0].multiply(baryCentric.x)
                        .add(this.Var_Vertex_Screen[1].multiply(baryCentric.y))
                        .add(this.Var_Vertex_Screen[2].multiply(baryCentric.z));
        
        // transform to shadow space
        let shadow_coords = this.Uni_Screen_to_Shadow.multiplyVec4(screen_coords).toVec3();

        let shadow_z = shadow_coords.z;
        let shadow_x = Math.floor(shadow_coords.x);
        let shadow_y = Math.floor(shadow_coords.y);

        // Check if the this pixel is in the shadow
        let shadow = this.renderer.shadowBuffer[shadow_x + shadow_y * this.renderer.canvasWidth] > shadow_z + this.Uni_Shaow_Z_Bias;
        let ambience = 0.3;

        if (shadow) {
            // in shadow, set the color with ambience
            color.setRGBA(color.r * ambience, color.g * ambience, color.b * ambience, 255);
            return true;
        }

        // not in shadow, set the color same as the phong shader

        // interpolate eyeDir
        let eyeDir = this.Var_Vertex_World[0].multiply(baryCentric.x)
                    .add((this.Var_Vertex_World[1]).multiply(baryCentric.y))
                    .add((this.Var_Vertex_World[2]).multiply(baryCentric.z))
                    .sub((this.Uni_eyePos).multiply(-1).normalize());
        
        // interpolate normal
        let normal = this.Var_Normal[0].multiply(baryCentric.x)
                    .add((this.Var_Normal[1]).multiply(baryCentric.y))
                    .add((this.Var_Normal[2]).multiply(baryCentric.z)).normalize()

        let half = eyeDir.add(this.Uni_lightDirInverse).normalize()

        let diffuse = Math.max(0, normal.dot(this.Uni_lightDirInverse));

        let specular = Math.max(0, normal.dot(half));

        specular = Math.pow(specular, this.Uni_specular_intensity);

        let factor = Math.min(1, ambience + diffuse * 0.5 + specular);

        color.setRGBA(color.r * factor, color.g * factor, color.b * factor, 255);
        //color.setRGBA(shadow * 255, shadow * 255, shadow * 255, 255);
        return true;

    }

}


export { Shader, DepthShader, TextureShader as PlainTextureShader, GouradShader, PhongShader, TextureWithShadowShader };