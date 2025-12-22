// components/ProductCard.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import customizer from '@/routes/user/customizer';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

interface ProductCardProps {
    product: any;
    currency?: string;
    tagLabel?: string; // e.g., "Assigned" or "Purchased"
    tagColor?: string; // tailwind color, e.g., "bg-blue-500"
    showActions?: boolean; // show buttons like View/Get Support
    purchaseDate?: string;
}

const ProductCard = ({
    product,
    currency = '$',
    tagLabel,
    tagColor = 'bg-blue-500',
    showActions = true,
    purchaseDate,
}: ProductCardProps) => {
    const productImage =
        product.images?.length > 0
            ? product.images.find((img: any) => img.is_primary)?.path ||
              product.images[0].path
            : null;

    return (
        <Card className="overflow-hidden shadow-lg transition-shadow duration-200 hover:shadow-2xl">
            <CardContent className="p-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {productImage ? (
                        <img
                            src={`/storage/${productImage}`}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}

                    {tagLabel && (
                        <div
                            className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium text-white ${tagColor}`}
                        >
                            {tagLabel}
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-semibold">
                        {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <div>
                            <div className="text-xs">
                                {product.brand?.name ?? ''}
                            </div>
                            <div className="mt-1 font-medium">
                                {currency}
                                {product.sale_price ?? product.price}
                            </div>
                        </div>

                        {showActions && (
                            <div className="flex items-center gap-2">
                                <Button size="icon" asChild>
                                    <Link
                                        href={`/products/${product.slug}`}
                                        className="p-2"
                                    >
                                        <Eye />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Link href={customizer.index(product.slug)}>
                                        Customize
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {purchaseDate && (
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div>
                                Purchased on:{' '}
                                <span className="font-medium">
                                    {purchaseDate}
                                </span>
                            </div>
                            <div className="font-medium text-emerald-600">
                                Purchased
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
