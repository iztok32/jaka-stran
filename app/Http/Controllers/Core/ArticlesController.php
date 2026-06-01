<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ArticlesController extends Controller
{
    public function index()
    {
        $articles = Article::with(['author', 'media'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Article $a) => $this->formatArticle($a));

        return Inertia::render('Core/Articles/Index', [
            'articles' => $articles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => 'nullable|string|max:255|unique:articles,slug',
            'excerpt'      => 'nullable|string|max:1000',
            'content'      => 'nullable|string',
            'status'       => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_public'    => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $validated['author_id'] = auth()->id();

        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        $article = Article::create($validated);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $article->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return redirect()->back()->with('success', 'Article created successfully.');
    }

    public function update(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => ['nullable', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($article->id)],
            'excerpt'      => 'nullable|string|max:1000',
            'content'      => 'nullable|string',
            'status'       => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_public'    => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if (empty($validated['slug'])) {
            unset($validated['slug']);
        }

        $article->update($validated);

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $article->clearMediaCollection('featured_image');
            $article->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return redirect()->back()->with('success', 'Article updated successfully.');
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return redirect()->back()->with('success', 'Article deleted successfully.');
    }

    public function uploadMedia(Request $request, Article $article)
    {
        $request->validate([
            'file'       => 'required|image|max:10240',
            'collection' => ['nullable', Rule::in(['featured_image', 'gallery'])],
        ]);

        $collection = $request->input('collection', 'gallery');

        if ($collection === 'featured_image') {
            $article->clearMediaCollection('featured_image');
        }

        $media = $article->addMediaFromRequest('file')
            ->toMediaCollection($collection);

        return response()->json([
            'id'  => $media->id,
            'url' => $media->getUrl(),
        ]);
    }

    public function deleteMedia(Article $article, int $mediaId)
    {
        $media = $article->media()->findOrFail($mediaId);
        $media->delete();

        return redirect()->back()->with('success', 'Media deleted successfully.');
    }

    private function formatArticle(Article $article): array
    {
        return [
            'id'             => $article->id,
            'title'          => $article->title,
            'slug'           => $article->slug,
            'excerpt'        => $article->excerpt,
            'content'        => $article->content,
            'status'         => $article->status,
            'is_public'      => $article->is_public,
            'published_at'   => $article->published_at?->toISOString(),
            'created_at'     => $article->created_at?->toISOString(),
            'updated_at'     => $article->updated_at?->toISOString(),
            'deleted_at'     => $article->deleted_at?->toISOString(),
            'author'         => [
                'id'   => $article->author?->id,
                'name' => $article->author?->name,
            ],
            'featured_image'       => $article->getFirstMediaUrl('featured_image'),
            'featured_image_thumb' => $article->getFirstMediaUrl('featured_image', 'thumb')
                ?: $article->getFirstMediaUrl('featured_image'),
            'gallery'        => $article->getMedia('gallery')->map(fn ($m) => [
                'id'    => $m->id,
                'url'   => $m->getUrl(),
                'thumb' => $m->getUrl('thumb') ?: $m->getUrl(),
                'name'  => $m->file_name,
            ]),
        ];
    }
}
