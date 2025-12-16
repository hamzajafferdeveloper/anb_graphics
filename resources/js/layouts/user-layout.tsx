import { SidebarProvider } from '@/components/ui/sidebar';
import UserHeader from '@/components/user/header';
import UserSideBar from '@/components/user/sidebar';
import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { toast, Toaster } from 'sonner';

interface FrontendLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function UserLayout({
    children,
    breadcrumbs,
}: FrontendLayoutProps) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <SidebarProvider>
                {/* Sidebar */}
                <UserSideBar />

                {/* Main Content Area */}
                <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <UserHeader breadcrumbs={breadcrumbs} />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
            <Toaster richColors position="top-right" />
        </div>
    );
}
