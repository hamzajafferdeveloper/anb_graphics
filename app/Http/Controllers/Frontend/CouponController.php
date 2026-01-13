<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Coupon;
use App\Models\UserCoupon;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Log;

class CouponController extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user();

            $userCoupons = UserCoupon::where('user_id', $user->id)->with('coupon')->get();

            return response()->json([
                'userCoupons' => $userCoupons
            ]);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 505);
        }
    }

    public function couponPage()
    {
        try {
            $coupons = Coupon::where('status', 1)
                ->orderBy('created_at', 'desc')
                ->get()
                ->filter();

            $user = auth()->user();

            $buyedCoupon = [];

            if ($user) {
                $buyedCoupon = UserCoupon::where('user_id', $user->id)->where('status', 'active')->get();
            }

            return Inertia::render('frontend/coupon-price/index', [
                'coupons' => $coupons->values(),
                'buyedCoupon' => $buyedCoupon
            ]);
        } catch (Exception $e) {
            Log::error('Fail to get coupon price page ' . $e->getMessage());

            return Inertia::render('frontend/coupon-price/index', [
                'coupons' => [],
                'buyedCoupon' => []
            ]);
        }
    }

    public function purchase(Request $request, Coupon $coupon)
    {
        try {

            $user = $request->user();

            $currency = AppSetting::where('key', 'site_currency')->first()->value ?? 'usd';

            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => $currency,
                            'product_data' => [
                                'name' => 'Coupon: ' . $coupon->coupon,
                                'description' => 'Get ' . $coupon->discount . '% discount on your purchase',
                            ],
                            'unit_amount' => $coupon->price * 100,
                        ],
                        'quantity' => 1,
                    ]
                ],
                'mode' => 'payment',
                'metadata' => [
                    'user_id' => (string) $user->id,
                ],
                'success_url' => route('coupon.purchase.success') . '?session_id={CHECKOUT_SESSION_ID}&coupon_id=' . $coupon->id,
                'cancel_url' => route('coupon.purchase.cancel'),
            ]);

            return response()->json(['id' => $session->id, 'url' => $session->url]);
        } catch (Exception $e) {
            Log::error('Stripe checkout create error: ' . $e->getMessage());

            return response()->json(['error' => 'Failed to create buy coupon session'], 500);
        }

    }

    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');
        $couponId = $request->get('coupon_id');

        if (!$sessionId || !$couponId) {
            return redirect()->route('couponPricePage')->with('error', 'Invalid request');
        }

        $coupon = Coupon::findOrFail($couponId);

        if (!$coupon) {
            return redirect()->route('couponPricePage')->with('error', 'Coupon Not Found');
        }

        \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));
        $session = \Stripe\Checkout\Session::retrieve($sessionId);

        if ($session->payment_status === 'paid') {
            // Create user coupon record
            UserCoupon::create([
                'user_id' => auth()->id(),
                'coupon_id' => $couponId,
                'code' => $coupon->coupon,
                'limit' => $coupon->limit,
                'stripe_session_id' => $sessionId,
                'price' => $coupon->price,
            ]);

            return redirect()->route('couponPricePage')
                ->with('success', 'Coupon purchased successfully! Your coupon code will be available in your dashboard.');
        }

        return redirect()->route('couponPricePage')
            ->with('error', 'There was an issue with your payment. Please try again.');
    }

    public function cancel()
    {
        return redirect()->route('couponPricePage')
            ->with('info', 'Your payment was cancelled.');
    }
}
