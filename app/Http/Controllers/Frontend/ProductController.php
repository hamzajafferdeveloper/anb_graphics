<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Product::with(['images', 'brand', 'category', 'type']);

            // Filters
            if ($request->filled('q')) {
                $q = $request->input('q');
                $query->where(function ($qbuilder) use ($q) {
                    $qbuilder->where('name', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%")
                        ->orWhere('keywords', 'like', "%{$q}%");
                });
            }

            if ($request->filled('category')) {
                $query->where('product_category_id', $request->input('category'));
            }
            if ($request->filled('brand')) {
                $query->where('product_brand_id', $request->input('brand'));
            }
            if ($request->filled('type')) {
                $query->where('product_type_id', $request->input('type'));
            }

            if ($request->filled('min_price')) {
                $query->where('price', '>=', (float) $request->input('min_price'));
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', (float) $request->input('max_price'));
            }

            $perPage = 12;
            $products = $query->orderBy('created_at', 'desc')->paginate($perPage)->appends($request->query());

            // Get the current user
            $user = auth()->user();

            // Transform products to include canBuy flag
            $transformedProducts = $products->getCollection()->map(function ($product) use ($user) {
                return array_merge($product->toArray(), [
                    'canBuy' => $user ? can_buy_product($product, $user) : true,
                ]);
            });

            // Set the transformed collection back to paginator
            $products->setCollection($transformedProducts);

            $categories = ProductCategory::orderBy('name')->get(['id', 'name']);
            $brands = ProductBrand::orderBy('name')->get(['id', 'name']);
            $types = ProductType::orderBy('name')->get(['id', 'name']);

            return Inertia::render('frontend/product/index', [
                'products' => $products->items(),
                'productsPagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                ],
                'categories' => $categories,
                'brands' => $brands,
                'types' => $types,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error fetching products: '.$e->getMessage());

            return Inertia::render('frontend/product/index', [
                'products' => [],
                'productsPagination' => null,
                'categories' => [],
                'brands' => [],
                'types' => [],
                'error' => 'Failed to load products. Please try again later.',
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        try {
            $product = Product::with(['images', 'brand', 'category', 'type', 'template.parts'])->where('slug', $slug)->firstOrFail();

            $canBuy = can_buy_product($product, auth()->user());

            if (! $product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            return Inertia::render('frontend/product/show', [
                'product' => $product,
                'canBuy' => $canBuy,
            ]);
        } catch (\Exception $e) {
            Log::error('Fail to get Show Product Page '.$e->getMessage());

            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
