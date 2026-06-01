<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'is_active' => true,
                'gsm_number' => null,
                'avatar' => null,
                'config' => json_encode(['theme' => 'dark', 'colorTheme' => 'blue']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Iztok Vozlič',
                'email' => 'iztok.vozlic@gmail.com',
                'email_verified_at' => null,
                'password' => Hash::make('password'),
                'is_active' => true,
                'gsm_number' => '+38640615371',
                'avatar' => 'avatars/I1gEQT6m5ogfB3bli9IV0eD6s1nz6mLlFdvGhtki.png',
                'config' => json_encode(['theme' => 'dark', 'language' => 'sl', 'colorTheme' => 'blue']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert($user);
        }

        // Assign roles to users (role_user pivot table)
        $roleUsers = [
            ['role_id' => 1, 'user_id' => 3], // Iztok Vozlič = SuperAdmin
            ['role_id' => 2, 'user_id' => 1], // Test User = Administrator
        ];

        foreach ($roleUsers as $roleUser) {
            DB::table('role_user')->insert($roleUser);
        }

        // Reset the sequence for PostgreSQL
        $maxId = DB::table('users')->max('id');
        DB::statement("SELECT setval('users_id_seq', COALESCE($maxId, 1), true)");

        $this->command->info('Users and role assignments seeded successfully!');
    }
}
