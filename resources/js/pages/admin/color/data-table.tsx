'use client';

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
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CreateEditColorModal from '@/modals/color/create-edit-modal';
import ConfirmModal from '@/modals/comfirmation';
import admin from '@/routes/admin';
import { ProductColor } from '@/types/data';
import { router } from '@inertiajs/react';
import { PlusCircle, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ColorsDataTable = () => {
    const [colors, setColors] = useState<ProductColor[]>([]);
    const [pagination, setPagination] = useState<any>(null);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
        null,
    );
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Debounce search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchColors(1);
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        fetchColors(page);
    }, [page]);

    const fetchColors = async (pageNumber = 1) => {
        setLoading(true);

        const response = await fetch(
            admin.color.getColors().url +
                `?page=${pageNumber}&search=${search}`,
        );

        const data = await response.json();

        setColors(data.colorsPagination.data);
        setPagination(data.colorsPagination);
        setLoading(false);
    };

    const nextPage = () => {
        if (pagination?.next_page_url) setPage(page + 1);
    };
    const prevPage = () => {
        if (pagination?.prev_page_url && page > 1) setPage(page - 1);
    };

    const handleDelete = async (color: ProductColor) => {
        try {
            setLoadingDelete(true);
            await router.delete(admin.color.destroy(color.id), {
                onSuccess: () => {
                    fetchColors(page);
                    setSelectedColor(null);
                },
                onError: console.error,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl rounded-md border p-4 shadow-sm">
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <Input
                    placeholder="Search colors..."
                    className="max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={() => setOpenCreateModal(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Hex Code</TableHead>
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
                                    colSpan={6}
                                    className="py-6 text-center"
                                >
                                    <Spinner className="mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : colors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-6 text-center"
                                >
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            colors.map((color) => (
                                <TableRow key={color.id}>
                                    <TableCell>{color.id}</TableCell>
                                    <TableCell>{color.name}</TableCell>
                                    <TableCell>
                                        <span
                                            className="inline-block h-6 w-6 rounded-full"
                                            style={{
                                                backgroundColor: color.code,
                                            }}
                                        ></span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            color.created_at,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            color.updated_at,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setOpenEditModal(true);
                                                }}
                                            >
                                                <SquarePen className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setOpenDeleteModal(true);
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
                <div className="mt-4 flex items-center justify-between">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={prevPage}
                                    className={
                                        pagination.prev_page_url
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                            {[...Array(pagination.last_page)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        onClick={() => setPage(i + 1)}
                                        isActive={page === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={nextPage}
                                    className={
                                        pagination.next_page_url
                                            ? ''
                                            : 'pointer-events-none opacity-50'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Modals */}
            {openCreateModal && (
                <CreateEditColorModal
                    open={openCreateModal}
                    fetchColors={() => fetchColors(page)}
                    onOpenChange={setOpenCreateModal}
                    type="create"
                />
            )}
            {selectedColor && openEditModal && (
                <CreateEditColorModal
                    open={openEditModal}
                    fetchColors={() => fetchColors(page)}
                    onOpenChange={setOpenEditModal}
                    selectedColor={selectedColor}
                    type="edit"
                />
            )}
            {selectedColor && openDeleteModal && (
                <ConfirmModal
                    open={openDeleteModal}
                    onOpenChange={setOpenDeleteModal}
                    title="Delete this color?"
                    description="Are you sure you want to delete this color? This cannot be undone."
                    confirmText="Yes, delete it"
                    cancelText="Cancel"
                    onConfirm={() =>
                        selectedColor && handleDelete(selectedColor)
                    }
                />
            )}
        </div>
    );
};

export default ColorsDataTable;
