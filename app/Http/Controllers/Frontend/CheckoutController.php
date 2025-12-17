<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\SubOrder;
use App\Models\UserCoupon;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /* =====================================================
     | PRODUCT CURRENT PRICE (SALE LOGIC)
     ===================================================== */
    public static function getProductCurrentPrice($product): float
    {
        try {
            $price = (float) $product->price;

            if (!empty($product->sale_price)) {
                $start = $product->sale_start_at ? Carbon::parse($product->sale_start_at) : null;
                $end = $product->sale_end_at ? Carbon::parse($product->sale_end_at) : null;
                $now = now();

                if (
                    (!$start || $now->gte($start)) &&
                    (!$end || $now->lte($end))
                ) {
                    $price = (float) $product->sale_price;
                }
            }

            return round($price, 2);
        } catch (Exception $e) {
            Log::error('Current price error', ['msg' => $e->getMessage()]);
            return (float) ($product->price ?? 0);
        }
    }

    /* =====================================================
     | PRODUCT PRICE AFTER COUPON
     ===================================================== */
    public static function getProductPriceAfterApplyingCoupon(
        $product,
        $appliedCoupons = []
    ): float {
        try {
            $price = self::getProductCurrentPrice($product);

            foreach ($appliedCoupons as $coupon) {
                if (
                    isset($coupon['product_id'], $coupon['discount']) &&
                    (int) $coupon['product_id'] === (int) $product->id
                ) {
                    $discountPercent = (float) $coupon['discount'];
                    $price -= $price * ($discountPercent / 100);
                    break;
                }
            }

            return max(round($price, 2), 0.01);
        } catch (Exception $e) {
            Log::error('Coupon price error', ['msg' => $e->getMessage()]);
            return self::getProductCurrentPrice($product);
        }
    }

    /* =====================================================
     | STORE ORDER + SUBORDERS
     ===================================================== */
    public static function storeOrder($items, $appliedCoupons)
    {
        return DB::transaction(function () use ($items, $appliedCoupons) {

            $userId = auth()->id();
            $totalAmount = 0;
            $discountedAmount = 0;

            foreach ($items as $item) {
                $qty = max(1, $item->quantity ?? 1);

                $totalAmount +=
                    self::getProductCurrentPrice($item->product) * $qty;

                $discountedAmount +=
                    self::getProductPriceAfterApplyingCoupon(
                        $item->product,
                        $appliedCoupons
                    ) * $qty;
            }

            $order = Order::create([
                'user_id' => $userId,
                'total_amount' => round($totalAmount, 2),
                'discounted_amount' => round($discountedAmount, 2),
                'payment_status' => 'pending',
            ]);

            foreach ($items as $item) {
                $matchedUserCouponId = null;

                foreach ($appliedCoupons as $coupon) {
                    if ((int) $coupon['product_id'] === (int) $item->product_id) {
                        $matchedUserCouponId = $coupon['user_coupon_id'];
                        break;
                    }
                }

                SubOrder::create([
                    'user_id' => $userId,
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'user_coupon_id' => $matchedUserCouponId,
                    'price' => self::getProductCurrentPrice($item->product),
                    'discounted_price' =>
                        self::getProductPriceAfterApplyingCoupon(
                            $item->product,
                            $appliedCoupons
                        ),
                    'quantity' => max(1, $item->quantity ?? 1),
                ]);
            }

            return $order;
        });
    }

    /* =====================================================
     | STRIPE CHECKOUT CREATE
     ===================================================== */
    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Auth required'], 401);
        }

        $currency =
            AppSetting::where('key', 'site_currency')->value('value') ?? 'usd';

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $appliedCoupons = collect($request->applied_coupons ?? []);
        $items = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($items->isEmpty()) {
            return response()->json(['error' => 'Cart empty'], 400);
        }

        $lineItems = [];

        foreach ($items as $item) {
            $amount =
                self::getProductPriceAfterApplyingCoupon(
                    $item->product,
                    $appliedCoupons
                ) * 100;

            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => ['name' => $item->product->name],
                    'unit_amount' => (int) round($amount),
                ],
                'quantity' => max(1, $item->quantity ?? 1),
            ];
        }

        $order = self::storeOrder($items, $appliedCoupons);

        $session = \Stripe\Checkout\Session::create([
            'mode' => 'payment',
            'line_items' => $lineItems,
            'success_url' =>
                route('cart.checkout.success') .
                '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('cart.checkout.cancel'),
            'metadata' => [
                'order_id' => $order->id,
                'user_id' => $user->id,
            ],
        ]);

        return response()->json([
            'id' => $session->id,
            'url' => $session->url,
        ]);
    }

    /* =====================================================
     | STRIPE SUCCESS
     ===================================================== */
    public function success(Request $request)
    {
        $user = $request->user();
        $sessionId = $request->session_id;

        // Reduce coupon usage AFTER payment success
        DB::transaction(function () use ($user, $sessionId) {

            $order = Order::where('user_id', $user->id)
                ->where('payment_status', 'pending')
                ->latest()
                ->first();

            if (!$order) {
                return;
            }

            $subOrders = SubOrder::where('order_id', $order->id)->get();

            foreach ($subOrders as $subOrder) {

                $userCoupon = UserCoupon::where('user_id', $user->id)
                    ->where('id', $subOrder->user_coupon_id)
                    ->where('status', 'active')
                    ->first();


                if (!$userCoupon) {
                    continue;
                }

                // Increment usage
                $userCoupon->used_no += 1;

                // If limit reached → mark inactive
                if ($userCoupon->used_no >= $userCoupon->limit) {
                    $userCoupon->status = 'used';
                }

                $userCoupon->save();
            }

            $order->update([
                'stripe_payment_id' => $sessionId,
                'payment_status' => 'completed',
            ]);

        });



        CartItem::where('user_id', $user->id)->delete();

        return Inertia::render('frontend/cart/success', [
            'session_id' => $sessionId,
        ]);
    }

    public function cancel()
    {
        return inertia('frontend/cart/cancel');
    }
}
