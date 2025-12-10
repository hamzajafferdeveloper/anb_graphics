import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create New Product',
        href: admin.product.type.index().url,
    },
];

const CreateProduct = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Type" />
            <section className="flex flex-col gap-4 p-4">
                Create Product
            </section>
        </AppLayout>
    );
};

export default CreateProduct;
