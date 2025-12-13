import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FrontendLayout from '@/layouts/frontend-layout';
import products from '@/routes/products';
import { BreadcrumbItem, SharedData } from '@/types';
import { Product, ProductImage } from '@/types/data';
import { Head, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const ProductDetail = ({ product }: { product: Product }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: products.index().url },
        { title: product.name, href: products.show(product.slug).url },
    ];

    const [images] = useState<ProductImage[]>(product.images);
    const primaryImage = images.find((img) => img.is_primary) || images[0];
    const [selectedImage, setSelectedImage] =
        useState<ProductImage>(primaryImage);

    const nonPrimaryImages = images.filter((img) => !img.is_primary);
    const { site_currency_symbol } = usePage<SharedData>().props.appSettings;

    return (
        <FrontendLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 lg:flex-row">
                {/* Left Side: Images */}
                <div className="flex gap-4 lg:w-[60%]">
                    {/* Thumbnails */}
                    <div className="flex flex-col gap-3">
                        {nonPrimaryImages.map((image) => (
                            <img
                                key={image.id}
                                src={`/storage/${image.path}`}
                                alt={`Thumbnail ${image.id}`}
                                className={`h-16 w-16 cursor-pointer rounded-lg border object-cover transition-all duration-300 hover:scale-105 ${
                                    selectedImage.id === image.id
                                        ? 'border-primary ring-2 ring-primary/30'
                                        : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedImage(image)}
                            />
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="flex flex-1 items-center justify-center rounded-xl bg-gray-50 p-6 shadow-sm">
                        <img
                            key={selectedImage.id}
                            src={`/storage/${selectedImage.path}`}
                            alt="Selected Product"
                            className="h-auto w-full max-w-3xl rounded-lg object-contain transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Right Side: Product Info */}
                <div className="flex flex-col gap-4 lg:w-[40%]">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {product.name}
                    </h1>

                    {/* Price Section */}
                    {product.sale_price ? (
                        <>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-primary">
                                    {site_currency_symbol} {product.sale_price}
                                </span>

                                <span className="text-sm text-gray-400 line-through">
                                    {site_currency_symbol} {product.price}
                                </span>

                                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                                    Sale
                                </Badge>
                            </div>

                            <p className="flex items-center gap-2 text-sm text-gray-600">
                                <span>
                                    <span className="font-medium text-gray-800">
                                        From:
                                    </span>{' '}
                                    {product.sale_start_at
                                        ? new Date(
                                              product.sale_start_at,
                                          ).toLocaleDateString()
                                        : '—'}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span>
                                    <span className="font-medium text-gray-800">
                                        To:
                                    </span>{' '}
                                    {product.sale_end_at
                                        ? new Date(
                                              product.sale_end_at,
                                          ).toLocaleDateString()
                                        : '—'}
                                </span>
                            </p>
                        </>
                    ) : (
                        <span className="text-2xl font-bold">
                            {site_currency_symbol} {product.price}
                        </span>
                    )}

                    {/* Description */}
                    <p className="leading-relaxed text-gray-700">
                        {product.description}
                    </p>

                    <hr className="my-2" />

                    {/* Colors */}
                    <div className="flex items-center gap-3">
                        <p className="font-semibold">Colors:</p>
                        <div className="flex gap-3">
                            {product.colors.map((color, index) => (
                                <div
                                    key={index}
                                    className="h-6 w-6 cursor-pointer rounded-full border shadow-sm transition-transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-1 text-sm text-gray-500">
                        <p>
                            Category:{' '}
                            <span className="text-gray-700">
                                {product.category.name}
                            </span>
                        </p>
                        <p>
                            Brand:{' '}
                            <span className="text-gray-700">
                                {product.brand.name}
                            </span>
                        </p>
                        <p>
                            Type:{' '}
                            <span className="text-gray-700">
                                {product.type.name}
                            </span>
                        </p>
                    </div>

                    {/* CTA */}
                    <Button className="mt-4 flex items-center gap-2 text-base shadow-md hover:shadow-lg">
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                    </Button>
                </div>
            </section>
        </FrontendLayout>
    );
};

export default ProductDetail;
