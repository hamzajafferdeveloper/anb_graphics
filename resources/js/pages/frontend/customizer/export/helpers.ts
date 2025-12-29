import { ExportFormat } from './canvas-export';

/* ================= IMAGE NODE ================= */
export const createImageNode = async (
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
export const createTextNode = (
    item: any,
    containerWidth: number,
    containerHeight: number,
    vbWidth: number,
    vbHeight: number,
) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

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

    // Map DOM pixels -> SVG viewBox coordinates
    const x = (item.x / containerWidth) * vbWidth;
    const y = (item.y / containerHeight) * vbHeight;

    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));

    // Horizontal alignment
    text.setAttribute('text-anchor', getTextAnchor(item.textAlign ?? 'start'));

    // Vertical alignment
    text.setAttribute('dominant-baseline', 'hanging'); // top-aligned

    return text;
};

export const getTextAnchor = (align: string) => {
    if (align === 'center') return 'middle';
    if (align === 'right') return 'end';
    return 'start';
};

/* ================= EXPORT ================= */
export const exportSvg = (
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
export const download = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadPdf = (canvas: HTMLCanvasElement) => {
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

export const toBase64 = (url: string): Promise<string> => {
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
