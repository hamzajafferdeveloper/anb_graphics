<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\SlugHelper;
use App\Http\Controllers\Controller;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class ProductTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/product/type/index');
    }

    public function getTypes(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = ProductType::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->input('search') . '%');
            }

            // Pagination
            $perPage = 10; // change as needed
            $types = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'typesPagination' => $types,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting types: ' . $e->getMessage());
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
            ]);

            $slug = SlugHelper::generate($validated['name'], 'product_types', 'slug');

            ProductType::create([
                'name' => $validated['name'],
                'slug' => $slug,
            ]);

            return back()->with('success', 'Type created!');

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

            $type = ProductType::findOrFail($id);

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ]);

            if (!request('name') || $type->name !== $validated['name']) {
                // Name has changed, regenerate slug
                $slug = SlugHelper::generate($validated['name'], 'product_types', 'slug');
            }

            $type->name = $validated['name'];
            $type->slug = $slug;
            $type->save();

            return back()->with('success', 'Type updated!');

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
            $type = ProductType::findOrFail($id);

            if($type->products()->exists()) {
                return back()->with('error', 'Type has products, cannot delete!');
            }

            $type->delete();

            return back()->with('success', 'Type deleted!');
        } catch (\Throwable $e) {

            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }
}
