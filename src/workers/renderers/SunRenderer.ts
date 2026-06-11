import { COLOR_INDEX, FLAG } from '../Constant';
import type { GlyphAtlas } from '../GlyphAtlas';
import { MathUtils } from '../Maths';
import type { GridConfig } from '../Types';
import { waveOffset } from '../Wave';

export class SunRenderer {
    draw(
        t: number,
        grid: GridConfig,
        cols: number,
        rows: number,
        W: number,
        H: number,
        atlas: GlyphAtlas
    ): void {
        const portrait = H > W;
        const radiusScale = portrait ? 0.9 : 1;
        const reach = FLAG.sunReach * (portrait ? 0.68 : 1);

        const R = Math.max(36, Math.min(W, H) * FLAG.sunRadius * radiusScale);
        const maxR = R * reach;
        const maxRSq = maxR * maxR;
        const cx = W / 2;
        const cy = H / 2;

        const c0 = Math.max(0, Math.floor((cx - maxR) / grid.cw));
        const c1 = Math.min(cols, Math.ceil((cx + maxR) / grid.cw));
        const margin = Math.ceil(FLAG.waveAmp * 2) + 2;
        const r0 = Math.max(0, Math.floor((cy - maxR) / grid.ch) - margin);
        const r1 = Math.min(rows, Math.ceil((cy + maxR) / grid.ch) + margin);

        const pulse = 0.9 + 0.1 * Math.sin(t * 2);

        for (let c = c0; c < c1; c++) {
            const normX = c / cols;
            const { offset } = waveOffset(normX, t);
            const px = c * grid.cw + grid.cw * 0.5;
            const dx = px - cx;
            const dxSq = dx * dx;

            for (let r = r0; r < r1; r++) {
                const sampleYpx = (r + offset) * grid.ch + grid.ch * 0.5;
                const dy = sampleYpx - cy;

                const distSq = dxSq + dy * dy;
                if (distSq > maxRSq) continue;

                const dist = Math.sqrt(distSq);
                const intensity = this.sunIntensity(dx, dy, dist, R, reach);
                if (intensity <= 0.05) continue;

                const alpha = MathUtils.sat(intensity) * FLAG.alphaSun * pulse;

                let charIdx: number;
                if (intensity > 0.85)
                    charIdx = 0; // █
                else if (intensity > 0.6)
                    charIdx = 1; // ▓
                else if (intensity > 0.35)
                    charIdx = 2; // ▒
                else charIdx = 3; // ░

                atlas.add(charIdx, COLOR_INDEX.gold, alpha, c * grid.cw, r * grid.ch);
            }
        }
    }

    private sunIntensity(dx: number, dy: number, dist: number, R: number, reach: number): number {
        if (dist <= R) {
            return 0.82 + 0.18 * (1 - dist / R);
        }

        const seg = (Math.atan2(dy, dx) / (Math.PI * 2)) * FLAG.sunRays;
        const idx = Math.round(seg);
        const isWavy = ((idx % 2) + 2) % 2 === 1;

        let segDist: number;
        if (isWavy) {
            const wiggle = Math.sin((dist - R) * 0.16) * 0.22;
            segDist = Math.abs(seg - idx - wiggle);
        } else {
            segDist = Math.abs(seg - idx);
        }

        const rayLen = isWavy ? R * (reach * 0.78) : R * reach;
        if (dist >= rayLen) return 0;

        const along = (dist - R) / (rayLen - R);
        const halfWidth = 0.38 * (1 - along * 0.85);

        if (segDist >= halfWidth) return 0;

        return (1 - along) * (1 - (segDist / halfWidth) * 0.45);
    }
}
