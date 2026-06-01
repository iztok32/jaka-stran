<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Role extends Model implements AuditableContract
{
    use SoftDeletes, Auditable;

    protected $fillable = ['name', 'slug', 'created_by_role_id', 'display_order'];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    // Parent role that created this role
    public function createdByRole()
    {
        return $this->belongsTo(Role::class, 'created_by_role_id');
    }

    // Child roles created by this role
    public function createdRoles()
    {
        return $this->hasMany(Role::class, 'created_by_role_id');
    }

    // Roles that this role can see (through visibility table)
    public function visibleRoles()
    {
        return $this->belongsToMany(Role::class, 'role_visibility', 'role_id', 'can_see_role_id')
            ->withTimestamps();
    }

    // Roles that can see this role
    public function visibleToRoles()
    {
        return $this->belongsToMany(Role::class, 'role_visibility', 'can_see_role_id', 'role_id')
            ->withTimestamps();
    }

    /**
     * Get all roles that the given role can see based on hierarchy rules
     */
    public static function getVisibleRolesForRole($roleId)
    {
        if (!$roleId) {
            return collect();
        }

        $role = static::find($roleId);
        if (!$role) {
            return collect();
        }

        // Check if this is superadmin (no parent)
        if (is_null($role->created_by_role_id)) {
            return static::all();
        }

        // Start with empty collection (role should NOT see itself, only children)
        $visibleRoleIds = collect();

        // Get directly created roles
        $directlyCreated = static::where('created_by_role_id', $roleId)->pluck('id');
        $visibleRoleIds = $visibleRoleIds->merge($directlyCreated);

        // Get roles created by child roles (recursively) if they have create permission
        static::addChildCreatedRoles($roleId, $visibleRoleIds);

        // Get explicitly granted visible roles
        $explicitlyVisible = $role->visibleRoles()->pluck('roles.id');
        $visibleRoleIds = $visibleRoleIds->merge($explicitlyVisible);

        return static::whereIn('id', $visibleRoleIds->unique())->get();
    }

    /**
     * Recursively add roles created by child roles
     */
    private static function addChildCreatedRoles($roleId, &$visibleRoleIds)
    {
        $childRoles = static::where('created_by_role_id', $roleId)->get();

        foreach ($childRoles as $childRole) {
            // Check if child role has permission to create roles
            if ($childRole->hasPermissionTo('roles-groups.create')) {
                $childCreated = static::where('created_by_role_id', $childRole->id)->pluck('id');
                $visibleRoleIds = $visibleRoleIds->merge($childCreated);

                // Recursively check this child's children
                static::addChildCreatedRoles($childRole->id, $visibleRoleIds);
            }
        }
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermissionTo($permissionSlug)
    {
        return $this->permissions()->where('slug', $permissionSlug)->exists();
    }

    /**
     * Check if this is a superadmin role
     */
    public function isSuperAdmin()
    {
        return is_null($this->created_by_role_id);
    }

    /**
     * Scope to filter roles visible to a specific role
     */
    public function scopeVisibleTo($query, $roleId)
    {
        if (!$roleId) {
            return $query->whereRaw('1 = 0'); // Return empty result
        }

        $role = static::find($roleId);
        if (!$role) {
            return $query->whereRaw('1 = 0');
        }

        // Superadmin sees all
        if (is_null($role->created_by_role_id)) {
            return $query;
        }

        $visibleRoles = static::getVisibleRolesForRole($roleId);
        return $query->whereIn('id', $visibleRoles->pluck('id'));
    }
}
