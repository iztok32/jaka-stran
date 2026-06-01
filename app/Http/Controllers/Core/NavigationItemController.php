<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\NavigationItem;
use App\Models\NavigationConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class NavigationItemController extends Controller
{
    public function index()
    {
        $this->ensureNavigationConfigsExist();

        $items = NavigationItem::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        $groups = NavigationConfig::orderBy('sort_order')
            ->get()
            ->groupBy('group');

        $configs = NavigationConfig::orderBy('sort_order')->get();

        return Inertia::render('Core/Navigation/Index', [
            'items' => $items,
            'groups' => $groups,
            'configs' => $configs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:navigation_items,id',
            'type' => 'required|string',
            'title_key' => 'required|string',
            'url' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'permission' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        NavigationItem::create($validated);

        return redirect()->back()->with('success', 'Item created successfully');
    }

    public function update(Request $request, NavigationItem $navigation)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:navigation_items,id',
            'type' => 'required|string',
            'title_key' => 'required|string',
            'url' => 'nullable|string',
            'icon' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'permission' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $navigation->update($validated);

        return redirect()->back()->with('success', 'Item updated successfully');
    }

    public function destroy(NavigationItem $navigation)
    {
        $navigation->delete();

        return redirect()->back()->with('success', 'Item deleted successfully');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:navigation_items,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            NavigationItem::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back()->with('success', 'Order updated successfully');
    }

    public function updateConfig(Request $request)
    {
        $this->ensureNavigationConfigsExist();

        $validated = $request->validate([
            'type' => 'required|string',
            'label' => 'required|string|max:255',
        ]);

        NavigationConfig::updateOrCreate(
            ['type' => $validated['type']],
            ['label' => $validated['label']]
        );

        return redirect()->back()->with('success', 'Configuration updated successfully');
    }

    public function addBlock(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
        ]);

        $type = 'main_' . strtolower(str_replace(' ', '_', $request->label)) . '_' . time();

        NavigationConfig::create([
            'type' => $type,
            'label' => $request->label,
            'group' => 'main',
            'sort_order' => NavigationConfig::where('group', 'main')->count(),
        ]);

        return redirect()->back()->with('success', 'Block added successfully');
    }

    public function deleteBlock(string $type)
    {
        $config = NavigationConfig::where('type', $type)->firstOrFail();
        
        // Don't allow deleting base blocks if needed, but for now let's allow it 
        // unless it' the very last one. 
        if (in_array($type, ['main', 'team', 'project'])) {
            return redirect()->back()->with('error', 'Cannot delete base blocks');
        }

        NavigationItem::where('type', $type)->delete();
        $config->delete();

        return redirect()->back()->with('success', 'Block deleted successfully');
    }

    private function ensureNavigationConfigsExist()
    {
        if (Schema::hasTable('navigation_configs')) {
            Schema::table('navigation_configs', function (Blueprint $table) {
                if (!Schema::hasColumn('navigation_configs', 'group')) {
                    $table->string('group')->nullable()->after('type');
                }
                if (!Schema::hasColumn('navigation_configs', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('group');
                }
                if (!Schema::hasColumn('navigation_configs', 'type')) {
                    $table->string('type')->unique()->after('id');
                }
                if (!Schema::hasColumn('navigation_configs', 'label')) {
                    $table->string('label')->after('type');
                }
                if (!Schema::hasColumn('navigation_configs', 'is_visible')) {
                    $table->boolean('is_visible')->default(true)->after('label');
                }
            });
        }

        $defaults = [
            ['type' => 'main', 'label' => 'Glavni meni', 'group' => 'main', 'sort_order' => 0],
            ['type' => 'header', 'label' => 'Glava (header)', 'group' => 'header', 'sort_order' => 0],
            ['type' => 'settings', 'label' => 'Nastavitveni (settings)', 'group' => 'settings', 'sort_order' => 0],
            ['type' => 'users', 'label' => 'Uporabnikov meni', 'group' => 'users', 'sort_order' => 10],
        ];

        foreach ($defaults as $default) {
            NavigationConfig::firstOrCreate(
                ['type' => $default['type']],
                [
                    'label' => $default['label'],
                    'group' => $default['group'],
                    'sort_order' => $default['sort_order']
                ]
            );
        }
    }
}
