<?php

use App\Http\Controllers\User\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('user')->middleware(['auth', 'role:user,admin_user'])->name('user.')->group(function () {
    Route::get('products', [ProductController::class, 'index'])->name('products');
});
