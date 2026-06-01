<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = null;

        // Priority 1: User config (if logged in)
        if ($request->user() && $request->user()->config) {
            $userLocale = $request->user()->getConfig('language');
            if ($userLocale && in_array($userLocale, config('app.available_locales'))) {
                $locale = $userLocale;
                Session::put('locale', $locale);
            }
        }

        // Priority 2: Session
        if (!$locale && Session::has('locale')) {
            $sessionLocale = Session::get('locale');
            if (in_array($sessionLocale, config('app.available_locales'))) {
                $locale = $sessionLocale;
            }
        }

        // Priority 3: Browser language detection
        if (!$locale && $request->server('HTTP_ACCEPT_LANGUAGE')) {
            $browserLocale = substr($request->server('HTTP_ACCEPT_LANGUAGE'), 0, 2);
            if (in_array($browserLocale, config('app.available_locales'))) {
                $locale = $browserLocale;
                Session::put('locale', $locale);
            }
        }

        // Apply the determined locale
        if ($locale) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
