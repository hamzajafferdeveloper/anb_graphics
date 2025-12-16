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
        Schema::create('user_product_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Polymorphic assignment target
            $table->string('assignable_type'); // product | category | type
            $table->unsignedBigInteger('assignable_id');

            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes & Constraints
            |--------------------------------------------------------------------------
            */

            // Prevent duplicate assignments
            $table->unique(
                ['user_id', 'assignable_type', 'assignable_id'],
                'user_assignable_unique'
            );

            // Speed up polymorphic lookups
            $table->index(
                ['assignable_type', 'assignable_id'],
                'assignable_lookup_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_product_assignments');
    }
};
