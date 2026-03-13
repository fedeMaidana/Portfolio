export const MathUtils = {
    hash(x: number, y: number): number {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    },

    vnoise(x: number, y: number): number {
        const ix = Math.floor(x),
            iy = Math.floor(y);
        const fx = x - ix,
            fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        return (
            (this.hash(ix, iy) + (this.hash(ix + 1, iy) - this.hash(ix, iy)) * ux) * (1 - uy) +
            (this.hash(ix, iy + 1) + (this.hash(ix + 1, iy + 1) - this.hash(ix, iy + 1)) * ux) * uy
        );
    },

    /** Fractal Brownian Motion: combina dos octavas de vnoise. */
    fbm(x: number, y: number): number {
        return this.vnoise(x, y) * 0.65 + this.vnoise(x * 2.1, y * 2.1) * 0.35;
    },

    /** Clamp al rango [0, 1]. */
    sat(v: number): number {
        return v < 0 ? 0 : v > 1 ? 1 : v;
    },

    smoothstep(lo: number, hi: number, v: number): number {
        const t = this.sat((v - lo) / (hi - lo));
        return t * t * (3 - 2 * t);
    },
};
