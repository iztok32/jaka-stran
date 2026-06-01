<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class UserConfigController extends Controller
{
    /**
     * Update a single config value
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'nullable',
        ]);

        $request->user()->setConfig($validated['key'], $validated['value']);

        return response()->json([
            'success' => true,
            'config' => $request->user()->config,
        ]);
    }

    /**
     * Update multiple config values
     */
    public function updateBatch(Request $request)
    {
        $validated = $request->validate([
            'config' => 'required|array',
        ]);

        $request->user()->updateConfig($validated['config']);

        return response()->json([
            'success' => true,
            'config' => $request->user()->config,
        ]);
    }

    /**
     * Get user config
     */
    public function show(Request $request)
    {
        return response()->json([
            'config' => $request->user()->config ?? [],
        ]);
    }
}
