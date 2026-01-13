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
    // Force white for mask visibility
    const forceWhite = (el: SVGElement) => {
        el.setAttribute('fill', '#fff');
        el.setAttribute('stroke', '#fff');
        el.setAttribute('opacity', '1');
        el.removeAttribute('fill-opacity');
        el.removeAttribute('stroke-opacity');

        // Overwrite inline styles if they exist
        if (el.style) {
            el.style.fill = '#fff';
            el.style.stroke = '#fff';
            el.style.opacity = '1';
            el.style.fillOpacity = '1';
            el.style.strokeOpacity = '1';
        }

        // Handle gradient stops (convert to white)
        if (el.tagName.toLowerCase() === 'stop') {
            el.setAttribute('stop-color', '#fff');
            el.setAttribute('stop-opacity', '1');
            if (el.style) {
                el.style.stopColor = '#fff';
                el.style.stopOpacity = '1';
            }
        }

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
        } catch { }
    }

    // ================= CREATE LAYERS =================
    // Layer 1: Template
    const templateLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const templateClone = templateContent.cloneNode(true) as SVGGElement;
    templateLayer.appendChild(templateClone);

    // Layer 2: Uploaded Items
    const itemsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const item of [...items].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
    )) {
        let node: SVGElement | null = null;

        if (item.type === 'image') {
            node = await createImageNode(
                item,
                containerWidth,
                containerHeight,
                vbWidth,
                vbHeight
            );
        } else if (item.type === 'text') {
            node = createTextNode(
                item,
                containerWidth,
                containerHeight,
                vbWidth,
                vbHeight
            );
        }

        if (!node) continue;

        // 🔥 APPLY MASK PER ITEM
        node.setAttribute('mask', `url(#${maskId})`);
        itemsLayer.appendChild(node);
    }

    // Append layers in correct order
    clonedSvg.appendChild(templateLayer); // TEMPLATE BELOW
    clonedSvg.appendChild(itemsLayer);    // UPLOADED ITEMS ABOVE

    // ================= Export =================
    exportSvg(clonedSvg, format, exportWidth, exportHeight);
};
