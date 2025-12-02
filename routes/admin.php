<?php

use App\Http\Controllers\Admin\AppSettingController;
use App\Http\Controllers\Admin\ProductBrandController;
use App\Http\Controllers\Admin\ProductCategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->name('admin.')->group(function () {

    // App Settings Route
    Route::prefix('app-settings')->name('settings.')->group(function () {
        Route::get('/', [AppSettingController::class, 'index'])->name('index');
        Route::post('/store', [AppSettingController::class, 'store'])->name('store');
    });


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

        // Product Brand Routes
        Route::prefix('brand')->name('brand.')->group(function () {
            Route::get('/', [ProductBrandController::class, 'index'])->name('index');
            Route::get('/get-categories', [ProductBrandController::class, 'getBrands'])->name('get-brands');
            Route::post('/', [ProductBrandController::class, 'store'])->name('store');
            Route::put('/{id}', [ProductBrandController::class, 'update'])->name('update');
            Route::delete('/{id}', [ProductBrandController::class, 'destroy'])->name('destroy');
        });


    });
});
