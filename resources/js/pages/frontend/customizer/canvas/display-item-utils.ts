// Lightweight DOM helpers used by DisplayItem for smooth rAF-batched visual updates

export function setTranslateRotate(el: HTMLElement | null, dx: number, dy: number, rotation: number) {
    if (!el) return;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
}

export function setRotate(el: HTMLElement | null, rotation: number) {
    if (!el) return;
    el.style.transform = `rotate(${rotation}deg)`;
}

export function setSize(el: HTMLElement | null, width: number, height: number) {
    if (!el) return;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
}
