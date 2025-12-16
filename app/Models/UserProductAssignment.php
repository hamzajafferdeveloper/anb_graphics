<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProductAssignment extends Model
{
    protected $table = 'user_product_assignments';

    protected $fillable = [
        'user_id',
        'assignable_type',
        'assignable_id',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic relation:
     * Product | ProductCategory | ProductType
     */
    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeProducts($query)
    {
        return $query->where('assignable_type', Product::class);
    }

    public function scopeCategories($query)
    {
        return $query->where('assignable_type', ProductCategory::class);
    }

    public function scopeTypes($query)
    {
        return $query->where('assignable_type', ProductType::class);
    }
}
