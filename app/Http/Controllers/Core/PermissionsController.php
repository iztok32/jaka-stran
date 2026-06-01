<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PermissionsController extends Controller
{
    // Standard permissions that cannot be deleted
    private const STANDARD_PERMISSIONS = ['view', 'create', 'edit', 'delete', 'is_global'];

    public function index()
    {
        // Get all modules from database
        $allModules = Module::orderBy('name')->get();

        // Get all permissions
        $permissions = Permission::orderBy('module')->orderBy('slug')->get();

        // Group permissions by module
        $permissionsGrouped = $permissions->groupBy('module');

        // Build grouped permissions array, including modules without permissions
        $groupedPermissions = $allModules->map(function ($module) use ($permissionsGrouped) {
            $modulePermissions = $permissionsGrouped->get($module->name, collect());

            return [
                'module' => $module->name,
                'web_root' => $module->web_root,
                'description' => $module->description,
                'standard' => $modulePermissions->filter(function ($permission) {
                    $action = Str::after($permission->slug, '.');
                    return in_array($action, self::STANDARD_PERMISSIONS);
                })->values(),
                'custom' => $modulePermissions->filter(function ($permission) {
                    $action = Str::after($permission->slug, '.');
                    return !in_array($action, self::STANDARD_PERMISSIONS);
                })->values(),
            ];
        })->values();

        return Inertia::render('Core/Permissions/Index', [
            'groupedPermissions' => $groupedPermissions,
            'standardPermissions' => self::STANDARD_PERMISSIONS,
            'allModules' => $allModules->pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:permissions,slug',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $action = Str::slug(Str::lower($validated['name']));
            $validated['slug'] = $validated['module'] . '.' . $action;
        }

        // Validate that this is not a standard permission being created manually
        $action = Str::after($validated['slug'], '.');
        if (in_array($action, self::STANDARD_PERMISSIONS)) {
            return back()->withErrors(['slug' => 'Cannot create standard permissions manually.']);
        }

        Permission::create($validated);

        return redirect()->back()->with('success', 'Permission created successfully');
    }

    public function update(Request $request, Permission $permission)
    {
        // Check if this is a standard permission
        $action = Str::after($permission->slug, '.');
        if (in_array($action, self::STANDARD_PERMISSIONS)) {
            return back()->withErrors(['error' => 'Cannot edit standard permissions.']);
        }

        $validated = $request->validate([
            'module' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:permissions,slug,' . $permission->id,
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $action = Str::slug(Str::lower($validated['name']));
            $validated['slug'] = $validated['module'] . '.' . $action;
        }

        $permission->update($validated);

        return redirect()->back()->with('success', 'Permission updated successfully');
    }

    public function destroy(Permission $permission)
    {
        // Check if this is a standard permission
        $action = Str::after($permission->slug, '.');
        if (in_array($action, self::STANDARD_PERMISSIONS)) {
            return back()->withErrors(['error' => 'Cannot delete standard permissions. Use toggle instead.']);
        }

        // Set is_active to false before soft delete
        $permission->update(['is_active' => false]);
        $permission->delete();

        return redirect()->back()->with('success', 'Permission deleted successfully');
    }

    /**
     * Toggle standard permission (create if doesn't exist, toggle is_active if exists)
     */
    public function toggleStandard(Request $request)
    {
        $validated = $request->validate([
            'module' => 'required|string|max:255',
            'action' => 'required|string|in:' . implode(',', self::STANDARD_PERMISSIONS),
        ]);

        $module = $validated['module'];
        $action = $validated['action'];
        $slug = $module . '.' . $action;

        $permission = Permission::where('slug', $slug)->first();

        if ($permission) {
            // Toggle is_active
            $permission->update(['is_active' => !$permission->is_active]);
            $status = $permission->is_active ? 'activated' : 'deactivated';
            return redirect()->back()->with('success', "Permission {$status} successfully");
        } else {
            // Create new permission
            Permission::create([
                'name' => ucfirst(str_replace('_', ' ', $action)) . ' ' . ucfirst($module),
                'slug' => $slug,
                'module' => $module,
                'is_active' => true,
            ]);
            return redirect()->back()->with('success', 'Permission created and activated successfully');
        }
    }

    /**
     * Delete standard permission (soft delete)
     */
    public function deleteStandard(Request $request)
    {
        $validated = $request->validate([
            'module' => 'required|string|max:255',
            'action' => 'required|string|in:' . implode(',', self::STANDARD_PERMISSIONS),
        ]);

        $slug = $validated['module'] . '.' . $validated['action'];
        $permission = Permission::where('slug', $slug)->first();

        if ($permission) {
            $permission->delete();
            return redirect()->back()->with('success', 'Permission deleted successfully');
        }

        return redirect()->back()->with('info', 'Permission not found');
    }
}
