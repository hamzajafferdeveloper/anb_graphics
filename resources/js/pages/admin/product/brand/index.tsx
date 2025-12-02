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
import { BreadcrumbItem, SharedData } from '@/types';
import { ProductCategory } from '@/types/data';
import { Form, Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Brand',
        href: admin.product.brand.index().url,
    },
];

const BrandIndex = () => {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const [brands, setBrands] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [formType, setFormType] = useState<'create' | 'edit'>('create');
    const [selectedBrand, setSelectedBrand] = useState<number | null>(
        null,
    );
    const [page, setPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);

    const loadBrands = (
        search: string = '',
        pageNum: number = 1,
        append: boolean = false,
    ) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const url = new URL(
            admin.product.brand.getBrands().url,
            window.location.origin,
        );
        if (search) url.searchParams.append('search', search);
        url.searchParams.append('page', pageNum.toString());

        fetch(url.toString())
            .then((response) => response.json())
            .then((data) => {
                if (append)
                    setBrands((prev) => [...prev, ...data.bradns]);
                else setBrands(data.categories);

                setPage(data.current_page);
                setLastPage(data.last_page);
            })
            .catch((error) => {
                console.error('Error fetching brands:', error);
            })
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const debouncedLoadBrand = debounce(
        (value: string) => loadBrands(value, 1, false),
        300,
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedLoadBrand(value);
    };

    const handleLoadMore = () => {
        if (page < lastPage) {
            loadBrands(searchValue, page + 1, true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Category" />
            <ResizablePanelGroup
                direction="horizontal"
                className="h-[calc(100vh-48px)] w-full"
            >
                {/* Form Panel */}
                <ResizablePanel defaultSize={25} minSize={0} maxSize={25}>
                    <div className="flex h-full justify-center overflow-hidden p-6">
                        <Card className="h-fit w-full max-w-sm">
                            <CardHeader className="!flex flex-row items-start justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle>
                                        {formType === 'create'
                                            ? 'Create New Brand'
                                            : 'Edit Brand'}
                                    </CardTitle>
                                    <CardDescription>
                                        {formType === 'create'
                                            ? 'Enter the brand details below.'
                                            : 'Edit the brand details below.'}
                                    </CardDescription>
                                </div>

                                {formType === 'edit' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setFormType('create');
                                            setSelectedBrand(null);
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
                                            ? admin.product.brand.store().url
                                            : admin.product.brand.update(
                                                  selectedBrand!,
                                              ).url
                                    }
                                    method={
                                        formType === 'create' ? 'POST' : 'PUT'
                                    }
                                    resetOnSuccess={true}
                                    onSuccess={() =>
                                        loadBrands(searchValue)
                                    }
                                    className="space-y-6"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="flex flex-col gap-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">
                                                        Brand Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        required
                                                        defaultValue={
                                                            formType === 'edit'
                                                                ? brands.find(
                                                                      (
                                                                          brand,
                                                                      ) =>
                                                                          brand.id ===
                                                                          selectedBrand,
                                                                  )?.name
                                                                : ''
                                                        }
                                                        autoFocus
                                                        tabIndex={1}
                                                        placeholder="e.g. 2A, Nike, Adidas  etc."
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="image">
                                                            Brand Image
                                                            (optional)
                                                        </Label>
                                                        {formType ===
                                                            'edit' && (
                                                            <img
                                                                src={`/storage/${
                                                                    brands.find(
                                                                        (
                                                                            brand,
                                                                        ) =>
                                                                            brand.id ===
                                                                            selectedBrand,
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
                            placeholder="Search brands..."
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
                                    {brands.map((brand) => (
                                        <Card
                                            key={brand.id}
                                            className="overflow-hidden shadow-sm transition-all hover:shadow-md"
                                        >
                                            <div className="relative w-full overflow-hidden rounded-md bg-gray-100 pb-[100%]">
                                                {brand.image ? (
                                                    <img
                                                        src={`/storage/${brand.image}`}
                                                        alt={brand.name}
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
                                                    {brand.name}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setFormType(
                                                                    'edit',
                                                                );
                                                                setSelectedBrand(
                                                                    brand.id,
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
                                                                    admin.product.brand.destroy(
                                                                        brand.id,
                                                                    ).url,
                                                                    {
                                                                        onSuccess:
                                                                            () =>
                                                                                loadBrands(
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

export default BrandIndex;

