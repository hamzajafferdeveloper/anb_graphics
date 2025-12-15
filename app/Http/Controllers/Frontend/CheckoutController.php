<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\UserProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CartItem;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $items = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($items->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $lineItems = [];

            foreach ($items as $item) {
                $product = $item->product;
                $amount = (int) round($product->price * 100);

                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $product->name,
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => max(1, $item->quantity ?? 1),
                ];
            }

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'metadata' => [
                    'user_id' => (string) $user->id,
                ],
                'success_url' => route('cart.checkout.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('cart.checkout.cancel'),
            ]);

            return response()->json(['id' => $session->id, 'url' => $session->url]);
        } catch (\Throwable $e) {
            Log::error('Stripe checkout create error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create checkout session'], 500);
        }
    }

    public function success(Request $request)
    {
        try {
            $user = $request->user();
            $sessionId = $request->input('session_id');

            if (!$user || !$sessionId) {
                return redirect()->route('cart.index')->with('error', 'Invalid session');
            }

            // Get items from cart
            $items = CartItem::with('product')->where('user_id', $user->id)->get();

            foreach ($items as $item) {
                UserProduct::firstOrCreate([
                    'user_id' => $user->id,
                    'product_id' => $item->product_id,
                    'stripe_payment_id' => $sessionId,
                ]);
            }


            // Clear cart
            CartItem::where('user_id', $user->id)->delete();

            // return redirect()->route('cart.index')->with('success', 'Checkout successful');

            return Inertia::render('frontend/cart/success', [
                'session_id' => $sessionId,
            ]);

        } catch (\Throwable $e) {
            Log::error('Stripe checkout success error: ' . $e->getMessage());
            return redirect()->route('cart.index')->with('error', 'Failed to process checkout');
        }
    }

    public function cancel(Request $request)
    {
        return inertia('frontend/cart/cancel');
    }
}
