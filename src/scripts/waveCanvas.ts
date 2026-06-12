let currentWorker: Worker | null = null;
let resizeHandler: (() => void) | null = null;
let schemeQuery: MediaQueryList | null = null;
let schemeHandler: ((e: MediaQueryListEvent) => void) | null = null;
let motionQuery: MediaQueryList | null = null;
let motionHandler: ((e: MediaQueryListEvent) => void) | null = null;
let smallQuery: MediaQueryList | null = null;
let smallHandler: ((e: MediaQueryListEvent) => void) | null = null;
let visibilityHandler: (() => void) | null = null;

const DPR = 1;

function cleanup() {
    if (currentWorker) {
        currentWorker.terminate();
        currentWorker = null;
    }
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
    if (schemeQuery && schemeHandler) {
        schemeQuery.removeEventListener('change', schemeHandler);
        schemeHandler = null;
        schemeQuery = null;
    }
    if (motionQuery && motionHandler) {
        motionQuery.removeEventListener('change', motionHandler);
        motionHandler = null;
        motionQuery = null;
    }
    if (smallQuery && smallHandler) {
        smallQuery.removeEventListener('change', smallHandler);
        smallHandler = null;
        smallQuery = null;
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

    worker.postMessage(
        {
            type: 'init',
            payload: {
                canvas: offscreen,
                width: window.innerWidth,
                height: window.innerHeight,
                dpr: DPR,
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
                    dpr: DPR,
                },
            });
        }, 100);
    };
    window.addEventListener('resize', resizeHandler);

    const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    schemeQuery = darkScheme;

    const sendTheme = () => {
        worker.postMessage({
            type: 'theme',
            payload: { theme: darkScheme.matches ? 'dark' : 'light' },
        });
    };

    schemeHandler = sendTheme;
    darkScheme.addEventListener('change', schemeHandler);
    sendTheme();

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 600px)');
    motionQuery = motion;
    smallQuery = small;

    const sendMotionPreference = () => {
        worker.postMessage({
            type: 'motion-preference',
            payload: { reduces: motion.matches || small.matches },
        });
    };

    motionHandler = sendMotionPreference;
    smallHandler = sendMotionPreference;
    motion.addEventListener('change', motionHandler);
    small.addEventListener('change', smallHandler);
    sendMotionPreference();

    visibilityHandler = () => {
        worker.postMessage({ type: 'visibility', payload: { hidden: document.hidden } });
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    worker.postMessage({ type: 'visibility', payload: { hidden: document.hidden } });
}

document.addEventListener('astro:page-load', initWave);
document.addEventListener('astro:before-swap', cleanup);
