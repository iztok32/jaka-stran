<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PhotographerPhoto extends Model
{
    protected $fillable = ['filename', 'original_name', 'usage', 'sort_order'];

    public function getUrlAttribute(): string
    {
        return Storage::url('photographer/' . $this->filename);
    }

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }
}
