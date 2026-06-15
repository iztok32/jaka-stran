<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'visitor_id',
        'path',
        'country',
        'country_code',
        'type',
        'viewable_type',
        'viewable_id',
    ];

    public function viewable()
    {
        return $this->morphTo();
    }
}
