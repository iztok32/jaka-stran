<?php

use App\Helpers\SmsHelper;

if (!function_exists('sendSms')) {
    /**
     * Send SMS message to GSM number
     *
     * @param string $gsmNumber
     * @param string $messageText
     * @return array
     */
    function sendSms(string $gsmNumber, string $messageText): array
    {
        return SmsHelper::sendSms($gsmNumber, $messageText);
    }
}
