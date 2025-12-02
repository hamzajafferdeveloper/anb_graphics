<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileHelper
{
    /**
     * Store uploaded file with unique name and return only filename.
     *
     * @param UploadedFile|null $file
     * @param string $folder
     * @return string|null
     */
    public static function store(UploadedFile $file = null, string $folder = 'uploads')
    {
        if (!$file) {
            return null;
        }

        // Generate unique name
        $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();

        // Store in storage/app/public/<folder>/
        Storage::putFileAs("public/$folder", $file, $filename);

        return $folder . '/' . $filename; // Return only file name
    }

    /**
     * Delete file from storage.
     *
     * @param string|null $filePath
     * @return void
     */
    public static function delete(string $filePath = null)
    {
        if ($filePath && Storage::exists("public/$filePath")) {
            Storage::delete("public/$filePath");
        }
    }
}
