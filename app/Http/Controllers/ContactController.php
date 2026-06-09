<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|max:255',
            'project_type' => 'nullable|string|max:255',
            'message'      => 'required|string|max:5000',
        ]);

        ContactInquiry::create($validated);

        return back()->with('contact_success', true);
    }
}
