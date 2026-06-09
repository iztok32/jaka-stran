<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Gallery-level tags
        Schema::create('gallery_tag', function (Blueprint $table) {
            $table->foreignId('gallery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['gallery_id', 'tag_id']);
        });

        // Photo-level tags (media table from Spatie)
        Schema::create('photo_tag', function (Blueprint $table) {
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['media_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_tag');
        Schema::dropIfExists('gallery_tag');
        Schema::dropIfExists('tags');
    }
};
