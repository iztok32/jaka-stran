<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Gallery extends Model implements HasMedia, AuditableContract
{
    use HasFactory, SoftDeletes, InteractsWithMedia, Auditable;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'user_id',
        'status',
        'is_public',
        'gallery_date',
        'cover_photo_id',
    ];

    protected function casts(): array
    {
        return [
            'is_public'    => 'boolean',
            'gallery_date' => 'date',
        ];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function booted(): void
    {
        static::creating(function (Gallery $gallery) {
            if (empty($gallery->slug)) {
                $gallery->slug = static::generateUniqueSlug($gallery->title);
            }
        });

        static::updating(function (Gallery $gallery) {
            if ($gallery->isDirty('title') && ! $gallery->isDirty('slug')) {
                $gallery->slug = static::generateUniqueSlug($gallery->title, $gallery->id);
            }
        });
    }

    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug     = Str::slug($title);
        $original = $slug;
        $count    = 1;

        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$original}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(300)
            ->performOnCollections('photos');

        $this->addMediaConversion('preview')
            ->width(1200)
            ->performOnCollections('photos');
    }
}
