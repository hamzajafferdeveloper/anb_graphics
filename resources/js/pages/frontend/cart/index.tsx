import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import FrontendLayout from '@/layouts/frontend-layout';
import { index } from '@/routes/coupon';
import { CartItem, fetchCart, removeFromCart } from '@/stores/cartSlice';
import { RootState } from '@/stores/store';
import { SharedData } from '@/types';
import { UserCoupon } from '@/types/data';
import { Head, Link, usePage } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Ticket, Trash2 } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

export default function CartPage() {
    const dispatch = useDispatch();
    const items = useSelector((s: RootState) => s.cart.items);

    const [coupons, setCoupons] = React.useState<UserCoupon[]>([]);
    const [appliedCoupons, setAppliedCoupons] = React.useState<
        Record<number, UserCoupon>
    >({});
    const [couponInputs, setCouponInputs] = React.useState<
        Record<number, string>
    >({});
    const [loading, setLoading] = React.useState(false);

    const { appSettings } = usePage<SharedData>().props;
    const { site_currency_symbol } = appSettings;

    /* -------------------- Fetch cart + coupons -------------------- */
    React.useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            dispatch(fetchCart());
            setLoading(true);
            try {
                const res = await fetch(index().url, {
                    signal: controller.signal,
                });
                const json = await res.json();
                setCoupons(json.userCoupons || []);
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    console.error('Failed to fetch coupons', e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [dispatch]);

    /* -------------------- Helpers -------------------- */
    const handleRemove = (cartItemId: number, productId: number) => {
        dispatch(removeFromCart(cartItemId));
        setAppliedCoupons((prev) => {
            const copy = { ...prev };
            delete copy[productId];
            return copy;
        });
        setCouponInputs((prev) => {
            const copy = { ...prev };
            delete copy[productId];
            return copy;
        });
    };

    const applyCoupon = (item: CartItem) => {
        const code = couponInputs[item.product_id]?.trim();
        if (!code) return toast.error('Enter coupon code');

        const userCoupon = coupons.find(
            (c) =>
                c.code === code && c.coupon.status === 1 && c.used_no < c.limit,
        );

        if (!userCoupon) return toast.error('Invalid or exhausted coupon');

        setAppliedCoupons((prev) => ({
            ...prev,
            [item.product_id]: { ...userCoupon, product_id: item.product_id },
        }));

        toast.success(`Coupon ${code} applied`);
    };

    const getItemTotal = (item: CartItem) => {
        const applied = appliedCoupons[item.product_id];
        let price = item.price;

        if (applied) {
            // Percentage discount
            price = Math.max(
                //@ts-ignore
                price - price * (applied.coupon.discount / 100),
                0,
            );
        }

        return price * item.quantity;
    };

    const subtotal = items.reduce(
        (t: number, it: CartItem) => t + it.price * it.quantity,
        0,
    );
    const total = items.reduce(
        (t: number, it: CartItem) => t + getItemTotal(it),
        0,
    );

    /* -------------------- Checkout -------------------- */
    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/cart/checkout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    items,
                    applied_coupons: Object.entries(appliedCoupons).map(
                        ([productId, coupon]) => ({
                            product_id: Number(productId),
                            user_coupon_id: coupon.id,
                            coupon_id: coupon.coupon_id,
                            code: coupon.code,
                            discount: coupon.coupon.discount,
                        }),
                    ),
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || 'Checkout failed');
            }

            const json = await res.json();
            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);

            if (json.url) {
                window.location.href = json.url;
                return;
            }

            //@ts-ignore
            await stripe?.redirectToCheckout({ sessionId: json.id });
        } catch (e: any) {
            toast.error(e.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- Empty cart -------------------- */
    if (!items.length) {
        return (
            <FrontendLayout>
                <Head title="Your Shopping Cart" />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="mb-6 text-3xl font-bold">
                        Your Cart is Empty
                    </h1>
                    <Link href="/products">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </FrontendLayout>
        );
    }

    /* -------------------- UI -------------------- */
    return (
        <FrontendLayout>
            <Head title="Your Shopping Cart" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Cart Items */}
                    <div className="space-y-6 md:col-span-2">
                        {items.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex gap-4 rounded-lg border p-4"
                            >
                                <img
                                    src={`storage/${item.image}`}
                                    className="h-32 w-32 rounded object-cover"
                                />

                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-medium">
                                            {item.name}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleRemove(
                                                    item.id,
                                                    item.product_id,
                                                )
                                            }
                                        >
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                        </Button>
                                    </div>

                                    <p className="text-lg">
                                        {site_currency_symbol}
                                        {item.price.toFixed(2)}
                                    </p>

                                    <div className="mt-3 flex gap-2">
                                        <Input
                                            placeholder="HOLIDAY10"
                                            value={
                                                couponInputs[item.product_id] ||
                                                ''
                                            }
                                            disabled={
                                                !!appliedCoupons[
                                                    item.product_id
                                                ]
                                            }
                                            onChange={(e) =>
                                                setCouponInputs((p) => ({
                                                    ...p,
                                                    [item.product_id]:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                        <Button
                                            variant="outline"
                                            disabled={
                                                !!appliedCoupons[
                                                    item.product_id
                                                ]
                                            }
                                            onClick={() => applyCoupon(item)}
                                        >
                                            <Ticket className="mr-2 h-4 w-4" />
                                            {appliedCoupons[item.product_id]
                                                ? 'Applied'
                                                : 'Use Coupon'}
                                        </Button>
                                    </div>

                                    {appliedCoupons[item.product_id] && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Discount: -{site_currency_symbol}
                                            {
                                                appliedCoupons[item.product_id]
                                                    .coupon.discount
                                            }
                                            %
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="h-fit rounded-lg border p-6">
                        <h2 className="mb-6 text-xl font-semibold">
                            Order Summary
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    {site_currency_symbol}
                                    {subtotal.toFixed(2)}
                                </span>
                            </div>

                            {subtotal !== total && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon Discount</span>
                                    <span>
                                        -{site_currency_symbol}
                                        {(subtotal - total).toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>
                                    {site_currency_symbol}
                                    {total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Button
                            className="mt-6 w-full"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading && <Spinner className="mr-2" />}
                            Proceed to Checkout
                        </Button>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
