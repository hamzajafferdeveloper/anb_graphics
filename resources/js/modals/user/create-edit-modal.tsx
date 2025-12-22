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
import { User } from '@/types/data';
import { Form } from '@inertiajs/react';

const CreateEditUserModal = ({
    open,
    onOpenChange,
    fetchUsers,
    selectedUser,
    type,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fetchUsers: () => void;
    selectedUser?: User;
    type: 'create' | 'edit';
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'create' ? 'Create User' : 'Edit User'}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'create'
                            ? 'Provide user details below.'
                            : 'Update user details and save your changes.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={type === 'create' ? 'post' : 'put'}
                    action={
                        type === 'edit' && selectedUser
                            ? admin.user.update(selectedUser.id).url
                            : admin.user.store().url
                    }
                    resetOnSuccess={true}
                    onSuccess={() => {
                        onOpenChange(false);
                        fetchUsers();
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
                                        placeholder="Full name"
                                        defaultValue={selectedUser?.name ?? ''}
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        defaultValue={selectedUser?.email ?? ''}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid space-y-2">
                                    <Label htmlFor="password">
                                        Password{' '}
                                        {type === 'edit'
                                            ? '(leave blank to keep current)'
                                            : ''}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid space-y-2">
                                    <Label htmlFor="profile_pic">
                                        Profile Picture (optional)
                                    </Label>
                                    {type === 'edit' &&
                                        selectedUser?.profile_pic && (
                                            <img
                                                src={`/storage/${selectedUser.profile_pic}`}
                                                alt={selectedUser.name}
                                                className="mb-2 h-16 w-16 rounded-full object-cover"
                                            />
                                        )}
                                    <Input
                                        id="profile_pic"
                                        name="profile_pic"
                                        type="file"
                                    />
                                    <InputError message={errors.profile_pic} />
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

export default CreateEditUserModal;
