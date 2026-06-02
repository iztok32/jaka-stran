<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GalleriesController extends Controller
{
    public function index()
    {
        $galleries = Gallery::with(['author', 'media'])
            ->orderByRaw('gallery_date DESC NULLS LAST')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Gallery $g) => $this->formatGallery($g));

        return Inertia::render('Core/Galleries/Index', [
            'galleries' => $galleries,
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
        ]);

        $validated['user_id'] = auth()->id();

        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        Gallery::create($validated);

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
        ]);

        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        $gallery->update($validated);

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

        // Verify the photo belongs to this gallery
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
            ];
        }

        return response()->json(['photos' => $uploaded]);
    }

    public function deletePhoto(Gallery $gallery, int $mediaId)
    {
        $media = $gallery->media()->findOrFail($mediaId);
        $media->delete();

        // Clear cover if the deleted photo was the cover
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

    private function formatGallery(Gallery $gallery): array
    {
        $photos = $gallery->getMedia('photos')->map(fn ($m) => [
            'id'      => $m->id,
            'url'     => $m->getUrl(),
            'thumb'   => $m->getUrl('thumb') ?: $m->getUrl(),
            'preview' => $m->getUrl('preview') ?: $m->getUrl(),
            'name'    => $m->file_name,
            'order'   => $m->order_column,
        ])->sortBy('order')->values();

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
            'created_at'     => $gallery->created_at?->toISOString(),
            'updated_at'     => $gallery->updated_at?->toISOString(),
            'deleted_at'     => $gallery->deleted_at?->toISOString(),
            'author'         => [
                'id'   => $gallery->author?->id,
                'name' => $gallery->author?->name,
            ],
            'cover'       => $coverPhoto['thumb'] ?? $coverPhoto['url'] ?? null,
            'cover_thumb' => $coverPhoto['thumb'] ?? null,
            'photos'      => $photos,
            'photos_count' => $photos->count(),
        ];
    }
}
