<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notification Channels
    |--------------------------------------------------------------------------
    |
    | Configure which notification channels are enabled for your application.
    | Available channels: portal, email, sms
    |
    */

    'enable_portal' => env('NOTIFICATION_ENABLE_PORTAL', true),
    'enable_email' => env('NOTIFICATION_ENABLE_EMAIL', true),
    'enable_sms' => env('NOTIFICATION_ENABLE_SMS', true),
];
