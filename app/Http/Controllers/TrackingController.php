<?php

namespace App\Http\Controllers;

use App\Models\PhotoView;
use App\Support\Visitor;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function photoView(Request $request)
    {
        $validated = $request->validate([
            'media_id'   => 'required|integer',
            'gallery_id' => 'nullable|integer',
        ]);

        PhotoView::create([
            'visitor_id' => Visitor::id($request),
            'media_id'   => $validated['media_id'],
            'gallery_id' => $validated['gallery_id'] ?? null,
        ]);

        return response()->json(['success' => true]);
    }
}
