// ── Payloads ───────────────────────────────────────────────

export interface CanvasInit {
    canvas: OffscreenCanvas;
    width: number;
    height: number;
    dpr: number;
}

export interface CanvasResize {
    width: number;
    height: number;
    dpr: number;
}

export interface MotionPreference {
    reduces: boolean;
}

// ── Mensajes ───────────────────────────────────────────────

export interface InitMessage {
    type: 'init';
    payload: CanvasInit;
}

export interface ResizeMessage {
    type: 'resize';
    payload: CanvasResize;
}

export interface MotionMessage {
    type: 'motion-preference';
    payload: MotionPreference;
}

export type WorkerMessage = InitMessage | ResizeMessage | MotionMessage;

// ── Render ─────────────────────────────────────────────────

export interface GridConfig {
    cw: number;
    ch: number;
}

export interface CellColor {
    r: number;
    g: number;
    b: number;
    alpha: number;
}

export interface CellRender {
    char: string;
    color: CellColor;
}

export type ColorTuple = [number, number, number, number];
