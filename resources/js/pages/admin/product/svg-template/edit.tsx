import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import EditTemplateSection from '@/sections/edit-template-section';
import { BreadcrumbItem } from '@/types';
import { Product, SvgTemplate } from '@/types/data';
import { Head } from '@inertiajs/react';

type Props = {
    product: Product;
    template: SvgTemplate
};

const CreateSvgTemplate = ({ product, template }: Props) => {
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
            <EditTemplateSection template={template} product={product} />
        </AppLayout>
    );
};

export default CreateSvgTemplate;
