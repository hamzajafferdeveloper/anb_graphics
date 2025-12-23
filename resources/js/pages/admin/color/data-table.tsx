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
import { Switch } from '@/components/ui/switch';
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

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    /* ---------------- Search debounce ---------------- */
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchColors(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchColors(page);
    }, [page]);

    const fetchColors = async (pageNumber = 1) => {
        setLoading(true);

        const res = await fetch(
            `${admin.color.getColors().url}?page=${pageNumber}&search=${search}`,
        );

        const data = await res.json();
        setColors(data.colorsPagination.data);
        setPagination(data.colorsPagination);
        setLoading(false);
    };

    /* ---------------- Pagination ---------------- */
    const nextPage = () => {
        if (pagination?.next_page_url) setPage((p) => p + 1);
    };

    const prevPage = () => {
        if (pagination?.prev_page_url && page > 1) setPage((p) => p - 1);
    };

    /* ---------------- Delete ---------------- */
    const handleDelete = async () => {
        if (!selectedColor) return;

        setDeletingId(selectedColor.id);

        router.delete(admin.color.destroy(selectedColor.id), {
            onSuccess: () => {
                fetchColors(page);
                setSelectedColor(null);
            },
            onFinish: () => setDeletingId(null),
        });
    };

    /* ---------------- Toggle protection ---------------- */
    const toggleProtection = (id: number) => {
        setTogglingId(id);

        router.post(
            admin.color.updateIsProtection(id),
            {},
            {
                onFinish: () => {
                    fetchColors(page);
                    setTogglingId(null);
                },
            },
        );
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
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Hex</TableHead>
                            <TableHead>Protection</TableHead>
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
                                    colSpan={7}
                                    className="py-6 text-center"
                                >
                                    <Spinner className="mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : colors.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
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
                                    <TableCell className="flex items-center gap-2">
                                        <span
                                            className="h-5 w-5 rounded-full border"
                                            style={{
                                                backgroundColor: color.code,
                                            }}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {color.code}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={color.is_protection}
                                            disabled={togglingId === color.id}
                                            onCheckedChange={() =>
                                                toggleProtection(color.id)
                                            }
                                        />
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
                                                {deletingId === color.id ? (
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
                <div className="mt-4 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={prevPage}
                                    className={
                                        !pagination.prev_page_url
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }
                                />
                            </PaginationItem>

                            {[...Array(pagination.last_page)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={nextPage}
                                    className={
                                        !pagination.next_page_url
                                            ? 'pointer-events-none opacity-50'
                                            : ''
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
                    type="create"
                    onOpenChange={setOpenCreateModal}
                    fetchColors={() => fetchColors(page)}
                />
            )}

            {selectedColor && openEditModal && (
                <CreateEditColorModal
                    open={openEditModal}
                    type="edit"
                    selectedColor={selectedColor}
                    onOpenChange={setOpenEditModal}
                    fetchColors={() => fetchColors(page)}
                />
            )}

            {selectedColor && openDeleteModal && (
                <ConfirmModal
                    open={openDeleteModal}
                    onOpenChange={setOpenDeleteModal}
                    title="Delete this color?"
                    description="This action cannot be undone."
                    confirmText="Yes, delete"
                    cancelText="Cancel"
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};

export default ColorsDataTable;
