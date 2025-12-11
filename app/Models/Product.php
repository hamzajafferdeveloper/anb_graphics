<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        "name",
        "slug",
        "description",
        "price",
        "sale_price",
        "sale_start_at",
        "sale_end_at",
        "product_type_id",
        "product_brand_id",
        "product_category_id",
        "material",
        "colors",
        "keywords",
        "meta",
        "status"
    ];

    protected $casts = [
        'colors' => 'array',
        'keywords' => 'array',
        'meta' => 'array',
        'sale_start_at' => 'datetime',
        'sale_end_at' => 'datetime',
    ];
    public function type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id', 'id');
    }

    public function brand()
    {
        return $this->belongsTo(ProductBrand::class, 'product_brand_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id', 'id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
}
