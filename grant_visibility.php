<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$admin = \App\Models\Role::where('slug', 'admin')->first();
$user = \App\Models\Role::where('slug', 'user')->first();

if ($admin && $user) {
    // Check if already exists
    $exists = $admin->visibleRoles()->where('can_see_role_id', $user->id)->exists();

    if (!$exists) {
        $admin->visibleRoles()->attach($user->id);
        echo "✓ Success: Admin can now see User role\n";
    } else {
        echo "ℹ Info: Admin already can see User role\n";
    }

    // Show all visible roles for admin
    echo "\nAdmin visible roles:\n";
    foreach ($admin->visibleRoles as $role) {
        echo "  - {$role->name}\n";
    }
} else {
    echo "✗ Error: Roles not found\n";
    echo "  Admin: " . ($admin ? "Found" : "Not found") . "\n";
    echo "  User: " . ($user ? "Found" : "Not found") . "\n";
}
