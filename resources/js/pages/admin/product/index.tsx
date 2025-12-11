import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/modals/comfirmation';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import {
    ProductBrand,
    ProductCategory,
    ProductImage,
    ProductType,
} from '@/types/data';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    LockKeyhole,
    LockKeyholeOpen,
    Pencil,
    PlusIcon,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Products',
        href: admin.product.index().url,
    },
];

interface ProductIndexProps {
    products: ProductPagination;
    categories: ProductCategory[];
    brands: ProductBrand[];
    types: ProductType[];
}

const ProductIndex = ({
    products,
    categories,
    brands,
    types,
}: ProductIndexProps) => {
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('all');
    const [brandId, setBrandId] = useState('all');
    const [typeId, setTypeId] = useState('all');
    const [status, setStatus] = useState('all');
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState<boolean>(false);
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
    const fetchProducts = () => {
        setLoading(true);

        const params: any = {};
        if (search) params.search = search;
        if (categoryId !== 'all') params.category_id = categoryId;
        if (brandId !== 'all') params.brand_id = brandId;
        if (typeId !== 'all') params.type_id = typeId;
        if (status !== 'all') params.status = status;
        if (sortField) params.sort_field = sortField;
        if (sortOrder) params.sort_order = sortOrder;

        router.get(admin.product.index().url, params, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false), // stop loading
        });
    };

    useEffect(() => {
        const delay = setTimeout(fetchProducts, 300); // debounce
        return () => clearTimeout(delay);
    }, [search, categoryId, brandId, typeId, status, sortField, sortOrder]);

    const handleSort = (field: string) => {
        const order =
            sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const handleDelete = () => {
        router.delete(admin.product.destroy(selectedProductSlug), {
            onSuccess: () => {
                setOpenDeleteModal(false);
                // fetchProducts();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Products" />

            <section className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">All Products</h1>

                {/* Filters */}
                <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64"
                            aria-label="Search products"
                        />
                        <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                        >
                            <SelectTrigger
                                className="md:w-48"
                                aria-label="Filter by category"
                            >
                                <SelectValue placeholder="Filter by Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Categories
                                </SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={cat.id.toString()}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Brand Filter */}
                        <Select value={brandId} onValueChange={setBrandId}>
                            <SelectTrigger className="md:w-48">
                                <SelectValue placeholder="Filter by Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((bra) => (
                                    <SelectItem
                                        key={bra.id}
                                        value={bra.id.toString()}
                                    >
                                        {bra.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Type Filter */}
                        <Select value={typeId} onValueChange={setTypeId}>
                            <SelectTrigger className="md:w-48">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {types.map((typ) => (
                                    <SelectItem
                                        key={typ.id}
                                        value={typ.id.toString()}
                                    >
                                        {typ.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger
                                className="md:w-48"
                                aria-label="Filter by status"
                            >
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="unpublished">
                                    Unpublished
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button>
                        <Link
                            href={admin.product.create().url}
                            className="flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        Name{' '}
                                        {sortField === 'name' &&
                                            (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TableHead>

                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort('price')}
                                    >
                                        Price{' '}
                                        {sortField === 'price' &&
                                            (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Created At{' '}
                                        {sortField === 'created_at' &&
                                            (sortOrder === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.images.length > 0 && (
                                                <img
                                                    src={`/storage/${
                                                        product.images.find(
                                                            (
                                                                img: ProductImage,
                                                            ) => img.is_primary,
                                                        )?.path ??
                                                        product.images[0].path
                                                    }`}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded object-cover"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>

                                        <TableCell>
                                            {product.category?.name}
                                        </TableCell>
                                        <TableCell>
                                            {product.type?.name}
                                        </TableCell>
                                        <TableCell>
                                            {product.brand?.name}
                                        </TableCell>
                                        <TableCell>
                                            $
                                            {product.sale_price ??
                                                product.price}
                                            {product.sale_price && (
                                                <span className="ml-1 text-sm text-gray-400 line-through">
                                                    ${product.price}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    product.status ===
                                                    'published'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {product.status ===
                                                'published' ? (
                                                    <LockKeyholeOpen />
                                                ) : (
                                                    <LockKeyhole />
                                                )}{' '}
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(product.created_at),
                                                'dd MMM yyyy',
                                            )}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="cursor-pointer"
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedProductSlug(product.slug)
                                                    setOpenDeleteModal(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="mt-4 flex w-full">
                            <Pagination className="w-full">
                                <PaginationContent>
                                    {/* Previous */}
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                products.prev_page_url &&
                                                    router.get(
                                                        products.prev_page_url,
                                                        {},
                                                        { preserveState: true },
                                                    );
                                            }}
                                        />
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {Array.from(
                                        { length: products.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={
                                                    page ===
                                                    products.current_page
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.get(
                                                        `${admin.product.index().url}?page=${page}`,
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
                                    {products.last_page > 5 && (
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
                                                products.next_page_url &&
                                                    router.get(
                                                        products.next_page_url,
                                                        {},
                                                        { preserveState: true },
                                                    );
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </section>
            <ConfirmModal
                open={openDeleteModal}
                onOpenChange={setOpenDeleteModal}
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
};

export default ProductIndex;
