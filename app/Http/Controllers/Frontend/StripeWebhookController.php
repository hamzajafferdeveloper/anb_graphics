<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CartItem;
use App\Models\UserProduct;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            if ($endpointSecret) {
                $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                // In testing or when no webhook secret is configured, accept raw JSON
                $event = json_decode($payload);
            }
        } catch (\UnexpectedValueException $e) {
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            $userId = $session->metadata->user_id ?? null;

            if ($userId) {
                try {
                    // Persist purchased products for the user before clearing cart
                    $items = CartItem::where('user_id', $userId)->get();

                    foreach ($items as $item) {
                        UserProduct::create([
                            'user_id' => $userId,
                            'product_id' => $item->product_id,
                            'stripe_payment_id' => $session->payment_intent ?? null,
                        ]);
                    }

                    CartItem::where('user_id', $userId)->delete();

                    Log::info('Created UserProduct entries and cleared cart after payment', ['user_id' => $userId]);
                } catch (\Throwable $e) {
                    Log::error('Failed processing checkout webhook: ' . $e->getMessage());
                }
            }
        }

        return response('OK');
    }
}
