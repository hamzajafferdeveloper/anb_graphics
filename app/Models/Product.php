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

    public function type()
    {
        return $this->belongsTo(ProductType::class);
    }

    public function brand()
    {
        return $this->belongsTo(ProductBrand::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class);
    }
}
