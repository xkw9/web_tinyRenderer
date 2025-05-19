import { Vec4 } from "./math.js";

class Color {

    constructor(r, g, b, a) {        
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        
    }

    set(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }

    setRGBA(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    setR(r) {
        this.r = r;
    }

    setG(g) {
        this.g = g;
    }

    setB(b) {
        this.b = b;
    }

    setA(a) {
        this.a = a;
    }

    static fromVec4(vec4) {
        return new Color(vec4.x, vec4.y, vec4.z, vec4.w);
    }

    static fromHex(hex) {
        const r = (hex >> 16) & 0xFF;
        const g = (hex >> 8) & 0xFF;
        const b = hex & 0xFF;
        return new Color(r, g, b, 255);
    }

    static fromColor(color, alpha) {
        return new Color(color.r, color.g, color.b, alpha);
    }

    static random() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return new Color(r, g, b, 255);
    }

    toHex() {
        return (this.r << 16) | (this.g << 8) | this.b;
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    static lerp(c0, c1, t) {
        const r = Math.round(c0.r + (c1.r - c0.r) * t);
        const g = Math.round(c0.g + (c1.g - c0.g) * t);
        const b = Math.round(c0.b + (c1.b - c0.b) * t);
        const a = Math.round(c0.a + (c1.a - c0.a) * t);
        return new Color(r, g, b, a);
    }

    static Black = new Color(0, 0, 0, 255);
    static White = new Color(255, 255, 255, 255);
    static Red = new Color(255, 0, 0, 255);
    static Green = new Color(0, 255, 0, 255);
    static Blue = new Color(0, 0, 255, 255);
    static Yellow = new Color(255, 255, 0, 255);
    static Cyan = new Color(0, 255, 255, 255);
    static Gray = new Color(128, 128, 128, 255);
    static Magenta = new Color(255, 0, 255, 255);
    static Orange = new Color(255, 165, 0, 255);
    static Purple = new Color(128, 0, 128, 255);
    static Pink = new Color(255, 192, 203, 255);
    static Brown = new Color(165, 42, 42, 255);
    static LightGray = new Color(211, 211, 211, 255);
    static DarkGray = new Color(169, 169, 169, 255);
    static LightRed = new Color(255, 99, 71, 255);
    static LightGreen = new Color(144, 238, 144, 255);
    static LightBlue = new Color(173, 216, 230, 255);
    static LightYellow = new Color(255, 255, 224, 255);
    static LightCyan = new Color(224, 255, 255, 255);
    static LightMagenta = new Color(255, 182, 193, 255);
    static LightOrange = new Color(255, 228, 181, 255);
    static LightPurple = new Color(216, 191, 216, 255);
    static LightPink = new Color(255, 182, 193, 255);



}

export { Color };