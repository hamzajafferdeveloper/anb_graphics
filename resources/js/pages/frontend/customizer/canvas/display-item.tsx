import { RootState } from '@/stores/store';
import { CanvasImageElement, CanvasTextElement } from '@/types/customizer/uploaded-items';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { moveItem, selectItem, resizeItem, updateItem, removeItem } from '@/stores/customizer/canvasItemSlice';
import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import { CustomizerHistoryState } from '@/types/customizer/customizer';
import { Trash2 } from 'lucide-react';

const MIN_SIZE = 20;

const DisplayItem = ({
    item,
}: {
    item: CanvasImageElement | CanvasTextElement;
}) => {
    const dispatch = useDispatch();
    const selectedItemId = useSelector(
        (state: RootState) => state.canvasItem?.selectedItemId || '',
    );

    const allItems = useSelector((state: RootState) => state.canvasItem.items);

    const isSelected = selectedItemId === item.id;

    // Local live state (no animation — direct update for smoother UX)
    const [position, setPosition] = useState({ x: item.x, y: item.y });
    const [size, setSize] = useState({ width: item.width, height: item.height });
    const [rotation, setRotation] = useState(item.rotation || 0);

    // Refs for dragging/resizing/rotating
    const draggingRef = useRef(false);
    const resizingRef = useRef(false);
    const rotatingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const { setAndCommit } = useCustomizerHistory<CustomizerHistoryState>();

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
        const el = wrapperRef.current;
        if (!el) return;
        const dx = dragTargetRef.current.dx;
        const dy = dragTargetRef.current.dy;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
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

        if (!isSelected) return;
        e.stopPropagation();
        const el = wrapperRef.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        draggingRef.current = true;

        const parentRect = (el.parentElement as HTMLElement).getBoundingClientRect();
        dragStartRef.current = { left: position.x, top: position.y };
        dragOffsetRef.current = { x: e.clientX - parentRect.left - position.x, y: e.clientY - parentRect.top - position.y };

        dragTargetRef.current = { dx: 0, dy: 0 };
        startDragRAF();

        const onMove = (ev: PointerEvent) => {
            if (!draggingRef.current) return;
            const nx = ev.clientX - parentRect.left - dragOffsetRef.current.x;
            const ny = ev.clientY - parentRect.top - dragOffsetRef.current.y;
            dragTargetRef.current = { dx: nx - dragStartRef.current.left, dy: ny - dragStartRef.current.top };
        };

        const onUp = (ev: PointerEvent) => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            try {
                el.releasePointerCapture(e.pointerId);
            } catch {}

            stopDragRAF();

            // Apply final position and clear transform
            const finalX = Math.round(dragStartRef.current.left + dragTargetRef.current.dx);
            const finalY = Math.round(dragStartRef.current.top + dragTargetRef.current.dy);
            setPosition({ x: finalX, y: finalY });
            el.style.transform = `rotate(${rotation}deg)`; // reset translate

            // Persist to Redux
            dispatch(moveItem({ id: item.id, x: finalX, y: finalY }));

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id ? { ...it, x: finalX, y: finalY } : it,
            );
            setAndCommit((prev: any) => ({ ...(prev || {}), uploadedItems: updatedItems }));

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
        const el = wrapperRef.current;
        if (!el) return;
        el.style.width = `${resizeTargetRef.current.width}px`;
        el.style.height = `${resizeTargetRef.current.height}px`;
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
        const aspect = isImage && item.originalWidth && item.originalHeight
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
            } catch {}

            stopResizeRAF();

            // Persist to Redux
            const final = { ...resizeTargetRef.current };
            setSize(final);
            sizeRef.current = final;
            dispatch(resizeItem({ id: item.id, width: final.width, height: final.height }));

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id ? { ...it, width: final.width, height: final.height } : it,
            );
            setAndCommit((prev: any) => ({ ...(prev || {}), uploadedItems: updatedItems }));

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
        const el = wrapperRef.current;
        if (!el) return;
        // Maintain any current drag translate while rotating
        const dx = dragTargetRef.current.dx || 0;
        const dy = dragTargetRef.current.dy || 0;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotateTargetRef.current}deg)`;
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
            const ang = Math.atan2(ev.clientY - rotateCenterRef.current.y, ev.clientX - rotateCenterRef.current.x);
            const deg = ((ang - startAngle) * 180) / Math.PI;
            rotateTargetRef.current = Math.round((startRotation + deg) % 360);
        };

        const onUp = (ev: PointerEvent) => {
            if (!rotatingRef.current) return;
            rotatingRef.current = false;
            try {
                el.releasePointerCapture(e.pointerId);
            } catch {}

            stopRotateRAF();

            // Persist to Redux
            const finalRot = rotateTargetRef.current;
            setRotation(finalRot);
            el.style.transform = `rotate(${finalRot}deg)`; // clear any translate
            dispatch(updateItem({ id: item.id, changes: { rotation: finalRot } }));

            // Commit to history
            const updatedItems = allItems.map((it: any) =>
                it.id === item.id ? { ...it, rotation: finalRot } : it,
            );
            setAndCommit((prev: any) => ({ ...(prev || {}), uploadedItems: updatedItems }));

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
        setAndCommit((prev: any) => ({ ...(prev || {}), uploadedItems: updatedItems }));
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // prevent container click
        dispatch(selectItem(item.id));
    };

    return (
        <div
            ref={wrapperRef}
            className={`pointer-events-auto absolute ${
                isSelected ? 'border-dashed border-2 p-2 rounded-lg border-primary' : ''
            }`}
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
            onClick={handleClick}
            onPointerDown={onPointerDown}
        >
            {isSelected && (
                <>
                    {/* Rotate handle (top center) */}
                    <div
                        data-canvas-control
                        onPointerDown={onRotatePointerDown}
                        style={{
                            position: 'absolute',
                            top: '-16px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'grab',
                            zIndex: 50,
                        }}
                    />

                    {/* Resize handle (bottom-right) */}
                    <div
                        data-canvas-control
                        onPointerDown={onResizePointerDown}
                        style={{
                            position: 'absolute',
                            right: -6,
                            bottom: -6,
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #ccc',
                            cursor: 'nwse-resize',
                            zIndex: 50,
                        }}
                    />

                    {/* Delete button (top-right) */}
                    <button
                        data-canvas-control
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onDelete}
                        style={{
                            position: 'absolute',
                            right: -10,
                            top: -10,
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            background: '#fff',
                            border: '1px solid #e74c3c',
                            color: '#e74c3c',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 50,
                        }}
                        title="Delete"
                        aria-label="Delete item"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}

            {item.type === 'image' ? (
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
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    {item.text}
                </div>
            )}
        </div>
    );
};

export default DisplayItem;
