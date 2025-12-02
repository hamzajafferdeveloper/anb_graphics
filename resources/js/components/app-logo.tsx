import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useSidebar } from './ui/sidebar';

export default function AppLogo() {
    const { appSettings } = usePage<SharedData>().props;
    const site_logo = appSettings.site_logo ?? '';
    const site_favicon = appSettings.site_favicon ?? '';

    const { state } = useSidebar();

    return (
        <>
            {state === 'collapsed' ? (
                <img
                    src={`/storage/${site_favicon}`}
                    className="h-[40px] w-[40px]"
                />
            ) : (
                <img
                    src={`/storage/${site_logo}`}
                    className="h-[40px] w-[174px]"
                />
            )}
        </>
    );
}
