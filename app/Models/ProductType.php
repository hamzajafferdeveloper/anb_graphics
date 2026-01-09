<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    protected $fillable = [
        'name',
        'slug',
    ];

    public function userAssignments()
    {
        return $this->morphMany(UserProductAssignment::class, 'assignable');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
