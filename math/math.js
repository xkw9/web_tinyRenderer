
class Vec2 {

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    static Up = () => new Vec2(0, 1);
    static Down = () => new Vec2(0, -1);
    static Left = () => new Vec2(-1, 0);
    static Right = () => new Vec2(1, 0);
    static Zero = () => new Vec2(0, 0); 
    
    /**
     * @param {Vec2} b
     * @returns {Vec2} a new Vec2 object `this` + `b`
     */
    add(b) {
        return new Vec2(this.x + b.x, this.y + b.y);
    }
    
    /**
     * @param {Vec2} b
     * @returns {Vec2} a new Vec2 object `this` - `b`
     */
    sub(b) {
        return new Vec2(this.x - b.x, this.y - b.y);
    }

    /**
     * @param {number} scalar 
     * @returns {Vec2} a new Vec2 object `scalar` * `this`
     */
    multiply(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }

    /**
     * @param {Vec2} b 
     * @returns {number} the dot product of `this` and `b`
     */
    dot(b) {
        return this.x * b.x + this.y * b.y;
    }

    /**
     * @returns {number} the length of `this` 
    */
    length() { 
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /**
     * @returns a new Vec2 object with the same direction as `this` but with length 1
     */
    normalize() {
        const len = this.length();
        if (len === 0) return Vec2.Zero;
        return this.multiply(1 / len);
    }

    /**
     * @param {number} z
     * @returns {Vec3} a new Vec3 object with the same x and y as `this` and z = `z` 
     */
    toVec3(z = 0) {
        return new Vec3(this.x, this.y, z);
    }
    
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
}

/**
 * A class representing a 3D vector with x, y, and z components.
 */
class Vec3 {
    /**
     * Creates a new Vec3 instance.
     * @param {number} x - The x component of the vector.
     * @param {number} y - The y component of the vector.
     * @param {number} z - The z component of the vector.
     */
    constructor(x, y, z, wInv = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.wInv = 1;
    }

    static Up = () => new Vec3(0, 1, 0);
    static Down = () => new Vec3(0, -1, 0);
    static Left = () => new Vec3(-1, 0, 0);
    static Right = () => new Vec3(1, 0, 0);
    static Forward = () =>new Vec3(0, 0, -1);
    static Backward = () => new Vec3(0, 0, 1);
    static Zero = () => new Vec3(0, 0, 0);

    /**
     * Adds two vectors and returns a new Vec3 instance.
     * @param {Vec3} v - The vector to add.
     * @returns {Vec3} A new vector representing the sum of `a` and `b`.
     */
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Subtracts vector `v` from this vector and returns a new Vec3 instance.
     * @param {Vec3} v - The vector to subtract.
     * @returns {Vec3} A new vector representing the difference.
     */
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * Multiplies this vector by a scalar and returns a new Vec3 instance.
     * @param {number} scalar - The scalar value to multiply by.
     * @returns {Vec3} A new vector scaled by the scalar.
     */
    multiply(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    /**
     * Computes the dot product of this vector and another vector.
     * @param {Vec3} v - The other vector.
     * @returns {number} The dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Computes the cross product of this vector and another vector and returns a new Vec3 instance.
     * @param {Vec3} v - The other vector.
     * @returns {Vec3} A new vector representing the cross product.
     */
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * Computes the length (magnitude) of this vector.
     * @returns {number} The length of the vector.
     */
    length() {
        return Math.hypot(this.x, this.y, this.z);
    }

    /**
     * Returns a normalized (unit length) copy of this vector.
     * If the vector is zero, returns Vec3.Zero().
     * @returns {Vec3}
     */
    normalize() {
        const len = this.length();
        return len > 0 ? this.multiply(1 / len) : Vec3.Zero();
    }

    /**
     * Allows iteration over the vector components (x, y, z).
     * @yields {number} The next component of the vector.
     */
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }

    /**
     * Creates a clone of the current vector.
     * @returns {Vec3} A new Vec3 instance with the same components as the current vector.
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    /**
     * Computes the cross-product matrix of the vector.
     * @returns {Mat3} A 3x3 matrix representing the cross-product operation.
     */
    crossMat() {
        return new Mat3(
            0, -this.z, this.y,
            this.z, 0, -this.x,
            -this.y, this.x, 0
        );
    }

