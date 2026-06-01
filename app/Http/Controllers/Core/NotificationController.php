<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $enabledChannels = $this->getEnabledChannels();

        // If no channels enabled, show all
        if (empty($enabledChannels)) {
            $enabledChannels = ['portal', 'email', 'sms'];
        }

        $notifications = Notification::with(['sender', 'recipient'])
            ->whereIn('type', $enabledChannels)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'sender' => $notification->sender?->name ?? 'System',
                    'recipient' => $notification->recipient?->name ?? ($notification->recipient_email ?: ($notification->recipient_gsm ?: 'All Users')),
                    'type' => $notification->type,
                    'subject' => $notification->subject,
                    'message' => $notification->message,
                    'status' => $notification->status,
                    'sent_at' => $notification->sent_at,
                    'created_at' => $notification->created_at,
                ];
            });

        $users = User::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'gsm_number' => $user->gsm_number,
                ];
            });

        return Inertia::render('Core/Notifications/Index', [
            'notifications' => $notifications,
            'users' => $users,
            'enabledChannels' => $enabledChannels,
        ]);
    }

    public function sendPortalNotification(Request $request)
    {
        $validated = $request->validate([
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'integer|exists:users,id',
            'send_to_all' => 'boolean',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            $recipientIds = [];

            // If send to all, get all active users
            if ($validated['send_to_all'] ?? false) {
                $recipientIds = User::where('is_active', true)->pluck('id')->toArray();
            } else {
                // Otherwise use selected users
                $recipientIds = $validated['recipient_ids'] ?? [];
            }

            // If no recipients, create one notification without recipient (broadcast)
            if (empty($recipientIds)) {
                Notification::create([
                    'sender_id' => auth()->id(),
                    'recipient_id' => null,
                    'type' => 'portal',
                    'subject' => $validated['subject'],
                    'message' => $validated['message'],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
            } else {
                // Create notification for each recipient
                foreach ($recipientIds as $recipientId) {
                    Notification::create([
                        'sender_id' => auth()->id(),
                        'recipient_id' => $recipientId,
                        'type' => 'portal',
                        'subject' => $validated['subject'],
                        'message' => $validated['message'],
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);
                }
            }

            $count = count($recipientIds);
            $message = $count > 0
                ? __('Portal notification sent successfully to :count users', ['count' => $count])
                : __('Portal notification sent successfully');

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to send notification: ' . $e->getMessage()]);
        }
    }

    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'integer|exists:users,id',
            'send_to_all' => 'boolean',
            'recipient_email' => 'nullable|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            // Custom email address
            if (isset($validated['recipient_email'])) {
                Mail::raw($validated['message'], function ($mail) use ($validated) {
                    $mail->to($validated['recipient_email'])
                         ->subject($validated['subject']);
                });

                Notification::create([
                    'sender_id' => auth()->id(),
                    'recipient_id' => null,
                    'type' => 'email',
                    'subject' => $validated['subject'],
                    'message' => $validated['message'],
                    'recipient_email' => $validated['recipient_email'],
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                return back()->with('success', __('Email sent successfully'));
            }

            // Multiple users
            $recipientIds = [];
            if ($validated['send_to_all'] ?? false) {
                $recipientIds = User::where('is_active', true)->pluck('id')->toArray();
            } else {
                $recipientIds = $validated['recipient_ids'] ?? [];
            }

            $successCount = 0;
            $failCount = 0;

            foreach ($recipientIds as $recipientId) {
                $user = User::find($recipientId);
                if (!$user) continue;

                try {
                    Mail::raw($validated['message'], function ($mail) use ($user, $validated) {
                        $mail->to($user->email)
                             ->subject($validated['subject']);
                    });

                    Notification::create([
                        'sender_id' => auth()->id(),
                        'recipient_id' => $user->id,
                        'type' => 'email',
                        'subject' => $validated['subject'],
                        'message' => $validated['message'],
                        'recipient_email' => $user->email,
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $successCount++;
                } catch (\Exception $e) {
                    Notification::create([
                        'sender_id' => auth()->id(),
                        'recipient_id' => $user->id,
                        'type' => 'email',
                        'subject' => $validated['subject'],
                        'message' => $validated['message'],
                        'recipient_email' => $user->email,
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);

                    $failCount++;
                }
            }

            $message = __('Email sent successfully to :count users', ['count' => $successCount]);
            if ($failCount > 0) {
                $message .= '. ' . __(':count failed', ['count' => $failCount]);
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to send email') . ': ' . $e->getMessage()]);
        }
    }

    public function sendSms(Request $request)
    {
        $validated = $request->validate([
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'integer|exists:users,id',
            'send_to_all' => 'boolean',
            'recipient_gsm' => 'nullable|string',
            'message' => 'required|string',
        ]);

        // Custom GSM number
        if (isset($validated['recipient_gsm'])) {
            $result = sendSms($validated['recipient_gsm'], $validated['message']);

            Notification::create([
                'sender_id' => auth()->id(),
                'recipient_id' => null,
                'type' => 'sms',
                'message' => $validated['message'],
                'recipient_gsm' => $validated['recipient_gsm'],
                'status' => $result['success'] ? 'sent' : 'failed',
                'error_message' => $result['success'] ? null : $result['message'],
                'sent_at' => $result['success'] ? now() : null,
            ]);

            if ($result['success']) {
                return back()->with('success', __('SMS sent successfully'));
            } else {
                return back()->withErrors(['error' => $result['message']]);
            }
        }

        // Multiple users
        $recipientIds = [];
        if ($validated['send_to_all'] ?? false) {
            $recipientIds = User::where('is_active', true)
                ->whereNotNull('gsm_number')
                ->pluck('id')
                ->toArray();
        } else {
            $recipientIds = $validated['recipient_ids'] ?? [];
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($recipientIds as $recipientId) {
            $user = User::find($recipientId);
            if (!$user || !$user->gsm_number) continue;

            $result = sendSms($user->gsm_number, $validated['message']);

            Notification::create([
                'sender_id' => auth()->id(),
                'recipient_id' => $user->id,
                'type' => 'sms',
                'message' => $validated['message'],
                'recipient_gsm' => $user->gsm_number,
                'status' => $result['success'] ? 'sent' : 'failed',
                'error_message' => $result['success'] ? null : $result['message'],
                'sent_at' => $result['success'] ? now() : null,
            ]);

            if ($result['success']) {
                $successCount++;
            } else {
                $failCount++;
            }
        }

        $message = __('SMS sent successfully to :count users', ['count' => $successCount]);
        if ($failCount > 0) {
            $message .= '. ' . __(':count failed', ['count' => $failCount]);
        }

        return back()->with('success', $message);
    }

    public function inbox()
    {
        $notifications = Notification::where('type', 'portal')
            ->where(function ($q) {
                $q->where('recipient_id', auth()->id())
                  ->orWhereNull('recipient_id');
            })
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'sender' => $notification->sender?->name ?? __('System'),
                    'subject' => $notification->subject,
                    'message' => $notification->message,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });

        return Inertia::render('Core/Notifications/Inbox', [
            'notifications' => $notifications,
        ]);
    }

    public function markAllRead()
    {
        Notification::where('type', 'portal')
            ->where(function ($q) {
                $q->where('recipient_id', auth()->id())
                  ->orWhereNull('recipient_id');
            })
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with('success', __('All notifications marked as read'));
    }

    public function markAsRead(Notification $notification)
    {
        // Allow if user is the recipient, or if it's a broadcast (recipient_id = null)
        if ($notification->recipient_id !== null && $notification->recipient_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $notification->update(['read_at' => now()]);

        return redirect()->back()->with('success', __('Notification marked as read'));
    }

    private function getEnabledChannels(): array
    {
        $channels = [];

        if (config('notifications.enable_portal', true)) {
            $channels[] = 'portal';
        }

        if (config('notifications.enable_email', true)) {
            $channels[] = 'email';
        }

        if (config('notifications.enable_sms', true)) {
            $channels[] = 'sms';
        }

        return $channels;
    }
}
