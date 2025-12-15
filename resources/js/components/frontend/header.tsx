import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, home, login, logout, register } from '@/routes';
import { index } from '@/routes/products';
import {
    CartItem as CartItemType,
    fetchCart,
    removeFromCart,
} from '@/stores/cartSlice';
import { RootState } from '@/stores/store';
import { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const navLinks = [
    { label: 'Home', href: home() },
    { label: 'Products', href: index() },
];

const FrontendHeader = () => {
    const page = usePage<SharedData>().props;
    const { auth } = page;
    const { site_logo, site_name } = page.appSettings;

    // Small cart preview component used in the header sheet
    const CartList = () => {
        const dispatch = useDispatch();
        const items = useSelector(
            (s: RootState) => s.cart.items as CartItemType[],
        );

        useEffect(() => {
            dispatch(fetchCart() as any);
        }, [dispatch]);

        if (!items || items.length === 0) {
            return (
                <div className="py-8 text-center text-sm text-gray-500">
                    Your cart is empty
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((item: CartItemType) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                            <img
                                src={
                                    `storage/${item.image}` ||
                                    '/images/placeholder-product.jpg'
                                }
                                alt={item.name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-sm font-medium">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Quantity: {item.quantity}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">
                                    ${item.price.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                dispatch(removeFromCart(Number(item.id)) as any)
                            }
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">Subtotal</div>
                    <div className="font-semibold">
                        $
                        {items
                            .reduce(
                                (t: number, it: CartItemType) =>
                                    t + it.price * it.quantity,
                                0,
                            )
                            .toFixed(2)}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                    <Link className="w-full" href="/cart">
                        <Button className="w-full">View Cart</Button>
                    </Link>
                    {/* <Button variant="secondary" className="w-full">
                        Checkout
                    </Button> */}
                </div>
            </div>
        );
    };

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
                                <Button className="w-full">Dashboard</Button>
                            </Link>

                            <Button
                                onClick={() => router.post(logout())}
                                variant="outline"
                                className="w-full"
                            >
                                Logout
                            </Button>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Open cart"
                                        className="relative h-10 w-10 rounded-full transition-all hover:scale-105 hover:bg-muted active:scale-95"
                                    >
                                        {/* Cart Icon */}
                                        <ShoppingCart className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />

                                        {/* Accessible text */}
                                        <span className="sr-only">
                                            Open cart
                                        </span>

                                        {/* Badge */}
                                        <span className="pointer-events-none absolute -top-1 -right-3 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground shadow">
                                            {useSelector(
                                                (s: RootState) =>
                                                    s.cart.items.length,
                                            ) || 0}
                                        </span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-full max-w-md"
                                >
                                    <SheetHeader>
                                        <SheetTitle>Your Cart</SheetTitle>
                                    </SheetHeader>
                                    {!auth?.user ? (
                                        <div className="p-6 text-center text-sm text-gray-600">
                                            Please{' '}
                                            <Link
                                                href="/login"
                                                className="text-primary underline"
                                            >
                                                login
                                            </Link>{' '}
                                            to view your cart.
                                        </div>
                                    ) : (
                                        <div className="p-4">
                                            <CartList />
                                        </div>
                                    )}
                                </SheetContent>
                            </Sheet>
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
