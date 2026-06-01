<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NavigationConfigSeeder extends Seeder
{
    public function run(): void
    {
        $configs = [
            ['id' => 1, 'type' => 'main', 'label' => 'Delo', 'is_visible' => true, 'group' => 'main', 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'type' => 'header', 'label' => 'Glava (header)', 'is_visible' => true, 'group' => 'header', 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'type' => 'settings', 'label' => 'Administracija', 'is_visible' => true, 'group' => 'settings', 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'type' => 'users', 'label' => 'Uporabnikov meni', 'is_visible' => true, 'group' => 'users', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($configs as $config) {
            DB::table('navigation_configs')->insert($config);
        }

        // Reset the sequence for PostgreSQL
        $maxId = DB::table('navigation_configs')->max('id');
        DB::statement("SELECT setval('navigation_configs_id_seq', COALESCE($maxId, 1), true)");

        $this->command->info('Navigation configs seeded successfully!');
    }
}
