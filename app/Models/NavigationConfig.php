<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NavigationConfig extends Model
{
    protected $fillable = [
        'type',
        'label',
        'group',
        'sort_order',
        'is_visible',
    ];
}
