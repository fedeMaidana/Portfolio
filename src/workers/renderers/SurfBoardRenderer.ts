import { CONFIG, SAND_MOUNDS, SURFBOARD_DATA } from '@/workers/Constant';
import type { SurfboardModel } from '@/workers/SurfBoardModel';

const DEFAULT_COLOR: [number, number, number, number] = [210, 205, 195, 0.12];

export class SurfboardRenderer {
    constructor(
        private ctx: OffscreenCanvasRenderingContext2D,
        private surfboard: SurfboardModel
    ) {}

    /** Redibuja la tabla completa en el canvas dedicado. Llamar en cada resize. */
    draw(W: number, H: number) {
        const sb = this.surfboard;
        const centerX = Math.floor(W * 0.6);
        const centerY = Math.floor(H * 0.18);

        const firstLine = SURFBOARD_DATA[0] ?? '';
        const pivotX = centerX + (firstLine.length * sb.charW) / 2;
        const pivotY = centerY + sb.visibleRows * sb.charH;

        this.ctx.clearRect(0, 0, W, H);
        this.ctx.save();
        this.ctx.translate(pivotX, pivotY);
        this.ctx.rotate(sb.tiltAngle);
        this.ctx.translate(-pivotX, -pivotY);

        this.drawSilhouette(centerX, centerY);
        this.drawChars(centerX, centerY);
        this.drawSandMounds(centerX, centerY);

        this.ctx.restore();
    }

    // ── Capas internas ─────────────────────────

    private drawSilhouette(centerX: number, centerY: number) {
        const sb = this.surfboard;
        const pad = 3;

        this.ctx.fillStyle = CONFIG.bg;
        this.ctx.beginPath();

        const first = sb.outline[0];
        if (first) {
            this.ctx.moveTo(
                centerX + first.left * sb.charW - pad,
                centerY + first.row * sb.charH - pad
            );
        }

        for (const o of sb.outline) {
            this.ctx.lineTo(
                centerX + o.left * sb.charW - pad,
                centerY + o.row * sb.charH + sb.charH * 0.5
            );
        }

        const last = sb.outline[sb.outline.length - 1];
        if (last) {
            this.ctx.lineTo(
                centerX + last.left * sb.charW - pad,
                centerY + last.row * sb.charH + sb.charH + pad
            );
            this.ctx.lineTo(
                centerX + (last.right + 1) * sb.charW + pad,
                centerY + last.row * sb.charH + sb.charH + pad
            );
        }

        for (let i = sb.outline.length - 1; i >= 0; i--) {
            const o = sb.outline[i];
            if (o) {
                this.ctx.lineTo(
                    centerX + (o.right + 1) * sb.charW + pad,
                    centerY + o.row * sb.charH + sb.charH * 0.5
                );
            }
        }

        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawChars(centerX: number, centerY: number) {
        const sb = this.surfboard;

        this.ctx.font = '7.5px "Space Mono", monospace';
        this.ctx.textBaseline = 'top';
        this.ctx.shadowColor = 'rgba(126, 184, 204, 0.08)';
        this.ctx.shadowBlur = 10;

        for (let row = 0; row < SURFBOARD_DATA.length; row++) {
            const line = SURFBOARD_DATA[row];
            if (!line) continue;

            const buriedFade =
                row < sb.visibleRows
                    ? 1.0
                    : Math.max(0, 1.0 - ((row - sb.visibleRows + 1) / (sb.buryRows + 1)) * 1.8);
            if (buriedFade <= 0.01) continue;

            const py = centerY + row * sb.charH;

            for (let col = 0; col < line.length; col++) {
                const char = line[col];
                if (!char || char === ' ') continue;

                const [r, g, b, a] = sb.colors.get(char) ?? DEFAULT_COLOR;

                this.ctx.fillStyle = `rgba(${r},${g},${b},${a * buriedFade})`;
                this.ctx.fillText(char, centerX + col * sb.charW, py);
            }
        }

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    private drawSandMounds(centerX: number, centerY: number) {
        const sb = this.surfboard;
        const mx = centerX + 2 * sb.charW;
        const my = centerY + sb.visibleRows * sb.charH - sb.charH * 0.3;

        for (let i = 0; i < SAND_MOUNDS.top.length; i++) {
            const char = SAND_MOUNDS.top[i];
            if (!char) continue;
            this.ctx.fillStyle = `rgba(210,190,135,${0.06 + Math.sin(i * 1.7) * 0.025})`;
            this.ctx.fillText(char, mx + i * sb.charW, my);
        }

        for (let i = 0; i < SAND_MOUNDS.bottom.length; i++) {
            const char = SAND_MOUNDS.bottom[i];
            if (!char) continue;
            this.ctx.fillStyle = `rgba(195,175,120,${0.04 + Math.sin(i * 2.1 + 0.5) * 0.02})`;
            this.ctx.fillText(char, mx - sb.charW + i * sb.charW, my + sb.charH * 0.8);
        }
    }
}
