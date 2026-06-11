const NOISE_SIZE = 256;
const NOISE_MASK = NOISE_SIZE - 1;

function hash(x: number, y: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
}

const lattice = new Float32Array(NOISE_SIZE * NOISE_SIZE);
for (let y = 0; y < NOISE_SIZE; y++) {
    for (let x = 0; x < NOISE_SIZE; x++) {
        lattice[y * NOISE_SIZE + x] = hash(x, y);
    }
}

function latticeAt(ix: number, iy: number): number {
    return lattice[(iy & NOISE_MASK) * NOISE_SIZE + (ix & NOISE_MASK)] ?? 0;
}

export const MathUtils = {
    vnoise(x: number, y: number): number {
        const ix = Math.floor(x),
            iy = Math.floor(y);
        const fx = x - ix,
            fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);

        const a = latticeAt(ix, iy);
        const b = latticeAt(ix + 1, iy);
        const c = latticeAt(ix, iy + 1);
        const d = latticeAt(ix + 1, iy + 1);

        return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
    },

    fbm(x: number, y: number): number {
        return this.vnoise(x, y) * 0.65 + this.vnoise(x * 2.1, y * 2.1) * 0.35;
    },

    sat(v: number): number {
        return v < 0 ? 0 : v > 1 ? 1 : v;
    },

    smoothstep(lo: number, hi: number, v: number): number {
        const t = this.sat((v - lo) / (hi - lo));
        return t * t * (3 - 2 * t);
    },
};
