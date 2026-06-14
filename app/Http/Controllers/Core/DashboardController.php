<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Models\Gallery;
use App\Models\PageView;
use App\Models\PhotoView;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DashboardController extends Controller
{
    public function index()
    {
        $since30 = now()->subDays(29)->startOfDay();

        // Daily page views / unique visitors for the last 30 days
        $dailyViews = PageView::where('created_at', '>=', $since30)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        for ($i = 0; $i < 30; $i++) {
            $date = $since30->copy()->addDays($i)->toDateString();
            $row  = $dailyViews->get($date);
            $chart[] = [
                'date'     => $date,
                'views'    => (int) ($row->views ?? 0),
                'visitors' => (int) ($row->visitors ?? 0),
            ];
        }

        $totalViews30    = array_sum(array_column($chart, 'views'));
        $totalVisitors30 = PageView::where('created_at', '>=', $since30)->distinct('visitor_id')->count('visitor_id');
        $totalViewsAll   = PageView::count();
        $totalVisitorsAll = PageView::distinct('visitor_id')->count('visitor_id');

        // Views by page type (last 30 days)
        $viewsByType = PageView::where('created_at', '>=', $since30)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        // Top galleries by views (last 30 days)
        $topGalleryViews = PageView::where('type', 'gallery')
            ->where('created_at', '>=', $since30)
            ->selectRaw('viewable_id, COUNT(*) as views')
            ->groupBy('viewable_id')
            ->orderByDesc('views')
            ->limit(5)
            ->get();

        $galleries = Gallery::whereIn('id', $topGalleryViews->pluck('viewable_id'))
            ->get(['id', 'title', 'slug'])
            ->keyBy('id');

        $topGalleries = $topGalleryViews->map(fn ($row) => [
            'id'    => $row->viewable_id,
            'title' => $galleries[$row->viewable_id]->title ?? '—',
            'slug'  => $galleries[$row->viewable_id]->slug ?? null,
            'views' => (int) $row->views,
        ])->values();

        // Top viewed photos (last 30 days)
        $topPhotoViews = PhotoView::where('created_at', '>=', $since30)
            ->selectRaw('media_id, COUNT(*) as views')
            ->groupBy('media_id')
            ->orderByDesc('views')
            ->limit(8)
            ->get();

        $mediaMap = Media::whereIn('id', $topPhotoViews->pluck('media_id'))->get()->keyBy('id');

        $photoGalleryIds = $mediaMap->pluck('model_id')->unique();
        $photoGalleries  = Gallery::whereIn('id', $photoGalleryIds)->pluck('title', 'id');

        $topPhotos = $topPhotoViews->map(function ($row) use ($mediaMap, $photoGalleries) {
            $media = $mediaMap[$row->media_id] ?? null;

            return [
                'id'            => $row->media_id,
                'thumb'         => $media?->getUrl('thumb') ?: $media?->getUrl(),
                'gallery_title' => $media ? ($photoGalleries[$media->model_id] ?? null) : null,
                'views'         => (int) $row->views,
            ];
        })->filter(fn ($p) => $p['thumb'])->values();

        // Contact inquiries
        $inquiriesTotal    = ContactInquiry::count();
        $inquiries30       = ContactInquiry::where('created_at', '>=', $since30)->count();
        $inquiriesByStatus = ContactInquiry::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentInquiries = ContactInquiry::orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'name', 'email', 'project_type', 'status', 'created_at'])
            ->map(fn ($i) => [
                'id'           => $i->id,
                'name'         => $i->name,
                'email'        => $i->email,
                'project_type' => $i->project_type,
                'status'       => $i->status,
                'created_at'   => $i->created_at?->toISOString(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'views_30d'     => $totalViews30,
                'visitors_30d'  => $totalVisitors30,
                'views_total'   => $totalViewsAll,
                'visitors_total' => $totalVisitorsAll,
                'inquiries_total' => $inquiriesTotal,
                'inquiries_30d'   => $inquiries30,
                'inquiries_new'   => (int) ($inquiriesByStatus['new'] ?? 0),
            ],
            'chart'              => $chart,
            'viewsByType'        => $viewsByType,
            'topGalleries'       => $topGalleries,
            'topPhotos'          => $topPhotos,
            'inquiriesByStatus'  => $inquiriesByStatus,
            'recentInquiries'    => $recentInquiries,
        ]);
    }
}
