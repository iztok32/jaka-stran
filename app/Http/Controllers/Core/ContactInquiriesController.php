<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactInquiriesController extends Controller
{
    public function index()
    {
        $inquiries = ContactInquiry::orderByRaw("CASE status WHEN 'new' THEN 0 WHEN 'read' THEN 1 WHEN 'replied' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ContactInquiry $i) => $this->format($i));

        return Inertia::render('Core/ContactInquiries/Index', [
            'inquiries' => $inquiries,
        ]);
    }

    public function show(ContactInquiry $contactInquiry)
    {
        if ($contactInquiry->status === 'new') {
            $contactInquiry->update(['status' => 'read']);
        }

        return Inertia::render('Core/ContactInquiries/Show', [
            'inquiry' => $this->format($contactInquiry),
        ]);
    }

    public function reply(Request $request, ContactInquiry $contactInquiry)
    {
        $validated = $request->validate([
            'reply' => 'required|string|max:10000',
        ]);

        $contactInquiry->update([
            'reply'       => $validated['reply'],
            'status'      => 'replied',
            'replied_at'  => now(),
        ]);

        return back()->with('success', 'Reply sent.');
    }

    public function updateStatus(Request $request, ContactInquiry $contactInquiry)
    {
        $request->validate([
            'status' => 'required|in:new,read,replied,archived',
        ]);

        $contactInquiry->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }

    public function destroy(ContactInquiry $contactInquiry)
    {
        $contactInquiry->delete();

        return redirect()->route('contact-inquiries.index')->with('success', 'Inquiry deleted.');
    }

    private function format(ContactInquiry $i): array
    {
        return [
            'id'           => $i->id,
            'name'         => $i->name,
            'email'        => $i->email,
            'project_type' => $i->project_type,
            'message'      => $i->message,
            'status'       => $i->status,
            'reply'        => $i->reply,
            'replied_at'   => $i->replied_at?->toISOString(),
            'created_at'   => $i->created_at?->toISOString(),
        ];
    }
}
