// @ts-ignore: optional dependency in some environments
import { ProductImage } from '@/types/data';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type BackendCartItem = {
    id: number;
    product_id: number;
    quantity: number;
    product?: any;
};

export type CartItem = {
    id: number | string;
    product_id: number;
    name: string;
    price: number;
    quantity: number; // fixed to 1
    image?: string | null;
    slug?: string | null;
};

type CartState = {
    items: CartItem[];
    loading: boolean;
    error?: string | null;
};

const initialState: CartState = {
    items: [],
    loading: false,
    error: null,
};

const mapBackendItem = (b: BackendCartItem): CartItem => {
    const product = b.product || {};

    // Parse sale start and end dates
    const now = new Date();
    const saleStart = product.sale_start_at
        ? new Date(product.sale_start_at)
        : null;
    const saleEnd = product.sale_end_at ? new Date(product.sale_end_at) : null;

    // Determine if sale is active
    const isSaleActive =
        product.sale_price &&
        (!saleStart || now >= saleStart) &&
        (!saleEnd || now <= saleEnd);

    return {
        id: b.id,
        product_id: b.product_id,
        name: product.name || 'Product',
        price:
            parseFloat(isSaleActive ? product.sale_price : product.price) || 0,
        quantity: 1,
        image:
            product.images?.find((img: ProductImage) => img.is_primary)?.path ||
            null,
        slug: product.slug || null,
    };
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
    const res = await fetch('/cart/items', {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    const json = await res.json();
    return (json.data || []) as BackendCartItem[];
});

export const addToCart = createAsyncThunk(
    'cart/add',
    async (product_id: number, { dispatch }: { dispatch: any }) => {
        const res = await fetch('/cart/items', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ product_id }),
        });

        // parse response body when possible to extract friendly messages
        let body: any = null;
        try {
            body = await res.json();
        } catch (e) {
            // ignore parse errors
        }

        if (res.status === 409) {
            // already in cart - refresh so UI is accurate
            await dispatch(fetchCart());
            return { already: true } as any;
        }

        if (!res.ok) {
            const message =
                body?.message || body?.error || 'Failed to add to cart';
            throw new Error(message);
        }

        await dispatch(fetchCart());
        return { ok: true } as any;
    },
);

export const removeFromCart = createAsyncThunk(
    'cart/remove',
    async (id: number, { dispatch }: { dispatch: any }) => {
        const res = await fetch(`/cart/items/${id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (!res.ok) throw new Error('Failed to remove item');
        await dispatch(fetchCart());
        return id;
    },
);

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart(state: CartState) {
            state.items = [];
        },
        setItems(state: CartState, action: any) {
            state.items = action.payload;
        },
    },
    extraReducers: (builder: any) => {
        builder
            .addCase(fetchCart.pending, (s: CartState) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchCart.fulfilled, (s: CartState, action: any) => {
                s.loading = false;
                s.items = (action.payload || []).map(mapBackendItem);
            })
            .addCase(fetchCart.rejected, (s: CartState, action: any) => {
                s.loading = false;
                s.error = action.error?.message || 'Failed to fetch cart';
            })
            .addCase(addToCart.rejected, (s: CartState, action: any) => {
                s.error = action.error?.message || 'Failed to add to cart';
            })
            .addCase(removeFromCart.rejected, (s: CartState, action: any) => {
                s.error = action.error?.message || 'Failed to remove from cart';
            });
    },
});

export const { clearCart, setItems } = cartSlice.actions;

export default cartSlice.reducer;
