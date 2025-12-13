import { Button } from '@/components/ui/button';
import FrontendLayout from '@/layouts/frontend-layout';
import { dashboard, products, register } from '@/routes';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { Download, Package, Paintbrush, ShoppingCart } from 'lucide-react';
import { useEffect, useRef } from 'react';

const features = [
    {
        icon: Package,
        title: 'Admin Adds Products',
        description:
            'Admins upload customizable products with flexible design options.',
    },
    {
        icon: Paintbrush,
        title: 'User Customization',
        description:
            'Users personalize products in real time using powerful tools.',
    },
    {
        icon: ShoppingCart,
        title: 'Buy Packages',
        description: 'Purchase packages to unlock more discounted products.',
    },
    {
        icon: Download,
        title: 'Instant Download',
        description:
            'Download your customized product instantly after purchase.',
    },
];

const Welcome = () => {
    const page = usePage<SharedData>().props;
    const { auth } = page;
    const heroRef = useRef<HTMLDivElement>(null);
    const featureRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        // Hero animation
        gsap.fromTo(
            heroRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        );

        // Features animation
        gsap.fromTo(
            featureRefs.current,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                delay: 0.3,
                ease: 'power3.out',
            },
        );
    }, []);

    return (
        <FrontendLayout>
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div
                    ref={heroRef}
                    className="mx-auto max-w-7xl px-6 py-28 text-center"
                >
                    <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                        Design • Customize • Download
                    </span>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Create, Customize & Download
                        <span className="block text-primary">
                            Premium Products
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                        A powerful platform where admins upload products, users
                        customize them, and download after purchasing flexible
                        packages.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button size="lg">Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href={register()}>
                                <Button size="lg">Get Started</Button>
                            </Link>
                        )}

                        <Link href={products()}>
                            <Button size="lg" variant="outline">
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Decorative blur */}
                <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
            </section>

            {/* FEATURES */}
            <section className="border-t bg-muted/40">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <h2 className="mb-16 text-center text-3xl font-bold text-foreground">
                        How It Works
                    </h2>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    ref={(el) => {
                                        if (el) featureRefs.current[index] = el;
                                    }}
                                    className="group rounded-xl border bg-background p-6 transition hover:border-primary hover:shadow-lg"
                                >
                                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                                        <Icon size={22} />
                                    </div>

                                    <h3 className="mb-2 text-lg font-semibold">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative">
                <div className="mx-auto max-w-7xl px-6 py-24 text-center">
                    <h2 className="text-3xl font-bold text-foreground">
                        Ready to start creating?
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Join now, customize your products, and download
                        professional designs in minutes.
                    </p>

                    <div className="mt-8">
                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button size="lg">Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href={register()}>
                                <Button size="lg">Get Started</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            </section>
        </FrontendLayout>
    );
};

export default Welcome;
