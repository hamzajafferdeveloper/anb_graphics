<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CartItem;

class CartController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Only return items for the currently authenticated user.
            if (!$request->user()) {
                return response()->json(['data' => []]);
            }

            $items = CartItem::with('product.images')
                ->where('user_id', $request->user()->id)
                ->get();

            return response()->json(['data' => $items]);
        } catch (\Throwable $e) {
            Log::error('Cart index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch cart items'], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['message' => 'Login required'], 401);
            }

            $attributes = ['product_id' => $request->input('product_id')];

            if ($user) {
                $attributes['user_id'] = $user->id;
            } else {
                $attributes['session_id'] = $request->session()->getId();
            }

            // Check existing
            Log::info('Attempt add to cart', $attributes);
            $existing = CartItem::where('product_id', $attributes['product_id'])
                ->where(function ($q) use ($attributes) {
                    if (isset($attributes['user_id'])) {
                        $q->where('user_id', $attributes['user_id']);
                    }
                    if (isset($attributes['session_id'])) {
                        $q->where('session_id', $attributes['session_id']);
                    }
                })->first();

            if ($existing) {
                Log::info('Product already in cart', ['existing_id' => $existing->id]);
                return response()->json(['message' => 'Product already in cart'], 409);
            }

            $item = CartItem::create(array_merge($attributes, ['quantity' => 1]));
            Log::info('Cart item created', ['id' => $item->id]);

            // load relation for response
            $item->load('product');

            return response()->json(['data' => $item], 201);
        } catch (\Throwable $e) {
            Log::error('Cart add error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to add to cart'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $item = CartItem::findOrFail($id);

            if ($request->user()) {
                if ($item->user_id !== $request->user()->id) {
                    return response()->json(['error' => 'Not allowed'], 403);
                }
            } else {
                if ($item->session_id !== $request->session()->getId()) {
                    return response()->json(['error' => 'Not allowed'], 403);
                }
            }

            $item->delete();

            return response()->json(['message' => 'Removed']);
        } catch (\Throwable $e) {
            Log::error('Cart delete error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to remove item'], 500);
        }
    }
}
