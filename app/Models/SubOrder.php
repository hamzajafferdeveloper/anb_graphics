<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stripe\Climate\Order;

class SubOrder extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'user_id',
        'price',
        'discounted_price',
        'user_coupon_id',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
