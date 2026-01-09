import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import FrontendLayout from '@/layouts/frontend-layout';
import { index, show } from '@/routes/products';

import { addToCart } from '@/stores/cartSlice';
import { SharedData } from '@/types';
import {
    Product,
    ProductBrand,
    ProductCategory,
    ProductType,
} from '@/types/data';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

interface Props {
    products: Product[];
    productsPagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null;
    filters: Record<string, any>;
    categories: ProductCategory[];
    brands: ProductBrand[];
    types: ProductType[];
}

const ProductIndexPage = ({
    products,
    productsPagination,
    filters,
    categories,
    brands,
    types,
}: Props) => {
    const [query, setQuery] = useState<string>(filters?.q ?? '');
    const [category, setCategory] = useState<string>(
        filters?.category ?? 'all',
    );
    const [brand, setBrand] = useState<string>(filters?.brand ?? 'all');
    const [type, setType] = useState<string>(filters?.type ?? 'all');
    const [minPrice, setMinPrice] = useState<string | undefined>(
        filters?.min_price ?? '',
    );
    const [maxPrice, setMaxPrice] = useState<string | undefined>(
        filters?.max_price ?? '',
    );
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const page = usePage<SharedData>();
    const { auth, appSettings } = page.props;

    const { site_currency, site_currency_symbol } = appSettings;

    const buildQuery = (page?: number) => {
        const params: any = {};
        if (query) params.q = query;
        if (category && category !== 'all') params.category = category;
        if (brand && brand !== 'all') params.brand = brand;
        if (type && type !== 'all') params.type = type;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (page) params.page = page;
        return params;
    };

    const fetch = (page?: number) => {
        setLoading(true);
        const params = buildQuery(page);
        router.get(index.url({ query: params }), params, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // Debounced fetch when filters change
    useEffect(() => {
        const t = setTimeout(() => fetch(), 300);
        return () => clearTimeout(t);
    }, [query, category, brand, type, minPrice, maxPrice]);

    return (
        <FrontendLayout>
            <Head title="Products" />

            <section className="mx-auto max-w-7xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Title */}
                    <h1 className="text-2xl font-bold">Products</h1>

                    {/* Filters */}
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <Input
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="min-w-[150px] flex-1"
                        />

                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id.toString()}
                                    >
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* <Select value={brand} onValueChange={setBrand}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((b) => (
                                    <SelectItem
                                        key={b.id}
                                        value={b.id.toString()}
                                    >
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}

                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {types.map((t) => (
                                    <SelectItem
                                        key={t.id}
                                        value={t.id.toString()}
                                    >
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {loading && (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <Spinner className="h-8 w-8" />
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            No products found.
                        </div>
                    )}

                    {!loading &&
                        products.map((product) => (
                            <Card
                                key={product.id}
                                className="flex flex-col shadow hover:shadow-lg"
                            >
                                <CardContent className="flex flex-col p-0">
                                    {/* Image */}
                                    <div className="relative aspect-[1/1] w-full overflow-hidden rounded-t sm:aspect-[3/3]">
                                        {product.images &&
                                            product.images.length > 0 ? (
                                            <img
                                                src={`/storage/${product.images.find((i) => i.is_primary)?.path ?? product.images[0].path}`}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="line-clamp-2 text-lg font-semibold">
                                            {product.name}
                                        </h3>

                                        <div className="mt-2 flex w-full items-center justify-between text-sm text-muted-foreground">
                                            <div>
                                                <div>
                                                    {product.brand?.name ?? ''}
                                                </div>
                                                <div className="font-medium">
                                                    {(() => {
                                                        const now = new Date();
                                                        const saleStart =
                                                            product.sale_start_at
                                                                ? new Date(
                                                                    product.sale_start_at,
                                                                )
                                                                : null;
                                                        const saleEnd =
                                                            product.sale_end_at
                                                                ? new Date(
                                                                    product.sale_end_at,
                                                                )
                                                                : null;

                                                        const isSaleActive =
                                                            product.sale_price &&
                                                            (!saleStart ||
                                                                now >=
                                                                saleStart) &&
                                                            (!saleEnd ||
                                                                now <= saleEnd);

                                                        return (
                                                            <>
                                                                {
                                                                    site_currency_symbol
                                                                }
                                                                {isSaleActive
                                                                    ? product.sale_price
                                                                    : product.price}
                                                                {isSaleActive && (
                                                                    <span className="ml-2 text-xs text-gray-400 line-through">
                                                                        {
                                                                            site_currency_symbol
                                                                        }
                                                                        {
                                                                            product.price
                                                                        }
                                                                    </span>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="icon">
                                                    <Link
                                                        href={show(
                                                            product.slug,
                                                        )}
                                                    >
                                                        <Eye />{' '}
                                                    </Link>
                                                </Button>

                                                {product.canBuy && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={async () => {
                                                            if (!auth?.user) {
                                                                toast.error(
                                                                    'Please login to add items to cart',
                                                                );
                                                                router.visit(
                                                                    '/login',
                                                                );
                                                                return;
                                                            }

                                                            const res: any =
                                                                await dispatch(
                                                                    addToCart(
                                                                        product.id as number,
                                                                    ),
                                                                );
                                                            if (
                                                                res?.meta
                                                                    ?.requestStatus ===
                                                                'rejected' ||
                                                                res?.type?.endsWith(
                                                                    '/rejected',
                                                                )
                                                            ) {
                                                                const message =
                                                                    res?.error
                                                                        ?.message ||
                                                                    res?.payload
                                                                        ?.message ||
                                                                    'Failed to add to cart';
                                                                toast.error(
                                                                    message,
                                                                );
                                                                return;
                                                            }

                                                            if (
                                                                res?.payload
                                                                    ?.already
                                                            ) {
                                                                toast(
                                                                    'Product already in cart',
                                                                );
                                                                return;
                                                            }

                                                            toast.success(
                                                                'Added to cart',
                                                            );
                                                        }}
                                                    >
                                                        <ShoppingCart />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>

                {productsPagination && (
                    <div className="mt-6 flex w-full justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const prev =
                                                productsPagination.current_page -
                                                1;
                                            if (prev >= 1) fetch(prev);
                                        }}
                                    />
                                </PaginationItem>

                                {Array.from(
                                    { length: productsPagination.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={
                                                page ===
                                                productsPagination.current_page
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                fetch(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const next =
                                                productsPagination.current_page +
                                                1;
                                            if (
                                                next <=
                                                productsPagination.last_page
                                            )
                                                fetch(next);
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </section>
        </FrontendLayout>
    );
};

export default ProductIndexPage;
