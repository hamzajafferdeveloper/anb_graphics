import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { ProductCategory, ProductType, User } from '@/types/data';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assign Product to User',
        href: admin.user.index().url,
    },
];

interface Props {
    user: User;
    categories: ProductCategory[];
    types: ProductType[];
}

export default function AssignProductToUser({
    user,
    categories,
    types,
}: Props) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch products with server-side search and pagination
    const fetchProducts = (page = 1, search = '') => {
        router.get(
            admin.user.assignProduct(user.id).url,
            { page, search },
            {
                preserveState: true,
                onSuccess: (pageProps: any) => {
                    if (pageProps.props.products) {
                        setProducts(pageProps.props.products.data);
                        setTotalPages(pageProps.props.products.last_page);
                        setCurrentPage(pageProps.props.products.current_page);
                    }
                },
            },
        );
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleProductSearch = (value: string) => {
        setProductSearch(value);
        fetchProducts(1, value);
    };

    const toggleSelection = (
        value: string,
        list: string[],
        setList: (val: string[]) => void,
    ) => {
        if (list.includes(value)) setList(list.filter((v) => v !== value));
        else setList([...list, value]);
    };

    const handlePost = () => {
        if (
            selectedCategories.length === 0 &&
            selectedTypes.length === 0 &&
            selectedProducts.length === 0
        ) {
            toast.error(
                'Please select at least one category, type or product.',
            );
            return;
        }

        setLoading(true);
        try {
            router.post(admin.user.assignProductPost(user.id).url, {
                categories: selectedCategories,
                types: selectedTypes,
                products: selectedProducts,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Product" />
            <div className="space-y-6 p-4">
                {/* Card 1: Filter/Search */}
                <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-xl">
                    <div className="flex justify-between">
                        <h2 className="mb-4 text-2xl font-bold text-blue-700">
                            Filter & Search
                        </h2>
                        <Button
                            className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white shadow-md transition-all hover:bg-blue-700"
                            disabled={loading}
                            onClick={() => handlePost()}
                        >
                            {loading && <Spinner />} Assign Selected Products
                        </Button>
                    </div>
                    <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => handleProductSearch(e.target.value)}
                        className="border-blue-300 focus:ring-blue-400"
                    />
                </Card>

                {/* Card 2: Categories & Types */}
                <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-xl">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <SelectionGroup
                            title="Categories"
                            items={categories.map((c) => ({
                                id: c.id.toString(),
                                label: c.name,
                                value: c.slug,
                            }))}
                            selected={selectedCategories}
                            setSelected={setSelectedCategories}
                        />
                        <SelectionGroup
                            title="Types"
                            items={types.map((t) => ({
                                id: t.id.toString(),
                                label: t.name,
                                value: t.slug,
                            }))}
                            selected={selectedTypes}
                            setSelected={setSelectedTypes}
                        />
                    </div>
                </Card>

                {/* Card 3: Products */}
                <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-xl">
                    <h3 className="mb-4 text-lg font-semibold text-blue-600">
                        Products
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((p) => (
                            <Card
                                key={p.id}
                                className="flex cursor-pointer flex-row items-center gap-2 rounded-xl p-4 text-center transition hover:shadow-lg"
                                onClick={() =>
                                    toggleSelection(
                                        p.id,
                                        selectedProducts,
                                        setSelectedProducts,
                                    )
                                }
                            >
                                {p.images?.[0]?.path && (
                                    <img
                                        src={`/storage/${p.images[0].path}`}
                                        alt={p.name}
                                        className="h-22 w-22 rounded-md object-cover"
                                    />
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedProducts.includes(
                                            p.id,
                                        )}
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-medium">
                                            {p.name}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {p.type.name}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {p.brand.name}
                                        </span>
                                        <span className="text-xs font-medium">
                                            {p.category.name}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i}
                                    size="sm"
                                    variant={
                                        i + 1 === currentPage
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        fetchProducts(i + 1, productSearch)
                                    }
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}

interface SelectionGroupProps {
    title: string;
    items: { id: string; label: string; value: string }[];
    selected: string[];
    setSelected: (val: string[]) => void;
}

function SelectionGroup({
    title,
    items,
    selected,
    setSelected,
}: SelectionGroupProps) {
    const toggle = (value: string) => {
        if (selected.includes(value)) {
            setSelected(selected.filter((v) => v !== value));
        } else {
            setSelected([...selected, value]);
        }
    };

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-600">{title}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition hover:bg-blue-100"
                        onClick={() => toggle(item.value)}
                    >
                        <Checkbox checked={selected.includes(item.value)} />
                        <span className="text-sm font-medium">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
