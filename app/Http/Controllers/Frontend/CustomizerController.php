<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SvgTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomizerController extends Controller
{
    public function index(string $slug)
    {

        try {
            $product = Product::where('slug', $slug)->firstOrFail();
            $template = SvgTemplate::where('product_id', $product->id)->with(['parts', 'product'])->first();

            if (!$template) {
                return redirect()->back()->with('error', 'No template found');
            }

            return Inertia::render('frontend/customizer/index');
        } catch (\Exception $e) {
            Log::error('Fail to get Customizer Page ' . $e->getMessage());
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
