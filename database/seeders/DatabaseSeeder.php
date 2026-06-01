<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // POMEMBNO: Vrstni red je kritičen zaradi relacij med tabelami!

        // 1. Modules - mora biti prva, ker permissions reference module
        $this->call(ModulesSeeder::class);

        // 2. Roles and Permissions - mora biti pred Users
        $this->call(RolesAndPermissionsSeeder::class);

        // 3. Users - mora biti po Roles, ker users dobijo role
        $this->call(UsersSeeder::class);

        // 4. Navigation Configs - mora biti pred Navigation Items
        $this->call(NavigationConfigSeeder::class);

        // 5. Navigation Items - zadnja, ker reference permissions in navigation_configs
        $this->call(NavigationSeeder::class);

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('All seeders completed successfully!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('Default users:');
        $this->command->info('  - test@example.com (Administrator)');
        $this->command->info('  - iztok.vozlic@gmail.com (SuperAdministrator)');
        $this->command->info('  Password for all: password');
        $this->command->info('');
    }
}
