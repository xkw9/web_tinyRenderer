import { Mat4, Vec3 } from './math/math.js'; 

export { Camera };


class Camera {

    /**
     * @param {Vec3} position
     * @param {Vec3} target
     * @param {HTMLCanvasElement} canvas
     */
    constructor(position, target, canvas, controllable = true) {
        this.canvas = canvas;
        
        this.lookAt(position, target);
        
        this.fov = 45; // Field of view in degrees
        this.aspectRatio = 1; // Aspect ratio
        this.near = 0.2; // Near clipping plane
        this.far = 5; // Far clipping plane
        
        this.sensitivity = 0.01; // Mouse sensitivity

        this.theta = Math.PI / 4; // Yaw
        this.phi = Math.PI / 4; // Pitch

        if (!controllable) return;

        this.canvas.addEventListener("mousedown", (evt) => {
            this.mouseDown = true;
            this.lastMouseX = evt.clientX;
            this.lastMouseY = evt.clientY;
        })

        this.canvas.addEventListener("mouseup", (evt) => {
            this.mouseDown = false;
        })

        this.canvas.addEventListener("mousemove", (evt) => {
            if (this.mouseDown) {
                let deltaX = evt.clientX - this.lastMouseX;
                let deltaY = evt.clientY - this.lastMouseY;

                this.lastMouseX = evt.clientX;
                this.lastMouseY = evt.clientY;

                let angleX = deltaX * this.sensitivity;
                let angleY = deltaY * this.sensitivity;

                this.theta += angleX;
                this.phi -= angleY;

                if (this.phi < 0.01) {
                    this.phi = 0.01;
                } else if (this.phi > Math.PI - 0.01) {
                    this.phi = Math.PI - 0.01;
                }

                let new_position = new Vec3(
                    this.distance * Math.sin(this.phi) * Math.cos(this.theta),
                    this.distance * Math.cos(this.phi),
                    this.distance * Math.sin(this.phi) * Math.sin(this.theta)
                );

                this.lookAt(
                    new_position,
                    Vec3.Zero()
                );

            }
        });

        this.canvas.addEventListener("wheel", (evt) => {


            let delta = evt.deltaY > 0 ? 0.1 : -0.1;

            this.distance += delta;

            if (this.distance < 0.1) {
                this.distance = 0.1;
            } else if (this.distance > 10) {
                this.distance = 10;
            }

            this.position = this.position.add(
                this.gaze.multiply(-delta)
            );

        });

        // addEventListener("keypress", (evt) => {
        //     if (evt.key === "w") {
        //         this.position = this.position.add(Vec3.Forward().multiply(0.05));
        //     } else if (evt.key === "s") {
        //         this.position = this.position.add(Vec3.Backward().multiply(0.05));
        //     } else if (evt.key === "a") {
        //         this.position = this.position.add(Vec3.Left().multiply(0.05));
        //     } else if (evt.key === "d") {
        //         this.position = this.position.add(Vec3.Right().multiply(0.05));
        //     } else if (evt.key === " ") {
        //         this.position = this.position.add(Vec3.Up().multiply(0.05));
        //     } else if (evt.shiftKey) {
        //         this.position = this.position.add(Vec3.Down().multiply(0.05));
        //     }
        // });

    }

    /**
     * @param {Vec3} eye
     * @param {Vec3} target
     */
    lookAt(eye, target) {
        this.position = eye;
        this.gaze = target.sub(eye).normalize();
        this.up = Vec3.Up().sub(this.gaze.multiply(this.gaze.dot(Vec3.Up()))).normalize();
        this.distance = target.sub(eye).length();
    }

    viewMatrix() {
        
        const translation = Mat4.translate(-this.position.x, -this.position.y, -this.position.z);

        const zAxis = this.gaze.multiply(-1);
        const yAxis = this.up;
        const xAxis = this.gaze.cross(this.up).normalize();
        
        const rotateMat = new Mat4(
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            0, 0, 0, 1
        );

        let view = rotateMat.multiply(translation);
        return view;
    }

    projectionMatrix() {
        
        // return new Mat4(this.canvas.width / 2, 0, 0, 0,
        //                 0, -this.canvas.height / 2, 0, this.canvas.height,
        //                 0, 0, 1, 0,
        //                 0, 0, 0, 1);

        const fovRad = (this.fov * Math.PI) / 180;
        const cotFov = 1 / Math.tan(fovRad / 2);

        const rangeInv = 1 / (this.far - this.near);
        const nearAddFar = this.near + this.far;
        const nearMulFar = this.near * this.far;

        let proj = new Mat4(
            cotFov / this.aspectRatio, 0, 0, 0,
            0, cotFov, 0, 0,
            0, 0,  nearAddFar * rangeInv, 2 * nearMulFar * rangeInv,
            0, 0, -1, 0
        );

        return proj;
    }

    viewportMatrix() {
    
        return new Mat4(
            this.canvas.width / 2, 0, 0, this.canvas.width / 2,
            0, -this.canvas.height / 2, 0, this.canvas.height / 2,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }
}

