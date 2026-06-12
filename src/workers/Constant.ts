import type { GridConfig, ThemeColors, ThemeName } from './Types';

export const CONFIG = {
    grid: { cw: 6, ch: 10 } as GridConfig,
};

export const THEMES: Record<ThemeName, ThemeColors> = {
    dark: {
        bg: '#0a0d10',
        palette: [
            { r: 117, g: 170, b: 219 },
            { r: 236, g: 240, b: 245 },
            { r: 245, g: 196, b: 84 },
        ],
    },
    light: {
        bg: '#f1f4f8',
        palette: [
            { r: 64, g: 125, b: 188 },
            { r: 146, g: 163, b: 184 },
            { r: 206, g: 148, b: 30 },
        ],
    },
};

export const FLAG = {
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

export const CHARS = ['█', '▓', '▒', '░', '·'] as const;

export const COLOR_INDEX = {
    celeste: 0,
    white: 1,
    gold: 2,
} as const;
