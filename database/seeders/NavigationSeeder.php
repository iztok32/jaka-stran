<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NavigationSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // ── Header ───────────────────────────────────────────────────────
            [
                'id' => 1, 'parent_id' => null, 'type' => 'header',
                'title_key' => 'Jaka Vozlič', 'url' => '/dashbord',
                'icon' => 'GalleryVerticalEnd',
                'metadata' => json_encode(['plan' => 'Photography', 'is_logo' => true]),
                'sort_order' => 1, 'is_active' => true,
                'permission' => null, 'allowed_roles' => null,
            ],

            // ── Main (Delo) ───────────────────────────────────────────────────
            [
                'id' => 21, 'parent_id' => null, 'type' => 'main',
                'title_key' => 'Galerija', 'url' => '/galleries',
                'icon' => 'Images', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'galleries.view', 'allowed_roles' => null,
            ],
            [
                'id' => 23, 'parent_id' => null, 'type' => 'main',
                'title_key' => 'Članki', 'url' => '/articles',
                'icon' => 'Newspaper', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'articles.view', 'allowed_roles' => null,
            ],
            [
                'id' => 24, 'parent_id' => null, 'type' => 'main',
                'title_key' => 'Zahtevki za kontakt', 'url' => '/contact-inquiries',
                'icon' => null, 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'contact-inquiries.view', 'allowed_roles' => null,
            ],
            [
                'id' => 2, 'parent_id' => null, 'type' => 'main',
                'title_key' => 'Obveščanje', 'url' => '/notifications',
                'icon' => 'Bell', 'metadata' => json_encode([]),
                'sort_order' => 1, 'is_active' => true,
                'permission' => null, 'allowed_roles' => null,
            ],

            // ── Settings (Administracija) ─────────────────────────────────────
            [
                'id' => 10, 'parent_id' => null, 'type' => 'settings',
                'title_key' => 'Uporabniki', 'url' => '/users',
                'icon' => 'Users', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'users.view', 'allowed_roles' => json_encode(['superadmin', 'admin']),
            ],
            [
                'id' => 22, 'parent_id' => null, 'type' => 'settings',
                'title_key' => 'Parametri in nastavitve', 'url' => '/settings',
                'icon' => 'FileCog', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'settings.view', 'allowed_roles' => null,
            ],
            [
                'id' => 12, 'parent_id' => null, 'type' => 'settings',
                'title_key' => 'Pravice uporabniških skupin', 'url' => '/roles-permissions',
                'icon' => 'ShieldCheck', 'metadata' => json_encode([]),
                'sort_order' => 2, 'is_active' => true,
                'permission' => null, 'allowed_roles' => json_encode(['superadmin', 'admin']),
            ],
            [
                'id' => 11, 'parent_id' => null, 'type' => 'settings',
                'title_key' => 'Uporabniške skupine', 'url' => '/roles-group',
                'icon' => 'group', 'metadata' => json_encode([]),
                'sort_order' => 3, 'is_active' => true,
                'permission' => null, 'allowed_roles' => json_encode(['superadmin', 'admin']),
            ],
            [
                'id' => 13, 'parent_id' => null, 'type' => 'settings',
                'title_key' => 'Ureja SuperAdmin', 'url' => null,
                'icon' => 'Shield', 'metadata' => json_encode([]),
                'sort_order' => 4, 'is_active' => true,
                'permission' => null, 'allowed_roles' => json_encode(['superadmin']),
            ],
            // Children of "Ureja SuperAdmin" (parent_id: 13)
            [
                'id' => 14, 'parent_id' => 13, 'type' => 'settings',
                'title_key' => 'Navigacija', 'url' => '/navigation',
                'icon' => 'SquareMenu', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'navigation.view', 'allowed_roles' => json_encode(['superadmin']),
            ],
            [
                'id' => 16, 'parent_id' => 13, 'type' => 'settings',
                'title_key' => 'Pravice modulov', 'url' => '/permissions',
                'icon' => 'UserKey', 'metadata' => json_encode([]),
                'sort_order' => 3, 'is_active' => true,
                'permission' => null, 'allowed_roles' => json_encode(['superadmin']),
            ],
            [
                'id' => 15, 'parent_id' => 13, 'type' => 'settings',
                'title_key' => 'Moduli', 'url' => '/modules-list',
                'icon' => 'Puzzle', 'metadata' => json_encode([]),
                'sort_order' => 4, 'is_active' => true,
                'permission' => null, 'allowed_roles' => json_encode(['superadmin']),
            ],

            // ── Users menu ────────────────────────────────────────────────────
            [
                'id' => 20, 'parent_id' => null, 'type' => 'users',
                'title_key' => 'Moj profil', 'url' => '/profile',
                'icon' => 'UserRoundPen', 'metadata' => json_encode([]),
                'sort_order' => 0, 'is_active' => true,
                'permission' => 'users.view', 'allowed_roles' => null,
            ],
        ];

        foreach ($items as $item) {
            DB::table('navigation_items')->insert(array_merge($item, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $maxId = DB::table('navigation_items')->max('id');
        DB::statement("SELECT setval('navigation_items_id_seq', COALESCE($maxId, 1), true)");

        $this->command->info('Navigation items seeded successfully!');
    }
}
