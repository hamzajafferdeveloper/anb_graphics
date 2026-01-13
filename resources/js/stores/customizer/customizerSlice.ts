import { TemplatePart } from '@/types/data';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomizerState {
    selectedSidebar: string;
    selectedSvgPart: string;
    parts: TemplatePart[];
    svgTemplateParentMaxSize?: number;
    zoom: number;
    pan: { x: number; y: number };
}

const initialState: CustomizerState = {
    selectedSidebar: 'Color',
    selectedSvgPart: '',
    parts: [],
    svgTemplateParentMaxSize: undefined,
    zoom: 1,
    pan: { x: 0, y: 0 },
};

const customizerSlice = createSlice({
    name: 'customizer',
    initialState,
    reducers: {
        // @ts-ignore
        setSelectedSidebar(state: any, action: PayloadAction<string>) {
            state.selectedSidebar = action.payload;
        },
        // @ts-ignore
        setSelectedSvgPart(state: any, action: PayloadAction<string>) {
            state.selectedSvgPart = action.payload;
        },
        // @ts-ignore
        setParts(state: any, action: PayloadAction<TemplatePart[]>) {
            state.parts = action.payload;
        },
        // @ts-ignore
        setSvgTemplateMaxSizeOfParent(state: any, action: PayloadAction<number>) {
            state.svgTemplateParentMaxSize = action.payload;
        },
        // @ts-ignore
        setZoom(state: any, action: PayloadAction<number>) {
            state.zoom = action.payload;
        },
        // @ts-ignore
        setPan(state: any, action: PayloadAction<{ x: number; y: number }>) {
            state.pan = action.payload;
        },
    },
});

// Export setParts
export const {
    setSelectedSidebar,
    setSelectedSvgPart,
    setParts,
    setSvgTemplateMaxSizeOfParent,
    setZoom,
    setPan,
} = customizerSlice.actions;

// Export reducer
export default customizerSlice.reducer;
