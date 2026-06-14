<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    public function galleries()
    {
        return $this->belongsToMany(Gallery::class, 'gallery_tag');
    }

    public static function findOrCreateByName(string $name): static
    {
        $slug = Str::slug($name);
        return static::firstOrCreate(
            ['slug' => $slug],
            ['name' => trim($name), 'slug' => $slug]
        );
    }

    public static function syncFromNames(array $names, string $pivotTable, string $foreignKey, int $foreignId): void
    {
        $tagIds = collect($names)
            ->filter(fn ($n) => filled(trim($n)))
            ->map(fn ($n) => static::findOrCreateByName($n)->id)
            ->unique()
            ->values()
            ->all();

        \Illuminate\Support\Facades\DB::table($pivotTable)
            ->where($foreignKey, $foreignId)
            ->delete();

        foreach ($tagIds as $tagId) {
            \Illuminate\Support\Facades\DB::table($pivotTable)->insertOrIgnore([
                $foreignKey => $foreignId,
                'tag_id'    => $tagId,
            ]);
        }
    }

    public static function addFromNames(array $names, string $pivotTable, string $foreignKey, int $foreignId): void
    {
        $tagIds = collect($names)
            ->filter(fn ($n) => filled(trim($n)))
            ->map(fn ($n) => static::findOrCreateByName($n)->id)
            ->unique()
            ->values()
            ->all();

        foreach ($tagIds as $tagId) {
            \Illuminate\Support\Facades\DB::table($pivotTable)->insertOrIgnore([
                $foreignKey => $foreignId,
                'tag_id'    => $tagId,
            ]);
        }
    }
}
