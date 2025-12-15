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
