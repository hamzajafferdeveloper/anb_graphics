<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductImageFile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductImageFileController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_slug' => 'required|exists:products,slug',
                'file' => 'required|file|max:5120',
            ]);

            $product = Product::where('slug', $request->product_slug)->first();

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();

            $path = FileHelper::store($file, 'product_files');

            ProductImageFile::create([
                'product_id' => $product->id,
                'name' => Str::slug(
                    pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)
                ),
                'path' => $path,
                'extention' => $extension,
            ]);

            return redirect()->back()->with('success', 'File Store Successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request, string $id)
    {
        try {
            $image = ProductImage::findOrFail($id);

            FileHelper::delete($image->path);

            $image->delete();

            return redirect()->back()->with('success', 'File deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
