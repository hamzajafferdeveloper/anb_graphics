import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { Product } from '@/types/data';
import { Head } from '@inertiajs/react';
import AddTemplateSection from '@/sections/add-template-section';


type Props = {
    product: Product;
};

const CreateSvgTemplate = ({ product }: Props) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'All Product',
            href: admin.product.index().url,
        },
        {
            title: 'Create Svg Template',
            href: admin.product.svgTemplate.create(product.slug).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Svg Template" />
            <AddTemplateSection product={product} />
        </AppLayout>
    );
};

export default CreateSvgTemplate;
