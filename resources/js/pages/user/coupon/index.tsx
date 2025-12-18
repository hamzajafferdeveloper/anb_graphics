import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import UserLayout from '@/layouts/user-layout';
import user from '@/routes/user';
import { BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Filter, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

/* ---------------------------------- */
/* Breadcrumbs */
/* ---------------------------------- */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: user.dashboard().url,
    },
    {
        title: 'Coupons',
        href: user.coupons().url,
    },
];

/* ---------------------------------- */
/* Types (MATCH BACKEND EXACTLY) */
/* ---------------------------------- */

type CouponItem = {
    id: number;
    code: string;
    discount: number;
    discount_type: 'fixed' | 'percentage';
    status: 'active' | 'used' | 'expired';
    used_no: number;
    limit: number | null;
    created_at: string;
    expires_at: string;
};

type CouponPageProps = {
    coupons: {
        data: CouponItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        status?: 'active' | 'used' | 'expired';
        per_page?: number;
    };
};

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function CouponIndex() {
    const { coupons, filters } = usePage<CouponPageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<'all' | 'active' | 'used' | 'expired'>(
        filters.status ?? 'all',
    );
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [isLoading, setIsLoading] = useState(false);

    /* ---------------------------------- */
    /* Filters Effect */
    /* ---------------------------------- */

    useEffect(() => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (status !== 'all') params.set('status', status);
        if (perPage) params.set('per_page', String(perPage));

        setIsLoading(true);

        router.get(
            user.coupons().url + '?' + params.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }, [status, perPage]);

    /* ---------------------------------- */
    /* Helpers */
    /* ---------------------------------- */

    const getStatusBadge = (status: CouponItem['status']) => {
        switch (status) {
            case 'used':
                return <Badge variant="destructive">Used</Badge>;
            case 'expired':
                return <Badge variant="outline">Expired</Badge>;
            default:
                return <Badge>Active</Badge>;
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);

    /* ---------------------------------- */
    /* Render */
    /* ---------------------------------- */

    return (
        <UserLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Coupon History
                    </h1>
                    <p className="text-muted-foreground">
                        View and manage your coupon codes
                    </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative w-full max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search coupons..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(
                                        value as
                                            | 'all'
                                            | 'active'
                                            | 'used'
                                            | 'expired',
                                    )
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="used">Used</SelectItem>
                                    <SelectItem value="expired">
                                        Expired
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>

                                        <TableHead className="text-right">
                                            Number of used
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Expires
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : coupons.data.length ? (
                                        coupons.data.map((coupon) => (
                                            <TableRow key={coupon.id}>
                                                <TableCell className="font-mono font-bold">
                                                    {coupon.code}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            Discount Coupon
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Created on{' '}
                                                            {format(
                                                                new Date(
                                                                    coupon.created_at,
                                                                ),
                                                                'MMM d, yyyy',
                                                            )}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right font-medium">
                                                    {coupon.discount_type ===
                                                    'percentage'
                                                        ? `${coupon.discount}%`
                                                        : formatCurrency(
                                                              coupon.discount,
                                                          )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    {coupon.used_no}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    {getStatusBadge(
                                                        coupon.status,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    {format(
                                                        new Date(
                                                            coupon.expires_at,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                            >
                                                No coupons found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination info + per page */}
                        {coupons.total > 0 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {coupons.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {coupons.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">
                                        {coupons.total}
                                    </span>{' '}
                                    coupons
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        Rows per page:
                                    </span>
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={(value) =>
                                            setPerPage(Number(value))
                                        }
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[5, 10, 20, 50, 100].map(
                                                (size) => (
                                                    <SelectItem
                                                        key={size}
                                                        value={String(size)}
                                                    >
                                                        {size}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
