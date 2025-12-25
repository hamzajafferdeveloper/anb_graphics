import { SVG_TEMPLATE_PARENT_MAX_SIZE } from '@/lib/customizer/variable';
import { useEffect, useState } from 'react';
import ZoomUndoRedo from './canvas/zoom-undo-redo-icons';
import OverlayUI from './canvas/overlay-ui';

const Canvas = ({
    className,
    svgContainerRef,
    handleSvgContainerClick,
}: {
    className?: string;
    svgContainerRef: React.RefObject<HTMLDivElement | null>;
    handleSvgContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
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
            <div className="lg:aspect-none relative flex aspect-[1/1] w-full flex-col overflow-hidden rounded-2xl border p-2 shadow-2xl lg:h-[calc(100vh-30px)] lg:flex-row">
                <div
                    className="absolute inset-0 bg-center opacity-20"
                    style={{
                        backgroundImage: `url(/storage/canvas-background-img.avif)`,
                    }}
                />

                <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
                    <div
                        className="relative h-full w-full rounded-xl"
                        style={{
                            maxWidth: `${svgTemplateParentMaxSize}px`,
                            maxHeight: `${svgTemplateParentMaxSize}px`,
                            height: '100%',
                        }}
                    >
                        <div
                            ref={svgContainerRef}
                            onClick={handleSvgContainerClick}
                            className="h-full w-full cursor-pointer"
                        />
                        <OverlayUI />
                    </div>
                </div>

                <ZoomUndoRedo />
            </div>
        </section>
    );
};

export default Canvas;
