import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import {
    addText,
    removeItem,
    selectItem,
    updateItem,
} from '@/stores/customizer/canvasItemSlice';
import { RootState, store } from '@/stores/store';
import {
    CanvasItem,
    CanvasTextElement,
} from '@/types/customizer/uploaded-items';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const defaultNewText = {
    x: 80,
    y: 80,
    width: 260,
    height: 60,
    text: 'New text',
    fontSize: 28,
    fontFamily: 'Inter',
    color: '#000000',
    textAlign: 'center' as const,
    lineHeight: 1.2,
    letterSpacing: 0,
    underline: false,
};

const TextSideBar: React.FC = () => {
    const dispatch = useDispatch();
    const items = useSelector(
        (s: RootState) => s.canvasItem.items,
    ) as CanvasItem[];
    const selectedItemId = useSelector(
        (s: RootState) => s.canvasItem.selectedItemId,
    ) as string | null;
    const textItems = items.filter(
        (i) => i.type === 'text',
    ) as CanvasTextElement[];
    const selected = items.find(
        (i) => i.id === selectedItemId && i.type === 'text',
    ) as CanvasTextElement | undefined;
    const { setAndCommit } = useCustomizerHistory();

    const commitItemsToHistory = (newItems?: CanvasItem[]) => {
        // If we weren't passed items, read from store (reliable sync)
        const itemsNow =
            newItems ?? (store.getState().canvasItem.items as CanvasItem[]);
        setAndCommit((prev: any) => ({
            ...(prev || {}),
            uploadedItems: itemsNow,
        }));
    };

    const handleAddText = () => {
        dispatch(addText(defaultNewText as any));
        // commit after store updates
        setTimeout(() => commitItemsToHistory(), 0);
    };

    const updateSelectedField = (
        field: keyof CanvasTextElement,
        value: any,
    ) => {
        if (!selected) return;
        dispatch(updateItem({ id: selected.id, changes: { [field]: value } }));

        const updated = items.map((it) =>
            it.id === selected.id ? { ...it, [field]: value } : it,
        );
        commitItemsToHistory(updated);
    };

    const handleDelete = (id: string) => {
        dispatch(removeItem(id));
        // commit after state change
        setTimeout(() => commitItemsToHistory(), 0);
    };

    const handleSelect = (id: string) => {
        dispatch(selectItem(id));
    };

    return (
        <div className="w-full p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Text</h3>
                <button
                    className="inline-flex items-center gap-2 rounded border bg-white px-3 py-1 text-sm"
                    onClick={handleAddText}
                    aria-label="Add text"
                >
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="mb-2 text-xs text-muted">Items</div>
                    <div className="max-h-40 space-y-2 overflow-auto">
                        {textItems.length === 0 && (
                            <div className="text-sm text-muted">
                                No text added yet
                            </div>
                        )}

                        {textItems.map((t) => (
                            <div
                                key={t.id}
                                className={`flex items-center justify-between rounded border p-2 ${selectedItemId === t.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                            >
                                <div
                                    onClick={() => handleSelect(t.id)}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div
                                        className="text-sm font-medium"
                                        style={{
                                            fontSize: Math.min(18, t.fontSize),
                                        }}
                                    >
                                        {t.text}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {t.fontFamily} • {t.fontSize}px
                                    </div>
                                </div>
                                <div className="ml-2 flex items-center gap-2">
                                    <button
                                        className="rounded p-1 hover:bg-gray-100"
                                        title="Bring to front"
                                        onClick={() => {
                                            dispatch({
                                                type: 'canvas/bringToFront',
                                                payload: t.id,
                                            });
                                            setTimeout(
                                                () => commitItemsToHistory(),
                                                0,
                                            );
                                        }}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className="rounded p-1 hover:bg-gray-100"
                                        title="Delete"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selected ? (
                    <div>
                        <div className="mb-2 text-xs text-muted">
                            Properties
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs">Text</label>
                            <textarea
                                className="w-full rounded border p-2"
                                value={selected.text}
                                onChange={(e) =>
                                    updateSelectedField('text', e.target.value)
                                }
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-xs">
                                    Font size
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded border p-2"
                                        value={selected.fontSize}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'fontSize',
                                                Math.max(
                                                    1,
                                                    Number(e.target.value) || 1,
                                                ),
                                            )
                                        }
                                    />
                                </label>

                                <label className="block text-xs">
                                    Color
                                    <input
                                        type="color"
                                        className="mt-1 h-10 w-full rounded p-1"
                                        value={selected.color}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'color',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-xs">
                                    Font family
                                    <select
                                        className="mt-1 w-full rounded border p-2"
                                        value={selected.fontFamily}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'fontFamily',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="Inter">Inter</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Times New Roman">
                                            Times New Roman
                                        </option>
                                        <option value="Courier New">
                                            Courier New
                                        </option>
                                    </select>
                                </label>

                                <label className="block text-xs">
                                    Align
                                    <select
                                        className="mt-1 w-full rounded border p-2"
                                        value={selected.textAlign || 'center'}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'textAlign',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-xs">
                                    Line height
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="mt-1 w-full rounded border p-2"
                                        value={selected.lineHeight || 1}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'lineHeight',
                                                Math.max(
                                                    0.5,
                                                    Number(e.target.value) || 1,
                                                ),
                                            )
                                        }
                                    />
                                </label>

                                <label className="block text-xs">
                                    Letter spacing
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="mt-1 w-full rounded border p-2"
                                        value={selected.letterSpacing || 0}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'letterSpacing',
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={!!selected.underline}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'underline',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    Underline
                                </label>

                                <label className="flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selected.fontStyle === 'italic'
                                        }
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'fontStyle',
                                                e.target.checked
                                                    ? 'italic'
                                                    : 'normal',
                                            )
                                        }
                                    />
                                    Italic
                                </label>

                                <label className="flex items-center gap-2 text-xs">
                                    Rotation
                                    <input
                                        type="number"
                                        className="w-20 rounded border p-2"
                                        value={selected.rotation || 0}
                                        onChange={(e) =>
                                            updateSelectedField(
                                                'rotation',
                                                Number(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className="mt-2 border-t pt-2">
                                <div className="mb-2 text-xs font-semibold">
                                    Outline
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="block text-xs">
                                        Color
                                        <input
                                            type="color"
                                            className="mt-1 h-10 w-full rounded p-1"
                                            value={selected.stroke || '#000000'}
                                            onChange={(e) =>
                                                updateSelectedField(
                                                    'stroke',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </label>

                                    <label className="block text-xs">
                                        Width
                                        <input
                                            type="number"
                                            className="mt-1 w-full rounded border p-2"
                                            value={selected.strokeWidth || 0}
                                            onChange={(e) =>
                                                updateSelectedField(
                                                    'strokeWidth',
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            e.target.value,
                                                        ) || 0,
                                                    ),
                                                )
                                            }
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    className="rounded bg-red-600 px-3 py-1 text-white"
                                    onClick={() => handleDelete(selected.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted">
                        Select a text item to edit its properties
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextSideBar;
