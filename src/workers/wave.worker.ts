// ══════════════════════════════════════════════
// 1. UTILIDADES Y MATEMÁTICA
// ══════════════════════════════════════════════
const MathUtils = {
    hash(x: number, y: number): number {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    },
    vnoise(x: number, y: number): number {
        const ix = Math.floor(x),
            iy = Math.floor(y);
        const fx = x - ix,
            fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        return (
            (this.hash(ix, iy) + (this.hash(ix + 1, iy) - this.hash(ix, iy)) * ux) * (1 - uy) +
            (this.hash(ix, iy + 1) + (this.hash(ix + 1, iy + 1) - this.hash(ix, iy + 1)) * ux) * uy
        );
    },
    fbm(x: number, y: number): number {
        return this.vnoise(x, y) * 0.65 + this.vnoise(x * 2.1, y * 2.1) * 0.35;
    },
    sat(v: number): number {
        return v < 0 ? 0 : v > 1 ? 1 : v;
    },
    smoothstep(lo: number, hi: number, v: number): number {
        const t = this.sat((v - lo) / (hi - lo));
        return t * t * (3 - 2 * t);
    },
};

// ══════════════════════════════════════════════
// 2. CONFIGURACIÓN Y MODELO
// ══════════════════════════════════════════════
const CONFIG = {
    grid: { cw: 5, ch: 9 },
    frameSkip: 2,
    bg: '#0a0d10',
};

const SURFBOARD_DATA = [
    '       ▄       ',
    '      ▟█▙      ',
    '     ▟███▙     ',
    '    ▐█▌█▐█▌    ',
    '    ▐█ █ █▌    ',
    '   ▐█  █  █▌   ',
    '   ██  █  ██   ',
    '   ██ ◆█◆ ██   ',
    '   ██  █  ██   ',
    '   ██ ◇█◇ ██   ',
    '   ██  █  ██   ',
    '   ██ ◆█◆ ██   ',
    '   ▐█  █  █▌   ',
    '    ▐█ █ █▌    ',
    '    ▐█▌█▐█▌    ',
    '     ▜███▛     ',
    '      ▜█▛      ',
    '      ▐█▌      ',
    '     ▟▀▀▀▙     ',
    '    ▝▀   ▀▘    ',
];

class SurfboardModel {
    readonly buryRows = 5;
    readonly visibleRows = SURFBOARD_DATA.length - 5;
    readonly charW = 5;
    readonly charH = 8;
    readonly tiltAngle = -0.21;
    readonly outline: { row: number; left: number; right: number }[] = [];
    readonly colors = new Map<string, number[]>();

    constructor() {
        for (let row = 0; row < this.visibleRows; row++) {
            const line = SURFBOARD_DATA[row];
            if (!line) continue;

            let left = -1,
                right = -1;
            for (let i = 0; i < line.length; i++)
                if (line[i] !== ' ') {
                    left = i;
                    break;
                }
            for (let i = line.length - 1; i >= 0; i--)
                if (line[i] !== ' ') {
                    right = i;
                    break;
                }
            if (left >= 0) this.outline.push({ row, left, right });
        }

        '█▄▟▙▜▛▝▘'.split('').forEach((c) => this.colors.set(c, [225, 220, 210, 0.15]));
        '▐▌'.split('').forEach((c) => this.colors.set(c, [205, 200, 190, 0.12]));
        this.colors.set('◆', [126, 184, 204, 0.25]);
        this.colors.set('◇', [160, 215, 235, 0.2]);
        this.colors.set('▀', [185, 180, 170, 0.13]);
    }
}

// ══════════════════════════════════════════════
// 3. MOTOR DE RENDERIZADO
// ══════════════════════════════════════════════
class WaveScene {
    private ctx: OffscreenCanvasRenderingContext2D;
    private boardCanvas: OffscreenCanvas;
    private boardCtx: OffscreenCanvasRenderingContext2D;
    private tick: number = 0;
    private surfboard = new SurfboardModel();
    private reducesMotion: boolean = false;
    private animationFrameId: number = 0;