    /**
     * Converts the vector to a 4D vector by adding a w component.
     * @param {number} [w=1] - The w component of the resulting 4D vector.
     * @returns {Vec4} A new Vec4 instance.
     */
    toVec4(w = 1) {
        return new Vec4(this.x, this.y, this.z, w);
    }
}

/**
 * Represents a 4-dimensional vector.
 */
class Vec4 {
    /**
     * Creates a new Vec4 instance.
     * @param {number} x - The x component of the vector.
     * @param {number} y - The y component of the vector.
     * @param {number} z - The z component of the vector.
     * @param {number} w - The w component of the vector.
     */
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static Up = () => new Vec4(0, 1, 0, 0);
    static Down = () => new Vec4(0, -1, 0, 0);
    static Left = () => new Vec4(-1, 0, 0, 0);
    static Right = () => new Vec4(1, 0, 0, 0);
    static Forward = () => new Vec4(0, 0, -1, 0);
    static Backward = () => new Vec4(0, 0, 1, 0);
    static Zero = () => new Vec4(0, 0, 0, 0);
    static One = () => new Vec4(1, 1, 1, 1);
    /**
     * Adds another Vec4 to this vector.
     * @param {Vec4} v - The vector to add.
     * @returns {Vec4} A new Vec4 representing the sum.
     */
    add(v) {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    /**
     * Subtracts another Vec4 from this vector.
     * @param {Vec4} v - The vector to subtract.
     * @returns {Vec4} A new Vec4 representing the difference.
     */
    sub(v) {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vec4} A new Vec4 representing the scaled vector.
     */
    multiply(scalar) {
        return new Vec4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    /**
     * Computes the dot product of this vector and another Vec4.
     * @param {Vec4} v - The vector to compute the dot product with.
     * @returns {number} The dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    /**
     * Computes the length (magnitude) of this vector.
     * @returns {number} The length of the vector.
     */
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
    }

    /**
     * Normalizes this vector (makes it have a length of 1).
     * @returns {Vec4} A new Vec4 representing the normalized vector.
     */
    normalize() {
        const len = this.length();
        if (len === 0) return new Vec4(0, 0, 0, 0);
        return this.multiply(1 / len);
    }

    /**
     * Allows iteration over the components of the vector (x, y, z, w).
     * @generator
     * @yields {number} The next component of the vector.
     */
    *[Symbol.iterator]() {}

    /**
     * Creates a clone of this vector.
     * @returns {Vec4} A new Vec4 with the same components.
     */
    clone() {
        return new Vec4(this.x, this.y, this.z, this.w);
    }

    /**
     * Converts this Vec4 to a Vec3 by dividing x, y, and z by w.
     * @throws {Error} If w is 0, a warning is logged and a zero Vec3 is returned.
     * @returns {Vec3} A new Vec3 representing the converted vector.
     */
    toVec3() {
        if (this.w === 0) {
            console.warn("Cannot convert Vec4 with w=0 to Vec3");
            return new Vec3(0, 0, 0);
        }

        let inv = 1 / this.w;
        return new Vec3(this.x * inv, this.y * inv, this.z * inv, inv);
    }

    /**
     * Converts this Vec4 to a Vec3 by truncating the w component.
     */
    truncToVec3() {
        return new Vec3(this.x, this.y, this.z);
    }
}
        

class Mat3 {

    /**
     * Creates a new 3x3 matrix.
     * @param {number} a11 - The element at row 1, column 1.
     * @param {number} a12 - The element at row 1, column 2.
     * @param {number} a13 - The element at row 1, column 3.
     * @param {number} a21 - The element at row 2, column 1.
     * @param {number} a22 - The element at row 2, column 2.
     * @param {number} a23 - The element at row 2, column 3.
     * @param {number} a31 - The element at row 3, column 1.
     * @param {number} a32 - The element at row 3, column 2.
     * @param {number} a33 - The element at row 3, column 3.
     * @constructor
     */    
    constructor( 
        a11, a12, a13,
        a21, a22, a23,
        a31, a32, a33) {

        this.m = [[a11, a12, a13],
                   [a21, a22, a23],
                   [a31, a32, a33]];
    }

