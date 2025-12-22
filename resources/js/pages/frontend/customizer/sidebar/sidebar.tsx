import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import user from '@/routes/user';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Layers, PaintBucket, Text } from 'lucide-react';

const btnSideBarLink = [
    {
        name: 'Home',
        icon: PaintBucket,
    },
    {
        name: 'Home',
        icon: Layers,
    },
    {
        name: 'Home',
        icon: Text,
    },
];

const Sidebar = ({ className }: { className?: string }) => {
    const page = usePage<SharedData>().props;
    const { site_favicon } = page.appSettings;
    return (
        <div
            className={`flex w-full flex-col gap-3 p-3 lg:flex-row xl:w-1/4 ${className}`}
        >
            <div className="flex items-stretch gap-2 lg:h-[calc(100vh-30px)] lg:flex-col">
                <div className="h-12 w-12 cursor-pointer rounded-xl border p-2 shadow-2xl">
                    <Link href={user.products()}>
                        <img
                            src={`/storage/${site_favicon}`}
                            alt=""
                            className="h-full w-full"
                        />
                    </Link>
                </div>
                <div className="flex h-fit w-full items-center gap-1 rounded-xl border p-1 shadow-2xl lg:h-full lg:w-auto lg:flex-col">
                    {btnSideBarLink.map((btn, index) => {
                        const isActive = index === 0;

                        return (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        key={index}
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={`relative !h-10 !w-10 overflow-hidden rounded-md p-2 transition-all duration-300 ${
                                            isActive
                                                ? `border border-white/30 bg-primary shadow-[0_8px_32px_rgba(255,255,255,0.18)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-br before:from-white/40 before:via-white/10 before:to-transparent before:opacity-60`
                                                : 'hover:bg-white/10'
                                        }`}
                                        asChild
                                    >
                                        <btn.icon
                                            className={`${
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{btn.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>

            <div className="h-full w-full flex-1 rounded-2xl border shadow-2xl">
                <div className="flex items-center justify-center py-4">
                    {/* Content Goes here */}sdf
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
