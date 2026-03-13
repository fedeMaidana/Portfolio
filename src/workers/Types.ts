export type WorkerMessage =
    | {
          type: 'init';
          payload: { canvas: OffscreenCanvas; width: number; height: number; dpr: number };
      }
    | { type: 'resize'; payload: { width: number; height: number; dpr: number } }
    | { type: 'motion-preference'; payload: { reduces: boolean } };

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

/** Tupla [R, G, B, alpha] para el mapa de colores de la tabla. */
export type ColorTuple = [number, number, number, number];
