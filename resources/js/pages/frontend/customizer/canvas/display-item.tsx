import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import {
    moveItem,
    removeItem,
    resizeItem,
    selectItem,
    updateItem,
} from '@/stores/customizer/canvasItemSlice';
import { RootState } from '@/stores/store';
import { CustomizerHistoryState } from '@/types/customizer/customizer';
import {
    CanvasImageElement,
    CanvasTextElement,
} from '@/types/customizer/uploaded-items';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DisplayItemController from './display-item-control';
import { setTranslateRotate } from './display-item-utils';

const MIN_SIZE = 20;

const DisplayItem = ({
    item,
    showContent = true,
    showControls = true,
}: {
    item: CanvasImageElement | CanvasTextElement;
    showContent?: boolean;
    showControls?: boolean;
}) => {
    const dispatch = useDispatch();
    const selectedItemId = useSelector(
        (state: RootState) => state.canvasItem?.selectedItemId || '',
    );

    const allItems = useSelector((state: RootState) => state.canvasItem.items);

    const isSelected = selectedItemId === item.id;

    // Local live state (no animation — direct update for smoother UX)
    const [position, setPosition] = useState({ x: item.x, y: item.y });
    const [size, setSize] = useState({
        width: item.width,
        height: item.height,
    });
    const [rotation, setRotation] = useState(item.rotation || 0);

    // Refs for dragging/resizing/rotating
    const draggingRef = useRef(false);
    const resizingRef = useRef(false);
    const rotatingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const { setAndCommit } = useCustomizerHistory<CustomizerHistoryState>();

    const zoom = useSelector((state: RootState) => state.customizer.zoom);

    // Keep local state in sync if props change externally
    useEffect(() => {
        setPosition({ x: item.x, y: item.y });
        setSize({ width: item.width, height: item.height });
        setRotation(item.rotation || 0);
    }, [item.x, item.y, item.width, item.height, item.rotation]);

    // Cleanup any running rAF on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, []);

    // Dragging (rAF-batched visual updates)
    const dragTargetRef = useRef({ dx: 0, dy: 0 });
    const dragStartRef = useRef({ left: 0, top: 0 });

    const applyDragTransform = () => {
        setTranslateRotate(
            wrapperRef.current,
            dragTargetRef.current.dx,
            dragTargetRef.current.dy,
            rotation,
        );
    };

    const startDragRAF = () => {
        if (rafRef.current) return;
        const step = () => {
            applyDragTransform();
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
    };

    const stopDragRAF = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Prevent starting drag when interacting with controls (handles/buttons)
        const tgt = e.target as HTMLElement;
        if (tgt.closest('[data-canvas-control]')) return;

        if (!isSelected) {
            dispatch(selectItem(item.id));
            return; // select first, don't start drag yet
        }
        e.stopPropagation();
        const el = wrapperRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        draggingRef.current = true;

        const parentRect = (
            el.parentElement as HTMLElement
        ).getBoundingClientRect();
        dragStartRef.current = { left: position.x, top: position.y };
        dragOffsetRef.current = {
            x: e.clientX - parentRect.left - position.x * zoom,
            y: e.clientY - parentRect.top - position.y * zoom,
        };

        // Note: We need to normalize pointer start relative to the zoomed parent for subsequent moves?
        // Actually, cleaner logic:
        // dx_screen = e.clientX - startX_screen
        // dx_item = dx_screen / zoom

        // Store screen start point
        const startXScreen = e.clientX;
        const startYScreen = e.clientY;

        dragTargetRef.current = { dx: 0, dy: 0 };
        startDragRAF();

        const onMove = (ev: PointerEvent) => {
            if (!draggingRef.current) return;
            const dxScreen = ev.clientX - startXScreen;
            const dyScreen = ev.clientY - startYScreen;

            // Apply zoom correction
            dragTargetRef.current = {
                dx: dxScreen / zoom,
                dy: dyScreen / zoom,
            };
        };

        const onUp = (ev: PointerEvent) => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            try {
                el.releasePointerCapture(e.pointerId);
            } catch { }

            stopDragRAF();

            // Apply final position and clear transform
            const finalX = Math.round(
                dragStartRef.current.left + dragTargetRef.current.dx,
            );
            const finalY = Math.round(
                dragStartRef.current.top + dragTargetRef.current.dy,
            );
            setPosition({ x: finalX, y: finalY });
            el.style.transform = `rotate(${rotation}deg)`; // reset translate

            // Persist to Redux
            dispatch(moveItem({ id: item.id, x: finalX, y: finalY }));

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id ? { ...it, x: finalX, y: finalY } : it,
            );
            setAndCommit((prev: any) => ({
                ...(prev || {}),
                uploadedItems: updatedItems,
            }));

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // Resize (bottom-right corner)
    const sizeRef = useRef({ width: size.width, height: size.height });
    const resizeTargetRef = useRef({ width: size.width, height: size.height });

    const applyResizeStyles = () => {
        setSize(resizeTargetRef.current);
    };

    const startResizeRAF = () => {
        if (rafRef.current) return;
        const step = () => {
            applyResizeStyles();
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
    };

    const stopResizeRAF = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const onResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!isSelected) return;
        const el = wrapperRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        resizingRef.current = true;

        const startW = sizeRef.current.width;
        const startH = sizeRef.current.height;
        const startX = e.clientX;
        const startY = e.clientY;

        // Aspect ratio for images
        const isImage = item.type === 'image';
        const aspect =
            isImage && item.originalWidth && item.originalHeight
                ? item.originalWidth / item.originalHeight
                : startW / startH;

        // Ensure element transform baseline is rotation-only to avoid jumps when changing size
        el.style.transform = `rotate(${rotation}deg)`;
        resizeTargetRef.current = { width: startW, height: startH };
        startResizeRAF();

        const onMove = (ev: PointerEvent) => {
            if (!resizingRef.current) return;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            if (isImage) {
                // maintain aspect ratio using horizontal delta
                const nw = Math.max(MIN_SIZE, Math.round(startW + dx));
                const nh = Math.max(MIN_SIZE, Math.round(nw / aspect));
                resizeTargetRef.current = { width: nw, height: nh };
            } else {
                const nw = Math.max(MIN_SIZE, Math.round(startW + dx));
                const nh = Math.max(MIN_SIZE, Math.round(startH + dy));
                resizeTargetRef.current = { width: nw, height: nh };
            }
        };

        const onUp = (ev: PointerEvent) => {
            if (!resizingRef.current) return;
            resizingRef.current = false;
            try {
                el.releasePointerCapture(e.pointerId);
            } catch { }

            stopResizeRAF();

            // Persist to Redux
            const final = { ...resizeTargetRef.current };
            setSize(final);
            sizeRef.current = final;
            dispatch(
                resizeItem({
                    id: item.id,
                    width: final.width,
                    height: final.height,
                }),
            );

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id
                    ? { ...it, width: final.width, height: final.height }
                    : it,
            );
            setAndCommit((prev: any) => ({
                ...(prev || {}),
                uploadedItems: updatedItems,
            }));

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // Rotate (top center handle) — rAF-batched transform updates
    const rotateTargetRef = useRef(rotation);
    const rotateCenterRef = useRef({ x: 0, y: 0 });

    const applyRotateTransform = () => {
        // Maintain any current drag translate while rotating
        setTranslateRotate(
            wrapperRef.current,
            dragTargetRef.current.dx || 0,
            dragTargetRef.current.dy || 0,
            rotateTargetRef.current,
        );
    };

    const startRotateRAF = () => {
        if (rafRef.current) return;
        const step = () => {
            applyRotateTransform();
            rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
    };

    const stopRotateRAF = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const onRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!isSelected) return;
        const el = wrapperRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        rotatingRef.current = true;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        rotateCenterRef.current = { x: cx, y: cy };
        const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const startRotation = rotation;

        // Reset any transient translate so rotation starts at the element's current visual position
        dragTargetRef.current = { dx: 0, dy: 0 };
        el.style.transform = `rotate(${startRotation}deg)`;
        rotateTargetRef.current = startRotation;
        startRotateRAF();

        const onMove = (ev: PointerEvent) => {
            if (!rotatingRef.current) return;
            const ang = Math.atan2(
                ev.clientY - rotateCenterRef.current.y,
                ev.clientX - rotateCenterRef.current.x,
            );
            const deg = ((ang - startAngle) * 180) / Math.PI;
            rotateTargetRef.current = Math.round((startRotation + deg) % 360);
        };

        const onUp = (ev: PointerEvent) => {
            if (!rotatingRef.current) return;
            rotatingRef.current = false;
            try {
                el.releasePointerCapture(e.pointerId);
            } catch { }

            stopRotateRAF();

            // Persist to Redux
            const finalRot = rotateTargetRef.current;
            setRotation(finalRot);
            el.style.transform = `rotate(${finalRot}deg)`; // clear any translate
            dispatch(
                updateItem({ id: item.id, changes: { rotation: finalRot } }),
            );

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id ? { ...it, rotation: finalRot } : it,
            );
            setAndCommit((prev: any) => ({
                ...(prev || {}),
                uploadedItems: updatedItems,
            }));

            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // Delete
    const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        dispatch(removeItem(item.id));

        // Commit to history
        const updatedItems = allItems.filter((it: any) => it.id !== item.id);
        setAndCommit((prev: any) => ({
            ...(prev || {}),
            uploadedItems: updatedItems,
        }));
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        dispatch(selectItem(item.id));
    };

    return (
        <div
            ref={wrapperRef}
            className={`${showControls || showContent ? 'pointer-events-auto' : 'pointer-events-none'
                } absolute ${showControls && isSelected ? 'rounded-lg border-2 border-dashed border-primary p-2' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                transform: `rotate(${rotation || 0}deg)`,
                transformOrigin: 'center',
                cursor: isSelected ? 'grab' : 'default',
                touchAction: 'none', // needed for pointer events
            }}
            onClick={showControls ? handleClick : showContent ? handleClick : undefined}
            onPointerDown={showControls ? onPointerDown : undefined}
        >
            {showControls && isSelected && (
                <DisplayItemController
                    onRotatePointerDown={onRotatePointerDown}
                    onResizePointerDown={onResizePointerDown}
                    onDelete={onDelete}
                />
            )}

            {showContent &&
                (item.type === 'image' ? (
                    <img
                        src={item.src}
                        alt="Uploaded content"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                                (item as any).textAlign === 'left'
                                    ? 'flex-start'
                                    : (item as any).textAlign === 'right'
                                        ? 'flex-end'
                                        : 'center',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                padding: 4,
                                boxSizing: 'border-box',
                                fontSize: `${(item as any).fontSize || 16}px`,
                                fontFamily:
                                    (item as any).fontFamily ||
                                    'Inter, sans-serif',
                                fontWeight:
                                    (item as any).fontWeight || 'normal',
                                fontStyle: (item as any).fontStyle || 'normal',
                                color: (item as any).color || '#000',
                                lineHeight: (item as any).lineHeight || 1.2,
                                letterSpacing: `${(item as any).letterSpacing || 0}px`,
                                textDecoration: (item as any).underline
                                    ? 'underline'
                                    : 'none',
                                textAlign: (item as any).textAlign || 'center',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            {(item as any).text}
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default DisplayItem;
