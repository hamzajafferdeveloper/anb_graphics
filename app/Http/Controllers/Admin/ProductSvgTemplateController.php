<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SvgTemplate;
use App\Models\SvgTemplatePart;
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

            if (SvgTemplate::where('product_id', $product->id)->exists()) {
                return redirect()->route('admin.product.svgTemplate.edit', $slug);
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
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'name' => 'required|string',
                'svg' => 'required|string', // assuming raw SVG string
                'parts' => 'required|array',
                'parts.*.id' => 'required|string',
                'parts.*.name' => 'required|string',
                'parts.*.protection' => 'required|boolean',
                'parts.*.isGroup' => 'required|boolean',
                'parts.*.color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
            ]);

            $svgtemplate = SvgTemplate::create([
                'product_id' => $validated['product_id'],
                'name' => $validated['name'],
                'template' => $validated['svg'],
            ]);

            foreach ($validated['parts'] as $part) {
                $type = $part['protection'] ? 'protection' : 'leather';

                SvgTemplatePart::create([
                    'part_id' => $part['id'],
                    'template_id' => $svgtemplate->id,
                    'type' => $type,
                    'name' => $part['name'],
                    'color' => $part['color'],
                    'is_group' => $part['isGroup'],
                ]);
            }

            return redirect()->route('admin.product.index')->with('success', 'Product SVG template added successfully!');
        } catch (\Exception $e) {
            Log::error('Fail to create SVG Template ' . $e->getMessage());
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
        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return redirect()->back()->with('error', 'Product not found');
        }

        $template = SvgTemplate::where('product_id', $product->id)->with('parts')->first();

        if (!$template) {
            return redirect()->route('admin.product.svgTemplate.create', $slug);
        }

        return Inertia::render('admin/product/svg-template/edit', [
            'template' => $template,
            'product' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'svg' => 'required|string', // assuming raw SVG string
            'parts' => 'required|array',
            'parts.*.part_id' => 'required|string',
            'parts.*.name' => 'required|string',
            'parts.*.type' => 'required|string|in:leather,protection',
            'parts.*.is_group' => 'required|boolean',
            'parts.*.color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
        ]);

        $template = SvgTemplate::findOrFail($id);
        $template->name = $validated['name'];
        $template->template = $validated['svg'];
        $template->save();

        SvgTemplatePart::where('template_id', $template->id)->delete();

        foreach ($validated['parts'] as $part) {
            SvgTemplatePart::create([
                'template_id' => $template->id,
                'part_id' => $part['part_id'],
                'type' => $part['type'],
                'name' => $part['name'],
                'color' => $part['color'],
                'is_group' => $part['is_group'],
            ]);
        }

        return redirect()->route('admin.product.index')->with('success', 'Product SVG template updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