    static Identity = () => new Mat3(1, 0, 0,
                               0, 1, 0,
                               0, 0, 1);  

    static Zero = () => new Mat3(0, 0, 0,
                           0, 0, 0,
                           0, 0, 0);

    transpose() {
        return new Mat3(
            this.m[0][0], this.m[1][0], this.m[2][0],
            this.m[0][1], this.m[1][1], this.m[2][1],
            this.m[0][2], this.m[1][2], this.m[2][2]
        );
    }

    determinant() {
        return this.m[0][0] * (this.m[1][1] * this.m[2][2] - this.m[1][2] * this.m[2][1]) -
               this.m[0][1] * (this.m[1][0] * this.m[2][2] - this.m[1][2] * this.m[2][0]) +
               this.m[0][2] * (this.m[1][0] * this.m[2][1] - this.m[1][1] * this.m[2][0]);
    }

    inverse() {
        const det = this.determinant();
        if (det === 0) throw new Error("Matrix is not invertible");

        const invDet = 1 / det;
        return new Mat3(
            (this.m[1][1] * this.m[2][2] - this.m[1][2] * this.m[2][1]) * invDet,
            (this.m[0][2] * this.m[2][1] - this.m[0][1] * this.m[2][2]) * invDet,
            (this.m[0][1] * this.m[1][2] - this.m[0][2] * this.m[1][1]) * invDet,

            (this.m[1][2] * this.m[2][0] - this.m[1][0] * this.m[2][2]) * invDet,
            (this.m[0][0] * this.m[2][2] - this.m[0][2] * this.m[2][0]) * invDet,
            (this.m[0][2] * this.m[1][0] - this.m[0][0] * this.m[1][2]) * invDet,

            (this.m[1][0] * this.m[2][1] - this.m[1][1] * this.m[2][0]) * invDet,
            (this.m[0][1] * this.m[2][0] - this.m[0][0] * this.m[2][1]) * invDet,
            (this.m[0][0] * this.m[1][1] - this.m[0][1] * this.m[1][0]) * invDet
        );
    }

    /**
     * 
     * @param {Mat3} B 
     * @returns {Mat3} a new Mat3 object `this` + `B`
     */
    add(B) {
        return new Mat3(
            this.m[0][0] + B.m[0][0], this.m[0][1] + B.m[0][1], this.m[0][2] + B.m[0][2],
            this.m[1][0] + B.m[1][0], this.m[1][1] + B.m[1][1], this.m[1][2] + B.m[1][2],
            this.m[2][0] + B.m[2][0], this.m[2][1] + B.m[2][1], this.m[2][2] + B.m[2][2]
        );
    }

    /**
     * 
     * @param {number} scalar 
     * @returns {Mat3} a new Mat3 object `this` * `scalar`
     */
    scalarMultiply(scalar) {
        return new Mat3(
            this.m[0][0] * scalar, this.m[0][1] * scalar, this.m[0][2] * scalar,
            this.m[1][0] * scalar, this.m[1][1] * scalar, this.m[1][2] * scalar,
            this.m[2][0] * scalar, this.m[2][1] * scalar, this.m[2][2] * scalar
        );
    }

    /**
     * @param {Mat3} B
     * @returns {Mat3} a new Mat3 object `this` - `B`
     */
    sub(B) {
        return this.add(B.scalarMultiply(-1));
    }

    /**
     * 
     * @param {Mat3} B 
     * @returns {Mat3} a new Mat3 object `this` * `B`
     */
    multiply(B) {
        const result = Mat3.Zero();

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                result.m[i][j] = this.m[i][0] * B.m[0][j] +
                                 this.m[i][1] * B.m[1][j] +
                                 this.m[i][2] * B.m[2][j];
            }
        }

        return result;
    }

    /**
     * 
     * @param {Vec3} v 
     * @returns {Vec3} a new Vec3 object `this` * `v`
     */
    multiplyVec3(v) {
        return new Vec3(
            this.m[0][0] * v.x + this.m[0][1] * v.y + this.m[0][2] * v.z,
            this.m[1][0] * v.x + this.m[1][1] * v.y + this.m[1][2] * v.z,
            this.m[2][0] * v.x + this.m[2][1] * v.y + this.m[2][2] * v.z
        );
    }
}

