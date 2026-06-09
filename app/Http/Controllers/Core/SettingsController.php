<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\PhotographerPhoto;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key');

        $photographerPhotos = PhotographerPhoto::orderBy('sort_order')
            ->orderBy('created_at')
            ->get()
            ->map(fn (PhotographerPhoto $p) => [
                'id'            => $p->id,
                'url'           => $p->url,
                'original_name' => $p->original_name,
                'usage'         => $p->usage,
                'sort_order'    => $p->sort_order,
            ]);

        return Inertia::render('Core/Settings/Index', [
            'settings' => [
                'watermark_image'    => Setting::getWatermarkUrl(),
                'watermark_enabled'  => (bool) ($settings['watermark_enabled']?->value ?? false),
                'watermark_opacity'  => (int)  ($settings['watermark_opacity']?->value ?? 30),
                'watermark_position' => $settings['watermark_position']?->value ?? 'bottom-right',
                'instagram_url'      => $settings['instagram_url']?->value,
                'facebook_url'       => $settings['facebook_url']?->value,
                'contact_email'      => $settings['contact_email']?->value,
                'contact_phone'      => $settings['contact_phone']?->value,
            ],
            'photographerPhotos' => $photographerPhotos,
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

    public function uploadPhotographerPhotos(Request $request)
    {
        $request->validate([
            'photos'   => 'required|array|min:1',
            'photos.*' => 'required|image|mimes:jpeg,png,webp|max:10240',
        ]);

        $maxOrder = PhotographerPhoto::max('sort_order') ?? 0;
        $uploaded = [];

        foreach ($request->file('photos') as $i => $file) {
            $filename = $file->store('photographer', 'public');
            $photo = PhotographerPhoto::create([
                'filename'      => basename($filename),
                'original_name' => $file->getClientOriginalName(),
                'usage'         => null,
                'sort_order'    => $maxOrder + $i + 1,
            ]);
            $uploaded[] = [
                'id'            => $photo->id,
                'url'           => $photo->url,
                'original_name' => $photo->original_name,
                'usage'         => null,
                'sort_order'    => $photo->sort_order,
            ];
        }

        return response()->json(['photos' => $uploaded]);
    }

    public function updatePhotographerPhotoUsage(Request $request, PhotographerPhoto $photographerPhoto)
    {
        $request->validate([
            'usage' => 'nullable|string|max:50',
        ]);

        // If another photo already has this usage, clear it first
        $newUsage = $request->input('usage') ?: null;
        if ($newUsage) {
            PhotographerPhoto::where('usage', $newUsage)
                ->where('id', '!=', $photographerPhoto->id)
                ->update(['usage' => null]);
        }

        $photographerPhoto->update(['usage' => $newUsage]);

        return response()->json(['success' => true]);
    }

    public function deletePhotographerPhoto(PhotographerPhoto $photographerPhoto)
    {
        Storage::disk('public')->delete('photographer/' . $photographerPhoto->filename);
        $photographerPhoto->delete();

        return back()->with('success', 'Photo deleted.');
    }
}
