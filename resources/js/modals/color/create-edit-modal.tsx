import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import admin from '@/routes/admin';
import { ProductColor } from '@/types/data';
import { Form } from '@inertiajs/react';

const CreateEditTypeModal = ({
    open,
    onOpenChange,
    fetchColors,
    selectedColor,
    type,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fetchColors: () => void;
    selectedColor?: ProductColor;
    type: 'create' | 'edit';
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'create' ? 'Create Color' : 'Edit Color'}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'create'
                            ? 'Provide information below to create a new color.'
                            : 'Update the fields below and save your changes.'}
                    </DialogDescription>
                </DialogHeader>
                <Form
                    method={type === 'create' ? 'post' : 'put'}
                    action={
                        type === 'edit' && selectedColor
                            ? admin.color.update(selectedColor.id).url
                            : admin.color.store().url
                    }
                    resetOnSuccess={true}
                    onSuccess={() => {
                        onOpenChange(false);
                        fetchColors();
                    }}
                >
                    {({ errors, processing }) => (
                        <>
                            {type === 'edit' && (
                                <input
                                    type="hidden"
                                    name="_method"
                                    value="put"
                                />
                            )}

                            <div className="space-y-4 py-2">
                                <div className="grid space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Type name"
                                        defaultValue={selectedColor?.name ?? ''}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <div className="space-y-4 py-2">
                                <div className="grid space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                        id="color"
                                        type="color"
                                        name="color"
                                        placeholder="Color"
                                        defaultValue={selectedColor?.code ?? ''}
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>

                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
                                    {type === 'create'
                                        ? 'Create'
                                        : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEditTypeModal;
