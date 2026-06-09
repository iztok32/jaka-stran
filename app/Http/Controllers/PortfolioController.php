<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Gallery;
use App\Models\Setting;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PortfolioController extends Controller
{
    public function show(string $slug)
    {
        $service = Article::where('status', 'published')
            ->where('slug', 'storitev-' . $slug)
            ->firstOrFail();

        $tag = Tag::where('slug', 'portfolio-' . $slug)->first();

        $photos = collect();

        if ($tag) {
            $mediaIds = DB::table('photo_tag')->where('tag_id', $tag->id)->pluck('media_id');
            $publishedGalleryIds = Gallery::where('status', 'published')->pluck('id');

            $photos = Media::query()
                ->whereIn('id', $mediaIds)
                ->where('model_type', Gallery::class)
                ->whereIn('model_id', $publishedGalleryIds)
                ->orderBy('id')
                ->get()
                ->map(fn (Media $m) => [
                    'id'      => $m->id,
                    'url'     => $m->getUrl(),
                    'preview' => $m->getUrl('preview') ?: $m->getUrl(),
                    'thumb'   => $m->getUrl('thumb') ?: $m->getUrl(),
                ])
                ->values();
        }

        return Inertia::render('Portfolio', [
            'portfolio' => [
                'slug'    => $slug,
                'title'   => $service->title,
                'excerpt' => $service->excerpt,
                'photos'  => $photos,
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
