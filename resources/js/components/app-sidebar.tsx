import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Archive,
    BookOpen,
    Box,
    Folder,
    LayoutGrid,
    List,
    Palette,
    Settings,
    Tag,
    Ticket,
    User2,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: admin.user.index(),
        icon: User2,
    },
    {
        title: 'Products',
        icon: Archive,
        children: [
            { title: 'All', href: admin.product.index(), icon: Box },
            {
                title: 'Category',
                href: admin.product.category.index(),
                icon: Archive,
            },
            { title: 'Brand', href: admin.product.brand.index(), icon: Tag },
            { title: 'Type', href: admin.product.type.index(), icon: List },
        ],
    },
    {
        title: 'Colors',
        href: admin.color.index(),
        icon: Palette,
    },
    {
        title: 'App Settings',
        href: admin.settings.index(),
        icon: Settings,
    },
    {
        title: 'Coupon',
        href: admin.coupon.index(),
        icon: Ticket,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
