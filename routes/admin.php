<?php

use App\Http\Controllers\Admin\ProductCategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->name('admin.')->group(function () {

    // Product Related Routes
    Route::prefix('product')->name('product.')->group(function () {

        // Product Category Routes
        Route::prefix('category')->name('category.')->group(function () {
            Route::get('/', [ProductCategoryController::class, 'index'])->name('index');
            Route::get('/get-categories', [ProductCategoryController::class, 'getCategories'])->name('get-categories');
            Route::post('/', [ProductCategoryController::class, 'store'])->name('store');
            Route::put('/{id}', [ProductCategoryController::class, 'update'])->name('update');
            Route::delete('/{id}', [ProductCategoryController::class, 'destroy'])->name('destroy');
        });
    });
});
