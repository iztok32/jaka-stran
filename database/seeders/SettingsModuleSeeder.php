<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsModuleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('modules')->insertOrIgnore([
            'id'          => 15,
            'name'        => 'settings',
            'web_root'    => '/settings',
            'description' => 'Splošne nastavitve aplikacije - vodni žig, prikaz, ...',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $permissions = [
            ['id' => 62, 'name' => 'View Settings', 'slug' => 'settings.view', 'module' => 'settings', 'is_active' => true],
            ['id' => 63, 'name' => 'Edit Settings', 'slug' => 'settings.edit', 'module' => 'settings', 'is_active' => true],
        ];

        foreach ($permissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // SuperAdmin + Admin dobita obe pravici
        foreach ([62, 63] as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        $maxPerm = DB::table('permissions')->max('id');
        DB::statement("SELECT setval('permissions_id_seq', COALESCE($maxPerm, 1), true)");

        $maxMod = DB::table('modules')->max('id');
        DB::statement("SELECT setval('modules_id_seq', COALESCE($maxMod, 1), true)");

        $this->command->info('Settings module seeded successfully!');
    }
}
