import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '@/stores/store';
import {
    addText,
    updateItem,
    removeItem,
    selectItem,
} from '@/stores/customizer/canvasItemSlice';
import { useCustomizerHistory } from '@/contexts/customizer-history-context';
import { CanvasTextElement, CanvasItem } from '@/types/customizer/uploaded-items';
import { Trash2, Plus } from 'lucide-react';

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
    const items = useSelector((s: RootState) => s.canvasItem.items) as CanvasItem[];
    const selectedItemId = useSelector((s: RootState) => s.canvasItem.selectedItemId) as string | null;
    const textItems = items.filter((i) => i.type === 'text') as CanvasTextElement[];
    const selected = items.find((i) => i.id === selectedItemId && i.type === 'text') as CanvasTextElement | undefined;
    const { setAndCommit } = useCustomizerHistory();

    const commitItemsToHistory = (newItems?: CanvasItem[]) => {
        // If we weren't passed items, read from store (reliable sync)
        const itemsNow = newItems ?? (store.getState().canvasItem.items as CanvasItem[]);
        setAndCommit((prev: any) => ({ ...(prev || {}), uploadedItems: itemsNow }));
    };

    const handleAddText = () => {
        dispatch(addText(defaultNewText as any));
        // commit after store updates
        setTimeout(() => commitItemsToHistory(), 0);
    };

    const updateSelectedField = (field: keyof CanvasTextElement, value: any) => {
        if (!selected) return;
        dispatch(updateItem({ id: selected.id, changes: { [field]: value } }));

        const updated = items.map((it) => (it.id === selected.id ? { ...it, [field]: value } : it));
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
        <div className="p-4 w-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Text</h3>
                <button
                    className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm bg-white"
                    onClick={handleAddText}
                    aria-label="Add text"
                >
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="text-xs text-muted mb-2">Items</div>
                    <div className="space-y-2 max-h-40 overflow-auto">
                        {textItems.length === 0 && (
                            <div className="text-sm text-muted">No text added yet</div>
                        )}

                        {textItems.map((t) => (
                            <div
                                key={t.id}
                                className={`flex items-center justify-between p-2 rounded border ${selectedItemId === t.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                            >
                                <div onClick={() => handleSelect(t.id)} className="flex-1 cursor-pointer">
                                    <div className="text-sm font-medium" style={{ fontSize: Math.min(18, t.fontSize) }}>{t.text}</div>
                                    <div className="text-xs text-muted">{t.fontFamily} • {t.fontSize}px</div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <button className="p-1 rounded hover:bg-gray-100" title="Bring to front" onClick={() => { dispatch({ type: 'canvas/bringToFront', payload: t.id }); setTimeout(() => commitItemsToHistory(), 0); }}>
                                        ↑
                                    </button>
                                    <button className="p-1 rounded hover:bg-gray-100" title="Delete" onClick={() => handleDelete(t.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selected ? (
                    <div>
                        <div className="text-xs text-muted mb-2">Properties</div>
                        <div className="space-y-2">
                            <label className="block text-xs">Text</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={selected.text}
                                onChange={(e) => updateSelectedField('text', e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-xs">
                                    Font size
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded mt-1"
                                        value={selected.fontSize}
                                        onChange={(e) => updateSelectedField('fontSize', Math.max(1, Number(e.target.value) || 1))}
                                    />
                                </label>

                                <label className="block text-xs">
                                    Color
                                    <input
                                        type="color"
                                        className="w-full h-10 p-1 mt-1 rounded"
                                        value={selected.color}
                                        onChange={(e) => updateSelectedField('color', e.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-xs">
                                    Font family
                                    <select
                                        className="w-full p-2 border rounded mt-1"
                                        value={selected.fontFamily}
                                        onChange={(e) => updateSelectedField('fontFamily', e.target.value)}
                                    >
                                        <option value="Inter">Inter</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                        <option value="Courier New">Courier New</option>
                                    </select>
                                </label>

                                <label className="block text-xs">
                                    Align
                                    <select
                                        className="w-full p-2 border rounded mt-1"
                                        value={selected.textAlign || 'center'}
                                        onChange={(e) => updateSelectedField('textAlign', e.target.value)}
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
                                        className="w-full p-2 border rounded mt-1"
                                        value={selected.lineHeight || 1}
                                        onChange={(e) => updateSelectedField('lineHeight', Math.max(0.5, Number(e.target.value) || 1))}
                                    />
                                </label>

                                <label className="block text-xs">
                                    Letter spacing
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full p-2 border rounded mt-1"
                                        value={selected.letterSpacing || 0}
                                        onChange={(e) => updateSelectedField('letterSpacing', Number(e.target.value) || 0)}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs">
                                    <input type="checkbox" checked={!!selected.underline} onChange={(e) => updateSelectedField('underline', e.target.checked)} />
                                    Underline
                                </label>

                                <label className="flex items-center gap-2 text-xs">
                                    Rotation
                                    <input
                                        type="number"
                                        className="w-20 p-2 border rounded"
                                        value={selected.rotation || 0}
                                        onChange={(e) => updateSelectedField('rotation', Number(e.target.value) || 0)}
                                    />
                                </label>
                            </div>

                            <div className="flex justify-end">
                                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => handleDelete(selected.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted">Select a text item to edit its properties</div>
                )}
            </div>
        </div>
    );
};

export default TextSideBar;
