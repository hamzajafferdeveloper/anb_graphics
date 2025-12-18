<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\UserCoupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,used,expired',
            'sort' => 'nullable|in:newest,oldest,value_high,value_low',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $user = Auth::user();

        $coupons = $user->coupons()
            ->with('coupon')
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%");
            })
            ->when($validated['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($validated['sort'] ?? null, function ($query, $sort) {
                match ($sort) {
                    'newest' => $query->latest(),
                    'oldest' => $query->oldest(),
                    'value_high' => $query->join('coupons', 'user_coupons.coupon_id', '=', 'coupons.id')
                        ->orderBy('coupons.discount', 'desc'),
                    'value_low' => $query->join('coupons', 'user_coupons.coupon_id', '=', 'coupons.id')
                        ->orderBy('coupons.discount', 'asc'),
                };
            })
            ->orderBy('created_at', 'desc')
            ->paginate($validated['per_page'] ?? 10)
            ->through(fn($userCoupon) => [
                'id' => $userCoupon->id,
                'code' => $userCoupon->code,
                'discount' => $userCoupon->coupon->discount,
                'discount_type' => 'fixed',
                'status' => $userCoupon->status,
                'used_no' => $userCoupon->used_no,
                'limit' => $userCoupon->limit,
                'created_at' => $userCoupon->created_at,
                'expires_at' => $userCoupon->created_at
                    ->addDays($userCoupon->coupon->expires_in),
            ]);

        return Inertia::render('user/coupon/index', [
            'coupons' => $coupons,
            'filters' => $validated,
        ]);
    }

}
