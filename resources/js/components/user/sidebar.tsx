import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn, resolveUrl } from '@/lib/utils';
import user from '@/routes/user';
import { router, usePage } from '@inertiajs/react';
import { LayoutDashboard, Menu, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: user.dashboard() },
    // { label: 'Profile', icon: User, href: 'profile' },
    { label: 'Products', icon: ShoppingBag, href: user.products() },
    // { label: 'Settings', icon: Settings, href: 'settings' },
];

function SidebarContent({ className }: { className?: string }) {
    const page = usePage();
    const [active, setActive] = useState('Dashboard');

    return (
        <div
            className={cn(
                'flex h-screen flex-col border bg-background/70 shadow-xl backdrop-blur-xl',
                className,
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-3 border-b px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
                    U
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">User Panel</span>
                    <span className="text-xs text-muted-foreground">
                        Welcome back
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {sidebarItems.map((item) => {
                    const isActive = item.href
                        ? page.url.startsWith(resolveUrl(item.href))
                        : false;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActive(item.label);
                                router.get(item.href);
                            }}
                            className={cn(
                                'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-primary/20 text-primary shadow-lg ring-1 ring-primary/30 backdrop-blur-md'
                                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'h-5 w-5 transition-transform',
                                    isActive && 'scale-110',
                                )}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

const UserSideBar = () => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden h-screen w-72 lg:block">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="h-screen w-72 p-0">
                        <SidebarContent className="border-none shadow-none" />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
};

export default UserSideBar;
