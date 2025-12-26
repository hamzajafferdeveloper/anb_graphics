import { Trash2 } from 'lucide-react';

const DisplayItemController = ({
    onRotatePointerDown,
    onResizePointerDown,
    onDelete,
}: {
    onRotatePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onResizePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
    return (
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
    );
};

export default DisplayItemController;
