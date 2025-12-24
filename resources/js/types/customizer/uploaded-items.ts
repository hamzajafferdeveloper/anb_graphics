export interface CanvasElementBase {
    id: string;
    type: 'image' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    zIndex?: number;
    locked?: boolean;
}

export interface CanvasImageElement extends CanvasElementBase {
    type: 'image';
    src: string;
    originalWidth?: number;
    originalHeight?: number;
    crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    flipX?: boolean;
    flipY?: boolean;
}

export interface CanvasTextElement extends CanvasElementBase {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight?: 'normal' | 'bold' | number;
    fontStyle?: 'normal' | 'italic';
    color: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    underline?: boolean;
}

export type CanvasItem = CanvasImageElement | CanvasTextElement;
