<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserProduct;
use App\Models\ProductBrand;
use App\Models\Product;
use App\Models\UserProductAssignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\SubOrder;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $q = $request->query('q');
        $brand = $request->query('brand');
        $perPage = intval($request->query('per_page', 12));
        $isAdminUser = $user->hasRole('admin_user');

        // Base query: user's purchases that have a product matching filters
        $base = SubOrder::where('user_id', $user->id)
            ->whereHas('product', function ($query) use ($q, $brand) {
                if ($q) {
                    $query->where('name', 'like', "%{$q}%");
                }

                if ($brand && $brand !== 'all') {
                    $query->where('product_brand_id', $brand);
                }
            });

        $paginated = $base->with(['product.images', 'product.brand'])
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->appends($request->except('page', '_token'));

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
                    'images' => $up->product->images->map(fn($img) => ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
                ] : null,
                'created_at' => $up->created_at ? $up->created_at->toDateTimeString() : null,
            ];
        });

        $assignedProducts = [];
        $assignedPagination = [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => $perPage,
            'total' => 0,
        ];

        if ($isAdminUser) {
            $assignedQuery = UserProductAssignment::with(['assignable.images', 'assignable.brand'])
                ->where('user_id', $user->id)
                ->where('assignable_type', Product::class) // Only get product assignments
                ->whereHasMorph('assignable', [Product::class], function ($query) use ($q, $brand) {
                    if ($q) {
                        $query->where('name', 'like', "%{$q}%");
                    }
                    if ($brand && $brand !== 'all') {
                        $query->where('product_brand_id', $brand);
                    }
                });
            $assignedPaginated = $assignedQuery->orderByDesc('created_at')
                ->paginate($perPage);
            $assignedProducts = $assignedPaginated->getCollection()->map(function ($assignment) {
                $product = $assignment->assignable;
                return [
                    'id' => $assignment->id,
                    'product' => $product ? [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'sale_price' => $product->sale_price,
                        'brand' => $product->brand ?
                            ['id' => $product->brand->id, 'name' => $product->brand->name] : null,
                        'images' => $product->images->map(fn($img) =>
                            ['id' => $img->id, 'path' => $img->path, 'is_primary' => $img->is_primary])->values(),
                    ] : null,
                    'created_at' => $assignment->created_at ? $assignment->created_at->toDateTimeString() : null,
                ];
            });

            $assignedPagination = [
                'current_page' => $assignedPaginated->currentPage(),
                'last_page' => $assignedPaginated->lastPage(),
                'per_page' => $assignedPaginated->perPage(),
                'total' => $assignedPaginated->total(),
            ];
        }

        // Get all unique brand IDs from both purchased and assigned products
        $purchasedBrandIds = DB::table('sub_orders')
            ->join('products', 'sub_orders.product_id', '=', 'products.id')
            ->where('sub_orders.user_id', $user->id)
            ->pluck('products.product_brand_id');

        $assignedBrandIds = $isAdminUser
            ? DB::table('user_product_assignments')
                ->join('products', function($join) {
                    $join->where('user_product_assignments.assignable_type', 'App\\Models\\Product')
                         ->whereColumn('user_product_assignments.assignable_id', 'products.id');
                })
                ->where('user_product_assignments.user_id', $user->id)
                ->pluck('products.product_brand_id')
            : collect();

        $allBrandIds = $purchasedBrandIds->concat($assignedBrandIds)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $brands = ProductBrand::whereIn('id', $allBrandIds)->get(['id', 'name']);

        return Inertia::render('user/products', [
            'purchased' => $items,
            'purchased_pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'assigned' => $assignedProducts,
            'assigned_pagination' => $assignedPagination,
            'filters' => [
                'q' => $q,
                'brand' => $brand ?? 'all',
                'per_page' => $perPage,
            ],
            'brands' => $brands,
            'purchased_count' => SubOrder::where('user_id', $user->id)->count(),
            'assigned_count' => $isAdminUser ? UserProductAssignment::where('user_id', $user->id)->count() : 0,
            'is_admin_user' => $isAdminUser,
        ]);
    }
}
