<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\FileHelper;
use App\Helpers\SlugHelper;
use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/product/category/index');
    }

    public function getCategories(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = ProductCategory::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->input('search') . '%');
            }

            // Pagination
            $perPage = 2; // change as needed
            $categories = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'categories' => $categories->items(),
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting categories: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'image' => [
                    'nullable',
                    'image',
                    'max:2048',
                    'mimes:jpeg,png,jpg,gif,svg',
                    'dimensions:min_width=200,min_height=200,max_width=700,max_height=700',
                ],
            ]);

            if ($request->hasFile('image')) {
                $validated['image'] = FileHelper::store($request->file('image'), 'categories');
            }

            $slug = SlugHelper::generate($validated['name'], 'product_categories', 'slug');

            ProductCategory::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'image' => $validated['image'] ?? null,
            ]);

            return back()->with('success', 'Category created!');

        } catch (\Throwable $e) {

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }

            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $category = ProductCategory::findOrFail($id);

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'image' => [
                    'nullable',
                    'image',
                    'max:2048',
                    'mimes:jpeg,png,jpg,gif,svg',
                    'dimensions:min_width=200,min_height=200,max_width=700,max_height=700',
                ],
            ]);

            if ($request->hasFile('image')) {
                // Delete old image if exists
                FileHelper::delete($category->image);

                // Store new image
                $validated['image'] = FileHelper::store($request->file('image'), 'categories');
            }

            $slug = SlugHelper::generate($validated['name'], 'product_categories', 'slug', $category->id);

            $category->update([
                'name' => $validated['name'],
                'slug' => $slug,
                'image' => $validated['image'] ?? $category->image,
            ]);

            return back()->with('success', 'Category updated!');

        } catch (\Throwable $e) {

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                throw $e;
            }

            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $category = ProductCategory::findOrFail($id);

            // Delete associated image if exists
            FileHelper::delete($category->image);

            $category->delete();

            return back()->with('success', 'Category deleted!');

        } catch (\Throwable $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }
}
