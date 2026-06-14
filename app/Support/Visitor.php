<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class Visitor
{
    const COOKIE_NAME = 'vid';

    /**
     * Get the anonymous visitor id for the current request, generating
     * and queuing a long-lived cookie if one doesn't exist yet.
     */
    public static function id(Request $request): string
    {
        $id = $request->cookie(self::COOKIE_NAME);

        if (! $id || ! Str::isUuid($id)) {
            $id = (string) Str::uuid();
            Cookie::queue(self::COOKIE_NAME, $id, 60 * 24 * 365);
        }

        return $id;
    }
}
