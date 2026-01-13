<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_coupons', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->after('coupon_id');
        });

        // Backfill existing records with current coupon price
        $coupons = \Illuminate\Support\Facades\DB::table('coupons')->get();
        foreach ($coupons as $coupon) {
            \Illuminate\Support\Facades\DB::table('user_coupons')
                ->where('coupon_id', $coupon->id)
                ->update(['price' => $coupon->price]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_coupons', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
