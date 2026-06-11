import { GlyphAtlas } from '../GlyphAtlas';
import type { GridConfig } from '../Types';
import { ClothRenderer } from './ClothRenderer';
import { SunRenderer } from './SunRenderer';

export class FlagRenderer {
    private cloth = new ClothRenderer();
    private sun = new SunRenderer();

    private atlas: GlyphAtlas | null = null;
    private atlasKey = '';

    constructor(private ctx: OffscreenCanvasRenderingContext2D) {}

    draw(t: number, grid: GridConfig, W: number, H: number): void {
        const key = `${grid.cw}x${grid.ch}`;
        if (!this.atlas || key !== this.atlasKey) {
            this.atlas = new GlyphAtlas(grid);
            this.atlasKey = key;
        }

        const cols = Math.ceil(W / grid.cw) + 1;
        const rows = Math.ceil(H / grid.ch) + 1;

        const foldScale = H > W ? 1.7 : 1;

        this.cloth.draw(t, grid, cols, rows, this.atlas, foldScale);
        this.atlas.flush(this.ctx);

        this.sun.draw(t, grid, cols, rows, W, H, this.atlas);
        this.atlas.flush(this.ctx);
    }
}
