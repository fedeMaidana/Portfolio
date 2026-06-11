import type { GridConfig } from './Types';

export const CONFIG = {
    frameSkip: 2,
    bg: '#0a0d10',
    grid: { cw: 4, ch: 7 } as GridConfig,
};

export const FLAG = {
    celeste: { r: 117, g: 170, b: 219 },
    white: { r: 236, g: 240, b: 245 },
    gold: { r: 245, g: 196, b: 84 },

    waveAmp: 3.2,
    waveFreq: 7.5,
    waveSpeed: 1.8,

    sunRadius: 0.075,
    sunReach: 2.35,
    sunRays: 32,

    alphaCeleste: 0.38,
    alphaWhite: 0.3,
    alphaSun: 0.6,
} as const;

export const ALPHA_STEPS = 24;
