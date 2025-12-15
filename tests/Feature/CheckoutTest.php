<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to create a checkout session', function () {
    $res = $this->postJson('/cart/checkout');
    $res->assertStatus(401);
});

it('returns error when cart is empty', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $res = $this->postJson('/cart/checkout');
    $res->assertStatus(400);
});

it('creates user_products when webhook received', function () {
    $user = User::factory()->create();
    $product = \App\Models\Product::factory()->create();

    // add item to user's cart
    \App\Models\CartItem::create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    // simulate Stripe checkout.session.completed webhook payload
    $payload = [
        'id' => 'evt_test_webhook',
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'id' => 'cs_test',
                'payment_intent' => 'pi_test_123',
                'metadata' => [
                    'user_id' => (string) $user->id,
                ],
            ],
        ],
    ];

    $res = $this->postJson('/stripe/webhook', $payload);
    $res->assertStatus(200);

    $this->assertDatabaseHas('user_products', [
        'user_id' => $user->id,
        'product_id' => $product->id,
        'stripe_payment_id' => 'pi_test_123',
    ]);
});
