import { ALPHA_STEPS, CHARS } from './Constant';
import type { GridConfig, RGB } from './Types';

const PAD = 4;

export class GlyphAtlas {
    private readonly atlas: OffscreenCanvas;
    private readonly cellW: number;
    private readonly cellH: number;
    private readonly buckets: number[][];

    constructor(grid: GridConfig, palette: readonly RGB[]) {
        this.cellW = grid.cw + PAD * 2;
        this.cellH = grid.ch + PAD * 2;

        this.atlas = new OffscreenCanvas(this.cellW * CHARS.length, this.cellH * palette.length);
        const ctx = this.atlas.getContext('2d');

        if (ctx) {
            ctx.font = `${grid.ch * 0.95}px "Space Mono", monospace`;
            ctx.textBaseline = 'top';

            palette.forEach((color, row) => {
                ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
                CHARS.forEach((char, col) => {
                    ctx.fillText(char, col * this.cellW + PAD, row * this.cellH + PAD);
                });
            });
        }

        this.buckets = Array.from(
            { length: CHARS.length * palette.length * ALPHA_STEPS },
            (): number[] => []
        );
    }

    add(charIdx: number, colorIdx: number, alpha: number, px: number, py: number): void {
        const step = Math.round(alpha * (ALPHA_STEPS - 1));
        if (step <= 0) return;

        const bucket = this.buckets[(colorIdx * CHARS.length + charIdx) * ALPHA_STEPS + step];
        if (!bucket) return;

        bucket.push(px, py);
    }

    flush(ctx: OffscreenCanvasRenderingContext2D): void {
        const { cellW, cellH } = this;

        for (let i = 0; i < this.buckets.length; i++) {
            const bucket = this.buckets[i];
            if (!bucket || bucket.length === 0) continue;

            const step = i % ALPHA_STEPS;
            const charIdx = Math.floor(i / ALPHA_STEPS) % CHARS.length;
            const colorIdx = Math.floor(i / (ALPHA_STEPS * CHARS.length));

            const sx = charIdx * cellW;
            const sy = colorIdx * cellH;

            ctx.globalAlpha = step / (ALPHA_STEPS - 1);

            for (let j = 0; j < bucket.length; j += 2) {
                const px = bucket[j] ?? 0;
                const py = bucket[j + 1] ?? 0;
                ctx.drawImage(this.atlas, sx, sy, cellW, cellH, px - PAD, py - PAD, cellW, cellH);
            }

            bucket.length = 0;
        }

        ctx.globalAlpha = 1;
    }
}
