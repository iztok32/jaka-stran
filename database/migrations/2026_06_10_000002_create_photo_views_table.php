<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_views', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_id')->index();
            $table->unsignedBigInteger('media_id')->index();
            $table->unsignedBigInteger('gallery_id')->nullable()->index();
            $table->timestamp('created_at')->useCurrent();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_views');
    }
};
