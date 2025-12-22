import {
    addToCart as addToCartThunk,
    clearCart as clearCartAction,
    fetchCart as fetchCartThunk,
    removeFromCart as removeFromCartThunk,
} from '@/stores/cartSlice';
import type { AppDispatch, RootState } from '@/stores/store';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Re-export thunks for compatibility with existing named imports
export const addToCart = addToCartThunk;
export const removeFromCart = removeFromCartThunk;
export const fetchCart = fetchCartThunk;
export const clearCart = clearCartAction;

/**
 * Backwards-compatible hook that mirrors the old `useCartStore` API
 * but delegates to the Redux store under the hood.
 */
export const useCartStore = () => {
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector((s: RootState) => s.cart.items);
    const loading = useSelector((s: RootState) => s.cart.loading);
    const error = useSelector((s: RootState) => s.cart.error);

    useEffect(() => {
        // ensure cart is loaded when the hook is used
        dispatch(fetchCartThunk());
    }, [dispatch]);

    const add = useCallback(
        (payload: number | { id?: number; product_id?: number }) => {
            const productId =
                typeof payload === 'number'
                    ? payload
                    : (payload.id ?? payload.product_id);
            if (typeof productId !== 'number') return;
            dispatch(addToCartThunk(productId));
        },
        [dispatch],
    );

    const remove = useCallback(
        (id: number) => dispatch(removeFromCartThunk(id)),
        [dispatch],
    );

    const updateQuantity = useCallback(
        (_id: string | number, _quantity: number) => {
            // Quantity is fixed to 1 by design — no-op
            console.warn(
                'updateQuantity is a no-op; cart quantities are fixed to 1',
            );
        },
        [],
    );

    const clear = useCallback(() => dispatch(clearCartAction()), [dispatch]);

    const itemCount = () =>
        items.reduce((t: number, it: any) => t + it.quantity, 0);
    const totalPrice = () =>
        items.reduce((t: number, it: any) => t + it.price * it.quantity, 0);

    return {
        items,
        loading,
        error,
        addToCart: add,
        removeFromCart: remove,
        updateQuantity,
        clearCart: clear,
        itemCount,
        totalPrice,
        getItems: () => [...items],
    };
};

export default useCartStore;
