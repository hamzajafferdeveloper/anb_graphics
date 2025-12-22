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
import { Switch } from '@/components/ui/switch';
import admin from '@/routes/admin';
import { Coupon } from '@/types/data';
import { Form } from '@inertiajs/react';

import { useState } from 'react';

const CreateEditCouponModal = ({
    open,
    onOpenChange,
    fetchCoupons,
    selectedCoupon,
    type,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fetchCoupons: () => void;
    selectedCoupon?: Coupon;
    type: 'create' | 'edit';
}) => {
    const [status, setStatus] = useState<boolean>(
        typeof selectedCoupon?.status !== 'undefined'
            ? !!selectedCoupon?.status
            : true,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'create' ? 'Create Coupon' : 'Edit Coupon'}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'create'
                            ? 'Provide coupon details below.'
                            : 'Update coupon details and save your changes.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={type === 'create' ? 'post' : 'put'}
                    action={
                        type === 'edit' && selectedCoupon
                            ? admin.coupon.update(selectedCoupon.id).url
                            : admin.coupon.store().url
                    }
                    resetOnSuccess={true}
                    onSuccess={() => {
                        onOpenChange(false);
                        fetchCoupons();
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
                                <div className="grid gap-2">
                                    <Label htmlFor="coupon">Coupon Code</Label>
                                    <Input
                                        id="coupon"
                                        name="coupon"
                                        placeholder="e.g. HOLIDAY20"
                                        defaultValue={
                                            selectedCoupon?.coupon ?? ''
                                        }
                                    />
                                    <InputError message={errors.coupon} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="discount">Discount</Label>
                                    <Input
                                        id="discount"
                                        name="discount"
                                        type="number"
                                        min={0}
                                        placeholder="Discount amount or percent"
                                        defaultValue={
                                            selectedCoupon?.discount ?? ''
                                        }
                                    />
                                    <InputError message={errors.discount} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="limit">Usage Limit</Label>
                                    <Input
                                        id="limit"
                                        name="limit"
                                        type="number"
                                        min={0}
                                        placeholder="e.g. 100"
                                        defaultValue={
                                            selectedCoupon?.limit ?? ''
                                        }
                                    />
                                    <InputError message={errors.limit} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="expires_in">
                                        Expires In
                                    </Label>
                                    <Input
                                        id="expires_in"
                                        name="expires_in"
                                        type="number"
                                        placeholder="Expiration date"
                                        defaultValue={
                                            selectedCoupon?.expires_in ?? ''
                                        }
                                    />
                                    <InputError message={errors.expires_in} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        placeholder="e.g. 100"
                                        defaultValue={
                                            selectedCoupon?.price ?? ''
                                        }
                                    />
                                    <InputError message={errors.price} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground">
                                            Inactive
                                        </span>
                                        <Switch
                                            id="status"
                                            checked={status}
                                            onCheckedChange={(v: any) =>
                                                setStatus(!!v)
                                            }
                                        />
                                        <span className="text-muted-foreground">
                                            Active
                                        </span>
                                    </div>
                                    <InputError message={errors.status} />
                                    <input
                                        type="hidden"
                                        name="status"
                                        value={status ? 1 : 0}
                                    />
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

export default CreateEditCouponModal;
