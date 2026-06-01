<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RolesGroupController extends Controller
{
    public function index()
    {
        $user = request()->user();
        $userRoleIds = $user->roles->pluck('id');

        // Get visible roles for all user's roles
        $visibleRoles = collect();
        foreach ($userRoleIds as $roleId) {
            $visibleRoles = $visibleRoles->merge(Role::getVisibleRolesForRole($roleId));
        }
        $visibleRoles = $visibleRoles->unique('id');

        // Get role IDs and fetch with relationships
        $roleIds = $visibleRoles->pluck('id');
        $roles = Role::with(['createdByRole', 'createdRoles', 'visibleRoles'])
            ->whereIn('id', $roleIds)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Core/RolesGroup/Index', [
            'roles' => $roles,
            'userRoles' => $user->roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:roles,slug',
            'created_by_role_id' => 'nullable|exists:roles,id',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // If created_by_role_id not provided, use user's first role
        if (empty($validated['created_by_role_id'])) {
            $userRole = $request->user()->roles->first();
            if ($userRole) {
                $validated['created_by_role_id'] = $userRole->id;
            }
        }

        Role::create($validated);

        return redirect()->back()->with('success', 'Role created successfully');
    }

    public function update(Request $request, Role $rolesGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:roles,slug,' . $rolesGroup->id,
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $rolesGroup->update($validated);

        return redirect()->back()->with('success', 'Role updated successfully');
    }

    public function destroy(Role $rolesGroup)
    {
        $rolesGroup->delete();

        return redirect()->back()->with('success', 'Role deleted successfully');
    }

    /**
     * Grant visibility of a role to another role
     */
    public function grantVisibility(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'can_see_role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $canSeeRole = Role::findOrFail($validated['can_see_role_id']);

        // Verify that the current user can see the role they're trying to grant
        $user = $request->user();
        $userCanSeeRole = false;
        foreach ($user->roles as $userRole) {
            $visibleRoles = Role::getVisibleRolesForRole($userRole->id);
            if ($visibleRoles->contains('id', $validated['can_see_role_id'])) {
                $userCanSeeRole = true;
                break;
            }
        }

        if (!$userCanSeeRole) {
            return redirect()->back()->withErrors(['error' => 'You cannot grant visibility to a role you cannot see']);
        }

        // Check if visibility already exists
        if (!$role->visibleRoles()->where('can_see_role_id', $validated['can_see_role_id'])->exists()) {
            $role->visibleRoles()->attach($validated['can_see_role_id']);
        }

        return redirect()->back()->with('success', 'Visibility granted successfully');
    }

    /**
     * Revoke visibility of a role from another role
     */
    public function revokeVisibility(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'can_see_role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $role->visibleRoles()->detach($validated['can_see_role_id']);

        return redirect()->back()->with('success', 'Visibility revoked successfully');
    }

    /**
     * Get available roles that can be granted visibility
     */
    public function getAvailableRoles(Role $role)
    {
        $user = request()->user();

        // Get all roles visible to the current user
        $visibleToUser = collect();
        foreach ($user->roles as $userRole) {
            $visibleToUser = $visibleToUser->merge(Role::getVisibleRolesForRole($userRole->id));
        }
        $visibleToUser = $visibleToUser->unique('id');

        // Get roles that are EXPLICITLY granted via visibility table (not auto-visible)
        $explicitlyGranted = $role->visibleRoles()->pluck('roles.id');

        // Available roles = visible to user - explicitly granted - self
        $available = $visibleToUser
            ->whereNotIn('id', $explicitlyGranted)
            ->where('id', '!=', $role->id);

        return response()->json($available->values());
    }

    /**
     * Reorder roles
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:roles,id',
            'items.*.display_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            Role::where('id', $item['id'])->update(['display_order' => $item['display_order']]);
        }

        return redirect()->back()->with('success', 'Order updated successfully');
    }
}
