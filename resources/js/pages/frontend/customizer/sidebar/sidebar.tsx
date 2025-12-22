import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const Sidebar = () => {
    const page = usePage<SharedData>().props;
    const { site_logo, site_name, site_currency_symbol } = page.appSettings;
    return (
        <div className="w-1/6 p-3">
            <div className="h-[95vh] rounded-2xl border shadow-2xl">
                <div className="flex justify-center pt-2">
                    <img
                        src={`/storage/${site_logo}`}
                        className="h-[40px] w-[174px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
