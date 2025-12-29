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

    // Clone SVG
    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.removeAttribute('width');
    clonedSvg.removeAttribute('height');
    clonedSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    if (originalViewBox) {
        clonedSvg.setAttribute('viewBox', originalViewBox);
    } else {
        clonedSvg.setAttribute(
            'viewBox',
            `0 0 ${containerWidth} ${containerHeight}`,
        );
    }

    // ====== Add uploaded items ======
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const item of [...items].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
    )) {
        if (item.type === 'image') {
            overlay.appendChild(
                await createImageNode(
                    item,
                    containerWidth,
                    containerHeight,
                    vbWidth,
                    vbHeight,
                ),
            );
        } else if (item.type === 'text') {
            overlay.appendChild(
                createTextNode(
                    item,
                    containerWidth,
                    containerHeight,
                    vbWidth,
                    vbHeight,
                ),
            );
        }
    }
    clonedSvg.appendChild(overlay);

    // Wait for webfonts to load
    if (
        typeof document !== 'undefined' &&
        (document as any).fonts &&
        (document as any).fonts.ready
    ) {
        try {
            await (document as any).fonts.ready;
        } catch {}
    }

    exportSvg(clonedSvg, format, exportWidth, exportHeight);
};

/* ================= IMAGE NODE ================= */
const createImageNode = async (
    item: any,
    containerWidth: number,
    containerHeight: number,
    vbWidth: number,
    vbHeight: number,
) => {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');

    // Scale DOM pixels -> viewBox units
    const x = (item.x / containerWidth) * vbWidth;
    const y = (item.y / containerHeight) * vbHeight;
    const width = (item.width / containerWidth) * vbWidth;
    const height = (item.height / containerHeight) * vbHeight;

    img.setAttribute('x', String(x));
    img.setAttribute('y', String(y));
    img.setAttribute('width', String(width));
    img.setAttribute('height', String(height));
    img.setAttribute('opacity', String(item.opacity ?? 1));

    const base64 = await toBase64(item.src);
    img.setAttribute('href', base64);
    return img;
};

/* ================= TEXT NODE ================= */
const createTextNode = (
    item: any,
    containerWidth: number,
    containerHeight: number,
    vbWidth: number,
    vbHeight: number,
) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    const LEFT_OFFSET=150;

    const fontSize = (item.fontSize ?? 16) * (vbHeight / containerHeight);

    text.setAttribute('font-size', `${fontSize}px`);
    text.setAttribute('font-family', item.fontFamily || 'Arial, sans-serif');
    text.setAttribute('fill', item.color || '#000');
    if (item.letterSpacing)
        text.setAttribute(
            'letter-spacing',
            String(item.letterSpacing * (vbWidth / containerWidth)),
        );
    if (item.underline) text.setAttribute('text-decoration', 'underline');

    text.textContent = item.text || '';

    // Add temporarily to DOM to measure its width
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';
    svg.appendChild(text);
    document.body.appendChild(svg);

    const bbox = text.getBBox(); // get width of the text

    // Map DOM pixels -> SVG viewBox coordinates
    let x = (item.x / containerWidth) * vbWidth;
    const y = (item.y / containerHeight) * vbHeight;

    // Add static left spacing (half of text width)
    x += bbox.width / 2 + LEFT_OFFSET;

    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('dominant-baseline', 'hanging');
    text.setAttribute('text-anchor', getTextAnchor(item.textAlign ?? 'start'));

    document.body.removeChild(svg);

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

    const rasterSvg = svg.cloneNode(true) as SVGSVGElement;
    rasterSvg.setAttribute('width', String(width));
    rasterSvg.setAttribute('height', String(height));
    rasterSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
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

    img.onerror = () => URL.revokeObjectURL(svgUrl);

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
