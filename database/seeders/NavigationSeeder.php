<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NavigationSeeder extends Seeder
{
    public function run(): void
    {
        $navigationItems = [
            // Header items
            [
                'id' => 1,
                'parent_id' => null,
                'type' => 'header',
                'title_key' => 'Acme Inc',
                'url' => '/dashbord',
                'icon' => 'GalleryVerticalEnd',
                'metadata' => json_encode(['plan' => 'Enterprise', 'is_logo' => true]),
                'sort_order' => 1,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Main items
            [
                'id' => 2,
                'parent_id' => null,
                'type' => 'main',
                'title_key' => 'Obveščanje',
                'url' => '/notifications',
                'icon' => 'Bell',
                'metadata' => json_encode([]),
                'sort_order' => 1,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Settings items
            [
                'id' => 10,
                'parent_id' => null,
                'type' => 'settings',
                'title_key' => 'Uporabniki',
                'url' => '/users',
                'icon' => 'Users',
                'metadata' => json_encode([]),
                'sort_order' => 0,
                'is_active' => true,
                'permission' => 'users.view',
                'allowed_roles' => json_encode(['superadmin', 'admin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'parent_id' => null,
                'type' => 'settings',
                'title_key' => 'Uporabniške skupine',
                'url' => '/roles-group',
                'icon' => 'group',
                'metadata' => json_encode([]),
                'sort_order' => 3,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => json_encode(['superadmin', 'admin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 12,
                'parent_id' => null,
                'type' => 'settings',
                'title_key' => 'Pravice uporabniških skupin',
                'url' => '/roles-permissions',
                'icon' => 'ShieldCheck',
                'metadata' => json_encode([]),
                'sort_order' => 2,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => json_encode(['superadmin', 'admin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 13,
                'parent_id' => null,
                'type' => 'settings',
                'title_key' => 'Ureja SuperAdmin',
                'url' => null,
                'icon' => 'Shield',
                'metadata' => json_encode([]),
                'sort_order' => 4,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => json_encode(['superadmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Children of "Ureja SuperAdmin" (parent_id: 13)
            [
                'id' => 14,
                'parent_id' => 13,
                'type' => 'settings',
                'title_key' => 'Navigacija',
                'url' => '/navigation',
                'icon' => 'SquareMenu',
                'metadata' => json_encode([]),
                'sort_order' => 0,
                'is_active' => true,
                'permission' => 'navigation.view',
                'allowed_roles' => json_encode(['superadmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 15,
                'parent_id' => 13,
                'type' => 'settings',
                'title_key' => 'Moduli',
                'url' => '/modules-list',
                'icon' => 'Puzzle',
                'metadata' => json_encode([]),
                'sort_order' => 4,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => json_encode(['superadmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 16,
                'parent_id' => 13,
                'type' => 'settings',
                'title_key' => 'Pravice modulov',
                'url' => '/permissions',
                'icon' => 'UserKey',
                'metadata' => json_encode([]),
                'sort_order' => 3,
                'is_active' => true,
                'permission' => null,
                'allowed_roles' => json_encode(['superadmin']),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Users items
            [
                'id' => 20,
                'parent_id' => null,
                'type' => 'users',
                'title_key' => 'Moj profil',
                'url' => '/profile',
                'icon' => 'UserRoundPen',
                'metadata' => json_encode([]),
                'sort_order' => 0,
                'is_active' => true,
                'permission' => 'users.view',
                'allowed_roles' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($navigationItems as $item) {
            DB::table('navigation_items')->insert($item);
        }

        // Reset the sequence for PostgreSQL
        $maxId = DB::table('navigation_items')->max('id');
        DB::statement("SELECT setval('navigation_items_id_seq', COALESCE($maxId, 1), true)");

        $this->command->info('Navigation items seeded successfully!');
    }
}
