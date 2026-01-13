import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { ProductCategory } from '@/types/data';
import { Form, Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Category',
        href: admin.product.category.index().url,
    },
];

const CategoryIndex = () => {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [formType, setFormType] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [page, setPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const isMediumOrBelow = useMediaQuery('(max-width: 768px)');

    const loadCategories = (
        search: string = '',
        pageNum: number = 1,
        append: boolean = false,
    ) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const url = new URL(
            admin.product.category.getCategories().url,
            window.location.origin,
        );
        if (search) url.searchParams.append('search', search);
        url.searchParams.append('page', pageNum.toString());

        fetch(url.toString())
            .then((response) => response.json())
            .then((data) => {
                if (append)
                    setCategories((prev) => [...prev, ...data.categories]);
                else setCategories(data.categories);

                setPage(data.current_page);
                setLastPage(data.last_page);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
            })
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const debouncedLoadCategories = debounce(
        (value: string) => loadCategories(value, 1, false),
        300,
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedLoadCategories(value);
    };

    const handleLoadMore = () => {
        if (page < lastPage) {
            loadCategories(searchValue, page + 1, true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Category" />
            <ResizablePanelGroup
                direction={isMediumOrBelow ? 'vertical' : 'horizontal'}
                className="h-[calc(100vh-48px)] w-full"
            >
                {/* Form Panel */}
                <ResizablePanel
                    defaultSize={25}
                    minSize={0}
                    maxSize={isMediumOrBelow ? 90 : 40}
                >
                    <div className="flex h-full justify-center overflow-hidden p-6">
                        <Card className="h-fit w-full max-w-sm">
                            <CardHeader className="!flex flex-row items-start justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle>
                                        {formType === 'create'
                                            ? 'Create New Category'
                                            : 'Edit Category'}
                                    </CardTitle>
                                    <CardDescription>
                                        {formType === 'create'
                                            ? 'Enter the category details below.'
                                            : 'Edit the category details below.'}
                                    </CardDescription>
                                </div>

                                {formType === 'edit' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setFormType('create');
                                            setSelectedCategory(null);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                )}
                            </CardHeader>

                            <CardContent>
                                <Form
                                    action={
                                        formType === 'create'
                                            ? admin.product.category.store().url
                                            : admin.product.category.update(
                                                  selectedCategory!,
                                              ).url
                                    }
                                    method={
                                        formType === 'create' ? 'POST' : 'PUT'
                                    }
                                    resetOnSuccess={true}
                                    onSuccess={() =>
                                        loadCategories(searchValue)
                                    }
                                    className="space-y-6"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="flex flex-col gap-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">
                                                        Category Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        defaultValue={
                                                            formType === 'edit'
                                                                ? categories.find(
                                                                      (
                                                                          category,
                                                                      ) =>
                                                                          category.id ===
                                                                          selectedCategory,
                                                                  )?.name
                                                                : ''
                                                        }
                                                        autoFocus
                                                        tabIndex={1}
                                                        placeholder="e.g. Suite, Gloves"
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="image">
                                                            Category Image
                                                            (optional)
                                                        </Label>
                                                        {formType ===
                                                            'edit' && (
                                                            <img
                                                                src={`/storage/${
                                                                    categories.find(
                                                                        (
                                                                            category,
                                                                        ) =>
                                                                            category.id ===
                                                                            selectedCategory,
                                                                    )?.image
                                                                }`}
                                                                className="h-12 w-12 rounded-xs"
                                                            />
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="image"
                                                        name="image"
                                                        type="file"
                                                        tabIndex={2}
                                                    />
                                                    <InputError
                                                        message={errors.image}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-4 w-full"
                                                tabIndex={4}
                                                disabled={processing}
                                            >
                                                {processing && <Spinner />}{' '}
                                                {formType === 'create'
                                                    ? 'Create'
                                                    : 'Update'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Categories Panel */}
                <ResizablePanel defaultSize={75}>
                    <div className="h-full w-full overflow-auto p-6">
                        <Input
                            type="text"
                            placeholder="Search categories..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            className="mb-4"
                        />

                        {loading ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <Spinner className="h-8 w-8" />
                            </div>
                        ) : (
                            <div className="w-full">
                                {/* Responsive Grid */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                    {categories.map((category) => (
                                        <Card
                                            key={category.id}
                                            className="overflow-hidden shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="relative w-full overflow-hidden rounded-md bg-gray-100 pb-[100%]">
                                                {category.image ? (
                                                    <img
                                                        src={`/storage/${category.image}`}
                                                        alt={category.name}
                                                        className="absolute top-0 left-0 h-full w-full object-cover transition-transform duration-200 ease-in-out hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center">
                                                        <span className="text-sm text-gray-400">
                                                            No Image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="flex items-center justify-between text-base font-semibold">
                                                    {category.name}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setFormType(
                                                                    'edit',
                                                                );
                                                                setSelectedCategory(
                                                                    category.id,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                router.delete(
                                                                    admin.product.category.destroy(
                                                                        category.id,
                                                                    ).url,
                                                                    {
                                                                        onSuccess:
                                                                            () =>
                                                                                loadCategories(
                                                                                    searchValue,
                                                                                ),
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardTitle>
                                                <p className="text-xs text-foreground">
                                                    No of Products:{' '}
                                                    {category.products_count ??
                                                        0}
                                                </p>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>

                                {/* Load More */}
                                {page < lastPage && (
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore && (
                                                <Spinner className="mr-2 h-4 w-4" />
                                            )}
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </AppLayout>
    );
};

export default CategoryIndex;
