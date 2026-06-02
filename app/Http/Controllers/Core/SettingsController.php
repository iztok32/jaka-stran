<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key');

        return Inertia::render('Core/Settings/Index', [
            'settings' => [
                'watermark_image'    => Setting::getWatermarkUrl(),
                'watermark_enabled'  => (bool) ($settings['watermark_enabled']?->value ?? false),
                'watermark_opacity'  => (int)  ($settings['watermark_opacity']?->value ?? 30),
                'watermark_position' => $settings['watermark_position']?->value ?? 'bottom-right',
            ],
        ]);
    }

    public function update(Request $request, string $key)
    {
        $setting = Setting::findOrFail($key);

        $value = match ($setting->type) {
            'boolean' => $request->boolean('value') ? '1' : '0',
            'integer' => (string) $request->integer('value'),
            default   => $request->string('value')->toString(),
        };

        $setting->update(['value' => $value]);
        Setting::clearCache();

        return back()->with('success', 'Setting saved.');
    }

    public function storeWatermark(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,webp|max:5120',
        ]);

        // Delete old watermark
        $old = Setting::get('watermark_image');
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('image')->store('settings', 'public');
        Setting::set('watermark_image', $path);

        return back()->with('success', 'Watermark uploaded.');
    }

    public function deleteWatermark()
    {
        $path = Setting::get('watermark_image');
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        Setting::set('watermark_image', null);

        return back()->with('success', 'Watermark deleted.');
    }
}
