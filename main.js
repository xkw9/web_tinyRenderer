"use strict";

import { Vec3, Mat4 } from "./math/math.js";
import { Model } from "./model.js";
import { Scene } from "./scene.js";
import { TinyRenderer } from "./tinyRenderer.js";
import { Camera } from "./camera.js";
import { DepthShader, GouradShader, PhongShader, PlainTextureShader, TextureWithShadowShader } from "./shader.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");

let scene = new Scene();
scene.setCamera(new Camera(new Vec3(1, 1, 1), Vec3.Zero(), canvas, true));
scene.addLight(new Vec3(1, 1, 1));

let renderer = new TinyRenderer(canvas, scene, false);
let pause_render = false;

let objFile = "./obj/mitagothic/mitagothic.obj";


let scale = 40;
let modelX = 0, modelY = -0.5, modelZ = 0;
let autoRotate = false;

let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

let fpsLabel = document.getElementById("fps");

function updateFPS() {
    frameCount++;
    rotateCnt %= 720;
    let currentTime = performance.now();
    let elapsedTime = currentTime - lastTime;
    if (elapsedTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        fpsLabel.innerText = `FPS: ${fps}`;
    }

}

let model = new Model(objFile);

fpsLabel.innerText = "loading model data, please wait...";
await model.load();

model.transform(new Mat4(
    40, 0, 0, 0,
    0, 40, 0, 0,
    0, 0, 40, 0,
    0, 0, 0, 1
));

scene.addModel(model);

model.setShader(new PlainTextureShader(scene, model, renderer));
let rotateCnt = 0;

function transformModel() {

    let scaleMat = new Mat4(
        scale, 0, 0, modelX,
        0, scale, 0, modelY,
        0, 0, scale, modelZ,
        0, 0, 0, 1
    )
    
    if (autoRotate) {
        rotateCnt ++;
    }
    
    scaleMat = scaleMat.multiply(Mat4.rotateY(Math.PI / 360 * (rotateCnt)));
    
    model.transform(scaleMat);
    
}

function renderLoop() {
    
    renderer.render();
    
    transformModel();
    
    // let light circle around the model
    // let lightPos = new Vec3(Math.sin(Date.now() / 1000) * 1, 0.5, Math.cos(Date.now() / 1000) * 1);
    // scene.lights[0] = lightPos;
    
    updateFPS();
    
    if (pause_render) {
        model.set(objFile)
        fpsLabel.innerText = "loading model data, please wait...";
        model.load().then(() => {pause_render = false; renderLoop()});
        return;
    }
    
    requestAnimationFrame(renderLoop);
}


// render start here!
renderLoop();


/* 

   ========== addEventListener for model options ==========

*/

let modelSelect = document.getElementById("model-select");
modelSelect?.addEventListener("change", async (event) => {
    let selectedModel = event.target.value;

    objFile = `./obj/${selectedModel}/${selectedModel}.obj`;

    // set the model scale, small models are scaled up
    switch (selectedModel) {
        case "mitagothic":
            scale = 40;
            break;
        case "mila":
            scale = 1;
            break;
        case "zzzshark":
            scale = 0.01;
    }

    // model will be reload in renderLoop
    pause_render = true;

});

let xRange = document.getElementById("x-range");
xRange?.addEventListener("input", (event) => {
    modelX = event.target.value;
});
let yRange = document.getElementById("y-range");
yRange?.addEventListener("input", (event) => {
    modelY = event.target.value;
});
let zRange = document.getElementById("z-range");
zRange?.addEventListener("input", (event) => {
    modelZ = event.target.value;
});

let autoRotateCheckbox = document.getElementById("auto-rotate");
autoRotateCheckbox?.addEventListener("change", (event) => {
    autoRotate = event.target.checked;
});

/*

    ========== addEventListener for shader options ==========
 
*/


let shaderSelect = document.getElementById("shader-select");
shaderSelect?.addEventListener("change", (event) => {
    let selectedShader = event.target.value;

    renderer.renderShadow = false;
    switch (selectedShader) {
        case "depth":
            model.setShader(new DepthShader(scene, model, renderer));
            break;
        case "gourad":
            model.setShader(new GouradShader(scene, model, renderer));
            break;
        case "phong":
            model.setShader(new PhongShader(scene, model, renderer));
            break;
        case "plainTexture":
            model.setShader(new PlainTextureShader(scene, model, renderer));
            break;
        case "textureWithShadow":
            model.setShader(new TextureWithShadowShader(scene, model, renderer));
            renderer.renderShadow = true;
            break;
    }
});

// let shadow_z_biasRange = document.getElementById("shadow-bias");
// shadow_z_biasRange?.addEventListener("input", (event) => {
//     renderer.shadow_z_bias = event.target.value;
// });

let showTriangleLinesCheckbox = document.getElementById("show-triangle-lines");
showTriangleLinesCheckbox?.addEventListener("change", (event) => {
    renderer.show_triangle_lines = event.target.checked;
});

/*
    ========== addEventListener for camera options ==========
*/


let resetCameraBtn = document.getElementById("reset-camera-btn");
resetCameraBtn?.addEventListener("click", () => {
    scene.setCamera(new Camera(new Vec3(1, 1, 1), Vec3.Zero(), canvas));
});


/*
    ========== addEventListener for light options ==========
*/

let lightXRange = document.getElementById("light-x-range");
lightXRange?.addEventListener("input", (event) => {
    scene.lights[0].x = event.target.value;
});
let lightYRange = document.getElementById("light-y-range");
lightYRange?.addEventListener("input", (event) => {
    scene.lights[0].y = event.target.value;
});
let lightZRange = document.getElementById("light-z-range");

lightZRange?.addEventListener("input", (event) => {
    scene.lights[0].z = event.target.value;
});

let specularRange = document.getElementById("specular-range");
specularRange?.addEventListener("input", (event) => {
    renderer.specular_intensity = event.target.value;
});