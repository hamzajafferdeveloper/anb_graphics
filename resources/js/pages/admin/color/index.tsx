import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import ColorsDataTable from './data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Colors',
        href: admin.color.index().url,
    },
];

const ColorIndex = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Colors" />
            <section className="flex flex-col gap-4 p-4">
                <ColorsDataTable />
            </section>
        </AppLayout>
    );
};

export default ColorIndex;
