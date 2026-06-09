<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // POMEMBNO: Vrstni red je kritičen zaradi relacij med tabelami!

        // 1. Core modules (IDs 1–13, brez galerij/nastavitev/kontakta)
        $this->call(ModulesSeeder::class);

        // 2. Roles + permissions (IDs 1–56, brez galerij/nastavitev/kontakta)
        $this->call(RolesAndPermissionsSeeder::class);

        // 3. Galleries module (ID 14) + permissions (57–61)
        $this->call(GalleriesModuleSeeder::class);

        // 4. Settings module (ID 15) + permissions (62–63)
        $this->call(SettingsModuleSeeder::class);

        // 5. Users — mora biti po Roles
        $this->call(UsersSeeder::class);

        // 6. Navigation Configs — mora biti pred Navigation Items
        $this->call(NavigationConfigSeeder::class);

        // 7. Navigation Items — zadnja core, ker referencira permissions in configs
        $this->call(NavigationSeeder::class);

        // 8. Landing page vsebina:
        //    - Članki (hero, o-fotografu, storitve)
        //    - Contact inquiries module (ID 16) + permissions (64–66)
        $this->call(LandingContentSeeder::class);

        // 9. Galerije, tagi in relacije (brez fotografij — te se naložijo ročno)
        $this->call(GalleriesSeeder::class);

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  Seeding completed successfully!');
        $this->command->info('========================================');
        $this->command->info('');
        $this->command->info('Default users:');
        $this->command->info('  test@example.com         (Administrator)');
        $this->command->info('  iztok.vozlic@gmail.com   (SuperAdministrator)');
        $this->command->info('  jaka.vozlic@gmail.com    (SuperAdministrator)');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->warn('Po postavitvi ročno nastavi:');
        $this->command->warn('  1. Watermark sliko (Nastavitve → Watermark)');
        $this->command->warn('  2. Fotografije v galerijah');
        $this->command->warn('  3. Fotografijo fotografa (Nastavitve → Fotografije fotografa)');
        $this->command->info('');
    }
}
