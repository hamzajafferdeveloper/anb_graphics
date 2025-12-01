<?php

namespace App\Helpers;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SlugHelper
{
    /**
     * Generate slug — optionally unique for a given table & column.
     *
     * @param string $text
     * @param string|null $table
     * @param string $column
     * @return string
     */
    public static function generate(string $text, string $table = null, string $column = 'slug')
    {
        // Basic slug
        $slug = Str::slug($text);
        $original = $slug;

        // If no uniqueness check is needed
        if (!$table) {
            return $slug;
        }

        // Check database for duplicates
        $count = 1;
        while (DB::table($table)->where($column, $slug)->exists()) {
            $slug = $original . '-' . $count++;
        }

        return $slug;
    }
}
