import { FLAG } from './Constant';

export interface WaveSample {
    offset: number;
    phase: number;
}

export function waveOffset(normX: number, t: number): WaveSample {
    const phase = normX * FLAG.waveFreq + t * FLAG.waveSpeed;

    const offset =
        Math.sin(phase) * FLAG.waveAmp * (0.18 + normX * 0.82) +
        Math.sin(phase * 0.55 + 1.7) * FLAG.waveAmp * 0.45 +
        Math.sin(phase * 2.3 + t * 0.6) * FLAG.waveAmp * 0.12;

    return { offset, phase };
}
