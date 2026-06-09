<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GalleriesSeeder extends Seeder
{
    public function run(): void
    {
        // Fotografije se naložijo ročno po postavitvi — cover_photo_id ostane null
        $ownerUserId = DB::table('users')->where('email', 'jaka.vozlic@gmail.com')->value('id')
            ?? DB::table('users')->value('id');

        // ── Tags ─────────────────────────────────────────────────────────────

        $tags = [
            ['id' => 1, 'name' => 'dogodek', 'slug' => 'dogodek'],
            ['id' => 2, 'name' => 'Šport',   'slug' => 'sport'],
            ['id' => 3, 'name' => 'Kultura',  'slug' => 'kultura'],
            ['id' => 4, 'name' => 'Koncerti', 'slug' => 'koncerti'],
        ];

        foreach ($tags as $tag) {
            DB::table('tags')->insertOrIgnore(array_merge($tag, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $maxTagId = DB::table('tags')->max('id');
        DB::statement("SELECT setval('tags_id_seq', COALESCE($maxTagId, 1), true)");

        // ── Galleries ─────────────────────────────────────────────────────────

        $galleries = [
            [
                'id'             => 1,
                'title'          => 'Jakov',
                'slug'           => 'jakov-koncert-stožice-2026',
                'description'    => 'Jakov koncert v stožicah 2026',
                'user_id'        => $ownerUserId,
                'status'         => 'published',
                'is_public'      => true,
                'gallery_date'   => '2026-05-08',
                'cover_photo_id' => null,
            ],
            [
                'id'             => 2,
                'title'          => 'Cirque du Soleil',
                'slug'           => 'cirque-du-soleil',
                'description'    => null,
                'user_id'        => $ownerUserId,
                'status'         => 'published',
                'is_public'      => true,
                'gallery_date'   => '2026-04-16',
                'cover_photo_id' => null,
            ],
            [
                'id'             => 3,
                'title'          => 'ICF Canoe slalom world cup',
                'slug'           => 'icf-canoe-slalom-world-cup',
                'description'    => null,
                'user_id'        => $ownerUserId,
                'status'         => 'published',
                'is_public'      => true,
                'gallery_date'   => '2026-05-29',
                'cover_photo_id' => null,
            ],
            [
                'id'             => 4,
                'title'          => 'ICF Canoe slalom world cup',
                'slug'           => 'icf-canoe-slalom-world-cup-1',
                'description'    => null,
                'user_id'        => $ownerUserId,
                'status'         => 'published',
                'is_public'      => true,
                'gallery_date'   => '2026-05-30',
                'cover_photo_id' => null,
            ],
        ];

        foreach ($galleries as $gallery) {
            DB::table('galleries')->insertOrIgnore(array_merge($gallery, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $maxGalId = DB::table('galleries')->max('id');
        DB::statement("SELECT setval('galleries_id_seq', COALESCE($maxGalId, 1), true)");

        // ── Gallery–Tag relationships ─────────────────────────────────────────

        $galleryTags = [
            ['gallery_id' => 1, 'tag_id' => 4], // Jakov → Koncerti
            ['gallery_id' => 2, 'tag_id' => 3], // Cirque du Soleil → Kultura
            ['gallery_id' => 3, 'tag_id' => 2], // ICF WC 1 → Šport
            ['gallery_id' => 4, 'tag_id' => 2], // ICF WC 2 → Šport
        ];

        foreach ($galleryTags as $gt) {
            DB::table('gallery_tag')->insertOrIgnore($gt);
        }

        $this->command->info('Galleries, tags and relationships seeded successfully!');
        $this->command->warn('  ⚠  Fotografije je potrebno naložiti ročno po postavitvi.');
        $this->command->warn('  ⚠  Watermark sliko je potrebno naložiti ročno v Nastavitve.');
    }
}
