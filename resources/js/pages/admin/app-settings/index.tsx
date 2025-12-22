import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { AppSetting, BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'App Settings',
        href: admin.settings.index().url,
    },
];

const AppSettings = ({ app_settings }: { app_settings: AppSetting[] }) => {
    // Get saved values
    const savedLogo =
        app_settings.find((s) => s.key === 'site_logo')?.value || '';
    const savedFavicon =
        app_settings.find((s) => s.key === 'site_favicon')?.value || '';

    // Refs
    const logoInput = useRef<HTMLInputElement>(null);
    const faviconInput = useRef<HTMLInputElement>(null);

    // Preview states
    const [logoPreview, setLogoPreview] = useState<string>(
        savedLogo ? `/storage/${savedLogo}` : '',
    );
    const [faviconPreview, setFaviconPreview] = useState<string>(
        savedFavicon ? `/storage/${savedFavicon}` : '',
    );

    // Handle preview
    const handlePreview = (
        file: File | null,
        setter: (url: string) => void,
    ) => {
        if (!file) return;
        setter(URL.createObjectURL(file));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />
            <section className="flex w-full justify-center p-4">
                <div className="rounded-md border p-4">
                    <Heading
                        title="App Setting"
                        description="Update site general settings"
                    />
                    <div className="max-w-lg">
                        <Form
                            action={admin.settings.store()}
                            method="post"
                            className=""
                        >
                            {({ errors, processing }) => (
                                <div className="flex flex-col gap-6">
                                    {/* Site Logo */}
                                    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:gap-4">
                                        <label className="w-32">
                                            Logo (174 x 40)
                                        </label>

                                        {/* Hidden Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="site_logo"
                                            ref={logoInput}
                                            hidden
                                            onChange={(e) =>
                                                handlePreview(
                                                    e.target.files?.[0] || null,
                                                    setLogoPreview,
                                                )
                                            }
                                        />

                                        <div>
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={logoPreview}
                                                    className="h-[40px] w-[174px] border bg-white object-contain"
                                                />

                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() =>
                                                        logoInput.current?.click()
                                                    }
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload File
                                                </Button>
                                            </div>
                                            <InputError
                                                message={errors.site_logo}
                                            />
                                        </div>
                                    </div>

                                    {/* Site Favicon */}
                                    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:gap-4">
                                        <label className="w-32">
                                            Favicon (32 x 32)
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="site_favicon"
                                            ref={faviconInput}
                                            hidden
                                            onChange={(e) =>
                                                handlePreview(
                                                    e.target.files?.[0] || null,
                                                    setFaviconPreview,
                                                )
                                            }
                                        />

                                        <div>
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={faviconPreview}
                                                    className="h-[32px] w-[32px] border bg-white object-contain"
                                                />

                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() =>
                                                        faviconInput.current?.click()
                                                    }
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload File
                                                </Button>
                                            </div>
                                            <InputError
                                                message={errors.site_favicon}
                                            />
                                        </div>
                                    </div>

                                    {/* Site Name */}
                                    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:gap-4">
                                        <label className="w-32">Name</label>
                                        <div>
                                            <Input
                                                id="site_name"
                                                type="text"
                                                name="site_name"
                                                placeholder="Enter site name"
                                                className="flex-1"
                                                defaultValue={
                                                    app_settings.find(
                                                        (setting) =>
                                                            setting.key ===
                                                            'site_name',
                                                    )?.value || ''
                                                }
                                            />
                                            <InputError
                                                message={errors.site_name}
                                            />
                                        </div>
                                    </div>

                                    {/* Site Currency */}
                                    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:gap-4">
                                        <label className="w-32">Currency</label>
                                        <div>
                                            <Input
                                                id="site_currency"
                                                type="text"
                                                name="site_currency"
                                                placeholder="Enter site currency"
                                                className="flex-1"
                                                defaultValue={
                                                    app_settings.find(
                                                        (s) =>
                                                            s.key ===
                                                            'site_currency',
                                                    )?.value || ''
                                                }
                                            />
                                            <InputError
                                                message={errors.site_currency}
                                            />
                                        </div>
                                    </div>

                                    {/* Site Currency Symbol */}
                                    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:gap-4">
                                        <label className="w-32">
                                            Currency Symbol
                                        </label>
                                        <div>
                                            <Input
                                                id="site_currency_symbol"
                                                name="site_currency_symbol"
                                                type="text"
                                                placeholder="Enter site currency icon"
                                                className="flex-1"
                                                defaultValue={
                                                    app_settings.find(
                                                        (s) =>
                                                            s.key ===
                                                            'site_currency_symbol',
                                                    )?.value || ''
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.site_currency_symbol
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Save Settings
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
};

export default AppSettings;
