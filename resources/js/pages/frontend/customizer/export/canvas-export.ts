import { CanvasItem } from '@/types/customizer/uploaded-items';
import { createImageNode, createTextNode, exportSvg } from './helpers';

export type ExportFormat = 'svg' | 'png' | 'jpg' | 'pdf';

/* ================= EXPORT CANVAS WITH CLIPPING ================= */
export const ExportCanvas = async ({
    svgContainerRef,
    format = 'svg',
    items = [],
    SvgTemplateParentMaxSize,
}: {
    svgContainerRef: React.RefObject<HTMLDivElement | null>;
    format?: ExportFormat;
    items?: CanvasItem[];
    SvgTemplateParentMaxSize?: number;
}) => {
    if (!svgContainerRef.current) return;

    const svgEl = svgContainerRef.current.querySelector('svg');
    if (!svgEl) return;

    // ================= Container =================
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    let exportWidth = Math.round(containerWidth);
    let exportHeight = Math.round(containerHeight);

    if (SvgTemplateParentMaxSize && SvgTemplateParentMaxSize > 0) {
        const scale =
            SvgTemplateParentMaxSize /
            Math.max(containerWidth, containerHeight);
        exportWidth = Math.round(containerWidth * scale);
        exportHeight = Math.round(containerHeight * scale);
    }

    // ================= ViewBox =================
    const viewBox = svgEl.viewBox.baseVal;
    const vbWidth = viewBox?.width || containerWidth;
    const vbHeight = viewBox?.height || containerHeight;

    // ================= Clone SVG =================
    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.removeAttribute('width');
    clonedSvg.removeAttribute('height');
    clonedSvg.setAttribute(
        'viewBox',
        viewBox
            ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
            : `0 0 ${containerWidth} ${containerHeight}`,
    );
    clonedSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

    // ================= defs =================
    let defs = clonedSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);
    }

    // ================= Create MASK =================
    const maskId = `mask-${Date.now()}`;
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', maskId);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');

    const templateContent = clonedSvg.querySelector('g') || clonedSvg;
    const maskClone = templateContent.cloneNode(true) as SVGGElement;

    // Force white for mask visibility
    const forceWhite = (el: SVGElement) => {
        el.setAttribute('fill', '#fff');
        el.setAttribute('stroke', '#fff');
        el.childNodes.forEach((c) => {
            if (c instanceof SVGElement) forceWhite(c);
        });
    };
    forceWhite(maskClone);

    mask.appendChild(maskClone);
    defs.appendChild(mask);

    // ================= Fonts (IMPORTANT BEFORE TEXT) =================
    if ((document as any).fonts?.ready) {
        try {
            await (document as any).fonts.ready;
        } catch {}
    }

    // ================= Overlay =================
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for (const item of [...items].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
    )) {
        let node: SVGElement | null = null;

        if (item.type === 'image') {
            node = await createImageNode(
                item,
                containerWidth,
                containerHeight,
                vbWidth,
                vbHeight,
            );
        } else if (item.type === 'text') {
            node = createTextNode(
                item,
                containerWidth,
                containerHeight,
                vbWidth,
                vbHeight,
            );
        }

        if (!node) continue;

        // 🔥 APPLY MASK PER ITEM (YOUR REQUIREMENT)
        node.setAttribute('mask', `url(#${maskId})`);
        overlay.appendChild(node);
    }

    clonedSvg.appendChild(overlay);

    // ================= Export =================
    exportSvg(clonedSvg, format, exportWidth, exportHeight);
};
