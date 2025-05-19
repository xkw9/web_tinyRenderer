import { Color } from "./math/color.js";
import { Mat4 } from "./math/math.js";
import { Model } from "./model.js";
import { Camera } from "./camera.js";

export { Scene };

class Scene {

    /**
     * @type {Camera}
     */
    camera;

    constructor() {
        /** @type {Array<Model>} */
        this.models = [];
        this.lights = [];

        this.backgroundColor = new Color(0, 0, 0, 255); // Default background color
    }

    /**
     * @param {Model} model 
     */
    addModel(model) {
        this.models.push(model);
    }

    addLight(light) {
        this.lights.push(light);
    }

    /**
     * @param {Camera} camera 
     */
    setCamera(camera) {
        this.camera = camera;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    getModels() {
        return this.models;
    }

    /**
     * @param {Model} model
     */
    getMVPMatrix(model) {
        
        let modelMatrix = model.modelMatrix;
        let viewMatrix = this.camera.viewMatrix();
        let projectionMatrix = this.camera.projectionMatrix();

        return projectionMatrix.multiply(viewMatrix).multiply(modelMatrix);

    }
}