import { SVG_TEMPLATE_PARENT_MAX_SIZE } from '@/lib/customizer/variable';
import { useEffect, useState } from 'react';
import ZoomUndoRedo from './canvas/zoom-undo-redo-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import DisplayItem from './canvas/display-item';
import { CanvasItem } from '@/types/customizer/uploaded-items';

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

    // Items and selection from Redux
    const items = useSelector((state: RootState) => state.canvasItem?.items || []) as CanvasItem[];
    const selectedItemId = useSelector((state: RootState) => state.canvasItem?.selectedItemId || null);

    // Mask URL and overlay bounding box used to clip content and position controller overlay
    const [svgMaskUrl, setSvgMaskUrl] = useState<string | null>(null);
    const [svgOverlayBox, setSvgOverlayBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

    // Compute mask URL (serialize SVG) when template changes
    useEffect(() => {
        const updateMask = () => {
            const svgContainer = document.getElementById('svg-container');
            if (!svgContainer) return;
            const svgEl = svgContainer.querySelector('svg');
            if (!svgEl) return;

            try {
                const clone = (svgEl as SVGSVGElement).cloneNode(true) as SVGSVGElement;
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(clone);
                setSvgMaskUrl(`url('data:image/svg+xml;utf8,${encodeURIComponent(svgString)}')`);
            } catch (err) {
                setSvgMaskUrl(null);
            }
        };

        const t = setTimeout(updateMask, 200);
        window.addEventListener('resize', updateMask);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', updateMask);
        };
    }, [svgContainerRef.current?.innerHTML]);

    // Compute overlay box (svg bounding client rect relative to parent)
    useEffect(() => {
        const updateOverlayBox = () => {
            const svgContainer = document.getElementById('svg-container');
            if (!svgContainer) return;
            const svgEl = svgContainer.querySelector('svg');
            if (!svgEl) return;

            const rect = svgEl.getBoundingClientRect();
            const parentRect = svgContainer.getBoundingClientRect();

            setSvgOverlayBox({
                left: rect.left - parentRect.left,
                top: rect.top - parentRect.top,
                width: rect.width,
                height: rect.height,
            });
        };

        const t = setTimeout(updateOverlayBox, 200);
        window.addEventListener('resize', updateOverlayBox);
        window.addEventListener('scroll', updateOverlayBox, true);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', updateOverlayBox);
            window.removeEventListener('scroll', updateOverlayBox, true);
        };
    }, [svgContainerRef.current?.innerHTML]);

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
                            id="svg-container"
                            onClick={handleSvgContainerClick}
                            className="h-full w-full cursor-pointer"
                        />

                        {/* Masked content layer: render item visuals clipped to template */}
                        {svgOverlayBox && svgMaskUrl && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: svgOverlayBox.left ?? 0,
                                    top: svgOverlayBox.top ?? 0,
                                    width: svgOverlayBox.width ?? 0,
                                    height: svgOverlayBox.height ?? 0,
                                    pointerEvents: 'none',
                                    WebkitMaskImage: svgMaskUrl || undefined,
                                    maskImage: svgMaskUrl || undefined,
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskSize: '100% 100%',
                                    maskSize: '100% 100%',
                                    zIndex: 20,
                                    minWidth: 0,
                                    minHeight: 0,
                                }}
                                className="p-2"
                            >
                                {items.map((item: CanvasItem) => (
                                    // Render DisplayItem directly; it positions itself relative to the masked container
                                    <DisplayItem key={item.id} item={item} showContent={true} showControls={false} />
                                ))}
                            </div>
                        )}

                        {/* Controls layer: selection borders and handles placed above template so they can overflow */}
                        {svgOverlayBox && selectedItemId && (() => {
                            const item = items.find((i) => i.id === selectedItemId);
                            if (!item) return null;
                            return (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: svgOverlayBox.left ?? 0,
                                        top: svgOverlayBox.top ?? 0,
                                        width: svgOverlayBox.width ?? 0,
                                        height: svgOverlayBox.height ?? 0,
                                        pointerEvents: 'none',
                                        zIndex: 9999,
                                    }}
                                >
                                    <DisplayItem item={item} showContent={false} showControls={true} />
                                </div>
                            );
                        })()}
                    </div>
                </div>

                <ZoomUndoRedo />
            </div>
        </section>
    );
};

export default Canvas;
