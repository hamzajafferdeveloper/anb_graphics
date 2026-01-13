<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserCoupon extends Model
{
    protected $fillable = [
        'user_id',
        'coupon_id',
        'code',
        'limit',
        'stripe_session_id',
        'used_no',
        'status',
        'price',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
}
