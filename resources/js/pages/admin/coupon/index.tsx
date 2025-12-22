import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/modals/comfirmation';
import CreateEditCouponModal from '@/modals/coupon/create-edit-modal';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Coupon } from '@/types/data';
import { Head, router } from '@inertiajs/react';
import { PlusCircle, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Coupons',
        href: admin.coupon.index().url,
    },
];

export default function CouponIndex() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchCoupons(1);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        fetchCoupons(page);
    }, [page]);

    const fetchCoupons = async (pageNumber = 1) => {
        setLoading(true);

        const response = await fetch(
            admin.coupon.getCoupons().url +
                `?page=${pageNumber}&search=${search}`,
        );

        const data = await response.json();

        setCoupons(data.coupons);
        setPagination({
            current_page: data.current_page,
            last_page: data.last_page,
        });
        setLoading(false);
    };

    const nextPage = () => {
        if (page < pagination?.last_page) setPage(page + 1);
    };
    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleDelete = async (coupon: Coupon) => {
        try {
            setLoadingDelete(true);
            await router.delete(admin.coupon.destroy(coupon.id), {
                onSuccess: () => {
                    fetchCoupons(page);
                    setSelectedCoupon(null);
                },
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupons" />
            <div className="mx-auto w-full max-w-7xl rounded-md border p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <Input
                        placeholder="Search coupons..."
                        className="max-w-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={() => setOpenCreateModal(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Coupon</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Limit</TableHead>
                                <TableHead>Expires in</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-6 text-center"
                                    >
                                        <Spinner className="mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-6 text-center"
                                    >
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell>{coupon.id}</TableCell>
                                        <TableCell>{coupon.coupon}</TableCell>
                                        <TableCell>
                                            {coupon.discount ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.limit ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.expires_in ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.price ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.status ? (
                                                <Badge>Active</Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                coupon.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                coupon.updated_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCoupon(
                                                            coupon,
                                                        );
                                                        setOpenEditModal(true);
                                                    }}
                                                >
                                                    <SquarePen className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedCoupon(
                                                            coupon,
                                                        );
                                                        setOpenDeleteModal(
                                                            true,
                                                        );
                                                    }}
                                                >
                                                    {loadingDelete ? (
                                                        <Spinner className="h-5 w-5" />
                                                    ) : (
                                                        <Trash2 className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="mt-4 flex w-full">
                        <Pagination className="w-full">
                            <PaginationContent>
                                {/* Previous */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            pagination.prev_page_url &&
                                                router.get(
                                                    pagination.prev_page_url,
                                                    {},
                                                    { preserveState: true },
                                                );
                                        }}
                                    />
                                </PaginationItem>

                                {/* Page Numbers */}
                                {Array.from(
                                    { length: pagination.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={
                                                page === pagination.current_page
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.get(
                                                    `${admin.coupon.index().url}?page=${page}`,
                                                    {},
                                                    { preserveState: true },
                                                );
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                {/* Ellipsis (optional, if you have many pages) */}
                                {pagination.last_page > 5 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Next */}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            pagination.next_page_url &&
                                                router.get(
                                                    pagination.next_page_url,
                                                    {},
                                                    { preserveState: true },
                                                );
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Modals */}
                {openCreateModal && (
                    <CreateEditCouponModal
                        open={openCreateModal}
                        fetchCoupons={() => fetchCoupons(page)}
                        onOpenChange={setOpenCreateModal}
                        type="create"
                    />
                )}
                {selectedCoupon && openEditModal && (
                    <CreateEditCouponModal
                        open={openEditModal}
                        fetchCoupons={() => fetchCoupons(page)}
                        onOpenChange={setOpenEditModal}
                        type="edit"
                        selectedCoupon={selectedCoupon}
                    />
                )}
                {selectedCoupon && openDeleteModal && (
                    <ConfirmModal
                        open={openDeleteModal}
                        onOpenChange={setOpenDeleteModal}
                        title="Delete this coupon?"
                        description="Are you sure you want to delete this coupon? This cannot be undone."
                        confirmText="Yes, delete it"
                        cancelText="Cancel"
                        onConfirm={() =>
                            selectedCoupon && handleDelete(selectedCoupon)
                        }
                    />
                )}
            </div>
        </AppLayout>
    );
}
