<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ModulesListController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $query = Module::withCount('permissions');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('web_root', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $modules = $query->orderBy('name')->get();

        return Inertia::render('Core/ModulesList/Index', [
            'modules' => $modules,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name',
            'web_root' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        // Ensure name is lowercase
        $validated['name'] = Str::lower($validated['name']);

        Module::create($validated);

        return redirect()->back()->with('success', 'Module created successfully');
    }

    public function update(Request $request, Module $modulesList)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name,' . $modulesList->id,
            'web_root' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        // Ensure name is lowercase
        $validated['name'] = Str::lower($validated['name']);

        $modulesList->update($validated);

        return redirect()->back()->with('success', 'Module updated successfully');
    }

    public function destroy(Module $modulesList)
    {
        // Check if module has permissions
        if ($modulesList->permissions()->count() > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete module that has permissions. Please delete all permissions first.'
            ]);
        }

        $modulesList->delete();

        return redirect()->back()->with('success', 'Module deleted successfully');
    }
}
