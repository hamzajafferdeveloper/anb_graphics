import { SVG_TEMPLATE_PARENT_MAX_SIZE } from '@/lib/customizer/variable';

type ExportFormat = 'svg' | 'png' | 'jpg' | 'pdf';

export const ExportCanvas = ({
    svgContainerRef,
    format = 'svg',
}: {
    svgContainerRef: React.RefObject<HTMLDivElement | null>;
    format?: ExportFormat;
}) => {
    if (!svgContainerRef.current) return;

    const svgEl = svgContainerRef.current.querySelector('svg');
    if (!svgEl) {
        console.error('No SVG found in container');
        return;
    }

    const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;

    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const width =
        SVG_TEMPLATE_PARENT_MAX_SIZE ||
        svgEl.viewBox.baseVal.width ||
        svgEl.clientWidth;

    const height =
        SVG_TEMPLATE_PARENT_MAX_SIZE ||
        svgEl.viewBox.baseVal.height ||
        svgEl.clientHeight;

    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // ================= SVG =================
    if (format === 'svg') {
        download(svgUrl, 'canvas.svg');
        return;
    }

    // ================= PNG / JPG =================
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // JPG needs white background
        if (format === 'jpg') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (format === 'png' || format === 'jpg') {
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    download(url, `canvas.${format}`);
                    URL.revokeObjectURL(url);
                },
                format === 'png' ? 'image/png' : 'image/jpeg',
                1,
            );
        }

        // ================= PDF =================
        if (format === 'pdf') {
            const pdfWindow = window.open('');
            if (!pdfWindow) return;

            pdfWindow.document.write(`
                <html>
                  <head>
                    <title>Canvas PDF</title>
                  </head>
                  <body style="margin:0">
                    <img src="${canvas.toDataURL(
                        'image/png',
                    )}" style="width:100%;height:auto;" />
                  </body>
                </html>
            `);

            pdfWindow.document.close();
            pdfWindow.focus();
            pdfWindow.print();
        }
    };

    img.src = svgUrl;
};

// ================= Helper =================
const download = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
