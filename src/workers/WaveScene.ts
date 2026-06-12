import { CONFIG } from './Constant';
import { FlagRenderer } from './renderers/FlagRenderer';
import type { GridConfig } from './Types';

export class WaveScene {
    private ctx: OffscreenCanvasRenderingContext2D;

    private t = 0;
    private lastFrame = 0;
    private reducedMotion = false;
    private hidden = false;
    private animationFrameId = 0;

    private static readonly FRAME_MS = 1000 / 24;
    private static readonly SPEED = 0.00036;

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

    public render(now: number = performance.now()) {
        if (this.reducedMotion || this.hidden) {
            this.animationFrameId = 0;
            return;
        }

        this.animationFrameId = requestAnimationFrame(this.render);

        const elapsed = now - this.lastFrame;
        if (elapsed < WaveScene.FRAME_MS) return;

        this.lastFrame = now - (elapsed % WaveScene.FRAME_MS);

        this.t += Math.min(elapsed, 100) * WaveScene.SPEED;
        this.drawFrame();
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

        this.flagRenderer.draw(this.t, this.grid, this.W, this.H);
    }

    private gridForSize(): GridConfig {
        return this.W < 768 ? { cw: 8, ch: 14 } : { cw: 6, ch: 10 };
    }

    private applyResize() {
        this.grid = this.gridForSize();

        this.cvs.width = this.W * this.dpr;
        this.cvs.height = this.H * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (this.reducedMotion || this.hidden) this.drawFrame();
    }
}
