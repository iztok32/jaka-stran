<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Roles
        $roles = [
            ['id' => 1, 'name' => 'SuperAdministrator', 'slug' => 'superadmin', 'created_by_role_id' => null, 'display_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Administrator', 'slug' => 'admin', 'created_by_role_id' => 1, 'display_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'User', 'slug' => 'user', 'created_by_role_id' => 1, 'display_order' => 2, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insert($role);
        }

        // 2. Create Permissions
        $permissions = [
            // Dashboard
            ['id' => 1, 'name' => 'View Dashboard', 'slug' => 'dashboard.view', 'module' => 'dashboard', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Users
            ['id' => 2, 'name' => 'View Users', 'slug' => 'users.view', 'module' => 'users', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Create Users', 'slug' => 'users.create', 'module' => 'users', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Edit Users', 'slug' => 'users.edit', 'module' => 'users', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Delete Users', 'slug' => 'users.delete', 'module' => 'users', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 27, 'name' => 'View All Users', 'slug' => 'users.is_global', 'module' => 'users', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Navigation
            ['id' => 7, 'name' => 'View Navigation', 'slug' => 'navigation.view', 'module' => 'navigation', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Create Navigation', 'slug' => 'navigation.create', 'module' => 'navigation', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Edit Navigation', 'slug' => 'navigation.edit', 'module' => 'navigation', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Delete Navigation', 'slug' => 'navigation.delete', 'module' => 'navigation', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'Is global Navigation', 'slug' => 'navigation.is_global', 'module' => 'navigation', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Profile
            ['id' => 14, 'name' => 'View Profile', 'slug' => 'profile.view', 'module' => 'profile', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'name' => 'Edit Profile', 'slug' => 'profile.edit', 'module' => 'profile', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'name' => 'Delete Profile', 'slug' => 'profile.delete', 'module' => 'profile', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 18, 'name' => 'Create Profile', 'slug' => 'profile.create', 'module' => 'profile', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],

            // Roles Group
            ['id' => 17, 'name' => 'View Roles-group', 'slug' => 'roles-group.view', 'module' => 'roles-group', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 19, 'name' => 'Create Roles-group', 'slug' => 'roles-group.create', 'module' => 'roles-group', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 20, 'name' => 'Edit Roles-group', 'slug' => 'roles-group.edit', 'module' => 'roles-group', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 21, 'name' => 'Delete Roles-group', 'slug' => 'roles-group.delete', 'module' => 'roles-group', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 26, 'name' => 'Is global Roles-group', 'slug' => 'roles-group.is_global', 'module' => 'roles-group', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Permissions
            ['id' => 22, 'name' => 'View Permissions', 'slug' => 'permissions.view', 'module' => 'permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 23, 'name' => 'Create Permissions', 'slug' => 'permissions.create', 'module' => 'permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 24, 'name' => 'Edit Permissions', 'slug' => 'permissions.edit', 'module' => 'permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 25, 'name' => 'Delete Permissions', 'slug' => 'permissions.delete', 'module' => 'permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 46, 'name' => 'Is global Permissions', 'slug' => 'permissions.is_global', 'module' => 'permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Audit Logs
            ['id' => 28, 'name' => 'View Audit Logs', 'slug' => 'audit_logs.view', 'module' => 'audit_logs', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 29, 'name' => 'View All Audit Logs', 'slug' => 'audit_logs.is_global', 'module' => 'audit_logs', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Notifications
            ['id' => 30, 'name' => 'View Notifications', 'slug' => 'notifications.view', 'module' => 'notifications', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 31, 'name' => 'Send Portal Notifications', 'slug' => 'notifications.send_portal', 'module' => 'notifications', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 32, 'name' => 'Send Email Notifications', 'slug' => 'notifications.send_email', 'module' => 'notifications', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 33, 'name' => 'Send SMS Notifications', 'slug' => 'notifications.send_sms', 'module' => 'notifications', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 34, 'name' => 'Create Notifications', 'slug' => 'notifications.create', 'module' => 'notifications', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],

            // Roles Groups (duplicate module - roles-groups)
            ['id' => 35, 'name' => 'View Roles Groups', 'slug' => 'roles-groups.view', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 36, 'name' => 'Create Roles Groups', 'slug' => 'roles-groups.create', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 37, 'name' => 'Edit Roles Groups', 'slug' => 'roles-groups.edit', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 38, 'name' => 'Delete Roles Groups', 'slug' => 'roles-groups.delete', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 39, 'name' => 'Manage Role Visibility', 'slug' => 'roles-groups.manage-visibility', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 40, 'name' => 'View All Roles Groups', 'slug' => 'roles-groups.is_global', 'module' => 'roles-groups', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Modules List
            ['id' => 41, 'name' => 'View Modules-list', 'slug' => 'modules-list.view', 'module' => 'modules-list', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 42, 'name' => 'Create Modules-list', 'slug' => 'modules-list.create', 'module' => 'modules-list', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 43, 'name' => 'Edit Modules-list', 'slug' => 'modules-list.edit', 'module' => 'modules-list', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 44, 'name' => 'Delete Modules-list', 'slug' => 'modules-list.delete', 'module' => 'modules-list', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 45, 'name' => 'Is global Modules-list', 'slug' => 'modules-list.is_global', 'module' => 'modules-list', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Roles Permissions
            ['id' => 47, 'name' => 'View Roles-permissions', 'slug' => 'roles-permissions.view', 'module' => 'roles-permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 48, 'name' => 'Create Roles-permissions', 'slug' => 'roles-permissions.create', 'module' => 'roles-permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 49, 'name' => 'Edit Roles-permissions', 'slug' => 'roles-permissions.edit', 'module' => 'roles-permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 50, 'name' => 'Delete Roles-permissions', 'slug' => 'roles-permissions.delete', 'module' => 'roles-permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 51, 'name' => 'Is global Roles-permissions', 'slug' => 'roles-permissions.is_global', 'module' => 'roles-permissions', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],

            // Articles
            ['id' => 52, 'name' => 'View Articles', 'slug' => 'articles.view', 'module' => 'articles', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 53, 'name' => 'Create Articles', 'slug' => 'articles.create', 'module' => 'articles', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 54, 'name' => 'Edit Articles', 'slug' => 'articles.edit', 'module' => 'articles', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 55, 'name' => 'Delete Articles', 'slug' => 'articles.delete', 'module' => 'articles', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 56, 'name' => 'Is global Articles', 'slug' => 'articles.is_global', 'module' => 'articles', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insert($permission);
        }

        // 3. Create Permission-Role relationships
        $permissionRoles = [
            // SuperAdmin (role_id: 1) - All permissions
            ['role_id' => 1, 'permission_id' => 1], ['role_id' => 1, 'permission_id' => 2], ['role_id' => 1, 'permission_id' => 3],
            ['role_id' => 1, 'permission_id' => 4], ['role_id' => 1, 'permission_id' => 5], ['role_id' => 1, 'permission_id' => 7],
            ['role_id' => 1, 'permission_id' => 8], ['role_id' => 1, 'permission_id' => 9], ['role_id' => 1, 'permission_id' => 10],
            ['role_id' => 1, 'permission_id' => 13], ['role_id' => 1, 'permission_id' => 14], ['role_id' => 1, 'permission_id' => 15],
            ['role_id' => 1, 'permission_id' => 16], ['role_id' => 1, 'permission_id' => 17], ['role_id' => 1, 'permission_id' => 19],
            ['role_id' => 1, 'permission_id' => 20], ['role_id' => 1, 'permission_id' => 21], ['role_id' => 1, 'permission_id' => 22],
            ['role_id' => 1, 'permission_id' => 23], ['role_id' => 1, 'permission_id' => 24], ['role_id' => 1, 'permission_id' => 25],
            ['role_id' => 1, 'permission_id' => 26], ['role_id' => 1, 'permission_id' => 27], ['role_id' => 1, 'permission_id' => 28],
            ['role_id' => 1, 'permission_id' => 29], ['role_id' => 1, 'permission_id' => 30], ['role_id' => 1, 'permission_id' => 31],
            ['role_id' => 1, 'permission_id' => 32], ['role_id' => 1, 'permission_id' => 33], ['role_id' => 1, 'permission_id' => 41],
            ['role_id' => 1, 'permission_id' => 42], ['role_id' => 1, 'permission_id' => 43], ['role_id' => 1, 'permission_id' => 44],
            ['role_id' => 1, 'permission_id' => 45], ['role_id' => 1, 'permission_id' => 46], ['role_id' => 1, 'permission_id' => 47],
            ['role_id' => 1, 'permission_id' => 48], ['role_id' => 1, 'permission_id' => 49], ['role_id' => 1, 'permission_id' => 50],
            ['role_id' => 1, 'permission_id' => 51], ['role_id' => 1, 'permission_id' => 52], ['role_id' => 1, 'permission_id' => 53],
            ['role_id' => 1, 'permission_id' => 54], ['role_id' => 1, 'permission_id' => 55], ['role_id' => 1, 'permission_id' => 56],

            // Admin (role_id: 2)
            ['role_id' => 2, 'permission_id' => 1], ['role_id' => 2, 'permission_id' => 2], ['role_id' => 2, 'permission_id' => 3],
            ['role_id' => 2, 'permission_id' => 4], ['role_id' => 2, 'permission_id' => 5], ['role_id' => 2, 'permission_id' => 14],
            ['role_id' => 2, 'permission_id' => 15], ['role_id' => 2, 'permission_id' => 17], ['role_id' => 2, 'permission_id' => 19],
            ['role_id' => 2, 'permission_id' => 20], ['role_id' => 2, 'permission_id' => 21], ['role_id' => 2, 'permission_id' => 30],
            ['role_id' => 2, 'permission_id' => 31], ['role_id' => 2, 'permission_id' => 32], ['role_id' => 2, 'permission_id' => 33],
            ['role_id' => 2, 'permission_id' => 47], ['role_id' => 2, 'permission_id' => 49],
            ['role_id' => 2, 'permission_id' => 52], ['role_id' => 2, 'permission_id' => 53],
            ['role_id' => 2, 'permission_id' => 54], ['role_id' => 2, 'permission_id' => 55],

            // User (role_id: 3)
            ['role_id' => 3, 'permission_id' => 1], ['role_id' => 3, 'permission_id' => 14], ['role_id' => 3, 'permission_id' => 30],
            ['role_id' => 3, 'permission_id' => 31], ['role_id' => 3, 'permission_id' => 32],
        ];

        foreach ($permissionRoles as $pr) {
            DB::table('permission_role')->insert($pr);
        }

        // 4. Create Role Visibility
        // Note: Users with a role automatically see users with the same role (handled in User model scope)
        // This table only defines ADDITIONAL visibility beyond same-role visibility
        DB::table('role_visibility')->insert([
            ['role_id' => 2, 'can_see_role_id' => 3, 'created_at' => now(), 'updated_at' => now()], // Admin can also see User role
        ]);

        // Reset the sequences for PostgreSQL
        $maxRoleId = DB::table('roles')->max('id');
        DB::statement("SELECT setval('roles_id_seq', COALESCE($maxRoleId, 1), true)");

        $maxPermissionId = DB::table('permissions')->max('id');
        DB::statement("SELECT setval('permissions_id_seq', COALESCE($maxPermissionId, 1), true)");

        $this->command->info('Roles, Permissions, and relationships seeded successfully!');
    }
}
