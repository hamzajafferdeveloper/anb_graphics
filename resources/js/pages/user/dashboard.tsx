import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserLayout from '@/layouts/user-layout';
import { home } from '@/routes';
import products from '@/routes/products';
import user from '@/routes/user';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Clock, ShoppingCart, Star } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: home().url,
    },
    {
        title: 'Dashboard',
        href: user.dashboard().url,
    },
];

const Stat = ({
    title,
    value,
    icon,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}) => (
    <Card className="p-4">
        <CardContent className="flex items-center justify-between gap-4 p-2">
            <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">{title}</div>
                <div className="mt-1 text-2xl font-bold">{value}</div>
            </div>
            <div className="rounded-md bg-muted p-3 text-muted-foreground">
                {icon}
            </div>
        </CardContent>
    </Card>
);

const UserDashboard = () => {
    const page = usePage<SharedData>().props as any;
    const stats = page.stats ?? {};
    const recent: any[] = page.recent_purchases ?? [];
    const recommended: any[] = page.recommended ?? [];
    const currency = page.appSettings?.site_currency_symbol ?? '$';

    const formatCurrency = (n: number) =>
        `${currency}${n?.toLocaleString?.() ?? n}`;

    return (
        <UserLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold">
                            Welcome back
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Here’s what’s happening with your account
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={products.index()}>
                            <Button size="sm">Browse Products</Button>
                        </Link>

                        <Link href={user.products().url}>
                            <Button variant="outline" size="sm">
                                Your Purchases
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Stat
                        title="Total Purchases"
                        value={stats.purchases_count ?? 0}
                        icon={<ShoppingCart />}
                    />
                    <Stat
                        title="Total Spent"
                        value={formatCurrency(stats.total_spent ?? 0)}
                        icon={<Star />}
                    />
                    <Stat
                        title="Recent Activity"
                        value={`${recent.length} item${recent.length !== 1 ? 's' : ''}`}
                        icon={<Clock />}
                    />
                </div>

                {/* Main content */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent purchases */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Recent Purchases
                            </h2>
                            <Link
                                href={user.products().url}
                                className="text-sm text-muted-foreground"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {recent.length === 0 && (
                                <Card>
                                    <CardContent className="p-6 text-center text-muted-foreground">
                                        No purchases yet — browse the store to
                                        get started.
                                    </CardContent>
                                </Card>
                            )}

                            {recent.map((r) => {
                                const p = r.product;
                                const img =
                                    p?.images && p.images.length > 0
                                        ? (p.images.find(
                                              (i: any) => i.is_primary,
                                          )?.path ?? p.images[0].path)
                                        : null;

                                return (
                                    <Card
                                        key={r.id}
                                        className="overflow-hidden shadow-sm"
                                    >
                                        <CardContent className="flex gap-4 p-3">
                                            <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                                {img ? (
                                                    <img
                                                        src={`/storage/${img}`}
                                                        alt={p?.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold">
                                                        {p?.name}
                                                    </div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {p?.brand?.name ?? ''}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="text-sm font-medium">
                                                        {currency}
                                                        {p?.sale_price ??
                                                            p?.price}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            r.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold sm:text-xl">
                                Recommended for you
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {recommended.map((p) => {
                                const img =
                                    p.images && p.images.length > 0
                                        ? (p.images.find(
                                              (i: any) => i.is_primary,
                                          )?.path ?? p.images[0].path)
                                        : null;

                                return (
                                    <Card
                                        key={p.id}
                                        className="group flex flex-row items-center gap-3 rounded-xl p-3 transition hover:bg-muted/40"
                                    >
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                            {img ? (
                                                <img
                                                    src={`/storage/${img}`}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex flex-1 flex-col overflow-hidden">
                                                <span className="truncate text-sm font-medium">
                                                    {p.name}
                                                </span>
                                                <span className="mt-1 text-xs text-muted-foreground">
                                                    {currency}
                                                    {p.sale_price ?? p.price}
                                                </span>
                                            </div>

                                            <Link
                                                href={products.show(p.slug)}
                                                className="shrink-0"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-lg"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}

                            {recommended.length === 0 && (
                                <Card className="rounded-xl">
                                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                        No recommendations available yet.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserDashboard;
