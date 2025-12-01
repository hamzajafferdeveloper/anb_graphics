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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
