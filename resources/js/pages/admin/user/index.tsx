import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import CreateEditUserModal from '@/modals/user/create-edit-modal';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { User } from '@/types/data';
import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Users',
        href: admin.user.index().url,
    },
];

export default function UserIndex() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsers(1);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const fetchUsers = async (pageNumber = 1) => {
        setLoading(true);

        const response = await fetch(
            admin.user.getUsers().url + `?page=${pageNumber}&search=${search}`,
        );

        const data = await response.json();

        setUsers(data.users);
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

    const handleDelete = async (user: User) => {
        try {
            setLoadingDelete(true);
            await router.delete(admin.user.destroy(user.id), {
                onSuccess: () => {
                    fetchUsers(page);
                    setSelectedUser(null);
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
            <Head title="All Users" />
            <div className="mx-auto w-full max-w-7xl rounded-md border p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <Input
                        placeholder="Search users..."
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Profile</TableHead>
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-6 text-center"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell className="hover:underline">
                                            <Link
                                                href={admin.user.assignProduct(
                                                    user.id,
                                                )}
                                            >
                                                {user.email}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {user.profile_pic ? (
                                                <img
                                                    src={`/storage/${user.profile_pic}`}
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                user.updated_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setOpenEditModal(true);
                                                    }}
                                                >
                                                    <SquarePen className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedUser(user);
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
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button onClick={prevPage} disabled={page === 1}>
                                Prev
                            </Button>
                            <div className="flex items-center px-2">
                                Page {pagination.current_page} of{' '}
                                {pagination.last_page}
                            </div>
                            <Button
                                onClick={nextPage}
                                disabled={page === pagination.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {openCreateModal && (
                    <CreateEditUserModal
                        open={openCreateModal}
                        fetchUsers={() => fetchUsers(page)}
                        onOpenChange={setOpenCreateModal}
                        type="create"
                    />
                )}
                {selectedUser && openEditModal && (
                    <CreateEditUserModal
                        open={openEditModal}
                        fetchUsers={() => fetchUsers(page)}
                        onOpenChange={setOpenEditModal}
                        selectedUser={selectedUser}
                        type="edit"
                    />
                )}
                {selectedUser && openDeleteModal && (
                    <ConfirmModal
                        open={openDeleteModal}
                        onOpenChange={setOpenDeleteModal}
                        title="Delete this user?"
                        description="Are you sure you want to delete this user? This cannot be undone."
                        confirmText="Yes, delete it"
                        cancelText="Cancel"
                        onConfirm={() =>
                            selectedUser && handleDelete(selectedUser)
                        }
                    />
                )}
            </div>
        </AppLayout>
    );
}
22;
