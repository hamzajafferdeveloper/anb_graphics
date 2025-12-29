import { TemplatePart } from '@/types/data';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomizerState {
    selectedSidebar: string;
    selectedSvgPart: string;
    parts: TemplatePart[];
    svgTemplateParentMaxSize?: number;
}

const initialState: CustomizerState = {
    selectedSidebar: 'Color',
    selectedSvgPart: '',
    parts: [],
    svgTemplateParentMaxSize: undefined,
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
    },
});

// Export setParts
export const { setSelectedSidebar, setSelectedSvgPart, setParts } =
    customizerSlice.actions;

// Export reducer
export default customizerSlice.reducer;
