<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');

            $table->integer('price');
            $table->integer('sale_price')->nullable();
            $table->date('sale_start_at')->nullable();
            $table->date('sale_end_at')->nullable();

            $table->foreignId('product_type_id')->constrained('product_types')->onDelete('cascade');
            $table->foreignId('product_brand_id')->constrained('product_brands')->onDelete('cascade');
            $table->foreignId('product_category_id')->constrained('product_categories')->onDelete('cascade');

            $table->string('material')->nullable();
            $table->enum('status', ['draft', 'published', 'unpublished'])->default('unpublished')->nullable();
            $table->json('colors')->nullable();
            $table->json('keywords')->nullable();

            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
