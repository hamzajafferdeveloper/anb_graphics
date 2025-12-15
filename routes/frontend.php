<?php

use App\Http\Controllers\Frontend\ProductController;
use App\Http\Controllers\Frontend\CartController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



Route::prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/{slug}', [ProductController::class, 'show'])->name('show');
});



// Cart pages and API
Route::get('/cart', function () {
    return Inertia::render('frontend/cart/index');
})->name('cart.index');

Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/items', [CartController::class, 'index'])->name('items.index');
    Route::post('/items', [CartController::class, 'store'])->middleware('auth')->name('items.store');
    Route::delete('/items/{id}', [CartController::class, 'destroy'])->middleware('auth')->name('items.destroy');
});
