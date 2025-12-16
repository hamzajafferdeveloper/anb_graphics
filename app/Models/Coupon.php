<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'coupon',
        'discount',
        'limit',
        'status',
        'expires_in',
        'price',
    ];
}
