<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductBrand;
use App\Models\ProductType;
use Illuminate\Support\Facades\Log;

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
                'filters' => $request->only(['q', 'category', 'brand', 'type', 'min_price', 'max_price']),
                'categories' => $categories,
                'brands' => $brands,
                'types' => $types,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return Inertia::render('frontend/product/index', [
                'products' => [],
                'productsPagination' => null,
                'filters' => [],
                'categories' => [],
                'brands' => [],
                'types' => [],
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        try {
            $product = Product::with(['images', 'brand', 'category', 'type', 'template.parts'])->where('slug', $slug)->firstOrFail();

            if (!$product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            return Inertia::render('frontend/product/show', [
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            Log::error('Fail to get Show Product Page ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
