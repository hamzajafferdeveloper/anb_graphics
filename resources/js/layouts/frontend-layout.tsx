import { Breadcrumbs } from '@/components/breadcrumbs';
import FrontendFooter from '@/components/frontend/footer';
import FrontendHeader from '@/components/frontend/header';
import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast, Toaster } from 'sonner';

interface FrontendLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function FrontendLayout({
    children,
    breadcrumbs,
}: FrontendLayoutProps) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="flex min-h-screen flex-col">
            <FrontendHeader />

            {breadcrumbs?.length ? (
                <div className="mx-auto w-full max-w-7xl border-b p-3">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            ) : null}

            <main className="flex-1">{children}</main>

            <FrontendFooter />

            <Toaster richColors position="top-right" />
        </div>
    );
}
