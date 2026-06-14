<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Gallery;
use App\Models\PageView;
use App\Models\PhotographerPhoto;
use App\Models\Setting;
use App\Models\Tag;
use App\Support\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index(Request $request)
    {
        PageView::create([
            'visitor_id' => Visitor::id($request),
            'path'       => '/',
            'type'       => 'home',
        ]);

        // Published galleries for the portfolio grid
        $galleries = Gallery::where('status', 'published')
            ->with(['media', 'tags'])
            ->orderByRaw('gallery_date DESC NULLS LAST')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Gallery $g) => $this->formatGallery($g));

        // All tags on published galleries (for filter bar)
        $allTags = Tag::whereHas('galleries', fn ($q) => $q->where('status', 'published'))
            ->orderBy('name')
            ->pluck('name')
            ->all();

        // Hero photos: use ALL galleries (any status) so the hero always has images
        $heroPhotos = Gallery::with('media')
            ->get()
            ->flatMap(function (Gallery $g) {
                $photos = $g->getMedia('photos')->map(fn ($m) => [
                    'url'   => $m->getUrl('preview') ?: $m->getUrl(),
                    'label' => $g->title,
                ])->values();

                // Also add the cover if set
                $coverPhotoId = $g->cover_photo_id;
                if ($coverPhotoId) {
                    $cover = $g->media()->find($coverPhotoId);
                    if ($cover) {
                        $coverEntry = [
                            'url'   => $cover->getUrl('preview') ?: $cover->getUrl(),
                            'label' => $g->title,
                        ];
                        // Put cover first so it has higher chance of being picked
                        return collect([$coverEntry])->merge($photos);
                    }
                }

                return $photos;
            })
            ->values()
            ->all();

        // Real stats from DB (all galleries, not just published)
        $totalGalleries = Gallery::count();
        $totalPhotos    = DB::table('media')
            ->where('model_type', 'App\\Models\\Gallery')
            ->where('collection_name', 'photos')
            ->count();

        $stats = [
            'galleries' => $totalGalleries,
            'photos'    => $totalPhotos,
        ];

        // Hero article
        $heroArticle = Article::where('slug', 'hero-vsebina')
            ->where('status', 'published')
            ->first();

        // About article
        $aboutArticle = Article::where('slug', 'o-fotografu')
            ->where('status', 'published')
            ->first();

        // Services articles (slugs starting with 'storitev-')
        $serviceArticles = Article::where('status', 'published')
            ->where('slug', 'like', 'storitev-%')
            ->orderBy('published_at')
            ->get()
            ->map(fn (Article $a) => [
                'id'            => $a->id,
                'title'         => $a->title,
                'excerpt'       => $a->excerpt,
                'portfolioSlug' => preg_replace('/^storitev-/', '', $a->slug),
            ]);

        $socialLinks = [
            'instagram' => Setting::get('instagram_url'),
            'facebook'  => Setting::get('facebook_url'),
        ];

        $contactInfo = [
            'email' => Setting::get('contact_email'),
            'phone' => Setting::get('contact_phone'),
        ];

        // All photographer photos for the About section cycling
        $photographerPhotos = PhotographerPhoto::orderBy('sort_order')
            ->orderBy('created_at')
            ->get()
            ->map(fn (PhotographerPhoto $p) => $p->url)
            ->values()
            ->all();

        return Inertia::render('Welcome', [
            'galleries'       => $galleries,
            'allTags'         => $allTags,
            'heroPhotos'      => $heroPhotos,
            'stats'           => $stats,
            'socialLinks'          => $socialLinks,
            'contactInfo'          => $contactInfo,
            'photographerPhotos'   => $photographerPhotos,
            'heroArticle'     => $heroArticle ? [
                'title'   => $heroArticle->title,
                'excerpt' => $heroArticle->excerpt,
                'tagline' => strip_tags($heroArticle->content ?? ''),
            ] : null,
            'aboutArticle'    => $aboutArticle ? [
                'title'   => $aboutArticle->title,
                'excerpt' => $aboutArticle->excerpt,
                'content' => $aboutArticle->content,
                'author'  => $aboutArticle->author?->name,
            ] : null,
            'serviceArticles' => $serviceArticles,
        ]);
    }

    private function formatGallery(Gallery $g): array
    {
        $photos = $g->getMedia('photos')->map(fn ($m) => [
            'id'      => $m->id,
            'thumb'   => $m->getUrl('thumb') ?: $m->getUrl(),
            'preview' => $m->getUrl('preview') ?: $m->getUrl(),
            'url'     => $m->getUrl(),
        ])->sortBy(fn ($m) => $m['id'])->values();

        $coverPhotoId = $g->cover_photo_id;
        $coverPhoto   = $coverPhotoId
            ? $photos->firstWhere('id', $coverPhotoId)
            : $photos->first();

        return [
            'id'           => $g->id,
            'title'        => $g->title,
            'slug'         => $g->slug,
            'description'  => $g->description,
            'gallery_date' => $g->gallery_date?->toDateString(),
            'cover'        => $coverPhoto['preview'] ?? $coverPhoto['url'] ?? null,
            'photos_count' => $photos->count(),
            'tags'         => $g->tags->pluck('name')->values()->all(),
            'photos'       => $photos->values(),
        ];
    }
}
