<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\FileHelper;
use App\Helpers\SlugHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateProductRequest;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\ProductKeyword;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Prompts\Key;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $categories = ProductCategory::all();
            $types = ProductType::all();
            $brands = ProductBrand::all();

            $query = Product::with(['category', 'type', 'brand', 'images']);

            if ($search = request('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($categoryId = request('category_id')) {
                $query->where('product_category_id', $categoryId);
            }

            if ($brandId = request('brand_id')) {
                $query->where('product_brand_id', $brandId);
            }

            if ($typeId = request('type_id')) {
                $query->where('product_type_id', $typeId);
            }

            if ($status = request('status')) {
                $query->where('status', $status);
            }

            // Sorting
            $sortField = request('sort_field', 'created_at');
            $sortOrder = request('sort_order', 'desc');

            $products = $query->orderBy($sortField, $sortOrder)
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('admin/product/index', [
                'products' => $products,
                'categories' => $categories,
                'types' => $types,
                'brands' => $brands
            ]);

        } catch (\Exception $e) {
            Log::error('Fail to get Product Page: ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $categories = ProductCategory::all();
            $types = ProductType::all();
            $brands = ProductBrand::all();
            $colors = Color::all();

            return Inertia::render('admin/product/create', [
                'categories' => $categories,
                'types' => $types,
                'brands' => $brands,
                'all_colors' => $colors
            ]);
        } catch (\Exception $e) {
            Log::error('Fail to get Create Product Page ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProductRequest $request)
    {
        try {

            $slug = SlugHelper::generate($request->name, 'products', 'slug');

            $product = Product::create([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'price' => $request->price,
                'sale_price' => $request->sale_price,
                'sale_start_at' => $request->sale_start_at,
                'sale_end_at' => $request->sale_end_at,
                'product_category_id' => $request->category_id,
                'product_brand_id' => $request->brand_id,
                'product_type_id' => $request->type_id,
                'material' => $request->material,
                'colors' => $request->colors,
                'keywords' => $request->keywords,
                'status' => 'unpublished',
                'meta' => [
                    'title' => $request->meta_title,
                    'description' => $request->meta_description,
                    // 'keywords' => $request->keywords
                ],
            ]);

            /* -------------------------
            SAVE KEYWORDS IN TABLE
            -------------------------- */
            if ($request->has('keywords')) {
                foreach ($request->keywords as $keyword) {

                    if (!$keyword)
                        continue;

                    ProductKeyword::firstOrCreate([
                        'keyword' => $keyword
                    ]);
                }
            }

            /* -------------------------
            SAVE IMAGES IN TABLE
            -------------------------- */
            if ($request->hasFile('images')) {

                $isFirst = true;

                foreach ($request->file('images') as $image) {

                    $path = FileHelper::store($image, 'products');

                    $product->images()->create([
                        'path' => $path,
                        'alt' => $request->name,
                        'is_primary' => $isFirst,
                    ]);

                    $isFirst = false;
                }
            }

            return redirect()->route('admin.product.index')->with('success', 'Product created successfully');

        } catch (\Exception $e) {
            Log::error('Fail to store product ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $slug)
    {
        try {
            $categories = ProductCategory::all();
            $types = ProductType::all();
            $brands = ProductBrand::all();
            $colors = Color::all();

            $data = Product::where('slug', $slug)->with('brand', 'category', 'type', 'images')->first();

            if (!$data) {
                return redirect()->back()->with('error', 'Product not found');
            }


            return Inertia::render('admin/product/edit', [
                'data' => $data,
                'categories' => $categories,
                'types' => $types,
                'brands' => $brands,
                'all_colors' => $colors
            ]);
        } catch (\Exception $e) {
            Log::error('Fail to get Edit Product Page ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CreateProductRequest $request, string $slug)
    {
        try {

            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            /* -------------------------------------------
            UPDATE BASIC PRODUCT FIELDS
            -------------------------------------------- */
            $newSlug = $product->slug;

            if ($product->name != $request->name) {
                $newSlug = SlugHelper::generate($request->name, 'products', 'slug');
            }

            $product->update([
                'name' => $request->name,
                'slug' => $newSlug,
                'description' => $request->description,
                'price' => $request->price,
                'sale_price' => $request->sale_price,
                'sale_start_at' => $request->sale_start_at,
                'sale_end_at' => $request->sale_end_at,
                'product_category_id' => $request->category_id,
                'product_brand_id' => $request->brand_id,
                'product_type_id' => $request->type_id,
                'material' => $request->material,
                'colors' => $request->colors,
                'keywords' => $request->keywords,
                'meta' => [
                    'title' => $request->meta_title,
                    'description' => $request->meta_description,
                ],
            ]);

            /* -------------------------------------------
            SYNC KEYWORDS TABLE
            -------------------------------------------- */
            if ($request->has('keywords')) {
                foreach ($request->keywords as $keyword) {
                    if (!$keyword)
                        continue;

                    ProductKeyword::firstOrCreate([
                        'keyword' => $keyword
                    ]);
                }
            }

            /* -------------------------------------------
            HANDLE EXISTING IMAGES (KEEP / REMOVE)
            -------------------------------------------- */

            $existingIds = $request->input('existing_images', []);

            $product->images()
                ->whereNotIn('id', $existingIds)
                ->each(function ($img) {
                    FileHelper::delete($img->path);
                    $img->delete();
                });

            /* -------------------------------------------
            HANDLE NEW IMAGES UPLOAD
            -------------------------------------------- */

            $hasPrimary = $product->images()->where('is_primary', true)->exists();

            if ($request->hasFile('images')) {

                foreach ($request->file('images') as $image) {

                    $path = FileHelper::store($image, 'products');

                    $product->images()->create([
                        'path' => $path,
                        'alt' => $product->name,
                        'is_primary' => !$hasPrimary, // set first uploaded as primary if missing
                    ]);

                    $hasPrimary = true;
                }
            }

            /* -------------------------------------------
            ENSURE PRIMARY IMAGE EXISTS
            -------------------------------------------- */
            if (!$hasPrimary && $product->images()->exists()) {
                $first = $product->images()->first();
                $first->update(['is_primary' => true]);
            }

            return redirect()
                ->route('admin.product.index')
                ->with('success', 'Product updated successfully');

        } catch (\Exception $e) {
            Log::error('Fail to update product ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function updateStatus(string $slug, string $status)
    {
        try {
            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            $product->status = $status;
            $product->save();

            return redirect()->back()->with('success', 'Product status updated successfully');
        } catch (\Exception $e) {
            Log::error('Fail to update product status: ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $slug)
    {
        try {
            // Find the product by slug
            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            foreach ($product->images as $image) {
                FileHelper::delete($image->path);
            }
            $product->images()->delete();

            $product->delete();

            return redirect()->route('admin.product.index')
                ->with('success', 'Product deleted successfully');
        } catch (\Exception $e) {
            Log::error('Fail to delete product: ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

}
