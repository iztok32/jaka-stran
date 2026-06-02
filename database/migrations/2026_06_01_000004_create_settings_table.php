<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('type')->default('string'); // string, boolean, integer, json, file
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'watermark_image', 'type' => 'file',   'value' => null, 'group' => 'watermark', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'watermark_enabled', 'type' => 'boolean', 'value' => '0',  'group' => 'watermark', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'watermark_opacity', 'type' => 'integer', 'value' => '30', 'group' => 'watermark', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'watermark_position', 'type' => 'string', 'value' => 'bottom-right', 'group' => 'watermark', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
