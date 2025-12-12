<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Coupon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/coupon/index');
    }

    public function getCoupons(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = Coupon::query();

            if ($request->filled('search')) {
                $query->where('coupon', 'like', '%' . $request->input('search') . '%');
            }

            $perPage = 12;
            $coupons = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'coupons' => $coupons->items(),
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting coupons: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'coupon' => ['required', 'string', 'max:255', 'unique:coupons,coupon'],
                'discount' => ['nullable', 'integer', 'min:0'],
                'limit' => ['nullable', 'integer', 'min:0'],
                'status' => ['nullable', 'integer', 'in:0,1'],
                'expires_in' => ['nullable', 'integer', 'min:0'],
            ]);

            Coupon::create([
                'coupon' => $validated['coupon'],
                'discount' => $validated['discount'] ?? null,
                'limit' => $validated['limit'] ?? null,
                'status' => $validated['status'] ?? 1,
                'expires_in' => $validated['status'] ?? 1,
            ]);

            return back()->with('success', 'Coupon created!');
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }
            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $coupon = Coupon::findOrFail($id);

            $validated = $request->validate([
                'coupon' => ['required', 'string', 'max:255', 'unique:coupons,coupon,' . $id],
                'discount' => ['nullable', 'integer', 'min:0'],
                'limit' => ['nullable', 'integer', 'min:0'],
                'status' => ['nullable', 'integer', 'in:0,1'],
                'expires_in' => ['nullable', 'integer', 'min:0'],
            ]);

            $coupon->update([
                'coupon' => $validated['coupon'],
                'discount' => $validated['discount'] ?? $coupon->discount,
                'limit' => $validated['limit'] ?? $coupon->limit,
                'status' => $validated['status'] ?? $coupon->status,
                'expires_in' => $validated['expires_in'] ?? $coupon->expires_in,
            ]);

            return back()->with('success', 'Coupon updated!');
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }
            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $coupon = Coupon::findOrFail($id);
            $coupon->delete();
            return back()->with('success', 'Coupon deleted!');
        } catch (\Throwable $e) {
            Log::error('Error deleting coupon: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }
}
