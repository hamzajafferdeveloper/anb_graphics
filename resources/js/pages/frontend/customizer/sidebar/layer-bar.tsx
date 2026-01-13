import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import {
    moveLayer,
    removeItem,
    selectItem,
} from '@/stores/customizer/canvasItemSlice';
import { RootState, store } from '@/stores/store';
import { CanvasItem } from '@/types/customizer/uploaded-items';
import { ArrowDown, ArrowUp, ImageIcon, Trash2, Type } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const LayerSideBar = () => {
    const dispatch = useDispatch();
    const items = useSelector(
        (state: RootState) => state.canvasItem.items,
    ) as CanvasItem[];
    const selectedItemId = useSelector(
        (state: RootState) => state.canvasItem.selectedItemId,
    );
    const { setAndCommit } = useCustomizerHistory();

    const commitItemsToHistory = (newItems?: CanvasItem[]) => {
        const itemsNow =
            newItems ?? (store.getState().canvasItem.items as CanvasItem[]);
        setAndCommit((prev: any) => ({
            ...(prev || {}),
            uploadedItems: itemsNow,
        }));
    };

    const handleSelect = (id: string) => {
        dispatch(selectItem(id));
    };

    const handleMove = (
        e: React.MouseEvent,
        id: string,
        direction: 'up' | 'down',
    ) => {
        e.stopPropagation();
        dispatch(moveLayer({ id, direction }));
        setTimeout(() => commitItemsToHistory(), 0);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch(removeItem(id));
        setTimeout(() => commitItemsToHistory(), 0);
    };

    // Reverse items for display (top layer at top of list)
    const displayItems = [...items].reverse();

    return (
        <div className="w-full p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Layers</h3>
                <span className="text-xs text-gray-500">
                    {items.length} items
                </span>
            </div>

            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="py-4 text-center text-sm text-gray-500">
                        No layers yet
                    </div>
                )}

                {displayItems.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`group flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors ${
                            selectedItemId === item.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-500">
                                {item.type === 'image' ? (
                                    <ImageIcon size={16} />
                                ) : (
                                    <Type size={16} />
                                )}
                            </div>
                            <div className="truncate text-sm font-medium">
                                {item.type === 'image'
                                    ? 'Image'
                                    : (item as any).text}
                            </div>
                        </div>

                        <div className="sm:opacity-100/50 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                                onClick={(e) => handleMove(e, item.id, 'up')}
                                disabled={index === 0} // Top of list = Top layer (can't move up)
                                title="Move Forward"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                                onClick={(e) => handleMove(e, item.id, 'down')}
                                disabled={index === items.length - 1} // Bottom of list = Bottom layer
                                title="Move Backward"
                            >
                                <ArrowDown size={14} />
                            </button>
                            <button
                                className="rounded p-1 text-red-500 hover:bg-red-50"
                                onClick={(e) => handleDelete(e, item.id)}
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerSideBar;