    constructor(
        private cvs: OffscreenCanvas,
        private W: number,
        private H: number,
        private dpr: number
    ) {
        this.ctx = cvs.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D;
        this.boardCanvas = new OffscreenCanvas(W, H);
        this.boardCtx = this.boardCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

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

    public setReduceMotion(reduces: boolean) {
        this.reducesMotion = reduces;
        if (!reduces && this.animationFrameId === 0) {
            this.render();
        }
    }

    private applyResize() {
        const isMobile = this.W < 768;
        CONFIG.grid.cw = isMobile ? 7 : 5;
        CONFIG.grid.ch = isMobile ? 12 : 9;

        this.cvs.width = this.W * this.dpr;
        this.cvs.height = this.H * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.boardCanvas.width = this.cvs.width;
        this.boardCanvas.height = this.cvs.height;
        this.boardCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.drawSurfboardBlock();
    }

    private drawWaves(t: number) {
        const COLS = Math.ceil(this.W / CONFIG.grid.cw) + 1;
        const ROWS = Math.ceil(this.H / CONFIG.grid.ch) + 1;
        const invCOLS = 1 / COLS;
        const invROWS = 1 / ROWS;
        const surge =
            Math.sin(this.tick * 0.01) * 0.055 + Math.sin(this.tick * 0.006 + 1.3) * 0.025;

        this.ctx.font = '7px "Space Mono", monospace';
        this.ctx.textBaseline = 'top';

        for (let r = 0; r < ROWS; r++) {
            const py = r * CONFIG.grid.ch;
            const nyF = 1 - r * invROWS;
            const sinA = Math.sin(nyF * 18 + t * 1.5) * 0.018;
            const sinB = Math.sin(nyF * 9 - t * 0.9);

            for (let c = 0; c < COLS; c++) {
                const px = c * CONFIG.grid.cw;
                const nxF = 1 - c * invCOLS;

                const shoreBase = nxF * 0.7 - nyF * 0.42 + 0.1;
                const wb =
                    sinA +
                    sinB * 0.028 * (1 + nxF * 0.14) +
                    (MathUtils.fbm(nxF * 5 + t * 0.08, nyF * 4.5) - 0.5) * 0.045;
                const dist = nxF - nyF * 0.58 - (shoreBase + wb + surge);

                if (dist > 0.03) continue;

                this.renderCell(dist, nxF, nyF, t, px, py);
            }
        }
    }

    private renderCell(dist: number, nxF: number, nyF: number, t: number, px: number, py: number) {
        const totalFoam = 0.065;
        let ch = '',
            alpha = 0,
            R = 0,
            G = 0,
            B = 0;

        if (dist > -totalFoam) {
            const foamT = MathUtils.sat((dist + totalFoam) / (totalFoam + 0.005));
            const fn = MathUtils.fbm(nxF * 14 + t * 0.12, nyF * 12 - t * 0.08);
            const density = 0.4 + fn * 0.6;

            if (foamT > 0.65) {
                const strength = MathUtils.smoothstep(0.65, 0.9, foamT) * density;
                const fn2 = MathUtils.vnoise(nxF * 25 + t * 0.2, nyF * 22);
                ch = fn2 > 0.35 && strength > 0.3 ? '█' : fn2 > 0.15 ? '▓' : '▒';
                alpha = 0.1 + strength * 0.25;
                R = 160;
                G = 195;
                B = 210;
            } else if (foamT > 0.3) {
                const strength = MathUtils.smoothstep(0.3, 0.65, foamT) * density;
                if (fn > 0.56) {
                    ch = '░';
                    alpha = 0.06 + strength * 0.18;
                    R = 130;
                    G = 170;
                    B = 190;
                } else {
                    ch = '·';
                    alpha = 0.04 + strength * 0.14;
                    R = 110;
                    G = 150;
                    B = 175;
                }
            } else {
                const strength = (foamT / 0.3) * density;
                if (fn > 0.58) {
                    ch = '·';
                    alpha = 0.03 + strength * 0.12;
                    R = 100;
                    G = 140;
                    B = 165;
                }
            }
        } else if (dist > -totalFoam - 0.12) {
            const wetT = MathUtils.sat(1.0 - (-dist - totalFoam) / 0.12);
            const wn = MathUtils.fbm(nxF * 7 + t * 0.02, nyF * 6);
            if (wn > 0.52) {
                ch = wn > 0.68 ? '·' : '░';
                alpha = 0.04 + wetT * 0.09;
                R = 185;
                G = 165;
                B = 115;
            } else if (wn > 0.42) {
                ch = '·';
                alpha = 0.02 + wetT * 0.04;
                R = 170;
                G = 150;
                B = 105;
            }
        } else {
            const sn = MathUtils.fbm(nxF * 9 + t * 0.005, nyF * 8 + t * 0.003);
            if (sn > 0.6) {
                const sn2 = MathUtils.vnoise(nxF * 18 + 3.1, nyF * 16 + 1.4);
                ch = sn2 > 0.6 ? '·' : '░';
                alpha = 0.04 + (sn - 0.6) * 0.12;
                R = 210;
                G = 190;
                B = 135;
            } else if (sn > 0.5) {
                ch = '·';
                alpha = 0.022;
                R = 195;
                G = 175;
                B = 120;
            } else if (sn > 0.42) {
                ch = '·';
                alpha = 0.01;
                R = 185;
                G = 165;
                B = 112;
            }
        }

        if (alpha > 0.01) {
            this.ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
            this.ctx.fillText(ch, px, py);
        }
    }

    private drawSurfboardBlock() {
        const sb = this.surfboard;
        const sbCenterX = Math.floor(this.W * 0.6);
        const sbCenterY = Math.floor(this.H * 0.18);

        const firstLine = SURFBOARD_DATA[0] ?? '';
        const pivotX = sbCenterX + (firstLine.length * sb.charW) / 2;
        const pivotY = sbCenterY + sb.visibleRows * sb.charH;

        this.boardCtx.clearRect(0, 0, this.W, this.H);
        this.boardCtx.save();
        this.boardCtx.translate(pivotX, pivotY);
        this.boardCtx.rotate(sb.tiltAngle);
        this.boardCtx.translate(-pivotX, -pivotY);

        const pad = 3;
        this.boardCtx.fillStyle = CONFIG.bg;
        this.boardCtx.beginPath();

        const first = sb.outline[0];
        if (first) {
            this.boardCtx.moveTo(
                sbCenterX + first.left * sb.charW - pad,
                sbCenterY + first.row * sb.charH - pad
            );
        }

        for (const o of sb.outline) {
            this.boardCtx.lineTo(
                sbCenterX + o.left * sb.charW - pad,
                sbCenterY + o.row * sb.charH + sb.charH * 0.5
            );
        }

        const last = sb.outline[sb.outline.length - 1];
        if (last) {
            this.boardCtx.lineTo(
                sbCenterX + last.left * sb.charW - pad,
                sbCenterY + last.row * sb.charH + sb.charH + pad
            );
            this.boardCtx.lineTo(
                sbCenterX + (last.right + 1) * sb.charW + pad,
                sbCenterY + last.row * sb.charH + sb.charH + pad
            );
        }

        for (let i = sb.outline.length - 1; i >= 0; i--) {
            const o = sb.outline[i];
            if (o) {
                this.boardCtx.lineTo(
                    sbCenterX + (o.right + 1) * sb.charW + pad,
                    sbCenterY + o.row * sb.charH + sb.charH * 0.5
                );
            }
        }

        this.boardCtx.closePath();
        this.boardCtx.fill();

        this.boardCtx.font = '7.5px "Space Mono", monospace';
        this.boardCtx.textBaseline = 'top';
        this.boardCtx.shadowColor = 'rgba(126, 184, 204, 0.08)';
        this.boardCtx.shadowBlur = 10;

        for (let row = 0; row < SURFBOARD_DATA.length; row++) {
            const line = SURFBOARD_DATA[row];
            if (!line) continue;

            const py = sbCenterY + row * sb.charH;
            let buriedFade = 1.0;
            if (row >= sb.visibleRows) {
                buriedFade = Math.max(
                    0,
                    1.0 - ((row - sb.visibleRows + 1) / (sb.buryRows + 1)) * 1.8
                );
            }
            if (buriedFade <= 0.01) continue;

            for (let col = 0; col < line.length; col++) {
                const char = line[col];
                if (!char || char === ' ') continue;

                const c = sb.colors.get(char) || [210, 205, 195, 0.12];
                const alpha = c[3] ?? 0.12;

                this.boardCtx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha * buriedFade})`;
                this.boardCtx.fillText(char, sbCenterX + col * sb.charW, py);
            }
        }

        this.boardCtx.shadowColor = 'transparent';
        this.boardCtx.shadowBlur = 0;
        const mx = sbCenterX + 2 * sb.charW;
        const my = sbCenterY + sb.visibleRows * sb.charH - sb.charH * 0.3;

        const mound1 = ['░', '·', '░', '·', '░', '░', '·', '░'];
        for (let i = 0; i < mound1.length; i++) {
            const char = mound1[i];
            if (char) {
                this.boardCtx.fillStyle = `rgba(210,190,135,${0.06 + Math.sin(i * 1.7) * 0.025})`;
                this.boardCtx.fillText(char, mx + i * sb.charW, my);
            }
        }

        const mound2 = ['·', '░', '·', '░', '░', '·', '░', '·', '░', '·'];
        for (let i = 0; i < mound2.length; i++) {
            const char = mound2[i];
            if (char) {
                this.boardCtx.fillStyle = `rgba(195,175,120,${0.04 + Math.sin(i * 2.1 + 0.5) * 0.02})`;
                this.boardCtx.fillText(char, mx - sb.charW + i * sb.charW, my + sb.charH * 0.8);
            }
        }
        this.boardCtx.restore();
    }

    public render() {
        if (this.reducesMotion) {
            this.animationFrameId = 0;
            return;
        }

        if (this.tick++ % CONFIG.frameSkip !== 0) {
            this.animationFrameId = requestAnimationFrame(this.render);
            return;
        }

        this.ctx.fillStyle = CONFIG.bg;
        this.ctx.fillRect(0, 0, this.W, this.H);

        this.drawWaves(this.tick * 0.006);
        this.ctx.drawImage(this.boardCanvas, 0, 0, this.W / this.dpr, this.H / this.dpr);

        this.animationFrameId = requestAnimationFrame(this.render);
    }
}

// ══════════════════════════════════════════════
// 4. COMUNICACIÓN CON EL MAIN THREAD
// ══════════════════════════════════════════════
let scene: WaveScene | null = null;

self.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === 'init') {
        scene = new WaveScene(payload.canvas, payload.width, payload.height, payload.dpr);
    } else if (type === 'resize' && scene) {
        scene.resize(payload.width, payload.height, payload.dpr);
    } else if (type === 'motion-preference' && scene) {
        scene.setReduceMotion(payload.reduces);
    }
};
