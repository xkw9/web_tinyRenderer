'use strict';
// @ts-check

import { Color } from "./math/color.js";
import { Vec4, Vec3 } from "./math/math.js";
import { Triangle, TriangleFace } from "./math/geometry.js";
import { Scene } from "./scene.js";
import { Model } from "./model.js";
import { Camera } from "./camera.js";
import { DepthShader, GouradShader, Shader, PlainTextureShader } from "./shader.js";

export { TinyRenderer };

class TinyRenderer {

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Scene} scene
     */
    constructor(canvas, scene, renderShadow = false) {
        this.renderShadow = renderShadow;
        this.canvas = canvas;
        this.scene = scene;
        this.ctx = canvas.getContext('2d');
        this.frameBuffer = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        this.imageData = new ImageData(this.frameBuffer, canvas.width, canvas.height);
        this.zBuffer = new Float32Array(canvas.width * canvas.height).fill(-Infinity);

        this.shadowBuffer = new Float32Array(canvas.width * canvas.height).fill(-Infinity);

        this.mainCamera = scene.camera;
        this.shadowCamera = new Camera(new Vec3(1, 1, 1), Vec3.Zero(), canvas, false);

        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;

        this.show_triangle_lines = false;
        this.shadow_z_bias = 0.0015;
        this.specular_intensity = 1000;
    }

    clearCanvas(color) {

        this.ctx.fillStyle = color.toString();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.frameBuffer = imageData.data;
    }

    /**
     * put a pixel in frameBuffer
     * @param {number} x the x coordinate of the pixel at the canvas
     * @param {number} y the y coordinate of the pixel at the canvas
     * @param {number} z the z coordinate of the pixel, for depth testing
     * @param {Color} color the color of the pixel
     */
    drawPixel(x, y, z, color, idx, frameBuffer) {
        if (
            x < 0 || x >= this.canvasWidth ||
            y < 0 || y >= this.canvasHeight
        ) return;   // out side the canvas

        //if (z <= this.zBuffer[idx]) return;
        this.zBuffer[idx] = z;

        const offset = idx << 2;
        frameBuffer[offset]     = color.r | 0;
        frameBuffer[offset + 1] = color.g | 0;
        frameBuffer[offset + 2] = color.b | 0;
        frameBuffer[offset + 3] = color.a | 0;
    }

    /**
     * draw a line on screen, start at [x0, y0], end at [x1, y1]
     * Note that this line will be drawn at topmost
     * @param {number} x0 
     * @param {number} y0 
     * @param {number} x1 
     * @param {number} y1 
     * @param {Color} color 
     */
    drawLine(x0, y0, x1, y1, color, frameBuffer) {
    
        // Round the coordinates to the nearest integer
        x0 = Math.round(x0);
        y0 = Math.round(y0);
        x1 = Math.round(x1);
        y1 = Math.round(y1);
    
        let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
        
        // if the line is steep, swap x and y
        if (steep) {
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
        }
        
        // Make sure the line is drawn from left to right
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }
        
        let dx = x1 - x0;
        let dy = y1 - y0;
    
        let y = y0;
        let s = dy / dx; // slope

        // sample from x0 to x1
        for (let x = x0; x <= x1; x++) {
            let rdy = Math.round(y);
            
            // if the line is steep, swap x and y back
            if (steep) {
                this.drawPixel(rdy, x, Infinity, color, rdy + this.canvasWidth * x, frameBuffer);
            } else {
                this.drawPixel(x, rdy, Infinity, color, x + this.canvasWidth * rdy, frameBuffer);
            }
    
            y += s;
        }
    
    }

    /**
     * 
     * @param {Triangle} triangle 
     * @param {Shader} shader 
     */
    drawTriangle(triangle, shader, frameBuffer, zbuffer) {

        /* 
            ============ 3. Rasterization Stage =============

                Sample through the bounding box of the triangle,
                check if this pixel should be rendered.

        */

        const v0 = triangle.v0_3, v1 = triangle.v1_3, v2 = triangle.v2_3;

        // Early out if any vertex is outside the clip space
        if (
            v0.z < -1 || v1.z < -1 || v2.z < -1 ||
            v0.z > 1  || v1.z > 1  || v2.z > 1
        ) return;

        const x0 = v0.x, y0 = v0.y;
        const x1 = v1.x, y1 = v1.y;
        const x2 = v2.x, y2 = v2.y;

        if (this.show_triangle_lines && frameBuffer) {
            this.drawLine(x0, y0, x1, y1, Color.Red, frameBuffer);
            this.drawLine(x1, y1, x2, y2, Color.Red, frameBuffer);
            this.drawLine(x2, y2, x0, y0, Color.Red, frameBuffer);
        }

        // Bounding box, clamped to canvas
        const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
        const maxX = Math.min(this.canvasWidth - 1, Math.ceil(Math.max(x0, x1, x2)));
        const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
        const maxY = Math.min(this.canvasHeight - 1, Math.ceil(Math.max(y0, y1, y2)));

        // Precompute edge functions for barycentric coordinates
        const denom = ((y1 - y2)*(x0 - x2) + (x2 - x1)*(y0 - y2)) || 1e-8;
        const denomInv = 1 / denom;

        for (let y = minY, rowAcc = this.canvasWidth * minY; y <= maxY; y++, rowAcc += this.canvasWidth) {
            for (let x = minX, idx = rowAcc + minX; x <= maxX; x++, idx++) {
                const px = x + 0.5, py = y + 0.5;

                // Compute barycentric coordinates
                const w0 = ((y1 - y2)*(px - x2) + (x2 - x1)*(py - y2)) * denomInv;

                if (w0 < 0) continue;   // Early out if outside triangle
                
                const w1 = ((y2 - y0)*(px - x2) + (x0 - x2)*(py - y2)) * denomInv;
                const w2 = 1 - w0 - w1;

                if (w0 < 0 || w1 < 0 || w2 < 0) continue;
                
                // Interpolated z
                const z = w0 * v0.z + w1 * v1.z + w2 * v2.z;
                
                // Perspective correct barycentric
                const w0p = w0 * v0.wInv, w1p = w1 * v1.wInv, w2p = w2 * v2.wInv;
                const sumInv = 1 / (w0p + w1p + w2p);
                const baryCentric = new Vec3(w0p * sumInv, w1p * sumInv, w2p * sumInv);


                /* 
                    ============= 4. Pixel Processing Stage =============

                        For each pixel rasterized, do depth test
                        call fragment shader to get the color of the pixel

                */

                // 4.1 depth test
                if (zbuffer[idx] >= z) continue;
                zbuffer[idx] = z;
                
                // 4.2 fragment shading
                const color = new Color(255, 255, 255, 255);
                if (shader.fragment(baryCentric, color) === false) continue;  // discard this pixel
                
                // write into frame buffer
                if (!frameBuffer) continue;

                this.drawPixel(x, y, z, color, idx, frameBuffer);

                // MSAA - 4x4
                // let sampleRate = MSAA ? 4 : 1;
                // let insideCnt = 0;
                // for (let i = 0; i < sampleRate; i++) {
                //     for (let j = 0; j < sampleRate; j++) {
                        
                //         // check if the point is inside the triangle
                //         if (!triangle.inside(new Vec3(center_x, center_y, 0))) {
                //             continue;
                //         }
    
                //         insideCnt++;
    
                //     }
                // }
                
                // if (insideCnt > 0) {
                //     // calculate the color based on the number of samples inside the triangle
                //     let alpha = Math.floor(255 * (insideCnt / (sampleRate * sampleRate)));
                //     this.drawPixel(x, y, Color.fromColor(color, alpha));
                // }
            }
        }
    }

    renderModel(model, shader, frameBuffer, zBuffer) {
        
        shader.updateUniforms();
        let faceCnt = model.faceCount();

        for (let iface = 0; iface < faceCnt; iface++) {
            const triangleFace = model.getFace(iface);

            /* 
                ===================== 2. Geometry Stage =====================

                GPU get draw command from CPU, 
                using vertex shader to change vertex position to screen space,
                and send each transformed triangle face to rasterization stage.

            */

            const v0 = triangleFace.v0, v1 = triangleFace.v1, v2 = triangleFace.v2;

            // 2.1 vertex shading
            const tv0 = shader.vertex(iface, 0, v0);
            const tv1 = shader.vertex(iface, 1, v1);
            const tv2 = shader.vertex(iface, 2, v2);
            
            // go to Rasterization stage
            this.drawTriangle(new Triangle(tv0, tv1, tv2), shader, frameBuffer, zBuffer);
        }
    }

    /**
     * Call Tiny Renderer to render a frame on canvas.
     */
    render() {

        /*
           =========== 1. Application Stage =============

           CPU prepares all data, do some pre-cutting,
           finally hands the draw commands to GPU.

        */

        const models = this.scene.getModels();
        for (let i = 0, len = models.length; i < len; i++) {
            const model = models[i];

            // shadow pass
            if (this.renderShadow) {

                const shadowShader = new Shader(this.scene, model, this);
                this.shadowCamera.lookAt(this.scene.lights[0], new Vec3(0, 0, 0));
                
                let mainCamera = this.scene.camera;
                this.scene.setCamera(this.shadowCamera);
    
                this.renderModel(model, shadowShader, null, this.shadowBuffer);
    
                this.scene.setCamera(mainCamera);
            }

            // render pass
            const shader = model.getShader();
            this.renderModel(model, shader, this.frameBuffer, this.zBuffer);
            
        }

        // Finally, Draw the frame buffer to the canvas
        this.ctx.putImageData(this.imageData, 0, 0);

        // And clear z-buffer and frame buffer
        this.zBuffer.fill(-Infinity);
        this.frameBuffer.fill(130);
        if (this.renderShadow) {
            // also clear shadow buffer if needed
            this.shadowBuffer.fill(-Infinity);
        }

    }

}