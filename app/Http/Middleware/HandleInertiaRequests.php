<?php

namespace App\Http\Middleware;

use App\Models\NavigationItem;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'permissions' => $user->permissions,
                    'config' => $user->config ?? [],
                    'unread_notifications_count' => \App\Models\Notification::where('type', 'portal')
                        ->where(function ($q) use ($user) {
                            $q->where('recipient_id', $user->id)
                              ->orWhereNull('recipient_id');
                        })
                        ->whereNull('read_at')
                        ->count(),
                ]) : null,
            ],
            'locale' => app()->getLocale(),
            'availableLocales' => config('app.available_locales'),
            'availableColorThemes' => config('app.available_color_themes'),
            'navigation' => [
                'configs' => \App\Models\NavigationConfig::all()->pluck('label', 'type'),
                'blocks' => \App\Models\NavigationConfig::orderBy('sort_order')->get()->map(function ($config) use ($user) {
                    // Get all navigation items first
                    $items = NavigationItem::where('type', $config->type)
                        ->whereNull('parent_id')
                        ->where('is_active', true)
                        ->when($user, function ($query) use ($user) {
                            $userRoleSlugs = $user->roles->pluck('slug')->toArray();

                            $query->where(function ($q) use ($user) {
                                // Check permission field
                                $q->whereNull('permission')
                                  ->orWhereIn('permission', $user->permissions);
                            })->where(function ($q) use ($userRoleSlugs) {
                                // Check allowed_roles field
                                $q->whereNull('allowed_roles');

                                // Check if user's role slugs are in allowed_roles array
                                foreach ($userRoleSlugs as $slug) {
                                    $q->orWhereRaw("allowed_roles::jsonb @> ?", [json_encode([$slug])]);
                                }
                            });
                        })
                        ->with(['children' => function($query) use ($user) {
                            $query->where('is_active', true)
                                ->when($user, function ($q) use ($user) {
                                    $userRoleSlugs = $user->roles->pluck('slug')->toArray();

                                    $q->where(function ($sq) use ($user) {
                                        // Check permission field
                                        $sq->whereNull('permission')
                                           ->orWhereIn('permission', $user->permissions);
                                    })->where(function ($sq) use ($userRoleSlugs) {
                                        // Check allowed_roles field
                                        $sq->whereNull('allowed_roles');

                                        // Check if user's role slugs are in allowed_roles array
                                        foreach ($userRoleSlugs as $slug) {
                                            $sq->orWhereRaw("allowed_roles::jsonb @> ?", [json_encode([$slug])]);
                                        }
                                    });
                                })
                                ->orderBy('sort_order');
                        }])
                        ->orderBy('sort_order')
                        ->get();

                    // Filter items based on module.view permission
                    if ($user) {
                        $items = $items->filter(function ($item) use ($user) {
                            return $this->canViewNavigationItem($item, $user);
                        })->map(function ($item) use ($user) {
                            // Also filter children
                            if ($item->children) {
                                $item->children = $item->children->filter(function ($child) use ($user) {
                                    return $this->canViewNavigationItem($child, $user);
                                });
                            }
                            return $item;
                        })->values();
                    }

                    return [
                        'type' => $config->type,
                        'group' => $config->group,
                        'label' => $config->label,
                        'items' => $items,
                    ];
                }),
            ],
            'translations' => array_merge(
                is_file(base_path("lang/".app()->getLocale().".json"))
                    ? json_decode(file_get_contents(base_path("lang/".app()->getLocale().".json")), true)
                    : [],
                // Add PHP-based translations if needed, but here we focus on JSON for React
            ),
        ];
    }

    /**
     * Check if user can view a navigation item based on module.view permission
     */
    protected function canViewNavigationItem($item, $user): bool
    {
        // If item has no URL, allow it (it's just a separator or heading)
        if (!$item->url) {
            return true;
        }

        // Get the module for this navigation item URL
        $url = ltrim($item->url, '/');
        $module = Module::where('web_root', $url)
            ->orWhere('web_root', '/' . $url)
            ->first();

        // If no module found, allow item (not module-based navigation)
        if (!$module) {
            return true;
        }

        // Check if user has module.view permission
        $viewPermission = $module->name . '.view';

        // Convert permissions to array if it's a Collection
        $permissions = is_array($user->permissions) ? $user->permissions : $user->permissions->toArray();

        return in_array($viewPermission, $permissions);
    }
}
