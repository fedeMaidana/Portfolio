import spaceMonoUrl from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?url';
import type { CanvasResize, ThemeName, WorkerMessage } from './Types';
import { WaveScene } from './WaveScene';

let scene: WaveScene | null = null;

let pendingResize: CanvasResize | null = null;
let pendingTheme: ThemeName | null = null;
let pendingReduced: boolean | null = null;
let pendingHidden: boolean | null = null;

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

            if (pendingResize) {
                scene.resize(pendingResize.width, pendingResize.height, pendingResize.dpr);
            }
            if (pendingTheme !== null) scene.setTheme(pendingTheme);
            if (pendingReduced !== null) scene.setReducedMotion(pendingReduced);
            if (pendingHidden !== null) scene.setVisibility(pendingHidden);
            break;
        case 'resize':
            if (scene) scene.resize(payload.width, payload.height, payload.dpr);
            else pendingResize = payload;
            break;
        case 'theme':
            if (scene) scene.setTheme(payload.theme);
            else pendingTheme = payload.theme;
            break;
        case 'motion-preference':
            if (scene) scene.setReducedMotion(payload.reduces);
            else pendingReduced = payload.reduces;
            break;
        case 'visibility':
            if (scene) scene.setVisibility(payload.hidden);
            else pendingHidden = payload.hidden;
            break;
    }
};
