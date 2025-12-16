<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'image'
    ];

    public function userAssignments()
    {
        return $this->morphMany(UserProductAssignment::class, 'assignable');
    }

}
