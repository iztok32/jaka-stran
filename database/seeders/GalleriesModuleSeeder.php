<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GalleriesModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Insert module
        DB::table('modules')->insertOrIgnore([
            'id'          => 14,
            'name'        => 'galleries',
            'web_root'    => '/galleries',
            'description' => 'Upravljanje fotogalerij - ustvarjanje galerij in nalaganje več fotografij',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Insert permissions
        $permissions = [
            ['id' => 57, 'name' => 'View Galleries',    'slug' => 'galleries.view',      'module' => 'galleries', 'is_active' => true],
            ['id' => 58, 'name' => 'Create Galleries',  'slug' => 'galleries.create',    'module' => 'galleries', 'is_active' => true],
            ['id' => 59, 'name' => 'Edit Galleries',    'slug' => 'galleries.edit',      'module' => 'galleries', 'is_active' => true],
            ['id' => 60, 'name' => 'Delete Galleries',  'slug' => 'galleries.delete',    'module' => 'galleries', 'is_active' => true],
            ['id' => 61, 'name' => 'Is global Galleries', 'slug' => 'galleries.is_global', 'module' => 'galleries', 'is_active' => true],
        ];

        foreach ($permissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // SuperAdmin (1) gets all, Admin (2) gets view/create/edit/delete
        $superAdminIds = [57, 58, 59, 60, 61];
        $adminIds      = [57, 58, 59, 60];

        foreach ($superAdminIds as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
        }
        foreach ($adminIds as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        // Update PostgreSQL sequences
        $maxPerm = DB::table('permissions')->max('id');
        DB::statement("SELECT setval('permissions_id_seq', COALESCE($maxPerm, 1), true)");

        $maxMod = DB::table('modules')->max('id');
        DB::statement("SELECT setval('modules_id_seq', COALESCE($maxMod, 1), true)");

        $this->command->info('Galleries module seeded successfully!');
    }
}