class Mat4 {
    constructor(
        a11, a12, a13, a14,
        a21, a22, a23, a24,
        a31, a32, a33, a34,
        a41, a42, a43, a44) {

        this.m = [[a11, a12, a13, a14],
                   [a21, a22, a23, a24],
                   [a31, a32, a33, a34],
                   [a41, a42, a43, a44]];
    }

    static Identity = () =>
               new Mat4(1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1);

    static Zero = () =>
               new Mat4(0, 0, 0, 0,
                        0, 0, 0, 0,
                        0, 0, 0, 0,
                        0, 0, 0, 0);

    clone() {
        return new Mat4(
            this.m[0][0], this.m[0][1], this.m[0][2], this.m[0][3],
            this.m[1][0], this.m[1][1], this.m[1][2], this.m[1][3],
            this.m[2][0], this.m[2][1], this.m[2][2], this.m[2][3],
            this.m[3][0], this.m[3][1], this.m[3][2], this.m[3][3]
        );
    }

    transpose() {
        return new Mat4(
            this.m[0][0], this.m[1][0], this.m[2][0], this.m[3][0],
            this.m[0][1], this.m[1][1], this.m[2][1], this.m[3][1],
            this.m[0][2], this.m[1][2], this.m[2][2], this.m[3][2],
            this.m[0][3], this.m[1][3], this.m[2][3], this.m[3][3]
        );
    }

    determinant() {
        const m = this.m;
        return (
            m[0][0] * (
                m[1][1] * (m[2][2] * m[3][3] - m[2][3] * m[3][2]) -
                m[1][2] * (m[2][1] * m[3][3] - m[2][3] * m[3][1]) +
                m[1][3] * (m[2][1] * m[3][2] - m[2][2] * m[3][1])
            ) -
            m[0][1] * (
                m[1][0] * (m[2][2] * m[3][3] - m[2][3] * m[3][2]) -
                m[1][2] * (m[2][0] * m[3][3] - m[2][3] * m[3][0]) +
                m[1][3] * (m[2][0] * m[3][2] - m[2][2] * m[3][0])
            ) +
            m[0][2] * (
                m[1][0] * (m[2][1] * m[3][3] - m[2][3] * m[3][1]) -
                m[1][1] * (m[2][0] * m[3][3] - m[2][3] * m[3][0]) +
                m[1][3] * (m[2][0] * m[3][1] - m[2][1] * m[3][0])
            ) -
            m[0][3] * (
                m[1][0] * (m[2][1] * m[3][2] - m[2][2] * m[3][1]) -
                m[1][1] * (m[2][0] * m[3][2] - m[2][2] * m[3][0]) +
                m[1][2] * (m[2][0] * m[3][1] - m[2][1] * m[3][0])
            )
        );
    }

