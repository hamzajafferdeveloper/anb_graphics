import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn, resolveUrl } from '@/lib/utils';
import user from '@/routes/user';
import { router, usePage } from '@inertiajs/react';
import { LayoutDashboard, ShoppingBag, Ticket } from 'lucide-react';

const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: user.dashboard() },
    { label: 'Products', icon: ShoppingBag, href: user.products() },
    { label: 'Coupons', icon: Ticket, href: user.coupons() },
];

function AppSidebar() {
    const page = usePage();

    return (
        <Sidebar
            collapsible="offcanvas"
            variant="floating"
            className="border-r bg-white/70 shadow-xl backdrop-blur-md"
        >
            <SidebarContent>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/30 font-bold text-primary backdrop-blur-md">
                        U
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                            User Panel
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Welcome back
                        </span>
                    </div>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-sm text-muted-foreground">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => {
                                const isActive = page.url.startsWith(
                                    resolveUrl(item.href),
                                );
                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.label}
                                        >
                                            <button
                                                onClick={() =>
                                                    router.get(item.href)
                                                }
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
                                                    isActive
                                                        ? '!bg-blue-500/90 !text-blue-600 !shadow-lg !backdrop-blur-lg'
                                                        : 'text-muted-foreground hover:bg-blue-100/20 hover:text-blue-600',
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        'h-5 w-5 transition-transform',
                                                        isActive && 'scale-110',
                                                    )}
                                                />
                                                <span>{item.label}</span>
                                            </button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 text-center text-xs text-muted-foreground">
                © User Panel
            </SidebarFooter>
        </Sidebar>
    );
}

export default function UserSidebarLayout() {
    return (
        <div className="flex min-h-screen">
            <AppSidebar />
        </div>
    );
}
