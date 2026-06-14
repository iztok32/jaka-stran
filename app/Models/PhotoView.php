<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhotoView extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'visitor_id',
        'media_id',
        'gallery_id',
    ];
}
