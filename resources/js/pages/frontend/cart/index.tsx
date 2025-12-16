import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import FrontendLayout from '@/layouts/frontend-layout';
import {
    CartItem,
    clearCart,
    fetchCart,
    removeFromCart,
} from '@/stores/cartSlice';
import { RootState } from '@/stores/store';
import { Head, Link } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CartPage() {
    const dispatch = useDispatch();
    const items = useSelector((s: RootState) => s.cart.items);
    const [loading, setLoading] = React.useState(false);

    // fetch cart on mount
    React.useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleRemove = (id: number) => {
        dispatch(removeFromCart(id));
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/cart/checkout', {
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
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    body?.error || 'Failed to create checkout session',
                );
            }

            const json = await res.json();
            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);

            if (json.url) {
                // If server returned direct url (modern Stripe), redirect browser
                window.location.href = json.url;
                return;
            }

            if (!stripe) throw new Error('Stripe failed to load');

            // @ts-ignore
            await stripe.redirectToCheckout({ sessionId: json.id });
        } catch (e: any) {
            console.error('Checkout error', e);
            alert(e?.message || 'Failed to start checkout');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <FrontendLayout>
                <Head title="Your Shopping Cart" />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="mb-6 text-3xl font-bold">
                        Your Cart is Empty
                    </h1>
                    <p className="mb-8 text-gray-600">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link href="/products">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </FrontendLayout>
        );
    }

    return (
        <FrontendLayout>
            <Head title="Your Shopping Cart" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Cart Items */}
                    <div className="md:col-span-2">
                        <div className="space-y-6">
                            {items.map((item: CartItem) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
                                >
                                    <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
                                        <img
                                            src={
                                                `storage/${item.image}` ||
                                                '/images/placeholder-product.jpg'
                                            }
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-medium">
                                                <Link
                                                    href={`/products/${item.slug || '#'}`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemove(
                                                        Number(item.id),
                                                    )
                                                }
                                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <p className="mt-1 text-lg font-medium">
                                            ${item.price.toFixed(2)}
                                        </p>
                                        <div className="mt-4 flex items-center">
                                            <div className="text-sm text-gray-600">
                                                Quantity: 1
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <Button variant="outline" asChild>
                                <Link href="/products">Continue Shopping</Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => dispatch(clearCart())}
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                                Clear Cart
                            </Button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-lg border p-6">
                        <h2 className="mb-6 text-xl font-semibold">
                            Order Summary
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>
                                    Subtotal (
                                    {items.reduce(
                                        (t: number, it: CartItem) =>
                                            t + it.quantity,
                                        0,
                                    )}{' '}
                                    items)
                                </span>
                                <span>
                                    $
                                    {items
                                        .reduce(
                                            (t: number, it: CartItem) =>
                                                t + it.price * it.quantity,
                                            0,
                                        )
                                        .toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>
                                    $
                                    {items
                                        .reduce(
                                            (t: number, it: CartItem) =>
                                                t + it.price * it.quantity,
                                            0,
                                        )
                                        .toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <Button
                            className="mt-6 w-full"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading && <Spinner className="mr-2" />} Proceed to Checkout
                        </Button>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
