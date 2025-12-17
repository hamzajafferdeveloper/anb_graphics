<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

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

    protected $casts = [
        'price' => 'float',
        'discount' => 'float',
    ];

    public function userCoupons(): HasMany
    {
        return $this->hasMany(UserCoupon::class);
    }

    public function isActive(): bool
    {
        return $this->status && Carbon::parse($this->expires_in)->isFuture();
    }

    public function isAvailable(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        if ($this->limit === null) {
            return true;
        }

        return $this->userCoupons()->count() < $this->limit;
    }
}
