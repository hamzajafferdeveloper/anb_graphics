import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItem, setOpenItem] = useState<string | null>(null);

    // Automatically open dropdown if current page is inside a child
    useEffect(() => {
        items.forEach((item) => {
            if (item.children && item.children.length > 0) {
                const match = item.children.some((child) =>
                    page.url.startsWith(resolveUrl(child.href || '')),
                );
                if (match) setOpenItem(item.title);
            }
        });
    }, [page.url, items]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <NavItemComponent
                        key={item.title}
                        item={item}
                        pageUrl={page.url}
                        openItem={openItem}
                        setOpenItem={setOpenItem}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavItemComponent({
    item,
    pageUrl,
    openItem,
    setOpenItem,
}: {
    item: NavItem;
    pageUrl: string;
    openItem: string | null;
    setOpenItem: (title: string | null) => void;
}) {
    const isActive = item.href
        ? pageUrl.startsWith(resolveUrl(item.href))
        : false;
    const isOpen = openItem === item.title;

    const toggleOpen = () => {
        setOpenItem(isOpen ? null : item.title);
    };

    if (item.children && item.children.length > 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    onClick={toggleOpen}
                    tooltip={{ children: item.title }}
                >
                    <button className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                        </div>
                        {isOpen ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                </SidebarMenuButton>

                {isOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={
                                        child.href
                                            ? pageUrl.startsWith(
                                                  resolveUrl(child.href),
                                              )
                                            : false
                                    }
                                    tooltip={{ children: child.title }}
                                >
                                    <Link href={child.href || '#'}>
                                        {child.icon && <child.icon />}
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </div>
                )}
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.title }}
            >
                <Link href={item.href || '#'}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
