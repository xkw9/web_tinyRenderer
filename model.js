import { Vec2, Vec3, Mat4 } from './math/math.js';
import { TriangleFace } from './math/geometry.js';
import { Color } from './math/color.js';

class Model {

    textures = new Array(10);
    textureCnt = 0;

    vertices = [];
    normals = [];
    uvs = [];
    faces = [];

    shader;

    /**
     *  Construct a model from an .obj file
     * @param {String} objFile
     */
    constructor(objFile) {
        this.objFile = objFile;
        this.rootPath = objFile.substring(0, objFile.lastIndexOf('/') + 1);

    }

    set(objFile) {
        this.objFile = objFile;
        this.rootPath = objFile.substring(0, objFile.lastIndexOf('/') + 1);
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.faces = [];
        this.textures = new Array(10);
        this.textureCnt = 0;
    }

    async load() {

        let data = await fetch(this.objFile)
            .then(response => response.text())
            .catch(error => {
                console.error(`Failed to load OBJ file: ${this.objFile}`, error);
                return null;
            });
        
        await this.parseObjFile(data);

    }

    async parseObjFile(objFileContent) {
        
        let lines = objFileContent.split('\n');
        

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#') || line.length === 0) continue; // Skip comments and empty lines

            let parts = line.split(' ');
            let command = parts[0];

            switch (command) {
                case 'v':   /* vertex coords */
                    this.vertices.push(new Vec3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                    break;
                case 'vn':  /*   vertex normal   */
                    this.normals.push(new Vec3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])).normalize());
                    break;
                case 'vt':  /*   vertex uv   */
                    this.uvs.push(new Vec2(parseFloat(parts[1]), parseFloat(parts[2])));
                    break;
                case 'f':   /*      face     */
                    let vertexIndices = [];
                    let uvIndices = [];
                    let normalIndices = [];
                    for (let i = 1; i < parts.length; i++) {
                        let vertexData = parts[i].split('/');
                        let vertexIndex = parseInt(vertexData[0]) - 1; // OBJ indices are 1-based
                        vertexIndices.push(vertexIndex);

                        let uvIndex = parseInt(vertexData[1]) - 1;
                        uvIndices.push(uvIndex);

                        let normalIndex = parseInt(vertexData[2]) - 1;
                        normalIndices.push(normalIndex);
                    }

                    if (vertexIndices.length === 3) {
                        
                        let v0 = this.vertices[vertexIndices[0]];
                        let v1 = this.vertices[vertexIndices[1]];
                        let v2 = this.vertices[vertexIndices[2]];
                        let uv0 = this.uvs[uvIndices[0]];
                        let uv1 = this.uvs[uvIndices[1]];
                        let uv2 = this.uvs[uvIndices[2]];
                        let [t0, t1, t2] = [this.normals[normalIndices[0]], 
                                            this.normals[normalIndices[1]], 
                                            this.normals[normalIndices[2]]];

                        this.faces.push(new TriangleFace(v0.toVec4(), v1.toVec4(), v2.toVec4(),
                                                          uv0, uv1, uv2, t0, t1, t2, this.textureCnt - 1));
                    
                    }

                    break;
                case 'usemtl': /* material */
                    // load material
                    await this.loadTexture(this.rootPath + parts[1] + '.png', this.textureCnt++);
                    break;
                default:
                    break;
                    // console.warn(`Unknown command: ${command}`);
            }
        }
    
    }

    async loadTexture(textureFile, textureId) {
        // Load texture from file
        let blob = await fetch(textureFile)
            .then(response => response.blob());
        
        let img = await new Promise((resolve, reject) => {
            let img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => resolve(img);
            img.onerror = (error) => {
                console.error(`Failed to load texture: ${textureFile}`, error);
                reject(error);
            };
        });

        const canvas = new OffscreenCanvas(img.width, img.height);
        canvas.width = canvas.width;
        canvas.height = canvas.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        this.textures[textureId] = new Texture(imageData.data, canvas.width, canvas.height);

    }

    vertexCount() {
        return this.vertices.length;
    }

    faceCount() {
        return this.faces.length;
    }

    getFace(iface) {
        return this.faces[iface];
    }

    getUV(iface, ivertex) {
        return this.faces[iface].uv[ivertex];
    }

    getNormal(iface, ivertex) {
        return this.faces[iface].t[ivertex];
    }

    transform(matrix) {
        this.modelMatrix = matrix;
    }

    sampleTexture(uv, iface) {

        if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1) {

            return Color.Black; // Out of bounds
        }

        // Bilinear interpolation
        // let x0 = Math.floor(x);
        // let y0 = Math.floor(y);
        // let x1 = Math.ceil(x);
        // let y1 = Math.ceil(y);
        // let u = x - x0;
        // let v = y - y0;

        // let c00 = this.getTextureColor(x0, y0);
        // let c01 = this.getTextureColor(x0, y1);
        // let c10 = this.getTextureColor(x1, y0);
        // let c11 = this.getTextureColor(x1, y1);
        // let c0 = Color.lerp(c00, c10, u);
        // let c1 = Color.lerp(c01, c11, u);
        // return Color.lerp(c0, c1, v);

        return this.textures[this.faces[iface].imtl].getColor(uv.x, uv.y);
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    // getTextureColor(x, y) {
    //     let index = (y * this.textureWidth + x) * 4;
    //     return new Color (
    //         this.textureData[index],
    //         this.textureData[index + 1],
    //         this.textureData[index + 2],
    //         this.textureData[index + 3]
    //     );
    // }
    
    getShader() {
        return this.shader;
    }

    setShader(shader) {
        this.shader = shader;
    }

}

class Texture {
    
    constructor(textureData, width, height) {
        this.textureData = textureData;
        this.width = width;
        this.height = height;
    }

    getColor(u, v) {

        let x = u * this.width;
        let y = (1 - v) * this.height;

        x = Math.floor(x);
        y = Math.floor(y);

        let index = (y * this.width + x) * 4;
        return new Color (
            this.textureData[index],
            this.textureData[index + 1],
            this.textureData[index + 2],
            this.textureData[index + 3]
        );
    }
}

export { Model };