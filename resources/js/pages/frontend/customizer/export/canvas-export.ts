import { CanvasItem } from '@/types/customizer/uploaded-items';

type ExportFormat = 'svg' | 'png' | 'jpg' | 'pdf';

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

    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Export size (preserve aspect ratio). If max size provided, treat it as maximum dimension.
    let exportWidth: number;
    let exportHeight: number;
    if (SvgTemplateParentMaxSize && SvgTemplateParentMaxSize > 0) {
        const maxSize = SvgTemplateParentMaxSize;
        const scale = maxSize / Math.max(containerWidth, containerHeight);
        exportWidth = Math.round(containerWidth * scale);
        exportHeight = Math.round(containerHeight * scale);
    } else {
        exportWidth = Math.round(containerWidth);
        exportHeight = Math.round(containerHeight);
    }

    // Determine the SVG's viewBox dimensions so we place overlay items in the correct coordinate system.
    const originalViewBox = svgEl.getAttribute('viewBox');
    let vbWidth = containerWidth;
    let vbHeight = containerHeight;
    if (originalViewBox) {
        const parts = originalViewBox.split(/\s+/).map(Number);
        if (parts.length === 4 && !parts.some(isNaN)) {
            vbWidth = parts[2];
            vbHeight = parts[3];
        }
    }

    // Compute scale factors from DOM pixels -> SVG viewBox units (used to position overlay items)
    const viewScaleX = vbWidth / containerWidth;
    const viewScaleY = vbHeight / containerHeight;

    // Clone SVG
    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Do NOT set explicit width/height on the exported SVG. Rely on viewBox + preserveAspectRatio.
    // Remove any width/height attributes coming from the source to avoid fixed dimensions in the downloaded SVG.
    clonedSvg.removeAttribute('width');
    clonedSvg.removeAttribute('height');
    // Ensure the viewBox scaling preserves aspect ratio when rasterizing
    clonedSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

    // Keep the original viewBox if present; otherwise fall back to container size so coordinates match the template
    if (originalViewBox) {
        clonedSvg.setAttribute('viewBox', originalViewBox);
    } else {
        clonedSvg.setAttribute(
            'viewBox',
            `0 0 ${containerWidth} ${containerHeight}`,
        );
    }

    // ====== Scale the template content ======
    const templateGroup = clonedSvg.querySelector('g') || clonedSvg;

    // Keep any existing transforms on template group — removing them can break layout
    // (we position overlay items in viewBox coordinates instead)

    // Instead of scaling with transform, keep items and template in same coordinates
    // All scaling will happen in the exported canvas (via viewBox & width/height)

    // ====== Add uploaded items ======
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const item of [...items].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
    )) {
        if (item.type === 'image') {
            overlay.appendChild(await createImageNode(item, viewScaleX, viewScaleY));
        } else if (item.type === 'text') {
            overlay.appendChild(createTextNode(item, viewScaleX, viewScaleY));
        }
    }

    clonedSvg.appendChild(overlay);

    exportSvg(clonedSvg, format, exportWidth, exportHeight);
};

/* ================= IMAGE NODE ================= */
const createImageNode = async (item: any, scaleX: number, scaleY: number) => {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    // Positions/sizes here are in SVG viewBox units (mapped from DOM pixels using scaleX/scaleY)
    img.setAttribute('x', String(item.x * scaleX));
    img.setAttribute('y', String(item.y * scaleY));
    img.setAttribute('width', String(item.width * scaleX));
    img.setAttribute('height', String(item.height * scaleY));
    img.setAttribute('opacity', String(item.opacity ?? 1));
    const base64 = await toBase64(item.src);
    img.setAttribute('href', base64);
    return img;
};

/* ================= TEXT NODE ================= */
const createTextNode = (item: any, scaleX: number, scaleY: number) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    // Positions/sizes here are in SVG viewBox units (mapped from DOM pixels using scaleX/scaleY)
    text.setAttribute('x', String(item.x * scaleX));
    text.setAttribute('y', String(item.y * scaleY + item.fontSize * scaleY));
    text.setAttribute('fill', item.color);
    text.setAttribute('font-size', String(item.fontSize * scaleY));
    text.setAttribute('font-family', item.fontFamily);
    text.setAttribute('text-anchor', getTextAnchor(item.textAlign));
    text.setAttribute('dominant-baseline', 'hanging');

    if (item.letterSpacing)
        text.setAttribute(
            'letter-spacing',
            String(item.letterSpacing * scaleX),
        );
    if (item.underline) text.setAttribute('text-decoration', 'underline');

    text.textContent = item.text;
    return text;
};

const getTextAnchor = (align: string) => {
    if (align === 'center') return 'middle';
    if (align === 'right') return 'end';
    return 'start';
};

/* ================= EXPORT ================= */
const exportSvg = (
    svg: SVGSVGElement,
    format: ExportFormat,
    width: number,
    height: number,
) => {
    const serializer = new XMLSerializer();

    if (format === 'svg') {
        // For raw SVG downloads we want no fixed width/height so it remains scalable (use viewBox only)
        const tmp = svg.cloneNode(true) as SVGSVGElement;
        tmp.removeAttribute('width');
        tmp.removeAttribute('height');
        const svgString = serializer.serializeToString(tmp);
        const svgBlob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        download(svgUrl, 'canvas.svg');
        URL.revokeObjectURL(svgUrl);
        return;
    }

    // For raster exports, serialize an SVG that has explicit pixel width/height so the rasterizer renders at the correct size
    const rasterSvg = svg.cloneNode(true) as SVGSVGElement;
    rasterSvg.setAttribute('width', String(width));
    rasterSvg.setAttribute('height', String(height));
    rasterSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    // ensure there's a viewBox (should already exist but be defensive)
    if (!rasterSvg.getAttribute('viewBox')) {
        rasterSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    const svgString = serializer.serializeToString(rasterSvg);
    const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'jpg') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);
        }

        // Draw the rasterized SVG scaled to the target canvas dimensions
        ctx.drawImage(img, 0, 0, width, height);

        if (format === 'png' || format === 'jpg') {
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                download(url, `canvas.${format}`);
                URL.revokeObjectURL(url);
            });
        }

        if (format === 'pdf') downloadPdf(canvas);

        URL.revokeObjectURL(svgUrl);
    };

    img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
};

/* ================= HELPERS ================= */
const download = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const downloadPdf = (canvas: HTMLCanvasElement) => {
    const win = window.open('');
    if (!win) return;

    win.document.write(`
        <html>
          <body style="margin:0">
            <img src="${canvas.toDataURL('image/png')}" style="width:100%" />
          </body>
        </html>
    `);

    win.document.close();
    win.focus();
    win.print();
};

const toBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas not supported');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
    });
};
