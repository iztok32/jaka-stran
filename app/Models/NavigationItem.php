<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NavigationItem extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'parent_id',
        'type',
        'title_key',
        'url',
        'icon',
        'metadata',
        'sort_order',
        'is_active',
        'permission',
        'allowed_roles',
    ];

    protected $casts = [
        'metadata' => 'array',
        'allowed_roles' => 'array',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(NavigationItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(NavigationItem::class, 'parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }
}
