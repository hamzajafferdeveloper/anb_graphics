<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Storage;
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


    public function destroyImage(string $id)
    {
        $image = ProductImage::findOrFail($id);
        $productId = $image->product_id;
        $wasPrimary = $image->is_primary;

        // Delete the file from storage
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        // Delete the image record
        $image->delete();

        // If it was primary, set the first remaining image as primary
        if ($wasPrimary) {
            $nextImage = ProductImage::where('product_id', $productId)
                ->orderBy('id') // or orderBy('created_at') if you prefer
                ->first();

            if ($nextImage) {
                $nextImage->is_primary = true;
                $nextImage->save();
            }
        }

        return back()->with('success', 'Image deleted successfully');
    }

    public function destroyFile(string $id)
    {
        $file = ProductImageFile::findOrFail($id);

        if (Storage::disk('public')->exists($file->path)) {
            Storage::disk('public')->delete($file->path);
        }

        $file->delete();

        return back()->with('success', 'File deleted successfully');
    }
}
