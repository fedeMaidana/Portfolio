import { FLAG } from '../Constant';
import { MathUtils } from '../Maths';
import type { GridConfig } from '../Types';

/**
 * Bandera argentina a pantalla completa, en ASCII.
 *
 * - Tres franjas (celeste / blanca / celeste) que ondean como tela
 *   sujeta por el lado izquierdo, con sombreado de pliegues.
 * - Sol de Mayo procedural en el centro: un disco real con 32 rayos
 *   alternados (rectos y flamígeros), calculados por distancia y
 *   ángulo en cada celda, no un sprite fijo. El sol acompaña el
 *   ondeo de la tela.
 */
export class FlagRenderer {
    constructor(private ctx: OffscreenCanvasRenderingContext2D) {}

    draw(t: number, grid: GridConfig, W: number, H: number) {
        // Caracteres que llenan la celda → la tela se ve continua.
        this.ctx.font = `${grid.ch * 0.95}px "Space Mono", monospace`;
        this.ctx.textBaseline = 'top';

        const cols = Math.ceil(W / grid.cw) + 1;
        const rows = Math.ceil(H / grid.ch) + 1;

        this.drawCloth(t, grid, cols, rows);
        this.drawSun(t, grid, cols, rows, W, H);
    }

    // ── Ondeo ──────────────────────────────────

    /**
     * Desplazamiento vertical de la tela en una columna dada.
     * La amplitud crece hacia la derecha, como una bandera
     * sujeta por el mástil a la izquierda.
     */
    private waveOffset(normX: number, t: number): { offset: number; phase: number } {
        const phase = normX * FLAG.waveFreq + t * FLAG.waveSpeed;
        const offset =
            Math.sin(phase) * FLAG.waveAmp * (0.2 + normX * 0.8) +
            Math.sin(phase * 0.5 + 1.7) * FLAG.waveAmp * 0.35;
        return { offset, phase };
    }

    // ── Tela (franjas) ─────────────────────────

    private drawCloth(t: number, grid: GridConfig, cols: number, rows: number) {
        const invCols = 1 / cols;
        const invRows = 1 / rows;

        for (let c = 0; c < cols; c++) {
            const normX = c * invCols;
            const px = c * grid.cw;
            const { offset, phase } = this.waveOffset(normX, t);

            // Pliegues: luz en la cresta, sombra en el valle,
            // con un segundo armónico para que la tela no sea "perfecta".
            const shade = MathUtils.sat(
                0.72 + 0.22 * Math.cos(phase) + 0.06 * Math.cos(phase * 2 + 0.8)
            );

            for (let r = 0; r < rows; r++) {
                // Muestreo con el y desplazado: los bordes entre franjas ondulan.
                const sampleY = (r + offset) * invRows;
                if (sampleY < 0 || sampleY > 1) continue;

                const isWhite = sampleY >= 1 / 3 && sampleY < 2 / 3;

                // Grano de la tela.
                const n = MathUtils.fbm(normX * 16 + t * 0.05, sampleY * 12 - t * 0.02);
                const lum = MathUtils.sat(shade * (0.8 + n * 0.2));

                let char: string;
                if (lum > 0.82) char = '█';
                else if (lum > 0.62) char = '▓';
                else if (lum > 0.42) char = '▒';
                else if (lum > 0.26) char = '░';
                else char = '·';

                const color = isWhite ? FLAG.white : FLAG.celeste;
                const base = isWhite ? FLAG.alphaWhite : FLAG.alphaCeleste;
                const alpha = base * (0.5 + lum * 0.5);

                this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
                this.ctx.fillText(char, px, r * grid.ch);
            }
        }
    }

    // ── Sol de Mayo (procedural) ───────────────

    private drawSun(t: number, grid: GridConfig, cols: number, rows: number, W: number, H: number) {
        const R = Math.max(36, Math.min(W, H) * FLAG.sunRadius);
        const maxR = R * FLAG.sunReach;
        const cx = W / 2;
        const cy = H / 2;

        // Solo recorremos la caja que contiene al sol.
        const c0 = Math.max(0, Math.floor((cx - maxR) / grid.cw));
        const c1 = Math.min(cols, Math.ceil((cx + maxR) / grid.cw));
        const margin = Math.ceil(FLAG.waveAmp * 2) + 2;
        const r0 = Math.max(0, Math.floor((cy - maxR) / grid.ch) - margin);
        const r1 = Math.min(rows, Math.ceil((cy + maxR) / grid.ch) + margin);

        const pulse = 0.9 + 0.1 * Math.sin(t * 2);

        for (let c = c0; c < c1; c++) {
            const normX = c / cols;
            const { offset } = this.waveOffset(normX, t);
            const px = c * grid.cw + grid.cw * 0.5;
            const dx = px - cx;

            for (let r = r0; r < r1; r++) {
                // El sol vive "pegado" a la tela: usa el mismo y desplazado.
                const sampleYpx = (r + offset) * grid.ch + grid.ch * 0.5;
                const dy = sampleYpx - cy;

                const dist = Math.hypot(dx, dy);
                if (dist > maxR) continue;

                const intensity = this.sunIntensity(dx, dy, dist, R);
                if (intensity <= 0.05) continue;

                const alpha = MathUtils.sat(intensity) * FLAG.alphaSun * pulse;

                let char: string;
                if (intensity > 0.85) char = '█';
                else if (intensity > 0.6) char = '▓';
                else if (intensity > 0.35) char = '▒';
                else char = '░';

                this.ctx.fillStyle = `rgba(${FLAG.gold.r},${FLAG.gold.g},${FLAG.gold.b},${alpha})`;
                this.ctx.fillText(char, c * grid.cw, r * grid.ch);
            }
        }
    }

    /**
     * Intensidad [0, 1] del sol en un punto (dx, dy) respecto a su centro.
     * Disco sólido hasta R; afuera, 32 rayos triangulares alternando
     * rectos (largos) y flamígeros (más cortos, que serpentean).
     */
    private sunIntensity(dx: number, dy: number, dist: number, R: number): number {
        if (dist <= R) {
            // Disco: levemente más brillante en el centro, con borde firme.
            return 0.82 + 0.18 * (1 - dist / R);
        }

        // Posición angular en "unidades de rayo" (un rayo = 1 unidad).
        const seg = (Math.atan2(dy, dx) / (Math.PI * 2)) * FLAG.sunRays;
        const idx = Math.round(seg);
        const isWavy = ((idx % 2) + 2) % 2 === 1;

        let segDist: number;
        if (isWavy) {
            // Rayo flamígero: su eje serpentea a lo largo de la distancia.
            const wiggle = Math.sin((dist - R) * 0.16) * 0.22;
            segDist = Math.abs(seg - idx - wiggle);
        } else {
            segDist = Math.abs(seg - idx);
        }

        const rayLen = isWavy ? R * (FLAG.sunReach * 0.78) : R * FLAG.sunReach;
        if (dist >= rayLen) return 0;

        const along = (dist - R) / (rayLen - R); // 0 en la base, 1 en la punta
        const halfWidth = 0.38 * (1 - along * 0.85); // taper triangular

        if (segDist >= halfWidth) return 0;

        return (1 - along) * (1 - (segDist / halfWidth) * 0.45);
    }
}
