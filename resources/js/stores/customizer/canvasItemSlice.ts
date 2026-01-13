import { generateUUID } from '@/lib/utils';
import {
    CanvasImageElement,
    CanvasItem,
    CanvasTextElement,
} from '@/types/customizer/uploaded-items';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CanvasState {
    items: CanvasItem[];
    selectedItemId: string | null;
}

const initialState: CanvasState = {
    items: [],
    selectedItemId: null,
};

// Helper to bring item to front
function getNextZIndex(items: CanvasItem[]) {
    return items.length ? Math.max(...items.map((i) => i.zIndex ?? 0)) + 1 : 1;
}

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        /* ---------------- IMAGE UPLOAD ---------------- */
        addImage(
            state: any,
            // @ts-ignore
            action: PayloadAction<
                Omit<CanvasImageElement, 'id' | 'type' | 'zIndex'>
            >,
        ) {
            const id = generateUUID();

            state.items.push({
                id,
                type: 'image',
                zIndex: getNextZIndex(state.items),
                ...action.payload,
            });

            state.selectedItemId = id;
        },

        /* ---------------- TEXT ADD ---------------- */
        addText(
            state: any,
            // @ts-ignore
            action: PayloadAction<
                Omit<CanvasTextElement, 'id' | 'type' | 'zIndex'>
            >,
        ) {
            const id = generateUUID();

            state.items.push({
                id,
                type: 'text',
                zIndex: getNextZIndex(state.items),
                ...action.payload,
            });

            state.selectedItemId = id;
        },

        /* ---------------- SELECT ---------------- */
        selectItem(
            state: any,
            //@ts-ignore
            action: PayloadAction<string | null>,
        ) {
            state.selectedItemId = action.payload;
        },

        /* ---------------- UPDATE ---------------- */
        updateItem(
            state: any,
            // @ts-ignore
            action: PayloadAction<{
                id: string;
                changes: Partial<CanvasItem>;
            }>,
        ) {
            const item = state.items.find(
                (i: any) => i.id === action.payload.id,
            );
            if (!item || item.locked) return;

            Object.assign(item, action.payload.changes);
        },

        /* ---------------- MOVE ---------------- */
        moveItem(
            state: any,
            // @ts-ignore
            action: PayloadAction<{ id: string; x: number; y: number }>,
        ) {
            const item = state.items.find(
                (i: any) => i.id === action.payload.id,
            );
            if (!item || item.locked) return;

            item.x = action.payload.x;
            item.y = action.payload.y;
        },

        /* ---------------- RESIZE ---------------- */
        resizeItem(
            state: any,
            // @ts-ignore
            action: PayloadAction<{
                id: string;
                width: number;
                height: number;
            }>,
        ) {
            const item = state.items.find(
                (i: any) => i.id === action.payload.id,
            );
            if (!item || item.locked) return;

            item.width = action.payload.width;
            item.height = action.payload.height;
        },

        /* ---------------- Z-INDEX ---------------- */
        bringToFront(
            state: any,
            //@ts-ignore
            action: PayloadAction<string>,
        ) {
            const item = state.items.find((i: any) => i.id === action.payload);
            if (!item) return;

            item.zIndex = getNextZIndex(state.items);
        },

        /* ---------------- SET ITEMS (for history sync) ---------------- */
        setItems(state: any, //@ts-ignore
            action: PayloadAction<CanvasItem[]>) {
            state.items = action.payload;
            // If selected item no longer exists, clear selection
            if (!state.items.find((i: any) => i.id === state.selectedItemId)) {
                state.selectedItemId = null;
            }
        },

        /* ---------------- DELETE ---------------- */
        removeItem(
            state: any,
            //@ts-ignore
            action: PayloadAction<string>,
        ) {
            state.items = state.items.filter(
                (i: any) => i.id !== action.payload,
            );

            if (state.selectedItemId === action.payload) {
                state.selectedItemId = null;
            }
        },

        /* ---------------- REORDER LAYERS ---------------- */
        moveLayer(
            state: any,
            // @ts-ignore
            action: PayloadAction<{
                id: string;
                direction: 'up' | 'down' | 'front' | 'back';
            }>,
        ) {
            const index = state.items.findIndex(
                (i: any) => i.id === action.payload.id,
            );
            if (index === -1) return;

            const item = state.items[index];
            const newItems = [...state.items];

            if (action.payload.direction === 'back') {
                // Move to start (bottom)
                newItems.splice(index, 1);
                newItems.unshift(item);
            } else if (action.payload.direction === 'front') {
                // Move to end (top)
                newItems.splice(index, 1);
                newItems.push(item);
            } else if (action.payload.direction === 'down') {
                // Swap with previous (move backward visually)
                if (index > 0) {
                    [newItems[index], newItems[index - 1]] = [
                        newItems[index - 1],
                        newItems[index],
                    ];
                }
            } else if (action.payload.direction === 'up') {
                // Swap with next (move forward visually)
                if (index < newItems.length - 1) {
                    [newItems[index], newItems[index + 1]] = [
                        newItems[index + 1],
                        newItems[index],
                    ];
                }
            }
            
            // Re-assign zIndex to match array order (optional but good for consistency)
            newItems.forEach((it, idx) => {
                it.zIndex = idx + 1;
            });

            state.items = newItems;
        },

        /* ---------------- CLEAR CANVAS ---------------- */
        clearCanvas(state: any) {
            state.items = [];
            state.selectedItemId = null;
        },
    },
});

export const {
    addImage,
    addText,
    selectItem,
    updateItem,
    moveItem,
    resizeItem,
    bringToFront,
    removeItem,
    moveLayer,
    clearCanvas,
    setItems,
} = canvasSlice.actions;

export default canvasSlice.reducer;
