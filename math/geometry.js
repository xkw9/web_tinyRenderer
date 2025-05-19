import { Mat4, Vec2, Vec3, Vec4 } from './math.js';

class Triangle {

    /**
     * @param {Vec4} v0
     * @param {Vec4} v1
     * @param {Vec4} v2
     */
    constructor(v0, v1, v2) {
        this.v0 = v0;
        this.v1 = v1;
        this.v2 = v2;

        this.v0_3 = v0.toVec3();
        this.v1_3 = v1.toVec3();
        this.v2_3 = v2.toVec3();
        // this.e0 = v1.sub(v0);
        // this.e1 = v2.sub(v1);
        // this.e2 = v0.sub(v2);
    }

    // getNormal() {
        
    //     if (this._normal) return this._normal;
        
    //     // lazy initialization of normal vector
    //     this._normal = this.e1.cross(this.e0).normalize();
    //     return this._normal;
    // }

    /**
     * 
     * @param {Triangle} triangle 
     * @param {Vec3} point 
     * @returns {boolean} 
     */
    // static inside2D(triangle, point) {
    //     const v0 = triangle.v0;
    //     const v1 = triangle.v1;
    //     const v2 = triangle.v2;

    //     const c0 = triangle.e0.cross(point.sub(v0));
    //     const c1 = triangle.e1.cross(point.sub(v1));
    //     const c2 = triangle.e2.cross(point.sub(v2));

    //     const n = triangle.getNormal();

    //     const d0 = c0.dot(n);
    //     const d1 = c1.dot(n);
    //     const d2 = c2.dot(n);

    //     return ( d0 >= 0 && d1 >= 0 && d2 >= 0 )||
    //            ( d0 <= 0 && d1 <= 0 && d2 <= 0) ;
    // }

    
    // /**
    //  * @param {Vec3} point
    //  */
    // inside2D(point) {
    //     return Triangle.inside2D(this, point);
    // }    

    /**
     * @param {Vec3 | Vec2} point
     */
    baryCentric(point) {

        const { x: x0, y: y0 } = this.v0_3;
        const { x: x1, y: y1 } = this.v1_3;
        const { x: x2, y: y2 } = this.v2_3;
        const { x: px, y: py } = point;

        const denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
        if (denom === 0) return new Vec3(-1, -1, -1); // Degenerate triangle

        const denomInv = 1 / denom;

        const alpha = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) * denomInv;
        const beta  = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) * denomInv;
        const gamma = 1 - alpha - beta;

        return new Vec3(alpha, beta, gamma);
        
    }


}

class TriangleFace extends Triangle {

    /**
     * 
     * @param {Vec4} v0 
     * @param {Vec4} v1 
     * @param {Vec4} v2 
     * @param {Vec2} v0uv 
     * @param {Vec2} v1uv 
     * @param {Vec2} v2uv 
     * @param {Vec3} v0t
     * @param {Vec3} v1t
     * @param {Vec3} v2t
     */
    constructor(v0, v1, v2, v0uv, v1uv, v2uv, v0t, v1t, v2t, imtl) {
        super(v0, v1, v2);
        this.v = [v0, v1, v2];

        this.v0uv = v0uv;
        this.v1uv = v1uv;
        this.v2uv = v2uv;
        this.uv = [v0uv, v1uv, v2uv];

        this.v0t = v0t;
        this.v1t = v1t;
        this.v2t = v2t;
        this.t = [v0t, v1t, v2t];

        this.imtl = imtl;
    }

}

export { TriangleFace, Triangle };