<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OwenIt\Auditing\Models\Audit;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request): Response
    {
        $query = Audit::with(['user', 'auditable'])
            ->orderBy('created_at', 'desc');

        // Filter by model type
        if ($request->filled('model_type')) {
            $query->where('auditable_type', $request->model_type);
        }

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search in old and new values
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('old_values', 'like', "%{$search}%")
                    ->orWhere('new_values', 'like', "%{$search}%");
            });
        }

        $audits = $query->paginate(20)->through(function ($audit) {
            return [
                'id' => $audit->id,
                'event' => $audit->event,
                'auditable_type' => class_basename($audit->auditable_type),
                'auditable_id' => $audit->auditable_id,
                'user' => $audit->user ? [
                    'id' => $audit->user->id,
                    'name' => $audit->user->name,
                    'email' => $audit->user->email,
                ] : null,
                'old_values' => $audit->old_values,
                'new_values' => $audit->new_values,
                'url' => $audit->url,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'created_at' => $audit->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Get available model types for filter
        $modelTypes = Audit::select('auditable_type')
            ->distinct()
            ->pluck('auditable_type')
            ->map(fn($type) => [
                'value' => $type,
                'label' => class_basename($type),
            ])
            ->values();

        // Get available event types
        $eventTypes = ['created', 'updated', 'deleted', 'restored'];

        return Inertia::render('Core/AuditLog/Index', [
            'audits' => $audits,
            'filters' => $request->only(['model_type', 'event', 'user_id', 'date_from', 'date_to', 'search']),
            'modelTypes' => $modelTypes,
            'eventTypes' => $eventTypes,
        ]);
    }

    /**
     * Display the specified audit log.
     */
    public function show(Audit $audit): Response
    {
        $audit->load(['user', 'auditable']);

        return Inertia::render('Core/AuditLog/Show', [
            'audit' => [
                'id' => $audit->id,
                'event' => $audit->event,
                'auditable_type' => $audit->auditable_type,
                'auditable_id' => $audit->auditable_id,
                'auditable' => $audit->auditable,
                'user' => $audit->user ? [
                    'id' => $audit->user->id,
                    'name' => $audit->user->name,
                    'email' => $audit->user->email,
                ] : null,
                'old_values' => $audit->old_values,
                'new_values' => $audit->new_values,
                'url' => $audit->url,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'tags' => $audit->tags,
                'created_at' => $audit->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
