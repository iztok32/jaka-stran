<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType    = 'string';
    public $incrementing  = false;

    protected $fillable = ['key', 'type', 'value', 'group'];

    private static array $cache = [];

    public static function get(string $key, mixed $default = null): mixed
    {
        if (array_key_exists($key, static::$cache)) {
            return static::$cache[$key];
        }

        $setting = static::find($key);
        if (! $setting) {
            return $default;
        }

        $value = match ($setting->type) {
            'boolean' => (bool) $setting->value,
            'integer' => (int) $setting->value,
            'json'    => json_decode($setting->value, true),
            default   => $setting->value,
        };

        static::$cache[$key] = $value;
        return $value;
    }

    public static function getBool(string $key, bool $default = false): bool
    {
        $setting = static::find($key);
        return $setting ? (bool) $setting->value : $default;
    }

    public static function set(string $key, mixed $value): void
    {
        $setting = static::find($key);
        if (! $setting) {
            return;
        }

        $stored = match ($setting->type) {
            'boolean' => $value ? '1' : '0',
            'json'    => json_encode($value),
            default   => (string) $value,
        };

        $setting->update(['value' => $stored]);
        unset(static::$cache[$key]);
    }

    public static function getWatermarkUrl(): ?string
    {
        $path = static::get('watermark_image');
        if (! $path) {
            return null;
        }
        return Storage::url($path);
    }

    public static function clearCache(): void
    {
        static::$cache = [];
    }
}
