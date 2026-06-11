import { FLAG } from './Constant';

export interface WaveSample {
    offset: number;
    phase: number;
}

export function waveOffset(normX: number, t: number, freqScale = 1): WaveSample {
    const phase = normX * FLAG.waveFreq * freqScale + t * FLAG.waveSpeed;
    const offset =
        Math.sin(phase) * FLAG.waveAmp * (0.2 + normX * 0.8) +
        Math.sin(phase * 0.5 + 1.7) * FLAG.waveAmp * 0.35;
    return { offset, phase };
}
