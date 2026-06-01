<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!$request->user()->hasPermission($permission)) {
            // Redirect to dashboard with error message instead of showing 403
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to access this resource.')
                ->with('permission_denied', true);
        }

        return $next($request);
    }
}
