import { MathUtils } from '@/workers/Maths';
import type { CellRender, GridConfig } from '@/workers/Types';

export class WaveRenderer {
    constructor(private ctx: OffscreenCanvasRenderingContext2D) {}

    draw(t: number, grid: GridConfig, W: number, H: number, tick: number) {
        const cols = Math.ceil(W / grid.cw) + 1;
        const rows = Math.ceil(H / grid.ch) + 1;
        const invCols = 1 / cols;
        const invRows = 1 / rows;
        const surge = Math.sin(tick * 0.01) * 0.055 + Math.sin(tick * 0.006 + 1.3) * 0.025;

        this.ctx.font = '7px "Space Mono", monospace';
        this.ctx.textBaseline = 'top';

        for (let r = 0; r < rows; r++) {
            const py = r * grid.ch;
            const normY = 1 - r * invRows;
            const sinA = Math.sin(normY * 18 + t * 1.5) * 0.018;
            const sinB = Math.sin(normY * 9 - t * 0.9);

            for (let c = 0; c < cols; c++) {
                const px = c * grid.cw;
                const normX = 1 - c * invCols;

                const shoreBase = normX * 0.7 - normY * 0.42 + 0.1;
                const waveBend =
                    sinA +
                    sinB * 0.028 * (1 + normX * 0.14) +
                    (MathUtils.fbm(normX * 5 + t * 0.08, normY * 4.5) - 0.5) * 0.045;
                const dist = normX - normY * 0.58 - (shoreBase + waveBend + surge);

                if (dist > 0.03) continue;

                const cell = this.classifyCell(dist, normX, normY, t);
                if (cell) {
                    const { char, color } = cell;
                    this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.alpha})`;
                    this.ctx.fillText(char, px, py);
                }
            }
        }
    }

    // ── Clasificación de celda ─────────────────

    private classifyCell(dist: number, normX: number, normY: number, t: number): CellRender | null {
        const FOAM_DEPTH = 0.065;

        if (dist > -FOAM_DEPTH) return this.renderFoam(dist, normX, normY, t, FOAM_DEPTH);
        if (dist > -FOAM_DEPTH - 0.12) return this.renderWetSand(dist, normX, normY, t, FOAM_DEPTH);
        /* else */ return this.renderDrySand(normX, normY, t);
    }

    private renderFoam(
        dist: number,
        normX: number,
        normY: number,
        t: number,
        foamDepth: number
    ): CellRender | null {
        const foamT = MathUtils.sat((dist + foamDepth) / (foamDepth + 0.005));
        const noise = MathUtils.fbm(normX * 14 + t * 0.12, normY * 12 - t * 0.08);
        const density = 0.4 + noise * 0.6;

        if (foamT > 0.65) {
            const strength = MathUtils.smoothstep(0.65, 0.9, foamT) * density;
            const noise2 = MathUtils.vnoise(normX * 25 + t * 0.2, normY * 22);
            const char = noise2 > 0.35 && strength > 0.3 ? '█' : noise2 > 0.15 ? '▓' : '▒';
            return { char, color: { r: 160, g: 195, b: 210, alpha: 0.1 + strength * 0.25 } };
        }

        if (foamT > 0.3) {
            const strength = MathUtils.smoothstep(0.3, 0.65, foamT) * density;
            if (noise > 0.56)
                return {
                    char: '░',
                    color: { r: 130, g: 170, b: 190, alpha: 0.06 + strength * 0.18 },
                };
            return { char: '·', color: { r: 110, g: 150, b: 175, alpha: 0.04 + strength * 0.14 } };
        }

        const strength = (foamT / 0.3) * density;
        if (noise > 0.58)
            return { char: '·', color: { r: 100, g: 140, b: 165, alpha: 0.03 + strength * 0.12 } };
        return null;
    }

    private renderWetSand(
        dist: number,
        normX: number,
        normY: number,
        t: number,
        foamDepth: number
    ): CellRender | null {
        const wetT = MathUtils.sat(1.0 - (-dist - foamDepth) / 0.12);
        const noise = MathUtils.fbm(normX * 7 + t * 0.02, normY * 6);

        if (noise > 0.52) {
            const char = noise > 0.68 ? '·' : '░';
            return { char, color: { r: 185, g: 165, b: 115, alpha: 0.04 + wetT * 0.09 } };
        }
        if (noise > 0.42)
            return { char: '·', color: { r: 170, g: 150, b: 105, alpha: 0.02 + wetT * 0.04 } };
        return null;
    }

    private renderDrySand(normX: number, normY: number, t: number): CellRender | null {
        const noise = MathUtils.fbm(normX * 9 + t * 0.005, normY * 8 + t * 0.003);

        if (noise > 0.6) {
            const noise2 = MathUtils.vnoise(normX * 18 + 3.1, normY * 16 + 1.4);
            const char = noise2 > 0.6 ? '·' : '░';
            return { char, color: { r: 210, g: 190, b: 135, alpha: 0.04 + (noise - 0.6) * 0.12 } };
        }
        if (noise > 0.5) return { char: '·', color: { r: 195, g: 175, b: 120, alpha: 0.022 } };
        if (noise > 0.42) return { char: '·', color: { r: 185, g: 165, b: 112, alpha: 0.01 } };
        return null;
    }
}
