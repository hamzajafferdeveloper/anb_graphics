<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImageFile extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'path',
        'extention',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
