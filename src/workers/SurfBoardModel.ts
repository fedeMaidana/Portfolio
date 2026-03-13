import { SURFBOARD_DATA } from '@/workers/Constant';
import type { ColorTuple } from '@/workers/Types';

export interface OutlinePoint {
    row: number;
    left: number;
    right: number;
}

export class SurfboardModel {
    readonly buryRows = 5;
    readonly visibleRows = SURFBOARD_DATA.length - 5;
    readonly charW = 5;
    readonly charH = 8;
    readonly tiltAngle = -0.21;
    readonly outline: OutlinePoint[] = [];
    readonly colors = new Map<string, ColorTuple>();

    constructor() {
        this.buildOutline();
        this.buildColorMap();
    }

    private buildOutline() {
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
    }

    private buildColorMap() {
        '█▄▟▙▜▛▝▘'.split('').forEach((c) => this.colors.set(c, [225, 220, 210, 0.15]));
        '▐▌'.split('').forEach((c) => this.colors.set(c, [205, 200, 190, 0.12]));
        this.colors.set('◆', [126, 184, 204, 0.25]);
        this.colors.set('◇', [160, 215, 235, 0.2]);
        this.colors.set('▀', [185, 180, 170, 0.13]);
    }
}
