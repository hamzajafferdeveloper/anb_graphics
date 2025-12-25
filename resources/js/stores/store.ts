// @ts-ignore: optional dependency in some environments
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import customizerReducer from './customizer/customizerSlice';
import canvasItemReducer from './customizer/canvasItemSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        customizer: customizerReducer,
        canvasItem: canvasItemReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
