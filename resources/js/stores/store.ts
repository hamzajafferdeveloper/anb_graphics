// @ts-ignore: optional dependency in some environments
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import customizerReducer from './customizer/customizerSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        customizer: customizerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
