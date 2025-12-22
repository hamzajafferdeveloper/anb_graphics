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
import ConfirmModal from '@/modals/comfirmation';
import CreateEditTypeModal from '@/modals/product-type/create-edit-modal';
import admin from '@/routes/admin';
import { ProductType } from '@/types/data';
import { router } from '@inertiajs/react';
import { PlusCircle, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProductTypeDataTable = () => {
    const [types, setTypes] = useState<ProductType[]>([]);
    const [pagination, setPagination] = useState<any>(null);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedType, setSelectedType] = useState<ProductType | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Debounce search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchTypes(1); // reset to page 1 on search
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        fetchTypes(page);
    }, [page]);

    const fetchTypes = async (pageNumber = 1) => {
        setLoading(true);

        const response = await fetch(
            admin.product.type.getTypes().url +
                `?page=${pageNumber}` +
                `&search=${search}`,
        );

        const data = await response.json();

        setTypes(data.typesPagination.data);
        setPagination(data.typesPagination);
        setLoading(false);
    };

    const nextPage = () => {
        if (pagination?.next_page_url) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (pagination?.prev_page_url && page > 1) {
            setPage(page - 1);
        }
    };

    const handleDelete = async (type: ProductType) => {
        try {
            setLoadingDelete(true);

            await router.delete(admin.product.type.destroy(type.id), {
                onSuccess: () => {
                    fetchTypes(page); // Refresh the data table
                    setSelectedType(null); // Clear selection
                },
                onError: (errors) => {
                    console.error(errors);
                },
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl rounded-md border p-4 shadow-sm">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <Input
                    placeholder="Search product types..."
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
                            <TableHead>Slug</TableHead>
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
                        ) : types.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-6 text-center"
                                >
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            types.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.slug}</TableCell>
                                    <TableCell>
                                        {new Date(
                                            item.created_at,
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            item.updated_at,
                                        ).toLocaleString()}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedType(item);
                                                    setOpenEditModal(true);
                                                }}
                                            >
                                                <SquarePen className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedType(item);
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
                <CreateEditTypeModal
                    open={openCreateModal}
                    fetchTypes={() => fetchTypes(page)}
                    onOpenChange={(o) => {
                        setOpenCreateModal(o);
                    }}
                    type="create"
                />
            )}

            {selectedType && openEditModal && (
                <CreateEditTypeModal
                    open={openEditModal}
                    fetchTypes={() => fetchTypes(page)}
                    onOpenChange={(o) => {
                        setOpenEditModal(o);
                    }}
                    selectedType={selectedType}
                    type="edit"
                />
            )}

            {selectedType && openDeleteModal && (
                <ConfirmModal
                    open={openDeleteModal}
                    onOpenChange={setOpenDeleteModal}
                    title="Delete this item?"
                    description="Are you sure you want to delete this item? This cannot be undone."
                    confirmText="Yes, delete it"
                    cancelText="Cancel"
                    onConfirm={() => selectedType && handleDelete(selectedType)}
                />
            )}
        </div>
    );
};

export default ProductTypeDataTable;
