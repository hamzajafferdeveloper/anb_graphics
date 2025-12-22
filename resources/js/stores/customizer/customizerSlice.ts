import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomizerState {
    selectedSidebar: string;
    selectedSvgPart: string;
}

const initialState: CustomizerState = {
    selectedSidebar: 'color',
    selectedSvgPart: '',
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
    },
});

// Export actions
export const { setSelectedSidebar, setSelectedSvgPart } =
    customizerSlice.actions;

// Export reducer
export default customizerSlice.reducer;
