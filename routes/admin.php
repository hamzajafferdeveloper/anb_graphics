<?php

use App\Http\Controllers\Admin\AppSettingController;
use App\Http\Controllers\Admin\ProductBrandController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductColorController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductSvgTemplateController;
use App\Http\Controllers\Admin\ProductTypeController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {

    // App Settings Route
    Route::prefix('app-settings')->name('settings.')->group(function () {
        Route::get('/', [AppSettingController::class, 'index'])->name('index');
        Route::post('/store', [AppSettingController::class, 'store'])->name('store');
    });

    // Product Related Routes
    Route::prefix('product')->name('product.')->group(function () {

        // Product Cruds Routes
        Route::get('/index', [ProductController::class, 'index'])->name('index');
        Route::get('/create', [ProductController::class, 'create'])->name('create');
        Route::post('/store', [ProductController::class, 'store'])->name('store');
        Route::get('/edit/{slug}', [ProductController::class, 'edit'])->name('edit');
        Route::put('/update/{slug}', [ProductController::class, 'update'])->name('update');
        Route::delete('/destroy/{slug}', [ProductController::class, 'destroy'])->name('destroy');
        Route::post('/update-status/{slug}/{status}', [ProductController::class, 'updateStatus'])->name('update-status');

        Route::prefix('svg-template')->name('svgTemplate.')->group(function () {
            Route::get('/product={slug}', [ProductSvgTemplateController::class, 'create'])->name('create');
            Route::post('/store/product={slug}', [ProductSvgTemplateController::class, 'store'])->name('store');
            Route::get('/edit/product={slug}', [ProductSvgTemplateController::class, 'edit'])->name('edit');
            Route::put('/update/{id}', [ProductSvgTemplateController::class, 'update'])->name('update');
        });

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

        // Product Type Routes
        Route::prefix('type')->name('type.')->group(function () {
            Route::get('/', [ProductTypeController::class, 'index'])->name('index');
            Route::get('/get-types', [ProductTypeController::class, 'getTypes'])->name('get-types');
            Route::post('/', [ProductTypeController::class, 'store'])->name('store');
            Route::put('/{id}', [ProductTypeController::class, 'update'])->name('update');
            Route::delete('/{id}', [ProductTypeController::class, 'destroy'])->name('destroy');
        });

    });

    // Coupon Routes
    Route::prefix('coupon')->name('coupon.')->group(function () {
        Route::get('/index', [CouponController::class, 'index'])->name('index');
        Route::get('/get-coupons', [CouponController::class, 'getCoupons'])->name('get-coupons');
        Route::post('/store', [CouponController::class, 'store'])->name('store');
        Route::put('/update/{id}', [CouponController::class, 'update'])->name('update');
        Route::delete('/destroy/{id}', [CouponController::class, 'destroy'])->name('destroy');
    });

    // User Routes
    Route::prefix('/user')->name('user.')->group(function () {
        Route::get('/index', [UserController::class, 'index'])->name('index');
        Route::get('/get-users', [UserController::class, 'getUsers'])->name('get-users');
        Route::post('/store', [UserController::class, 'store'])->name('store');
        Route::put('/update/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('/destroy/{id}', [UserController::class, 'destroy'])->name('destroy');
    });

    // Color Routes
    Route::prefix('color')->name('color.')->group(function () {
        Route::get('/', [ProductColorController::class, 'index'])->name('index');
        Route::get('/get-colors', [ProductColorController::class, 'getColors'])->name('get-colors');
        Route::post('/', [ProductColorController::class, 'store'])->name('store');
        Route::put('/{id}', [ProductColorController::class, 'update'])->name('update');
        Route::delete('/{id}', [ProductColorController::class, 'destroy'])->name('destroy');
    });
});
