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
import UserLayout from '@/layouts/user-layout';
import products, { show } from '@/routes/products';
import user from '@/routes/user';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: user.dashboard().url,
    },
    {
        title: 'Products',
        href: user.products().url,
    },
];

const UserProduct = () => {
    const page = usePage<SharedData>().props as any;

    // server-provided
    const purchased: any[] = page.purchased ?? [];
    const purchasedPagination: any = page.purchased_pagination ?? null;
    const serverFilters: any = page.filters ?? {};
    const brands: any[] = page.brands ?? [];
    const purchasedCount: number =
        page.purchased_count ?? purchased?.length ?? 0;
    const currency = page.appSettings?.site_currency_symbol ?? '$';

    // local state for filters
    const [query, setQuery] = useState<string>(serverFilters?.q ?? '');
    const [brand, setBrand] = useState<string>(
        serverFilters?.brand ? serverFilters.brand.toString() : 'all',
    );
    const [perPage, setPerPage] = useState<number>(
        serverFilters?.per_page ?? 12,
    );
    const [loading, setLoading] = useState(false);

    const buildQuery = (pageNum?: number) => {
        const params: any = {};
        if (query) params.q = query;
        if (brand && brand !== 'all') params.brand = brand;
        if (perPage) params.per_page = perPage;
        if (pageNum) params.page = pageNum;
        return params;
    };

    const fetch = (pageNum?: number) => {
        setLoading(true);
        const params = buildQuery(pageNum);
        router.get(user.products().url, params, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // debounce filters
    useEffect(() => {
        const t = setTimeout(() => fetch(1), 300);
        return () => clearTimeout(t);
    }, [query, brand, perPage]);

    return (
        <UserLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold">
                            Your Purchases
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            You have purchased{' '}
                            <span className="font-semibold">
                                {purchasedCount}
                            </span>{' '}
                            product{purchasedCount !== 1 ? 's' : ''}.
                        </p>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <Link href={products.index()}>
                            <Button className="text-sm">Browse Store</Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-2xl border bg-background p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left: Filters */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
                            <Input
                                placeholder="Search products…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full sm:min-w-[150PX]"
                            />

                            <Select
                                value={brand}
                                onValueChange={(v) => setBrand(v)}
                            >
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Brands
                                    </SelectItem>
                                    {brands.map((b: any) => (
                                        <SelectItem
                                            key={b.id}
                                            value={b.id.toString()}
                                        >
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* <Select
                                value={perPage.toString()}
                                onValueChange={(v) => setPerPage(parseInt(v))}
                            >
                                <SelectTrigger className="w-full sm:w-36">
                                    <SelectValue placeholder="Per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 / page</SelectItem>
                                    <SelectItem value="12">
                                        12 / page
                                    </SelectItem>
                                    <SelectItem value="24">
                                        24 / page
                                    </SelectItem>
                                </SelectContent>
                            </Select> */}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex justify-end">
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    setQuery('');
                                    setBrand('all');
                                    setPerPage(12);
                                    fetch(1);
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                            <Spinner className="h-8 w-8" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {purchased.length === 0 && !loading && (
                            <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-8 text-center">
                                <h3 className="text-lg font-semibold">
                                    No purchases yet
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Once you buy a product, it will appear here
                                    with quick actions and download/view links.
                                </p>
                                <div className="mt-4">
                                    <Link href={products.index()}>
                                        <Button className="text-sm">
                                            Browse Store
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {purchased.map((p) => {
                            const prod = p.product;
                            if (!prod) return null;

                            const img =
                                prod.images && prod.images.length > 0
                                    ? (prod.images.find(
                                          (i: any) => i.is_primary,
                                      )?.path ?? prod.images[0].path)
                                    : null;

                            return (
                                <Card
                                    key={p.id}
                                    className="overflow-hidden shadow-lg transition-shadow duration-200 hover:shadow-2xl"
                                >
                                    <CardContent className="p-0">
                                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                                            {img ? (
                                                <img
                                                    src={`/storage/${img}`}
                                                    alt={prod.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="line-clamp-2 text-lg font-semibold">
                                                {prod.name}
                                            </h3>
                                            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                                                <div>
                                                    <div className="text-xs">
                                                        {prod.brand?.name ?? ''}
                                                    </div>
                                                    <div className="mt-1 font-medium">
                                                        {currency}
                                                        {prod.sale_price ??
                                                            prod.price}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button size="icon" asChild>
                                                        <Link
                                                            href={show(
                                                                prod.slug,
                                                            )}
                                                            className="p-2"
                                                        >
                                                            <Eye />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Get Support
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                <div>
                                                    Purchased on:{' '}
                                                    <span className="font-medium">
                                                        {new Date(
                                                            p.created_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="font-medium text-emerald-600">
                                                    Purchased
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {purchasedPagination &&
                        purchasedPagination.last_page > 1 && (
                            <div className="mt-6 flex w-full justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const prev =
                                                        (purchasedPagination.current_page ??
                                                            1) - 1;
                                                    if (prev >= 1) fetch(prev);
                                                }}
                                            />
                                        </PaginationItem>

                                        {Array.from(
                                            {
                                                length: purchasedPagination.last_page,
                                            },
                                            (_, i) => i + 1,
                                        ).map((pageNum) => (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        fetch(pageNum);
                                                    }}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const next =
                                                        (purchasedPagination.current_page ??
                                                            1) + 1;
                                                    if (
                                                        next <=
                                                        (purchasedPagination.last_page ??
                                                            1)
                                                    )
                                                        fetch(next);
                                                }}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                </div>
            </div>
        </UserLayout>
    );
};

export default UserProduct;
