import { FLAG } from '../Constant';
import { MathUtils } from '../Maths';
import type { GridConfig } from '../Types';
import { waveOffset } from '../Wave';

export class ClothRenderer {
    constructor(private ctx: OffscreenCanvasRenderingContext2D) {}

    draw(t: number, grid: GridConfig, cols: number, rows: number) {
        const invCols = 1 / cols;
        const invRows = 1 / rows;

        for (let c = 0; c < cols; c++) {
            const normX = c * invCols;
            const px = c * grid.cw;
            const { offset, phase } = waveOffset(normX, t);

            const shade = MathUtils.sat(
                0.72 + 0.22 * Math.cos(phase) + 0.06 * Math.cos(phase * 2 + 0.8)
            );

            for (let r = 0; r < rows; r++) {
                const sampleY = (r + offset) * invRows;
                if (sampleY < 0 || sampleY > 1) continue;

                const isWhite = sampleY >= 1 / 3 && sampleY < 2 / 3;

                const n = MathUtils.fbm(normX * 16 + t * 0.05, sampleY * 12 - t * 0.02);
                const lum = MathUtils.sat(shade * (0.8 + n * 0.2));

                let char: string;
                if (lum > 0.82) char = '█';
                else if (lum > 0.62) char = '▓';
                else if (lum > 0.42) char = '▒';
                else if (lum > 0.26) char = '░';
                else char = '·';

                const color = isWhite ? FLAG.white : FLAG.celeste;
                const base = isWhite ? FLAG.alphaWhite : FLAG.alphaCeleste;
                const alpha = base * (0.5 + lum * 0.5);

                this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
                this.ctx.fillText(char, px, r * grid.ch);
            }
        }
    }
}
