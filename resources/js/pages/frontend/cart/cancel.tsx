import { Button } from '@/components/ui/button';
import FrontendLayout from '@/layouts/frontend-layout';
import { Head, Link } from '@inertiajs/react';

export default function Cancel() {
    return (
        <FrontendLayout>
            <Head title="Payment Cancelled" />
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="mb-6 text-3xl font-bold">Payment Cancelled</h1>
                <p className="mb-8">
                    Your payment was cancelled. You can try again or continue
                    shopping.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/cart">
                        <Button variant="outline">Back to Cart</Button>
                    </Link>
                    <Link href="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        </FrontendLayout>
    );
}
