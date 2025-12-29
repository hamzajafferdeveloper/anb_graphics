import { Button } from '@/components/ui/button';
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
import products from '@/routes/products';
import user from '@/routes/user';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ProductCard from './components/product-card';

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
    const assigned: any[] = page.assigned ?? [];
    const assignedPagination: any = page.assigned_pagination ?? null;
    const serverFilters: any = page.filters ?? {};
    const brands: any[] = page.brands ?? [];
    const purchasedCount: number =
        page.purchased_count ?? purchased?.length ?? 0;
    const assignedCount: number = page.assigned_count ?? 0;
    const isAdminUser: boolean = page.is_admin_user ?? false;
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
                            {isAdminUser ? 'Your Products' : 'Your Purchases'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isAdminUser ? (
                                <>
                                    You have access to{' '}
                                    <span className="font-semibold">
                                        {purchasedCount + assignedCount}
                                    </span>{' '}
                                    product
                                    {purchasedCount + assignedCount !== 1
                                        ? 's'
                                        : ''}
                                    {purchasedCount > 0 && (
                                        <>
                                            {' '}
                                            (
                                            <span className="text-primary">
                                                {purchasedCount} purchased
                                            </span>
                                            {assignedCount > 0 && (
                                                <>
                                                    ,{' '}
                                                    <span className="text-blue-500">
                                                        {assignedCount} assigned
                                                    </span>
                                                </>
                                            )}
                                            )
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    You have purchased{' '}
                                    <span className="font-semibold">
                                        {purchasedCount}
                                    </span>{' '}
                                    product{purchasedCount !== 1 ? 's' : ''}.
                                </>
                            )}
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

                {/* Assigned Products Section for Admin Users */}
                {isAdminUser && assignedCount > 0 && (
                    <div className="mb-10">
                        <div className="mb-4 flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-semibold text-blue-600">
                                Assigned Products
                            </h2>
                        </div>
                        <div className="relative">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {assigned.map((item: any) => (
                                    <ProductCard
                                        key={item.id}
                                        product={item.product}
                                        currency={currency}
                                        tagLabel="Assigned"
                                        tagColor="bg-blue-500"
                                        showActions={true}
                                    />
                                ))}
                            </div>

                            {/* Pagination for assigned products */}
                            {assignedPagination.last_page > 1 && (
                                <div className="mt-6">
                                    <Pagination>
                                        <PaginationContent>
                                            {assignedPagination.current_page >
                                                1 && (
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={`?page=${assignedPagination.current_page - 1}`}
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>
                                            )}
                                            {Array.from(
                                                {
                                                    length: assignedPagination.last_page,
                                                },
                                                (_, i) => i + 1,
                                            ).map((pageNum) => (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        href={`?page=${pageNum}`}
                                                        isActive={
                                                            pageNum ===
                                                            assignedPagination.current_page
                                                        }
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            {assignedPagination.current_page <
                                                assignedPagination.last_page && (
                                                <PaginationItem>
                                                    <PaginationNext
                                                        href={`?page=${assignedPagination.current_page + 1}`}
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>
                                            )}
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Purchased Products Section */}
                <div className="relative">
                    {purchasedCount > 0 && (
                        <div className="mb-4 flex items-center justify-between border-b pb-2">
                            <h2 className="text-xl font-semibold">
                                {isAdminUser
                                    ? 'Purchased Products'
                                    : 'Your Purchases'}
                            </h2>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                            <Spinner className="h-8 w-8" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {purchased.length === 0 && !loading && (
                            <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-8 text-center">
                                <h3 className="text-lg font-semibold">
                                    {isAdminUser
                                        ? 'No products yet'
                                        : 'No purchases yet'}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {isAdminUser
                                        ? "You don't have any purchased products yet."
                                        : 'Once you buy a product, it will appear here with quick actions and download/view links.'}
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

                        {purchased.map((p) => (
                            <ProductCard
                                key={p.id}
                                product={p.product}
                                currency={currency}
                                tagLabel="Purchased"
                                tagColor="bg-emerald-600"
                                purchaseDate={new Date(
                                    p.created_at,
                                ).toLocaleString()}
                                showActions={true}
                            />
                        ))}
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
