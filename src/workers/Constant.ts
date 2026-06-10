import type { GridConfig } from './Types';

export const CONFIG = {
    frameSkip: 2,
    bg: '#0a0d10',
    grid: { cw: 5, ch: 9 } as GridConfig,
};

export const FLAG = {
    /** Celeste de la bandera (~#75AADB) */
    celeste: { r: 117, g: 170, b: 219 },
    /** Franja blanca */
    white: { r: 236, g: 240, b: 245 },
    /** Dorado del Sol de Mayo */
    gold: { r: 245, g: 196, b: 84 },

    /** Amplitud del ondeo, en filas de la grilla */
    waveAmp: 2.6,
    /** Frecuencia espacial del ondeo */
    waveFreq: 7,
    /** Velocidad del ondeo */
    waveSpeed: 1.4,

    /** Radio del disco del sol, relativo al lado menor del viewport */
    sunRadius: 0.075,
    /** Largo máximo de los rayos, como múltiplo del radio */
    sunReach: 2.35,
    /** Cantidad de rayos del Sol de Mayo (32: rectos y flamígeros alternados) */
    sunRays: 32,

    /** Opacidad base de cada franja (la tela modula sobre esto) */
    alphaCeleste: 0.38,
    alphaWhite: 0.3,
    alphaSun: 0.6,
} as const;
