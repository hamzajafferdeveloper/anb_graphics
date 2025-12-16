<?php

use App\Models\UserProduct;
use App\Models\UserProductAssignment;

if (! function_exists('can_buy_product')) {
    /**
     * Check if a user can buy a product
     *
     * @param  \App\Models\Product|int  $product  Product model or product ID
     * @param  \App\Models\User|int  $user  User model or user ID
     * @return bool Returns true if user can buy the product, false otherwise
     */
    function can_buy_product($product, $user): bool
    {
        $productId = $product instanceof \App\Models\Product ? $product->id : $product;
        $userId = $user instanceof \App\Models\User ? $user->id : $user;

        // Check if user has already purchased the product
        $hasPurchased = UserProduct::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($hasPurchased) {
            return false;
        }

        // Check if product is assigned to the user
        $isAssigned = UserProductAssignment::where('user_id', $userId)
            ->where('assignable_type', \App\Models\Product::class)
            ->where('assignable_id', $productId)
            ->exists();

        return ! $isAssigned;
    }
}
