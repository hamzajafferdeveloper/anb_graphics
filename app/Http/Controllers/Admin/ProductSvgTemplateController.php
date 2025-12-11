<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SvgTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductSvgTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(string $slug)
    {
        try {

            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return redirect()->back()->with('error', 'Product not found');
            }

            if(SvgTemplate::where('product_id', $product->id)->exists()) {
                return redirect()->back()->with('error', 'SVG Template already created');
            }

            return Inertia::render('admin/product/svg-template/create', [
                'product' => $product
            ]);

        } catch (\Exception $e) {
            Log::error('Fail to get creaate SVG Template Page ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
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
