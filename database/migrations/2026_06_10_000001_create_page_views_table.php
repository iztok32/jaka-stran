<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_id')->index();
            $table->string('path');
            $table->string('type')->index();
            $table->string('viewable_type')->nullable();
            $table->unsignedBigInteger('viewable_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['viewable_type', 'viewable_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
