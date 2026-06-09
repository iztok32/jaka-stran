<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LandingContentSeeder extends Seeder
{
    public function run(): void
    {
        $authorId = DB::table('users')->value('id');

        // ── Articles ─────────────────────────────────────────────────────────

        // Hero section (naslovnica — uvodni del)
        DB::table('articles')->insertOrIgnore([
            'title'        => 'Lovim akcijo. Ujamem zgodbo.',
            'slug'         => 'hero-vsebina',
            'excerpt'      => 'Dokumentiram trenutke, ki ostanejo. Športna, dokumentarna in komercialna fotografija z avtentičnim občutkom za detajl in atmosfero.',
            'content'      => 'Dostopno za projekte — ' . date('Y'),
            'author_id'    => $authorId,
            'status'       => 'published',
            'is_public'    => true,
            'published_at' => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // O fotografu (sekcija O meni)
        DB::table('articles')->insertOrIgnore([
            'title'        => 'Jaka Vozlič',
            'slug'         => 'o-fotografu',
            'excerpt'      => 'Fotograf z dušo — lovim akcijo, vzdušje in trenutke, ki jih ni mogoče ponoviti. Športna, dokumentarna in komercialna fotografija z avtentičnim pristopom.',
            'content'      => '<p>Sem fotograf z bazo v Sloveniji. Fotografija zame ni le posel — je način, kako vidim svet. Vsak projekt pristopam z radovednostjo, potrpežljivostjo in globokim spoštovanjem do svojih naročnikov.</p><p>Specializiran sem za športno, dokumentarno in komercialno fotografijo. Fotografiram dinamično, ko je potrebna hitrost in ostrina, dokumentarno, ko gre za vzdušje in čustva, ter umetniško, ko trenutek to dopušča. Moje delo je vedno pristno — brez pretiranega poziranja, z visoko mero pozornosti do detajlov in svetlobe.</p><p>Sodelujem s klubi, atleti, organizatorji dogodkov, umetniki, mediji in znamkami — za vsakega naročnika prilagodim pristop glede na potrebe in namen fotografij.</p>',
            'author_id'    => $authorId,
            'status'       => 'published',
            'is_public'    => true,
            'published_at' => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // Storitve (sekcija Storitve) — vrstni red določa published_at
        $services = [
            [
                'slug'         => 'storitev-kultura',
                'title'        => 'Fotografija kulturnih dogodkov',
                'excerpt'      => 'Vsak nastop, razstava ali kulturni dogodek nosi svojo zgodbo — enkratno vzdušje, ki ga ni mogoče ponoviti. Moja naloga je, da ga ujamem, preden izgine.',
                'content'      => '<p>Od intimnih koncertov do velikih festivalov, od gledaliških uprizoritev do razstav — fotografiram z občutkom za trenutek, svetlobo in čustvo. Brez motenja dogajanja, brez umetnega poziranja. Le pristne slike, ki ohranijo spomin na doživetje.</p><p>Sodelujem z organizatorji, umetniki, glasbeniki in mediji — za vsakega prilagodim pristop glede na vrsto dogodka in namen fotografij.</p>',
                'published_at' => now()->subDays(2),
            ],
            [
                'slug'         => 'storitev-sport',
                'title'        => 'Športna fotografija, ki ujame bistvo trenutka',
                'excerpt'      => 'Celovita dokumentacija vašega dogodka. Dinamično, pristno, brez zamujenih trenutkov.',
                'content'      => '<p>Vsak šport ima svoj ritem, svojo energijo in svoje zgodbe. Od napetosti ekipnih dvobojev do osebnih zmag posameznikov — moj objektiv sledi akciji tam, kjer se dogaja.</p><p>Fotografiram dinamično, ko je potrebna hitrost in ostrina, dokumentarno, ko gre za vzdušje in čustva, ter umetniško, ko trenutek to dopušča. Rezultat so fotografije, ki ne samo beležijo dogajanje, ampak ga zares povedo.</p><p>Sodelujem s klubi, atleti, mediji in revijami — za vsakega naročnika prilagodim pristop glede na potrebe in namen uporabe fotografij.</p>',
                'published_at' => now()->subDays(1),
            ],
            [
                'slug'         => 'storitev-komercialno',
                'title'        => 'Editorial & komercialno',
                'excerpt'      => 'Fotografije za revije, blagovne znamke in oglaševalske kampanje z izkušnjami iz različnih projektov.',
                'content'      => '<p>Komercialna fotografija za produktne kampanje, oglaševanje in editorial vsebino. Prilagojen pristop za vsako znamko.</p>',
                'published_at' => now(),
            ],
        ];

        foreach ($services as $s) {
            DB::table('articles')->insertOrIgnore(array_merge($s, [
                'author_id'  => $authorId,
                'status'     => 'published',
                'is_public'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // ── Galleries module (ID 14) + permissions ────────────────────────────

        DB::table('modules')->insertOrIgnore([
            'id'          => 14,
            'name'        => 'galleries',
            'web_root'    => '/galleries',
            'description' => 'Upravljanje fotogalerij - ustvarjanje galerij in nalaganje več fotografij',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $galleriesPermissions = [
            ['id' => 57, 'name' => 'View Galleries',       'slug' => 'galleries.view',      'module' => 'galleries', 'is_active' => true],
            ['id' => 58, 'name' => 'Create Galleries',     'slug' => 'galleries.create',    'module' => 'galleries', 'is_active' => true],
            ['id' => 59, 'name' => 'Edit Galleries',       'slug' => 'galleries.edit',      'module' => 'galleries', 'is_active' => true],
            ['id' => 60, 'name' => 'Delete Galleries',     'slug' => 'galleries.delete',    'module' => 'galleries', 'is_active' => true],
            ['id' => 61, 'name' => 'Is global Galleries',  'slug' => 'galleries.is_global', 'module' => 'galleries', 'is_active' => true],
        ];

        foreach ($galleriesPermissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, ['created_at' => now(), 'updated_at' => now()]));
        }

        foreach ([57, 58, 59, 60, 61] as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
        }
        foreach ([57, 58, 59, 60] as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        // ── Settings module (ID 15) + permissions ─────────────────────────────

        DB::table('modules')->insertOrIgnore([
            'id'          => 15,
            'name'        => 'settings',
            'web_root'    => '/settings',
            'description' => 'Splošne nastavitve aplikacije - vodni žig, prikaz, ...',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $settingsPermissions = [
            ['id' => 62, 'name' => 'View Settings', 'slug' => 'settings.view', 'module' => 'settings', 'is_active' => true],
            ['id' => 63, 'name' => 'Edit Settings',  'slug' => 'settings.edit', 'module' => 'settings', 'is_active' => true],
        ];

        foreach ($settingsPermissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, ['created_at' => now(), 'updated_at' => now()]));
        }

        foreach ([62, 63] as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        // ── Contact inquiries module (ID 16) + permissions ────────────────────

        DB::table('modules')->insertOrIgnore([
            'id'          => 16,
            'name'        => 'contact-inquiries',
            'web_root'    => '/contact-inquiries',
            'description' => 'Pregled in odgovarjanje na kontaktna povpraševanja z landing page.',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $contactPermissions = [
            ['id' => 64, 'name' => 'View Contact Inquiries',   'slug' => 'contact-inquiries.view',   'module' => 'contact-inquiries', 'is_active' => true],
            ['id' => 65, 'name' => 'Edit Contact Inquiries',   'slug' => 'contact-inquiries.edit',   'module' => 'contact-inquiries', 'is_active' => true],
            ['id' => 66, 'name' => 'Delete Contact Inquiries', 'slug' => 'contact-inquiries.delete', 'module' => 'contact-inquiries', 'is_active' => true],
        ];

        foreach ($contactPermissions as $p) {
            DB::table('permissions')->insertOrIgnore(array_merge($p, ['created_at' => now(), 'updated_at' => now()]));
        }

        foreach ([64, 65, 66] as $pid) {
            DB::table('permission_role')->insertOrIgnore(['role_id' => 1, 'permission_id' => $pid]);
            DB::table('permission_role')->insertOrIgnore(['role_id' => 2, 'permission_id' => $pid]);
        }

        // ── Reset PostgreSQL sequences ────────────────────────────────────────

        $maxPerm = DB::table('permissions')->max('id');
        DB::statement("SELECT setval('permissions_id_seq', COALESCE($maxPerm, 1), true)");

        $maxMod = DB::table('modules')->max('id');
        DB::statement("SELECT setval('modules_id_seq', COALESCE($maxMod, 1), true)");

        $maxArt = DB::table('articles')->max('id');
        DB::statement("SELECT setval('articles_id_seq', COALESCE($maxArt, 1), true)");

        $this->command->info('Landing content seeded successfully!');
    }
}
