import spaceMonoUrl from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?url';
import type { WorkerMessage } from './Types';
import { WaveScene } from './WaveScene';

let scene: WaveScene | null = null;

const fontReady: Promise<void> = (async () => {
    try {
        const font = new FontFace('Space Mono', `url(${spaceMonoUrl})`);
        await font.load();
        (self as unknown as { fonts: FontFaceSet }).fonts.add(font);
    } catch {}
})();

self.onmessage = async ({ data }: MessageEvent<WorkerMessage>) => {
    const { type, payload } = data;

    switch (type) {
        case 'init':
            await fontReady;
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
