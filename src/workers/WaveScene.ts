import { CONFIG } from './Constant';
import { FlagRenderer } from './renderers/FlagRenderer';
import type { GridConfig } from './Types';

export class WaveScene {
    private ctx: OffscreenCanvasRenderingContext2D;

    private tick: number = 0;
    private reducedMotion: boolean = false;
    private hidden: boolean = false;
    private animationFrameId: number = 0;

    private grid: GridConfig = CONFIG.grid;
    private flagRenderer: FlagRenderer;

    constructor(
        private cvs: OffscreenCanvas,
        private W: number,
        private H: number,
        private dpr: number
    ) {
        this.ctx = cvs.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D;

        this.flagRenderer = new FlagRenderer(this.ctx);

        this.render = this.render.bind(this);
        this.applyResize();
        this.render();
    }

    public resize(width: number, height: number, dpr: number) {
        this.W = width;
        this.H = height;
        this.dpr = dpr;
        this.applyResize();
    }

    public setReducedMotion(reduces: boolean) {
        this.reducedMotion = reduces;

        if (reduces) {
            this.stop();
            this.drawFrame();
        } else {
            this.resume();
        }
    }

    public setVisibility(hidden: boolean) {
        this.hidden = hidden;

        if (hidden) {
            this.stop();
        } else {
            this.resume();
        }
    }

    public render() {
        if (this.reducedMotion || this.hidden) {
            this.animationFrameId = 0;
            return;
        }

        if (this.tick++ % CONFIG.frameSkip !== 0) {
            this.animationFrameId = requestAnimationFrame(this.render);
            return;
        }

        this.drawFrame();

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    // ── Privado ───────────────────────────────

    private stop() {
        if (this.animationFrameId !== 0) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
        }
    }

    private resume() {
        if (!this.reducedMotion && !this.hidden && this.animationFrameId === 0) {
            this.render();
        }
    }

    private drawFrame() {
        this.ctx.fillStyle = CONFIG.bg;
        this.ctx.fillRect(0, 0, this.W, this.H);

        this.flagRenderer.draw(this.tick * 0.006, this.grid, this.W, this.H);
    }

    private gridForSize(): GridConfig {
        return this.W < 768 ? { cw: 6, ch: 10 } : { cw: 4, ch: 7 };
    }

    private applyResize() {
        this.grid = this.gridForSize();

        this.cvs.width = this.W * this.dpr;
        this.cvs.height = this.H * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (this.reducedMotion || this.hidden) this.drawFrame();
    }
}
