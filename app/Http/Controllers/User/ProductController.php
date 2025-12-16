<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserProduct;
use App\Models\ProductBrand;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $brand = $request->query('brand');
        $perPage = intval($request->query('per_page', 12));

        // Base query: user's purchases that have a product matching filters
        $base = UserProduct::where('user_id', auth()->id())->whereHas('product', function ($query) use ($q, $brand) {
            if ($q) {
                $query->where('name', 'like', "%{$q}%");
            }

            if ($brand && $brand !== 'all') {
                $query->where('product_brand_id', $brand);
            }
        });

        $paginated = $base->with(['product.images', 'product.brand'])->orderByDesc('created_at')->paginate($perPage)->appends($request->except('page', '_token'));

        $items = $paginated->getCollection()->map(function ($up) {
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

        // Brands available in the user's purchases (for filter dropdown)
        $brandIds = DB::table('user_products')
            ->join('products', 'user_products.product_id', '=', 'products.id')
            ->where('user_products.user_id', auth()->id())
            ->pluck('products.product_brand_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $brands = ProductBrand::whereIn('id', $brandIds)->get(['id', 'name']);

        return Inertia::render('user/products', [
            'purchased' => $items,
            'purchased_pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'filters' => [
                'q' => $q,
                'brand' => $brand ?? 'all',
                'per_page' => $perPage,
            ],
            'brands' => $brands,
            'purchased_count' => UserProduct::where('user_id', auth()->id())->count(),
        ]);
    }
}
