import { CanvasItem } from '@/types/customizer/uploaded-items';

type ExportFormat = 'svg' | 'png' | 'jpg' | 'pdf';

export const ExportCanvas = ({
    svgContainerRef,
    format = 'svg',
    items = [],
    SvgTemaplteParentMaxSize,
}: {
    svgContainerRef: React.RefObject<HTMLDivElement | null>;
    format?: ExportFormat;
    items?: CanvasItem[];
    SvgTemaplteParentMaxSize?: number;
}) => {
    if (!svgContainerRef.current) return;

    const svgEl = svgContainerRef.current.querySelector('svg');
    if (!svgEl) return;

    /* ================= REAL SVG SIZE ================= */

    const viewBox = svgEl.viewBox.baseVal;
    const width =
        SvgTemaplteParentMaxSize || viewBox.width || svgEl.clientWidth;
    const height =
        SvgTemaplteParentMaxSize || viewBox.height || svgEl.clientHeight;

    /* ================= CLONE SVG ================= */

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;

    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));
    clonedSvg.setAttribute('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`);

    /* ================= UPLOADED ITEMS ================= */

    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    items
        .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        .forEach((item) => {
            if (item.type === 'image') {
                overlay.appendChild(createImageNode(item));
            }

            if (item.type === 'text') {
                overlay.appendChild(createTextNode(item));
            }
        });

    clonedSvg.appendChild(overlay);

    /* ================= EXPORT ================= */

    exportSvg(clonedSvg, format, width, height);
};

/* ===================================================================== */
/* ============================ IMAGE ================================== */
/* ===================================================================== */

const createImageNode = (item: any) => {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');

    img.setAttribute('x', String(item.x));
    img.setAttribute('y', String(item.y));
    img.setAttribute('width', String(item.width));
    img.setAttribute('height', String(item.height));
    img.setAttribute('opacity', String(item.opacity ?? 1));
    img.setAttribute('href', item.src);

    return img;
};

/* ===================================================================== */
/* ============================= TEXT ================================== */
/* ===================================================================== */

const createTextNode = (item: any) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    text.setAttribute('x', String(item.x));
    text.setAttribute('y', String(item.y + item.fontSize));
    text.setAttribute('fill', item.color);
    text.setAttribute('font-size', String(item.fontSize));
    text.setAttribute('font-family', item.fontFamily);
    text.setAttribute('text-anchor', getTextAnchor(item.textAlign));
    text.setAttribute('dominant-baseline', 'hanging');

    if (item.letterSpacing) {
        text.setAttribute('letter-spacing', String(item.letterSpacing));
    }

    if (item.underline) {
        text.setAttribute('text-decoration', 'underline');
    }

    text.textContent = item.text;

    return text;
};

const getTextAnchor = (align: string) => {
    if (align === 'center') return 'middle';
    if (align === 'right') return 'end';
    return 'start';
};

/* ===================================================================== */
/* ============================ EXPORT ================================= */
/* ===================================================================== */

const exportSvg = (
    svg: SVGSVGElement,
    format: ExportFormat,
    width: number,
    height: number,
) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
    });

    const svgUrl = URL.createObjectURL(svgBlob);

    if (format === 'svg') {
        download(svgUrl, 'canvas.svg');
        return;
    }

    const img = new Image();
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

        ctx.drawImage(img, 0, 0);

        if (format === 'png' || format === 'jpg') {
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                download(url, `canvas.${format}`);
            });
        }

        if (format === 'pdf') {
            downloadPdf(canvas);
        }
    };

    img.src = svgUrl;
};

/* ===================================================================== */
/* ============================ HELPERS ================================ */
/* ===================================================================== */

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
