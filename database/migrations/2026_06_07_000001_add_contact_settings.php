<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->insertOrIgnore([
            ['key' => 'contact_email', 'type' => 'string', 'value' => 'info@jaka.si',    'group' => 'contact', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_phone', 'type' => 'string', 'value' => '+386 41 000 000', 'group' => 'contact', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', ['contact_email', 'contact_phone'])->delete();
    }
};
