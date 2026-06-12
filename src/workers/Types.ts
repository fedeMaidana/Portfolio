// ── Theme ───────────────────────────────────────────────────

export type ThemeName = 'light' | 'dark';

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface ThemeColors {
    bg: string;
    palette: readonly [RGB, RGB, RGB];
}

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

export interface VisibilityState {
    hidden: boolean;
}

export interface ThemePreference {
    theme: ThemeName;
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

export interface VisibilityMessage {
    type: 'visibility';
    payload: VisibilityState;
}

export interface ThemeMessage {
    type: 'theme';
    payload: ThemePreference;
}

export type WorkerMessage =
    | InitMessage
    | ResizeMessage
    | MotionMessage
    | VisibilityMessage
    | ThemeMessage;

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
