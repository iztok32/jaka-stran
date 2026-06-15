<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\PageView;
use App\Models\Setting;
use App\Support\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $gallery = Gallery::where('slug', $slug)
            ->where('status', 'published')
            ->with(['media', 'tags'])
            ->firstOrFail();

        PageView::create([
            'visitor_id'    => Visitor::id($request),
            'path'          => '/galerija/' . $slug,
            'type'          => 'gallery',
            'viewable_type' => Gallery::class,
            'viewable_id'   => $gallery->id,
            ...Visitor::location($request),
        ]);

        $photos = $gallery->getMedia('photos')
            ->map(fn ($m) => [
                'id'          => $m->id,
                'url'         => $m->getUrl(),
                'preview'     => $m->getUrl('preview') ?: $m->getUrl(),
                'thumb'       => $m->getUrl('thumb') ?: $m->getUrl(),
                'description' => $m->getCustomProperty('description'),
                'tags'        => [],
            ])
            ->sortBy('id')
            ->values();

        if ($photos->isNotEmpty()) {
            $photoTagsMap = DB::table('photo_tag')
                ->join('tags', 'tags.id', '=', 'photo_tag.tag_id')
                ->whereIn('photo_tag.media_id', $photos->pluck('id'))
                ->select('photo_tag.media_id', 'tags.name')
                ->get()
                ->groupBy('media_id');

            $photos = $photos->map(function ($photo) use ($photoTagsMap) {
                $photo['tags'] = ($photoTagsMap[$photo['id']] ?? collect())
                    ->pluck('name')
                    ->values()
                    ->all();
                return $photo;
            });
        }

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
