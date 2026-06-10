import type { GridConfig } from '../Types';
import { ClothRenderer } from './ClothRenderer';
import { SunRenderer } from './SunRenderer';

export class FlagRenderer {
    private cloth: ClothRenderer;
    private sun: SunRenderer;

    constructor(private ctx: OffscreenCanvasRenderingContext2D) {
        this.cloth = new ClothRenderer(ctx);
        this.sun = new SunRenderer(ctx);
    }

    draw(t: number, grid: GridConfig, W: number, H: number) {
        this.ctx.font = `${grid.ch * 0.95}px "Space Mono", monospace`;
        this.ctx.textBaseline = 'top';

        const cols = Math.ceil(W / grid.cw) + 1;
        const rows = Math.ceil(H / grid.ch) + 1;

        this.cloth.draw(t, grid, cols, rows);
        this.sun.draw(t, grid, cols, rows, W, H);
    }
}
