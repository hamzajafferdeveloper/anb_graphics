import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, home, login, logout, products, register } from '@/routes';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

const navLinks = [
    { label: 'Home', href: home() },
    { label: 'Products', href: products() },
];

const FrontendHeader = () => {
    const page = usePage<SharedData>().props;
    const { auth } = page;
    const { site_logo, site_name } = page.appSettings;

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img
                        src={`/storage/${site_logo}`}
                        alt={site_name}
                        className="h-6 w-auto"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <div className="flex gap-3">
                            <Link href={dashboard()}>
                                <Button className="w-full">
                                    Go to Dashboard
                                </Button>
                            </Link>

                            <Link href={logout()} method="post">
                                <Button variant="outline" className="w-full">Logout</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href={login()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden md:inline-flex"
                                >
                                    Login
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Sidebar Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-72">
                            <SheetHeader>
                                <SheetTitle className="text-primary">
                                    <img
                                        src={`/storage/${site_logo}`}
                                        alt={site_name}
                                        className="h-5 w-auto"
                                    />
                                </SheetTitle>
                            </SheetHeader>

                            <div className="p-4">
                                {/* Mobile Nav */}
                                <div className="mt-6 flex flex-col gap-4">
                                    {navLinks.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Auth Actions */}
                                <div className="mt-8 border-t pt-6">
                                    {auth?.user ? (
                                        <div className="flex flex-col gap-3">
                                            <Link href={dashboard()}>
                                                <Button className="w-full">
                                                    Go to Dashboard
                                                </Button>
                                            </Link>

                                            <Link href={logout()} method="post">
                                                <Button className="w-full">
                                                    Logout
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Link href={login()}>
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    Login
                                                </Button>
                                            </Link>

                                            <Link href={register()}>
                                                <Button className="w-full">
                                                    Get Started
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default FrontendHeader;
