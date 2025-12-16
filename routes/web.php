<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->middleware('role:admin')->name('dashboard');

    Route::get('user/dashboard', function () {
        // Dashboard for normal users (buyers) with quick stats and recent items
        $userId = auth()->id();

        // recent purchases (latest 4)
        $recent = App\Models\UserProduct::where('user_id', $userId)
            ->with(['product.images', 'product.brand'])
            ->orderByDesc('created_at')
            ->take(4)
            ->get()
            ->map(function ($up) {
                return [
                    'id' => $up->id,
                    'product' => $up->product ? [
                        'id' => $up->product->id,
                        'name' => $up->product->name,
                        'slug' => $up->product->slug,
                        'price' => $up->product->price,
                        'sale_price' => $up->product->sale_price,
                        'brand' => $up->product->brand ? ['id' => $up->product->brand->id, 'name' => $up->product->brand->name] : null,
                        'images' => $up->product->images->map(fn ($img) => ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
                    ] : null,
                    'created_at' => $up->created_at ? $up->created_at->toDateTimeString() : null,
                ];
            });

        // total number of purchases and total spent
        $purchasesCount = App\Models\UserProduct::where('user_id', $userId)->count();

        $totalSpent = App\Models\UserProduct::where('user_id', $userId)
            ->with('product')
            ->get()
            ->reduce(function ($carry, $up) {
                if (!$up->product) return $carry;
                $price = $up->product->sale_price ?? $up->product->price ?? 0;
                return $carry + (float) $price;
            }, 0);

        // Recommended products: random products excluding already purchased ones
        $purchasedIds = App\Models\UserProduct::where('user_id', $userId)->pluck('product_id')->filter()->unique()->values()->all();

        $recommended = App\Models\Product::whereNotIn('id', $purchasedIds)
            ->with('images')
            ->inRandomOrder()
            ->take(4)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => $p->price,
                    'sale_price' => $p->sale_price,
                    'images' => $p->images->map(fn ($img) => ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
                ];
            });

        return Inertia::render('user/dashboard', [
            'stats' => [
                'purchases_count' => $purchasesCount,
                'total_spent' => $totalSpent,
            ],
            'recent_purchases' => $recent,
            'recommended' => $recommended,
        ]);
    })->middleware('role:user')->name('user.dashboard');
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
