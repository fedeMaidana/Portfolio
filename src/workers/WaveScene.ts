import { CONFIG } from './Constant';
import { SurfboardRenderer } from './renderers/SurfBoardRenderer';
import { WaveRenderer } from './renderers/WaveRenderer';
import { SurfboardModel } from './SurfBoardModel';
import type { GridConfig } from './Types';

export class WaveScene {
    private ctx: OffscreenCanvasRenderingContext2D;
    private boardCanvas: OffscreenCanvas;
    private boardCtx: OffscreenCanvasRenderingContext2D;

    private tick: number = 0;
    private reducedMotion: boolean = false;
    private animationFrameId: number = 0;

    private grid: GridConfig = CONFIG.grid;
    private waveRenderer: WaveRenderer;
    private surfboardRenderer: SurfboardRenderer;

    constructor(
        private cvs: OffscreenCanvas,
        private W: number,
        private H: number,
        private dpr: number
    ) {
        this.ctx = cvs.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D;

        this.boardCanvas = new OffscreenCanvas(W, H);
        this.boardCtx = this.boardCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

        const surfboard = new SurfboardModel();
        this.waveRenderer = new WaveRenderer(this.ctx);
        this.surfboardRenderer = new SurfboardRenderer(this.boardCtx, surfboard);

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
        if (!reduces && this.animationFrameId === 0) {
            this.render();
        }
    }

    public render() {
        if (this.reducedMotion) {
            this.animationFrameId = 0;
            return;
        }

        if (this.tick++ % CONFIG.frameSkip !== 0) {
            this.animationFrameId = requestAnimationFrame(this.render);
            return;
        }

        this.ctx.fillStyle = CONFIG.bg;
        this.ctx.fillRect(0, 0, this.W, this.H);

        this.waveRenderer.draw(this.tick * 0.006, this.grid, this.W, this.H, this.tick);
        this.ctx.drawImage(this.boardCanvas, 0, 0, this.W / this.dpr, this.H / this.dpr);

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    // ── Privado ───────────────────────────────

    private gridForSize(): GridConfig {
        return this.W < 768 ? { cw: 7, ch: 12 } : { cw: 5, ch: 9 };
    }

    private applyResize() {
        this.grid = this.gridForSize();

        this.cvs.width = this.W * this.dpr;
        this.cvs.height = this.H * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.boardCanvas.width = this.cvs.width;
        this.boardCanvas.height = this.cvs.height;
        this.boardCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.surfboardRenderer.draw(this.W, this.H);
    }
}
