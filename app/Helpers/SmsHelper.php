<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class SmsHelper
{
    /**
     * Send SMS message to GSM number
     * This is an interface function - actual SMS provider integration should be implemented here
     *
     * @param string $gsmNumber
     * @param string $messageText
     * @return array ['success' => bool, 'message' => string]
     */
    public static function sendSms(string $gsmNumber, string $messageText): array
    {
        try {
            // TODO: Implement actual SMS provider integration here
            // For example: Twilio, Nexmo, or local SMS gateway

            Log::info('SMS Send Request', [
                'gsm_number' => $gsmNumber,
                'message' => $messageText,
            ]);

            // Simulate SMS sending - replace with actual implementation
            // Example for Twilio:
            // $twilio = new Client(config('services.twilio.sid'), config('services.twilio.token'));
            // $message = $twilio->messages->create($gsmNumber, [
            //     'from' => config('services.twilio.from'),
            //     'body' => $messageText
            // ]);

            return [
                'success' => true,
                'message' => 'SMS queued for delivery (provider integration pending)',
            ];
        } catch (\Exception $e) {
            Log::error('SMS Send Error', [
                'gsm_number' => $gsmNumber,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send SMS: ' . $e->getMessage(),
            ];
        }
    }
}
