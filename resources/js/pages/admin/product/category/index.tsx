import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import admin from '@/routes/admin';
import { BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: admin.product.category.index().url,
    },
];

const CategoryIndex = () => {
    const [formType, setFormType] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Category" />
            <ResizablePanelGroup direction="horizontal" className="w-full">
                <ResizablePanel defaultSize={25}>
                    <div className="flex h-full justify-center p-6">
                        <Card className="h-fit w-full max-w-sm">
                            <CardHeader>
                                <CardTitle>
                                    {' '}
                                    {formType === 'create'
                                        ? 'Create New Category'
                                        : 'Edit Category'}{' '}
                                </CardTitle>
                                <CardDescription>
                                    {formType === 'create'
                                        ? 'Enter the category details below.'
                                        : 'Edit the category details below.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    action={admin.product.category.store().url}
                                    method="post"
                                    resetOnSuccess={true}
                                    className="space-y-6"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="flex flex-col gap-6">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">
                                                        Category Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        // required
                                                        autoFocus
                                                        tabIndex={1}
                                                        placeholder="e.g. Suite, Gloves"
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <div className="flex items-center">
                                                        <Label htmlFor="image">
                                                            Category Image
                                                            (optional)
                                                        </Label>
                                                    </div>
                                                    <Input
                                                        id="image"
                                                        name="image"
                                                        type="file"
                                                        tabIndex={2}
                                                    />
                                                    <InputError
                                                        message={errors.image}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="mt-4 w-full"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                Create
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Content</span>
                        <Button
                            onClick={() => {
                                setFormType(
                                    formType === 'create' ? 'edit' : 'create',
                                );
                            }}
                        >
                            Switch to{' '}
                            {formType === 'create' ? 'Edit' : 'Create'} Form
                        </Button>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </AppLayout>
    );
};

export default CategoryIndex;
