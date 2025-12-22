import { Button } from '@/components/ui/button';
import FrontendLayout from '@/layouts/frontend-layout';
import { Head, Link } from '@inertiajs/react';

export default function Success({ session_id }: { session_id?: string }) {
    return (
        <FrontendLayout>
            <Head title="Payment Successful" />
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="mb-6 text-3xl font-bold">Payment Successful</h1>
                <p className="mb-8">
                    Thank you for your purchase. Your payment has been
                    processed.
                </p>
                <div className="flex justify-center">
                    <Link href="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        </FrontendLayout>
    );
}