    inverse() {
        
        let det = this.determinant();

        if (det === 0) {
            console.warn("Matrix is not invertible, returning zero matrix.");
            return Mat4.Zero();
            // throw new Error("Matrix is not invertible");
        }

        const m = this.clone().m;
        const invMat = Mat4.Zero();
        const inv = invMat.m;

        inv[0][0] = m[1][1] * m[2][2] * m[3][3] - m[1][1] * m[2][3] * m[3][2] - m[2][1] * m[1][2] * m[3][3] + m[2][1] * m[1][3] * m[3][2] + m[3][1] * m[1][2] * m[2][3] - m[3][1] * m[1][3] * m[2][2];
        inv[0][1] = -m[0][1] * m[2][2] * m[3][3] + m[0][1] * m[2][3] * m[3][2] + m[2][1] * m[0][2] * m[3][3] - m[2][1] * m[0][3] * m[3][2] - m[3][1] * m[0][2] * m[2][3] + m[3][1] * m[0][3] * m[2][2];
        inv[0][2] = m[0][1] * m[1][2] * m[3][3] - m[0][1] * m[1][3] * m[3][2] - m[1][1] * m[0][2] * m[3][3] + m[1][1] * m[0][3] * m[3][2] + m[3][1] * m[0][2] * m[1][3] - m[3][1] * m[0][3] * m[1][2];
        inv[0][3] = -m[0][1] * m[1][2] * m[2][3] + m[0][1] * m[1][3] * m[2][2] + m[1][1] * m[0][2] * m[2][3] - m[1][1] * m[0][3] * m[2][2] - m[2][1] * m[0][2] * m[1][3] + m[2][1] * m[0][3] * m[1][2];

        inv[1][0] = -m[1][0] * m[2][2] * m[3][3] + m[1][0] * m[2][3] * m[3][2] + m[2][0] * m[1][2] * m[3][3] - m[2][0] * m[1][3] * m[3][2] - m[3][0] * m[1][2] * m[2][3] + m[3][0] * m[1][3] * m[2][2];
        inv[1][1] = m[0][0] * m[2][2] * m[3][3] - m[0][0] * m[2][3] * m[3][2] - m[2][0] * m[0][2] * m[3][3] + m[2][0] * m[0][3] * m[3][2] + m[3][0] * m[0][2] * m[2][3] - m[3][0] * m[0][3] * m[2][2];
        inv[1][2] = -m[0][0] * m[1][2] * m[3][3] + m[0][0] * m[1][3] * m[3][2] + m[1][0] * m[0][2] * m[3][3] - m[1][0] * m[0][3] * m[3][2] - m[3][0] * m[0][2] * m[1][3] + m[3][0] * m[0][3] * m[1][2];
        inv[1][3] = m[0][0] * m[1][2] * m[2][3] - m[0][0] * m[1][3] * m[2][2] - m[1][0] * m[0][2] * m[2][3] + m[1][0] * m[0][3] * m[2][2] + m[2][0] * m[0][2] * m[1][3] - m[2][0] * m[0][3] * m[1][2];

        inv[2][0] = m[1][0] * m[2][1] * m[3][3] - m[1][0] * m[2][3] * m[3][1] - m[2][0] * m[1][1] * m[3][3] + m[2][0] * m[1][3] * m[3][1] + m[3][0] * m[1][1] * m[2][3] - m[3][0] * m[1][3] * m[2][1];
        inv[2][1] = -m[0][0] * m[2][1] * m[3][3] + m[0][0] * m[2][3] * m[3][1] + m[2][0] * m[0][1] * m[3][3] - m[2][0] * m[0][3] * m[3][1] - m[3][0] * m[0][1] * m[2][3] + m[3][0] * m[0][3] * m[2][1];
        inv[2][2] = m[0][0] * m[1][1] * m[3][3] - m[0][0] * m[1][3] * m[3][1] - m[1][0] * m[0][1] * m[3][3] + m[1][0] * m[0][3] * m[3][1] + m[3][0] * m[0][1] * m[1][3] - m[3][0] * m[0][3] * m[1][1];
        inv[2][3] = -m[0][0] * m[1][1] * m[2][3] + m[0][0] * m[1][3] * m[2][1] + m[1][0] * m[0][1] * m[2][3] - m[1][0] * m[0][3] * m[2][1] - m[2][0] * m[0][1] * m[1][3] + m[2][0] * m[0][3] * m[1][1];

        inv[3][0] = -m[1][0] * m[2][1] * m[3][2] + m[1][0] * m[2][2] * m[3][1] + m[2][0] * m[1][1] * m[3][2] - m[2][0] * m[1][2] * m[3][1] - m[3][0] * m[1][1] * m[2][2] + m[3][0] * m[1][2] * m[2][1];
        inv[3][1] = m[0][0] * m[2][1] * m[3][2] - m[0][0] * m[2][2] * m[3][1] - m[2][0] * m[0][1] * m[3][2] + m[2][0] * m[0][2] * m[3][1] + m[3][0] * m[0][1] * m[2][2] - m[3][0] * m[0][2] * m[2][1];
        inv[3][2] = -m[0][0] * m[1][1] * m[3][2] + m[0][0] * m[1][2] * m[3][1] + m[1][0] * m[0][1] * m[3][2] - m[1][0] * m[0][2] * m[3][1] - m[3][0] * m[0][1] * m[1][2] + m[3][0] * m[0][2] * m[1][1];
        inv[3][3] = m[0][0] * m[1][1] * m[2][2] - m[0][0] * m[1][2] * m[2][1] - m[1][0] * m[0][1] * m[2][2] + m[1][0] * m[0][2] * m[2][1] + m[2][0] * m[0][1] * m[1][2] - m[2][0] * m[0][2] * m[1][1];


        return invMat.scalarMultiply(1 / det);
    }

