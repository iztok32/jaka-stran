<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->date('gallery_date')->nullable()->after('is_public');
            $table->dropColumn('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropColumn('gallery_date');
            $table->unsignedInteger('sort_order')->default(0)->after('is_public');
        });
    }
};
