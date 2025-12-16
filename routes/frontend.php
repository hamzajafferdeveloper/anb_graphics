<?php

use App\Http\Controllers\Frontend\ProductController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\CheckoutController;
use App\Http\Controllers\Frontend\StripeWebhookController;
use App\Models\Coupon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/{slug}', [ProductController::class, 'show'])->name('show');
});

Route::get('/coupon-price', function () {
       $coupons = Coupon::where('status', 1) // Only active coupons
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('frontend/coupon-price/index', [
        'coupons' => $coupons
    ]);
})->name('couponPricePage');

// Cart pages and API
Route::get('/cart', function () {
    return Inertia::render('frontend/cart/index');
})->name('cart.index');

Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/items', [CartController::class, 'index'])->name('items.index');
    Route::post('/items', [CartController::class, 'store'])->middleware('auth')->name('items.store');
    Route::delete('/items/{id}', [CartController::class, 'destroy'])->middleware('auth')->name('items.destroy');
    Route::post('/checkout', [CheckoutController::class, 'create'])->middleware('auth')->name('checkout');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');
});
