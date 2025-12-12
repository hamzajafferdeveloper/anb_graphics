import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Users',
        href: admin.user.index().url,
    },
];

export default function UserIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                User Index page
            </div>
        </AppLayout>
    );
}
