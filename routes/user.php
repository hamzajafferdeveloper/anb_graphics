<?php

use App\Http\Controllers\Frontend\CustomizerController;
use App\Http\Controllers\User\CouponController;
use App\Http\Controllers\User\ProductController;




use Illuminate\Support\Facades\Route;

Route::prefix('user')->middleware(['auth', 'role:user,admin_user'])->name('user.')->group(function () {
    Route::get('products', [ProductController::class, 'index'])->name('products');
    Route::get('coupons', [CouponController::class, 'index'])->name('coupons');

    Route::prefix('customizer')->name('customizer.')->group(function () {
        Route::get('/{slug}', [CustomizerController::class, 'index'])->name('index');
        // Route::get('/{slug}', [CustomizerController::class, 'show'])->name('show');
    });
});
