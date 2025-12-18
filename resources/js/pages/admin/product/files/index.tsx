import AppLayout from '@/layouts/app-layout';
import ConfirmModal from '@/modals/comfirmation';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { Product } from '@/types/data';
import { Head, router } from '@inertiajs/react';
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ImageItem {
    id: number;
    path: string;
    alt?: string | null;
    is_primary?: boolean;
    size?: number;
}

interface FileItem {
    id: number;
    name: string;
    path: string;
    extention: string;
    size?: number;
}

interface Props {
    product: Product;
    images: ImageItem[];
    files: FileItem[];
}

const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default function ProductGallery({ product, images, files }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'All Products', href: admin.product.index().url },
        {
            title: 'Product Gallery',
            href: admin.product.files(product.slug).url,
        },
    ];

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteType, setDeleteType] = useState<'image' | 'file' | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const requestDelete = (type: 'image' | 'file', id: number) => {
        setDeleteType(type);
        setDeleteId(id);
        setOpenDeleteModal(true);
    };

    const handleDelete = () => {
        if (!deleteType || !deleteId) return;

        const route =
            deleteType === 'image'
                ? admin.product.deleteImage(deleteId).url
                : admin.product.deleteFile(deleteId).url;

        router.delete(route, {
            onFinish: () => {
                setOpenDeleteModal(false);
                setDeleteId(null);
                setDeleteType(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Gallery" />

            <div className="space-y-10 px-6 py-6">
                {/* IMAGES */}
                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <ImageIcon className="h-5 w-5" />
                        Images
                    </h2>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="group relative rounded-xl p-3 transition hover:bg-muted/50"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                                    <img
                                        src={`/storage/${image.path}`}
                                        alt={image.alt ?? 'Image'}
                                        className="h-full w-full object-cover"
                                    />

                                    {/* Delete */}
                                    <button
                                        onClick={() =>
                                            requestDelete('image', image.id)
                                        }
                                        className="absolute top-2 right-2 hidden rounded-md bg-black/60 p-1 text-white group-hover:block"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {image.is_primary && (
                                        <span className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white">
                                            Primary
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 truncate text-center text-xs">
                                    {image.alt ?? 'Image'}
                                </p>
                                <p className="text-center text-[10px] text-muted-foreground">
                                    {formatSize(image.size)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FILES */}
                <section>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <FileText className="h-5 w-5" />
                        Files
                    </h2>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="group relative rounded-xl p-3 transition hover:bg-muted/50"
                            >
                                <a
                                    href={`/storage/${file.path}`}
                                    download
                                    className="block"
                                >
                                    <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                                        <FileText className="h-10 w-10 text-muted-foreground" />
                                    </div>

                                    <p className="mt-2 truncate text-center text-xs font-medium">
                                        {file.name}
                                    </p>
                                    <p className="text-center text-[10px] text-muted-foreground">
                                        .{file.extention} ·{' '}
                                        {formatSize(file.size)}
                                    </p>
                                </a>

                                {/* Delete */}
                                <button
                                    onClick={() =>
                                        requestDelete('file', file.id)
                                    }
                                    className="absolute top-2 right-2 hidden rounded-md bg-black/60 p-1 text-white group-hover:block"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <ConfirmModal
                open={openDeleteModal}
                onOpenChange={setOpenDeleteModal}
                title="Delete Item"
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
