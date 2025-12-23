import { btnSideBarLink } from '@/constant/customizer-icon-bar-data';
import user from '@/routes/user';
import { RootState } from '@/stores/store';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import IconBar from './icon-bar';

const Sidebar = ({ className }: { className?: string }) => {
    const page = usePage<SharedData>().props;
    const { site_favicon } = page.appSettings;
    const selectedSidebar = useSelector(
        (state: RootState) => state.customizer.selectedSidebar,
    );

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
                <IconBar />
            </div>

            <div className="h-full w-full flex-1 rounded-2xl border shadow-2xl">
                <div className="flex items-center justify-center py-4">
                    {(() => {
                        const SidebarComponent = btnSideBarLink.find(
                            (item) => item.name === selectedSidebar
                        )?.component;
                        return SidebarComponent ? <SidebarComponent /> : null;
                    })()}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
