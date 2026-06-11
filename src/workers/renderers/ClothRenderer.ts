import { COLOR_INDEX, FLAG } from '../Constant';
import type { GlyphAtlas } from '../GlyphAtlas';
import { MathUtils } from '../Maths';
import type { GridConfig } from '../Types';
import { waveOffset } from '../Wave';

const MIN_ALPHA = 0.04;

export class ClothRenderer {
    draw(
        t: number,
        grid: GridConfig,
        cols: number,
        rows: number,
        atlas: GlyphAtlas,
        foldScale = 1
    ): void {
        const invCols = 1 / cols;
        const invRows = 1 / rows;

        for (let c = 0; c < cols; c++) {
            const normX = c * invCols;
            const px = c * grid.cw;
            const { offset, phase } = waveOffset(normX, t, foldScale);

            const shade = MathUtils.sat(
                0.72 + 0.22 * Math.cos(phase) + 0.06 * Math.cos(phase * 2 + 0.8)
            );

            for (let r = 0; r < rows; r++) {
                const sampleY = (r + offset) * invRows;
                if (sampleY < 0 || sampleY > 1) continue;

                const isWhite = sampleY >= 1 / 3 && sampleY < 2 / 3;

                const n = MathUtils.fbm(normX * 16 + t * 0.05, sampleY * 12 - t * 0.02);
                const lum = MathUtils.sat(shade * (0.8 + n * 0.2));

                const base = isWhite ? FLAG.alphaWhite : FLAG.alphaCeleste;
                const alpha = base * (0.5 + lum * 0.5);
                if (alpha < MIN_ALPHA) continue;

                let charIdx: number;
                if (lum > 0.82)
                    charIdx = 0; // █
                else if (lum > 0.62)
                    charIdx = 1; // ▓
                else if (lum > 0.42)
                    charIdx = 2; // ▒
                else if (lum > 0.26)
                    charIdx = 3; // ░
                else charIdx = 4; // ·

                atlas.add(
                    charIdx,
                    isWhite ? COLOR_INDEX.white : COLOR_INDEX.celeste,
                    alpha,
                    px,
                    r * grid.ch
                );
            }
        }
    }
}
