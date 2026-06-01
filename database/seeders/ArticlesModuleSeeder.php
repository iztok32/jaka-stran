<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArticlesModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Insert module
        DB::table('modules')->insertOrIgnore([
            'id'          => 13,
            'name'        => 'articles',
            'web_root'    => '/articles',
            'description' => 'Upravljanje člankov - dodajanje, urejanje, brisanje in objava HTML vsebine',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Insert permissions
        $permissions = [
            ['id' => 52, 'name' => 'View Articles',       'slug' => 'articles.view',      'module' => 'articles', 'is_active' => true],
            ['id' => 53, 'name' => 'Create Articles',     'slug' => 'articles.create',    'module' => 'articles', 'is_active' => true],
            ['id' => 54, 'name' => 'Edit Articles',       'slug' => 'articles.edit',      'module' => 'articles', 'is_active' => true],
            ['id' => 55, 'name' => 'Delete Articles',     'slug' => 'articles.delete',    'module' => 'articles', 'is_active' => true],
            ['id' => 56, 'name' => 'Is global Articles',  'slug' => 'articles.is_global', 'module' => 'articles', 'is_active' => true],
        ];

        foreach ($permissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // SuperAdmin (1) gets all, Admin (2) gets view/create/edit/delete
        $superAdminIds = [52, 53, 54, 55, 56];
        $adminIds      = [52, 53, 54, 55];

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

        $this->command->info('Articles module seeded successfully!');
    }
}
