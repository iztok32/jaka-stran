<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class LocaleController
{
    /**
     * Switch the application locale.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $request->validate([
            'locale' => ['required', 'string', 'in:' . implode(',', config('app.available_locales'))],
        ]);

        session(['locale' => $request->locale]);

        // Save to user config if logged in
        if ($request->user()) {
            $request->user()->setConfig('language', $request->locale);
        }

        return redirect()->back();
    }
}
