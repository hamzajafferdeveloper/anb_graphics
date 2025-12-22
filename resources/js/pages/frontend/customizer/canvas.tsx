import { SVG_TEMPLATE_PARENT_MAX_SIZE } from '@/lib/customizer/variable';
import { useEffect, useState } from 'react';

const Canvas = ({
    className,
    svgTemplate,
}: {
    className?: string;
    svgTemplate: string;
}) => {
    const [svgTemplateParentMaxSize, setSvgTemplateParentMaxSize] = useState(
        SVG_TEMPLATE_PARENT_MAX_SIZE,
    );

    useEffect(() => {
        setSvgTemplateParentMaxSize(
            window.innerHeight > SVG_TEMPLATE_PARENT_MAX_SIZE
                ? SVG_TEMPLATE_PARENT_MAX_SIZE
                : window.innerHeight,
        );
    }, []);

    return (
        <section className={`w-full p-3 lg:h-full ${className}`}>
            {/* Outer canvas container */}
            <div className="lg:aspect-none relative aspect-[1/1] w-full overflow-hidden rounded-2xl border shadow-2xl lg:h-[calc(100vh-30px)]">
                {/* Background image with opacity */}
                <div
                    className="absolute inset-0 bg-center opacity-20"
                    style={{
                        backgroundImage: `url(/storage/canvas-background-img.avif)`,
                    }}
                />

                {/* Content layer */}
                <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
                    <div
                        className="h-full w-full rounded-xl"
                        style={{
                            maxWidth: `${svgTemplateParentMaxSize}px`,
                            maxHeight: `${svgTemplateParentMaxSize}px`,
                            height: '100%',
                        }}
                    >
                        {/* SVG content */}
                        <div
                            dangerouslySetInnerHTML={{ __html: svgTemplate }}
                            className="h-full w-full cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Canvas;
