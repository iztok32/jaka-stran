<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Module;
use App\Models\NavigationItem;
use App\Models\NavigationConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RolesPermissionsController extends Controller
{
    // Standard permissions that are common
    private const STANDARD_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'is_global'];

    public function index(Request $request)
    {
        $currentUser = request()->user();

        // Check if current user is superadmin
        $isSuperAdmin = $currentUser->roles->first()?->isSuperAdmin() ?? false;

        // Get visible roles for current user
        $visibleRoles = collect();
        foreach ($currentUser->roles as $userRole) {
            $visibleRoles = $visibleRoles->merge(Role::getVisibleRolesForRole($userRole->id));
        }
        $visibleRoles = $visibleRoles->unique('id');

        // Get role IDs and fetch with proper ordering
        $roleIds = $visibleRoles->pluck('id');
        $roles = Role::whereIn('id', $roleIds)->orderBy('name')->get();

        // Get selected role (first role by default)
        $selectedRoleId = $request->get('role_id', $roles->first()?->id);
        $selectedRole = Role::find($selectedRoleId);

        // Check if user can edit selected role (cannot edit own role unless superadmin)
        $canEditRole = $isSuperAdmin || !$currentUser->roles->contains('id', $selectedRoleId);

        // Get user's permissions (for filtering what they can assign)
        $userPermissionIds = collect();
        if (!$isSuperAdmin) {
            foreach ($currentUser->roles as $userRole) {
                $userPermissionIds = $userPermissionIds->merge($userRole->permissions()->pluck('permissions.id'));
            }
            $userPermissionIds = $userPermissionIds->unique();
        }

        // Get all permissions (filtered by user's permissions if not superadmin)
        if ($isSuperAdmin) {
            $permissions = Permission::orderBy('module')->orderBy('slug')->get();
        } else {
            $permissions = Permission::whereIn('id', $userPermissionIds)->orderBy('module')->orderBy('slug')->get();
        }

        // Group permissions by module
        $permissionsGrouped = $permissions->groupBy('module');

        // Get role's permissions if role is selected
        $rolePermissions = $selectedRole
            ? $selectedRole->permissions()->pluck('permissions.id')->toArray()
            : [];

        // Get only modules that the current user has at least one permission for
        // (superadmin sees all modules)
        if ($isSuperAdmin) {
            $modulesWithPermissions = Module::orderBy('name')->get();
        } else {
            // Get unique module names from current user's permissions
            $userModules = $permissions->pluck('module')->unique();
            $modulesWithPermissions = Module::whereIn('name', $userModules)
                ->orderBy('name')
                ->get();
        }

        // Get navigation items URLs to determine which modules are in sidebar
        $navigationUrls = DB::table('navigation_items')
            ->whereNotNull('url')
            ->pluck('url')
            ->map(function ($url) {
                // Remove leading slash if present
                return ltrim($url, '/');
            })
            ->toArray();

        // Build grouped permissions array - only for modules the user has access to
        $buildPermissionsArray = function ($module) use ($permissionsGrouped, $rolePermissions) {
            $modulePermissions = $permissionsGrouped->get($module->name, collect());

            $standard = $modulePermissions->filter(function ($permission) {
                $action = Str::after($permission->slug, '.');
                return in_array($action, self::STANDARD_PERMISSIONS);
            })->values()->map(function ($permission) use ($rolePermissions) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'module' => $permission->module,
                    'is_active' => $permission->is_active,
                    'is_assigned' => in_array($permission->id, $rolePermissions),
                ];
            });

            $custom = $modulePermissions->filter(function ($permission) {
                $action = Str::after($permission->slug, '.');
                return !in_array($action, self::STANDARD_PERMISSIONS);
            })->values()->map(function ($permission) use ($rolePermissions) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'module' => $permission->module,
                    'is_active' => $permission->is_active,
                    'is_assigned' => in_array($permission->id, $rolePermissions),
                ];
            });

            return [
                'module' => $module->name,
                'web_root' => $module->web_root,
                'description' => $module->description,
                'standard' => $standard,
                'custom' => $custom,
                'assigned_count' => $standard->where('is_assigned', true)->count() + $custom->where('is_assigned', true)->count(),
                'total_count' => $standard->count() + $custom->count(),
            ];
        };

        // Separate modules into sidebar and non-sidebar
        $sidebarModules = collect();
        $nonSidebarModules = collect();

        foreach ($modulesWithPermissions as $module) {
            $webRoot = ltrim($module->web_root, '/');
            if (in_array($webRoot, $navigationUrls)) {
                $sidebarModules->push($module);
            } else {
                $nonSidebarModules->push($module);
            }
        }

        // Build grouped permissions for both categories
        $sidebarPermissions = $sidebarModules->map($buildPermissionsArray)->values();
        $nonSidebarPermissions = $nonSidebarModules->map($buildPermissionsArray)->values();

        // Build navigation preview for selected role
        $navigationPreview = null;
        if ($selectedRole) {
            $navigationPreview = $this->buildNavigationPreview($selectedRole);
        }

        return Inertia::render('Core/RolesPermissions/Index', [
            'roles' => $roles,
            'selectedRole' => $selectedRole,
            'sidebarPermissions' => $sidebarPermissions,
            'nonSidebarPermissions' => $nonSidebarPermissions,
            'navigationPreview' => $navigationPreview,
            'standardPermissions' => self::STANDARD_PERMISSIONS,
            'canEditRole' => $canEditRole,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function togglePermission(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_id' => 'required|exists:permissions,id',
        ]);

        $currentUser = $request->user();
        $role = Role::findOrFail($validated['role_id']);
        $permissionId = $validated['permission_id'];

        // Check if current user is superadmin
        $isSuperAdmin = $currentUser->roles->first()?->isSuperAdmin() ?? false;

        // Prevent editing own role unless superadmin
        if (!$isSuperAdmin && $currentUser->roles->contains('id', $validated['role_id'])) {
            return redirect()->back()->withErrors(['error' => 'You cannot edit your own role permissions']);
        }

        // Check if user has this permission (unless superadmin)
        if (!$isSuperAdmin) {
            $hasPermission = false;
            foreach ($currentUser->roles as $userRole) {
                if ($userRole->permissions()->where('permissions.id', $permissionId)->exists()) {
                    $hasPermission = true;
                    break;
                }
            }

            if (!$hasPermission) {
                return redirect()->back()->withErrors(['error' => 'You cannot assign a permission you do not have']);
            }
        }

        // Check if permission is already assigned
        if ($role->permissions()->where('permission_id', $permissionId)->exists()) {
            // Detach permission
            $role->permissions()->detach($permissionId);
            return redirect()->back()->with('success', 'Permission removed from role');
        } else {
            // Attach permission
            $role->permissions()->attach($permissionId);
            return redirect()->back()->with('success', 'Permission assigned to role');
        }
    }

    /**
     * Build navigation preview for a specific role
     * Shows ALL navigation items that the CURRENT USER can see,
     * with toggle switches to control visibility for the selected role
     */
    protected function buildNavigationPreview($role)
    {
        // Get CURRENT user's permissions
        $currentUser = request()->user();
        $currentUserPermissions = is_array($currentUser->permissions)
            ? $currentUser->permissions
            : $currentUser->permissions->toArray();
        $currentUserRoleSlugs = $currentUser->roles->pluck('slug')->toArray();

        // Get navigation configs and items (based on CURRENT USER, not selected role)
        $blocks = NavigationConfig::orderBy('sort_order')->get()->map(function ($config) use ($currentUser, $currentUserPermissions, $currentUserRoleSlugs) {
            // Get navigation items that CURRENT USER can see
            $items = NavigationItem::where('type', $config->type)
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->when($currentUser, function ($q) use ($currentUserPermissions) {
                    $q->where(function ($sq) use ($currentUserPermissions) {
                        // Check permission field
                        $sq->whereNull('permission')
                           ->orWhereIn('permission', $currentUserPermissions);
                    });
                })
                ->when($currentUser, function ($q) use ($currentUserRoleSlugs) {
                    $q->where(function ($sq) use ($currentUserRoleSlugs) {
                        // Check allowed_roles field
                        $sq->whereNull('allowed_roles');
                        foreach ($currentUserRoleSlugs as $slug) {
                            $sq->orWhereRaw("allowed_roles::jsonb @> ?", [json_encode([$slug])]);
                        }
                    });
                })
                ->with(['children' => function($query) use ($currentUserPermissions, $currentUserRoleSlugs) {
                    $query->where('is_active', true)
                        ->where(function ($sq) use ($currentUserPermissions) {
                            // Check permission field
                            $sq->whereNull('permission')
                               ->orWhereIn('permission', $currentUserPermissions);
                        })
                        ->where(function ($sq) use ($currentUserRoleSlugs) {
                            // Check allowed_roles field
                            $sq->whereNull('allowed_roles');
                            foreach ($currentUserRoleSlugs as $slug) {
                                $sq->orWhereRaw("allowed_roles::jsonb @> ?", [json_encode([$slug])]);
                            }
                        })
                        ->orderBy('sort_order');
                }])
                ->orderBy('sort_order')
                ->get();

            // Filter items based on module.view permission for CURRENT USER
            $items = $items->filter(function ($item) use ($currentUserPermissions) {
                return $this->canViewNavigationItemForRole($item, $currentUserPermissions);
            })->map(function ($item) use ($currentUserPermissions) {
                // Also filter children
                if ($item->children) {
                    $item->children = $item->children->filter(function ($child) use ($currentUserPermissions) {
                        return $this->canViewNavigationItemForRole($child, $currentUserPermissions);
                    });
                }
                return $item;
            })->values();

            return [
                'type' => $config->type,
                'group' => $config->group,
                'label' => $config->label,
                'items' => $items,
            ];
        });

        return [
            'configs' => NavigationConfig::all()->pluck('label', 'type'),
            'blocks' => $blocks,
        ];
    }

    /**
     * Check if role can view a navigation item based on module.view permission
     */
    protected function canViewNavigationItemForRole($item, $rolePermissions): bool
    {
        // If item has no URL, allow it
        if (!$item->url) {
            return true;
        }

        // Get the module for this navigation item URL
        $url = ltrim($item->url, '/');
        $module = Module::where('web_root', $url)
            ->orWhere('web_root', '/' . $url)
            ->first();

        // If no module found, allow item
        if (!$module) {
            return true;
        }

        // Check if role has module.view permission
        $viewPermission = $module->name . '.view';

        return in_array($viewPermission, $rolePermissions);
    }

    /**
     * Toggle navigation item visibility for a role
     */
    public function toggleNavigationVisibility(Request $request)
    {
        $validated = $request->validate([
            'role_slug' => 'required|exists:roles,slug',
            'navigation_item_id' => 'required|exists:navigation_items,id',
        ]);

        $navigationItem = NavigationItem::findOrFail($validated['navigation_item_id']);
        $roleSlug = $validated['role_slug'];

        // Get current allowed_roles
        $allowedRoles = $navigationItem->allowed_roles;

        if ($allowedRoles === null) {
            // Currently visible to ALL roles
            // Toggle OFF: Get all role slugs EXCEPT current role
            $allRoleSlugs = \App\Models\Role::pluck('slug')->toArray();
            $allowedRoles = array_values(array_diff($allRoleSlugs, [$roleSlug]));
        } else {
            // Currently restricted to specific roles
            if (in_array($roleSlug, $allowedRoles)) {
                // Role is in list - remove it (toggle OFF)
                $allowedRoles = array_values(array_diff($allowedRoles, [$roleSlug]));
            } else {
                // Role is NOT in list - add it (toggle ON)
                $allowedRoles[] = $roleSlug;
            }
        }

        // Save (set to null if empty array = nobody can see, which shouldn't happen)
        $navigationItem->allowed_roles = empty($allowedRoles) ? null : $allowedRoles;
        $navigationItem->save();

        return redirect()->back()->with('success', 'Navigation visibility updated');
    }
}
