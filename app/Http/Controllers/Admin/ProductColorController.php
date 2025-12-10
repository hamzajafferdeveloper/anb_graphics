<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\SlugHelper;
use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProductColorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('admin/color/index');
    }

    public function getColors(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = Color::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->input('search') . '%');
            }

            // Pagination
            $perPage = 10; // change as needed
            $colors = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'colorsPagination' => $colors,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting colors: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'search' => ['nullable', 'string', 'max:255'],
                'page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query = Color::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->input('search') . '%');
            }

            // Pagination
            $perPage = 10; // change as needed
            $colors = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'colorPagination' => $colors,
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Error getting colors: ' . $e->getMessage());
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
                'color' => ['required', 'string', 'max:255'],
            ]);

            $slug = SlugHelper::generate($validated['name'], 'colors', 'slug');

            Color::create([
                'name' => $validated['name'],
                'code' => $validated['color'],
                'slug' => $slug,
            ]);

            return back()->with('success', 'Color created!');

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

            $color = Color::findOrFail($id);

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'color' => ['required', 'string', 'max:255'],
            ]);

            if (!request('name') || $color->name !== $validated['name']) {
                // Name has changed, regenerate slug
                $slug = SlugHelper::generate($validated['name'], 'colors', 'slug');
            }

            $color->name = $validated['name'];
            $color->code = $validated['color'];
            $color->slug = $slug;
            $color->save();

            return back()->with('success', 'Color updated!');

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
            $type = Color::findOrFail($id);

            $type->delete();

            return back()->with('success', 'Color deleted!');
        } catch (\Throwable $e) {

            Log::error($e->getMessage());
            return back()->with('error', 'Something went wrong');
        }
    }
}
