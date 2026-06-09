<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\Setting;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function show(string $slug)
    {
        $gallery = Gallery::where('slug', $slug)
            ->where('status', 'published')
            ->with(['media', 'tags'])
            ->firstOrFail();

        $photos = $gallery->getMedia('photos')
            ->map(fn ($m) => [
                'id'      => $m->id,
                'url'     => $m->getUrl(),
                'preview' => $m->getUrl('preview') ?: $m->getUrl(),
                'thumb'   => $m->getUrl('thumb') ?: $m->getUrl(),
            ])
            ->sortBy('id')
            ->values();

        $coverPhotoId = $gallery->cover_photo_id;
        $coverEntry   = $coverPhotoId
            ? $photos->firstWhere('id', $coverPhotoId)
            : $photos->first();

        return Inertia::render('GalleryShow', [
            'gallery' => [
                'id'           => $gallery->id,
                'title'        => $gallery->title,
                'slug'         => $gallery->slug,
                'description'  => $gallery->description,
                'gallery_date' => $gallery->gallery_date?->toDateString(),
                'tags'         => $gallery->tags->pluck('name')->values()->all(),
                'cover'        => $coverEntry['preview'] ?? $coverEntry['url'] ?? null,
                'photos'       => $photos->values(),
            ],
            'watermark' => [
                'enabled'  => (bool) Setting::get('watermark_enabled', false),
                'url'      => Setting::getWatermarkUrl(),
                'opacity'  => (int) Setting::get('watermark_opacity', 30),
                'position' => Setting::get('watermark_position', 'bottom-right'),
            ],
        ]);
    }
}
