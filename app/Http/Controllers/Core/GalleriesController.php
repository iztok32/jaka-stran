<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Gallery;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GalleriesController extends Controller
{
    public function index()
    {
        $galleries = Gallery::with(['author', 'media', 'tags'])
            ->orderByRaw('gallery_date DESC NULLS LAST')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Gallery $g) => $this->formatGallery($g));

        $allTags = Tag::orderBy('name')->get(['id', 'name', 'slug']);

        $portfolioServices = Article::where('status', 'published')
            ->where('slug', 'like', 'storitev-%')
            ->orderBy('published_at')
            ->get(['title', 'slug'])
            ->map(fn (Article $a) => [
                'title'       => $a->title,
                'portfolioTag' => 'portfolio-' . preg_replace('/^storitev-/', '', $a->slug),
            ]);

        return Inertia::render('Core/Galleries/Index', [
            'galleries'         => $galleries,
            'allTags'           => $allTags,
            'portfolioServices' => $portfolioServices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => 'nullable|string|max:255|unique:galleries,slug',
            'description'  => 'nullable|string|max:5000',
            'status'       => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_public'    => 'boolean',
            'gallery_date' => 'nullable|date',
            'tags'         => 'nullable|string',
        ]);

        $tagNames = $this->parseTagNames($validated);
        unset($validated['tags']);

        $validated['user_id'] = auth()->id();
        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        $gallery = Gallery::create($validated);

        if ($tagNames !== null) {
            Tag::syncFromNames($tagNames, 'gallery_tag', 'gallery_id', $gallery->id);
        }

        return redirect()->back()->with('success', 'Gallery created successfully.');
    }

    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => ['nullable', 'string', 'max:255', Rule::unique('galleries', 'slug')->ignore($gallery->id)],
            'description'  => 'nullable|string|max:5000',
            'status'       => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_public'    => 'boolean',
            'gallery_date' => 'nullable|date',
            'tags'         => 'nullable|string',
        ]);

        $tagNames = $this->parseTagNames($validated);
        unset($validated['tags']);

        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        $gallery->update($validated);

        if ($tagNames !== null) {
            Tag::syncFromNames($tagNames, 'gallery_tag', 'gallery_id', $gallery->id);
        }

        return redirect()->back()->with('success', 'Gallery updated successfully.');
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();

        return redirect()->back()->with('success', 'Gallery deleted successfully.');
    }

    public function setCover(Request $request, Gallery $gallery)
    {
        $request->validate([
            'media_id' => 'nullable|integer',
        ]);

        $mediaId = $request->input('media_id');

        if ($mediaId && ! $gallery->media()->where('id', $mediaId)->exists()) {
            return response()->json(['error' => 'Photo not found in this gallery'], 422);
        }

        $gallery->update(['cover_photo_id' => $mediaId]);

        return response()->json(['success' => true, 'cover_photo_id' => $mediaId]);
    }

    public function uploadPhotos(Request $request, Gallery $gallery)
    {
        $request->validate([
            'photos'   => 'required|array|min:1',
            'photos.*' => 'required|image|max:102400',
        ]);

        $uploaded = [];
        foreach ($request->file('photos') as $file) {
            $media      = $gallery->addMedia($file)->toMediaCollection('photos');
            $uploaded[] = [
                'id'      => $media->id,
                'url'     => $media->getUrl(),
                'thumb'   => $media->getUrl('thumb') ?: $media->getUrl(),
                'preview' => $media->getUrl('preview') ?: $media->getUrl(),
                'name'    => $media->file_name,
                'order'   => $media->order_column,
                'tags'    => [],
            ];
        }

        return response()->json(['photos' => $uploaded]);
    }

    public function deletePhoto(Gallery $gallery, int $mediaId)
    {
        $media = $gallery->media()->findOrFail($mediaId);
        $media->delete();

        if ($gallery->cover_photo_id === $mediaId) {
            $gallery->update(['cover_photo_id' => null]);
        }

        return redirect()->back()->with('success', 'Photo deleted successfully.');
    }

    public function reorderPhotos(Request $request, Gallery $gallery)
    {
        $request->validate([
            'order'   => 'required|array',
            'order.*' => 'required|integer',
        ]);

        $mediaItems = $gallery->getMedia('photos');

        foreach ($request->order as $position => $mediaId) {
            $media = $mediaItems->firstWhere('id', $mediaId);
            if ($media) {
                $media->order_column = $position + 1;
                $media->save();
            }
        }

        return response()->json(['success' => true]);
    }

    public function syncPhotoTags(Request $request, Gallery $gallery, int $mediaId)
    {
        $request->validate([
            'tags' => 'nullable|string',
        ]);

        // Verify the photo belongs to this gallery
        if (! $gallery->media()->where('id', $mediaId)->exists()) {
            return response()->json(['error' => 'Photo not found'], 422);
        }

        $tagNames = $request->filled('tags')
            ? array_filter(array_map('trim', explode(',', $request->input('tags'))))
            : [];

        Tag::syncFromNames($tagNames, 'photo_tag', 'media_id', $mediaId);

        $tags = DB::table('photo_tag')
            ->join('tags', 'tags.id', '=', 'photo_tag.tag_id')
            ->where('photo_tag.media_id', $mediaId)
            ->select('tags.id', 'tags.name', 'tags.slug')
            ->get();

        return response()->json(['tags' => $tags]);
    }

    private function parseTagNames(array $validated): ?array
    {
        if (! array_key_exists('tags', $validated)) {
            return null;
        }
        $raw = $validated['tags'] ?? '';
        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }

    private function formatGallery(Gallery $gallery): array
    {
        $photos = $gallery->getMedia('photos')->map(fn ($m) => [
            'id'      => $m->id,
            'url'     => $m->getUrl(),
            'thumb'   => $m->getUrl('thumb') ?: $m->getUrl(),
            'preview' => $m->getUrl('preview') ?: $m->getUrl(),
            'name'    => $m->file_name,
            'order'   => $m->order_column,
            'tags'    => [],
        ])->sortBy('order')->values();

        // Load photo tags in one query
        if ($photos->isNotEmpty()) {
            $photoTagsMap = DB::table('photo_tag')
                ->join('tags', 'tags.id', '=', 'photo_tag.tag_id')
                ->whereIn('photo_tag.media_id', $photos->pluck('id'))
                ->select('photo_tag.media_id', 'tags.id', 'tags.name', 'tags.slug')
                ->get()
                ->groupBy('media_id');

            $photos = $photos->map(function ($photo) use ($photoTagsMap) {
                $photo['tags'] = ($photoTagsMap[$photo['id']] ?? collect())
                    ->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug])
                    ->values()
                    ->all();
                return $photo;
            });
        }

        $coverPhotoId = $gallery->cover_photo_id;
        $coverPhoto   = $coverPhotoId ? $photos->firstWhere('id', $coverPhotoId) : $photos->first();

        return [
            'id'             => $gallery->id,
            'title'          => $gallery->title,
            'slug'           => $gallery->slug,
            'description'    => $gallery->description,
            'status'         => $gallery->status,
            'is_public'      => $gallery->is_public,
            'gallery_date'   => $gallery->gallery_date?->toDateString(),
            'cover_photo_id' => $coverPhotoId,
            'tags'           => $gallery->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug])->values(),
            'created_at'     => $gallery->created_at?->toISOString(),
            'updated_at'     => $gallery->updated_at?->toISOString(),
            'deleted_at'     => $gallery->deleted_at?->toISOString(),
            'author'         => [
                'id'   => $gallery->author?->id,
                'name' => $gallery->author?->name,
            ],
            'cover'        => $coverPhoto['thumb'] ?? $coverPhoto['url'] ?? null,
            'cover_thumb'  => $coverPhoto['thumb'] ?? null,
            'photos'       => $photos->values(),
            'photos_count' => $photos->count(),
        ];
    }
}
