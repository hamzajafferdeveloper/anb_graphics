<?php

use App\Http\Controllers\Frontend\ProductController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\CheckoutController;
use App\Http\Controllers\Frontend\CouponController;
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



Route::get('/coupon-price', [CouponController::class, 'couponPage'])->name('couponPricePage');

// Coupon purchase routes
Route::prefix('coupons')->name('coupon.')->middleware('auth')->group(function () {
    Route::get('/all', [CouponController::class, 'index'])->name('index');
    Route::post('/{coupon}/purchase', [CouponController::class, 'purchase'])->name('purchase');
    Route::get('/purchase/success', [CouponController::class, 'success'])->name('purchase.success');
    Route::get('/purchase/cancel', [CouponController::class, 'cancel'])->name('purchase.cancel');
});

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
