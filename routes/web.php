<?php

use App\Http\Controllers\User\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:admin')->name('dashboard');

    Route::get('user/dashboard', [DashboardController::class, 'dashboard'])->middleware('role:user,admin_user')->name('user.dashboard');
});

// Route::get('create-role', function () {
//     Role::firstOrCreate(['name' => 'admin']);
//     Role::firstOrCreate(['name' => 'user']);
// });

// Route::get('assign-role', function () {

//     $user = App\Models\User::where('email', 'admin@example.com')->first();

//     $user->assignRole('admin');

// });

require __DIR__ . '/frontend.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/user.php';
