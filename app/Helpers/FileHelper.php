<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
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
        $file->storeAs('public/' . $folder, $filename);

        return $folder . '/' . $filename; // Return only file name
    }
}
