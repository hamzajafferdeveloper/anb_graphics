import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const FrontendFooter = () => {
    const { site_name } = usePage<SharedData>().props.appSettings;

    return (
        <footer className="border-t bg-background">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">
                            {site_name ? site_name : 'ANB Graphics'}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Quisquam, quae.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase text-foreground">
                            Company
                        </h4>
                        <ul className="space-y-3 text-sm">
                            {['About Us', 'Careers', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="text-muted-foreground transition hover:text-primary"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase text-foreground">
                            Resources
                        </h4>
                        <ul className="space-y-3 text-sm">
                            {['Blog', 'Help Center', 'Privacy Policy'].map(
                                (item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-muted-foreground transition hover:text-primary"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase text-foreground">
                            Follow Us
                        </h4>
                        <div className="flex gap-3">
                            {[Facebook, Instagram, Twitter, Linkedin].map(
                                (Icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="rounded-md border p-2 text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Icon size={18} />
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row">
                    <span>
                        © {new Date().getFullYear()}{' '}
                        {site_name ? site_name : 'ANB Graphics'}. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default FrontendFooter;
