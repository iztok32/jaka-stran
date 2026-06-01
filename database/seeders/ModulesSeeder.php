<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulesSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['id' => 1, 'name' => 'dashboard', 'web_root' => '/dashboard', 'description' => 'Dashboard - Pregled sistema in statistika', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'navigation', 'web_root' => '/navigation', 'description' => 'Upravljanje vsebine stranskega menija.', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'roles-group', 'web_root' => '/roles-group', 'description' => 'Uporabniške skupine.', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'permissions', 'web_root' => '/permissions', 'description' => 'Določanje katere uporabniške pravice so na voljo za določen modul.', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'profile', 'web_root' => '/profile', 'description' => 'Urejanje uporabniškega profila, menjava gesla...', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'users', 'web_root' => '/users', 'description' => 'User management - create, edit, delete users and assign roles', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'audit_logs', 'web_root' => '/audit-log', 'description' => 'View and track all system changes - who, when, and what was modified', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'modules-list', 'web_root' => '/modules-list', 'description' => 'Seznam modulov', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'name' => 'roles-permissions', 'web_root' => '/roles-permissions', 'description' => 'Pravice ki so na voljo za posamezne module.', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'name' => 'notifications', 'web_root' => '/notifications', 'description' => 'Pošiljanje obvestil, emailov in SMS sporočil', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'articles', 'web_root' => '/articles', 'description' => 'Upravljanje členkov - dodajanje, urejanje, brisanje in objava HTML vsebine', 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($modules as $module) {
            DB::table('modules')->insert($module);
        }

        // Reset the sequence for PostgreSQL
        $maxId = DB::table('modules')->max('id');
        DB::statement("SELECT setval('modules_id_seq', COALESCE($maxId, 1), true)");

        $this->command->info('Modules seeded successfully!');
    }
}
