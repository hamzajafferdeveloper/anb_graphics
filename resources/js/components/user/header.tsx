import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { logout } from '@/routes';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, LucideIcon, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '../breadcrumbs';
import { SidebarTrigger } from '../ui/sidebar';

interface UserHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

const UserHeader = ({ breadcrumbs }: UserHeaderProps) => {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
    ];

    const isDark = appearance === 'dark';
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
                {/* Left: Breadcrumbs */}
                <div className="flex min-w-0 flex-1 items-center">
                    <SidebarTrigger className="-ml-1" />
                    {breadcrumbs?.length ? (
                        <div className="truncate">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    ) : null}
                </div>

                {/* Right: User Actions */}
                <div className="flex shrink-0 items-center justify-end">
                    <button
                        onClick={() =>
                            updateAppearance(isDark ? 'light' : 'dark')
                        }
                        aria-label="Toggle theme"
                        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4 text-neutral-200" />
                        ) : (
                            <Moon className="h-4 w-4 text-neutral-700" />
                        )}
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 rounded-full px-2 hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary/40"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatar.png" />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <span className="hidden text-sm font-medium md:block">
                                    {auth.user ? auth.user.name : 'User'}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-background/80 backdrop-blur-md"
                        >
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem className="gap-2">
                                <User className="h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </DropdownMenuItem> */}
                            {/* <DropdownMenuSeparator /> */}
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                                <Link
                                    href={logout().url}
                                    method="post"
                                    className="flex gap-2"
                                >
                                    <LogOut className="h-4 w-4 items-center text-destructive" />
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default UserHeader;
