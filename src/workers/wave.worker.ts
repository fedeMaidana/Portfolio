import type { WorkerMessage } from '@/workers/Types';
import { WaveScene } from '@/workers/WaveScene';

let scene: WaveScene | null = null;

self.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
    const { type, payload } = data;

    switch (type) {
        case 'init':
            scene = new WaveScene(payload.canvas, payload.width, payload.height, payload.dpr);
            break;
        case 'resize':
            scene?.resize(payload.width, payload.height, payload.dpr);
            break;
        case 'motion-preference':
            scene?.setReducedMotion(payload.reduces);
            break;
    }
};
