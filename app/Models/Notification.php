<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Notification extends Model implements AuditableContract
{
    use Auditable;

    protected $fillable = [
        'sender_id',
        'recipient_id',
        'type',
        'subject',
        'message',
        'recipient_email',
        'recipient_gsm',
        'status',
        'error_message',
        'sent_at',
        'read_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
