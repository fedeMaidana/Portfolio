let currentWorker: Worker | null = null;
let resizeHandler: (() => void) | null = null;
let motionQuery: MediaQueryList | null = null;
let motionHandler: ((e: MediaQueryListEvent) => void) | null = null;
let visibilityHandler: (() => void) | null = null;

function cleanup() {
    if (currentWorker) {
        currentWorker.terminate();
        currentWorker = null;
    }
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
    if (motionQuery && motionHandler) {
        motionQuery.removeEventListener('change', motionHandler);
        motionHandler = null;
        motionQuery = null;
    }
    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
    }
}

function initWave() {
    cleanup();

    const cvs = document.getElementById('waveCanvas') as HTMLCanvasElement | null;
    if (!cvs || !('OffscreenCanvas' in window)) return;

    const offscreen = cvs.transferControlToOffscreen();

    const worker = new Worker(new URL('../workers/wave.worker.ts', import.meta.url), {
        type: 'module',
    });
    currentWorker = worker;

    const getDpr = () => Math.min(window.devicePixelRatio || 1, 1.25);

    worker.postMessage(
        {
            type: 'init',
            payload: {
                canvas: offscreen,
                width: window.innerWidth,
                height: window.innerHeight,
                dpr: getDpr(),
            },
        },
        [offscreen]
    );

    let resizeTimeout: number;
    resizeHandler = () => {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
            worker.postMessage({
                type: 'resize',
                payload: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    dpr: getDpr(),
                },
            });
        }, 100);
    };
    window.addEventListener('resize', resizeHandler);

    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionHandler = (e: MediaQueryListEvent) => {
        worker.postMessage({ type: 'motion-preference', payload: { reduces: e.matches } });
    };
    motionQuery.addEventListener('change', motionHandler);
    worker.postMessage({
        type: 'motion-preference',
        payload: { reduces: motionQuery.matches },
    });

    visibilityHandler = () => {
        worker.postMessage({ type: 'visibility', payload: { hidden: document.hidden } });
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    worker.postMessage({ type: 'visibility', payload: { hidden: document.hidden } });
}

document.addEventListener('astro:page-load', initWave);
document.addEventListener('astro:before-swap', cleanup);
