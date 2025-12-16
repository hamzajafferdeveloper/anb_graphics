<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UserProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
        $userId = auth()->id();

        // recent purchases (latest 4)
        $recent = UserProduct::where('user_id', $userId)
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
                        'images' => $up->product->images->map(fn($img) => ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
                    ] : null,
                    'created_at' => $up->created_at ? $up->created_at->toDateTimeString() : null,
                ];
            });

        // total number of purchases and total spent
        $purchasesCount = UserProduct::where('user_id', $userId)->count();

        $totalSpent = UserProduct::where('user_id', $userId)
            ->with('product')
            ->get()
            ->reduce(function ($carry, $up) {
                if (!$up->product)
                    return $carry;
                $price = $up->product->sale_price ?? $up->product->price ?? 0;
                return $carry + (float) $price;
            }, 0);

        // Recommended products: random products excluding already purchased ones
        $purchasedIds = UserProduct::where('user_id', $userId)->pluck('product_id')->filter()->unique()->values()->all();

        $recommended = Product::whereNotIn('id', $purchasedIds)
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
                    'images' => $p->images->map(fn($img) => ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
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
    }
}
