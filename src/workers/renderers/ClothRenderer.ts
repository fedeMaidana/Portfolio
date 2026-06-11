import { ALPHA_STEPS, FLAG } from '../Constant';
import { MathUtils } from '../Maths';
import type { GridConfig } from '../Types';
import { waveOffset } from '../Wave';

interface RGB {
    r: number;
    g: number;
    b: number;
}

function buildPalette(color: RGB, baseAlpha: number): string[] {
    const palette: string[] = [];
    for (let i = 0; i <= ALPHA_STEPS; i++) {
        const alpha = baseAlpha * (0.45 + (i / ALPHA_STEPS) * 0.55);
        palette.push(`rgba(${color.r},${color.g},${color.b},${alpha.toFixed(3)})`);
    }
    return palette;
}

export class ClothRenderer {
    private readonly celestePalette = buildPalette(FLAG.celeste, FLAG.alphaCeleste);
    private readonly whitePalette = buildPalette(FLAG.white, FLAG.alphaWhite);

    constructor(private ctx: OffscreenCanvasRenderingContext2D) {}

    draw(t: number, grid: GridConfig, cols: number, rows: number) {
        const invCols = 1 / cols;
        const invRows = 1 / rows;

        let lastStyle = '';

        for (let c = 0; c < cols; c++) {
            const normX = c * invCols;
            const px = c * grid.cw;
            const { offset, phase } = waveOffset(normX, t);

            const shade = MathUtils.sat(
                0.62 + 0.3 * Math.cos(phase) + 0.08 * Math.cos(phase * 2 + 0.8)
            );

            for (let r = 0; r < rows; r++) {
                const sampleY = (r + offset) * invRows;
                if (sampleY < 0 || sampleY > 1) continue;

                const isWhite = sampleY >= 1 / 3 && sampleY < 2 / 3;

                const n = MathUtils.fbm(normX * 16 + t * 0.05, sampleY * 12 - t * 0.02);
                const lum = MathUtils.sat(shade * (0.78 + n * 0.26));

                let char: string;
                if (lum > 0.84) char = '█';
                else if (lum > 0.66) char = '▓';
                else if (lum > 0.46) char = '▒';
                else if (lum > 0.28) char = '░';
                else char = '·';

                const palette = isWhite ? this.whitePalette : this.celestePalette;
                const bucket = Math.min(ALPHA_STEPS, Math.round(lum * ALPHA_STEPS));
                const style = palette[bucket] as string;

                if (style !== lastStyle) {
                    this.ctx.fillStyle = style;
                    lastStyle = style;
                }

                this.ctx.fillText(char, px, r * grid.ch);
            }
        }
    }
}