    /**
     * 
     * @param {Mat4} B 
     * @returns {Mat4} a new Mat4 object `this` + `B`
     */
    add(B) {
        return new Mat4(
            this.m[0][0] + B.m[0][0], this.m[0][1] + B.m[0][1], this.m[0][2] + B.m[0][2], this.m[0][3] + B.m[0][3],
            this.m[1][0] + B.m[1][0], this.m[1][1] + B.m[1][1], this.m[1][2] + B.m[1][2], this.m[1][3] + B.m[1][3],
            this.m[2][0] + B.m[2][0], this.m[2][1] + B.m[2][1], this.m[2][2] + B.m[2][2], this.m[2][3] + B.m[2][3],
            this.m[3][0] + B.m[3][0], this.m[3][1] + B.m[3][1], this.m[3][2] + B.m[3][2], this.m[3][3] + B.m[3][3]
        );
    }

    /**
     * 
     * @param {number} scalar 
     * @returns {Mat4} a new Mat4 object `this` * `scalar`
     */
    scalarMultiply(scalar) {
        return new Mat4(
            this.m[0][0] * scalar, this.m[0][1] * scalar, this.m[0][2] * scalar, this.m[0][3] * scalar,
            this.m[1][0] * scalar, this.m[1][1] * scalar, this.m[1][2] * scalar, this.m[1][3] * scalar,
            this.m[2][0] * scalar, this.m[2][1] * scalar, this.m[2][2] * scalar, this.m[2][3] * scalar,
            this.m[3][0] * scalar, this.m[3][1] * scalar, this.m[3][2] * scalar, this.m[3][3] * scalar
        );
    }

    /**
     * 
     * @param {Mat4} B 
     * @returns {Mat4} a new Mat4 object `this` - `B`
     */
    sub(B) {
        return this.add(B.scalarMultiply(-1));
    }

    /**
     * 
     * @param {Mat4} B 
     * @returns {Mat4} a new Mat4 object `this` * `B`
     */
    multiply(B) {
        let result = Mat4.Zero();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += this.m[i][k] * B.m[k][j];
                }
                result.m[i][j] = sum;
            }
        }

        return result;
    }

    /**
     * 
     * @param {Vec4} v 
     * @returns {Vec4} a new Vec4 object `this` * `v`
     */
    multiplyVec4(v) {
        const m = this.m, x = v.x, y = v.y, z = v.z, w = v.w;
        return new Vec4(
            m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3] * w,
            m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3] * w,
            m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3] * w,
            m[3][0] * x + m[3][1] * y + m[3][2] * z + m[3][3] * w
        );
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    static scale(x, y, z) {
        return new Mat4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    }
    
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns 
     */
    static translate(x, y, z) {
        return new Mat4(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
    }

    /**
     * @param {number} angle in radians
     */
    static rotateX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    }


    /**
     * @param {number} angle in radians
     */
    static rotateY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * 
     * @param {number} angle in radians
     * @returns 
     */
    static rotateZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Mat4(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }
    
    /**
     * @description rotates the matrix around an arbitrary axis
     * 
     * @param {number} angle 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    static rotateAxis(angle, x, y, z) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        return new Mat4(
            t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
            t * y * x + s * z, t * y * y + c, t * y * z - s * x, 0,
            t * z * x - s * y, t * z * y + s * x, t * z * z + c, 0,
            0, 0, 0, 1
        );
    }
}

// test the math functions

function testMath() {
    const mat = new Mat4(
        4, 7, 2, 3,
        0, 5, 9, 1,
        6, 3, 2, 8,
        1, 8, 4, 6
    );

    console.log("Matrix:");
    console.table(mat.m);
    console.log("Determinant:", mat.determinant());
    console.log("Inverse:");
    console.table(mat.inverse().m);
    console.log("M^-1 * M = I:");
    console.table(mat.multiply(mat.inverse()).m);
    console.log("M * M^-1 = I:");
    console.table(mat.inverse().multiply(mat).m);

}

//testMath();

export { Vec2, Vec3, Vec4, Mat3, Mat4 };