import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import FrontendLayout from '@/layouts/frontend-layout';
import { couponPricePage, home, login } from '@/routes';
import { purchase } from '@/routes/coupon';
import { SharedData } from '@/types';
import { Coupon } from '@/types/data';
import { Head, router, usePage } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle2, Loader2, Search, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Initialize Stripe with your public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

const breadcrumbs = [
    { title: 'Home', href: home().url },
    { title: 'Coupon Price', href: couponPricePage().url },
];

type SortOption =
    | 'price_asc'
    | 'price_desc'
    | 'discount_asc'
    | 'discount_desc'
    | 'newest';

const CouponPricePage = () => {
    const { auth, appSettings } = usePage<SharedData>().props;
    const { site_currency_symbol } = appSettings;
    const { coupons } = usePage<{ coupons: Coupon[] }>().props;

    console.log(coupons);

    const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showExpired, setShowExpired] = useState(false);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    useEffect(() => {
        let result = [...coupons];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (coupon) =>
                    coupon.coupon.toLowerCase().includes(term) ||
                    (coupon.discount &&
                        coupon.discount.toString().includes(term)),
            );
        }

        // Sort coupons
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price_desc':
                    return (b.price || 0) - (a.price || 0);
                case 'discount_asc':
                    return (a.discount || 0) - (b.discount || 0);
                case 'discount_desc':
                    return (b.discount || 0) - (a.discount || 0);
                case 'newest':
                default:
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
            }
        });

        setFilteredCoupons(result);
    }, [coupons, searchTerm, sortBy]);

    const handleBuyCoupon = async (coupon: Coupon) => {
        if (!auth.user) {
            router.visit(login());
            return;
        }

        setIsProcessing(coupon.id);

        try {
            const res = await fetch(purchase(coupon.id).url, {
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
                    body?.error || 'Failed to create buy coupon session',
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
            toast.error(e?.message || 'Failed to start checkout');
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <FrontendLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupon Deals" />

            <div className="mx-auto max-w-7xl py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Exclusive Coupon Deals
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Save big with our limited-time offers and discounts
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search coupons..."
                            className="w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="sort">Sort by:</Label>
                            <Select
                                value={sortBy}
                                onValueChange={(value: SortOption) =>
                                    setSortBy(value)
                                }
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        Newest First
                                    </SelectItem>
                                    <SelectItem value="price_asc">
                                        Price: Low to High
                                    </SelectItem>
                                    <SelectItem value="price_desc">
                                        Price: High to Low
                                    </SelectItem>
                                    <SelectItem value="discount_asc">
                                        Discount: Low to High
                                    </SelectItem>
                                    <SelectItem value="discount_desc">
                                        Discount: High to Low
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Coupons Grid */}
                {filteredCoupons.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCoupons.map((coupon) => (
                            <Card
                                key={coupon.id}
                                className="group relative overflow-hidden transition-shadow hover:shadow-lg"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Tag className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {coupon.coupon}
                                            </span>
                                        </div>
                                        {coupon.status ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="mt-2 text-2xl">
                                        {coupon.discount}% OFF
                                    </CardTitle>
                                    <CardDescription>
                                        <p>
                                            {coupon.limit ? (
                                                <span>
                                                    For <b>{coupon.limit}</b>{' '}
                                                    products
                                                </span>
                                            ) : (
                                                'No purchase limit'
                                            )}
                                        </p>
                                        <p>
                                            {coupon.expires_in ? (
                                                <span>
                                                    Expires in{' '}
                                                    <b>{coupon.expires_in}</b>{' '}
                                                    days after purchase
                                                </span>
                                            ) : (
                                                'Use for unlimited time'
                                            )}
                                        </p>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Coupon Price
                                            </p>
                                            <p className="text-xl font-bold">
                                                {site_currency_symbol}
                                                {coupon.price}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                handleBuyCoupon(coupon)
                                            }
                                            disabled={
                                                isProcessing === coupon.id
                                            }
                                        >
                                            {isProcessing === coupon.id ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Buy Now'
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                        <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                            No coupons found
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {searchTerm
                                ? 'Try adjusting your search or filter'
                                : 'Check back later for new deals!'}
                        </p>
                    </div>
                )}
            </div>
        </FrontendLayout>
    );
};

export default CouponPricePage;
