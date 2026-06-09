<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [\App\Http\Controllers\WelcomeController::class, 'index'])->name('welcome');
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');
Route::get('/galerija/{slug}', [\App\Http\Controllers\GalleryController::class, 'show'])->name('gallery.show');
Route::get('/portfolio/{slug}', [\App\Http\Controllers\PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('navigation', \App\Http\Controllers\Core\NavigationItemController::class)->except(['create', 'edit', 'show']);
    Route::post('navigation/reorder', [\App\Http\Controllers\Core\NavigationItemController::class, 'reorder'])->name('navigation.reorder');
    Route::post('navigation/config', [\App\Http\Controllers\Core\NavigationItemController::class, 'updateConfig'])->name('navigation.updateConfig');
    Route::post('navigation/add-block', [\App\Http\Controllers\Core\NavigationItemController::class, 'addBlock'])->name('navigation.addBlock');
    Route::delete('navigation/delete-block/{type}', [\App\Http\Controllers\Core\NavigationItemController::class, 'deleteBlock'])->name('navigation.deleteBlock');

    // RolesGroup routes with permission middleware
    Route::middleware('permission:roles-group.view')->group(function () {
        Route::get('roles-group', [\App\Http\Controllers\Core\RolesGroupController::class, 'index'])->name('roles-group.index');
        Route::get('roles-group/{role}/available-roles', [\App\Http\Controllers\Core\RolesGroupController::class, 'getAvailableRoles'])->name('roles-group.available-roles');
    });
    Route::middleware('permission:roles-group.create')->group(function () {
        Route::post('roles-group', [\App\Http\Controllers\Core\RolesGroupController::class, 'store'])->name('roles-group.store');
    });
    Route::middleware('permission:roles-group.edit')->group(function () {
        Route::put('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'update'])->name('roles-group.update');
        Route::patch('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'update']);
        Route::post('roles-group/grant-visibility', [\App\Http\Controllers\Core\RolesGroupController::class, 'grantVisibility'])->name('roles-group.grant-visibility');
        Route::post('roles-group/revoke-visibility', [\App\Http\Controllers\Core\RolesGroupController::class, 'revokeVisibility'])->name('roles-group.revoke-visibility');
        Route::post('roles-group/reorder', [\App\Http\Controllers\Core\RolesGroupController::class, 'reorder'])->name('roles-group.reorder');
    });
    Route::middleware('permission:roles-group.delete')->group(function () {
        Route::delete('roles-group/{roles_group}', [\App\Http\Controllers\Core\RolesGroupController::class, 'destroy'])->name('roles-group.destroy');
    });

    Route::resource('modules-list', \App\Http\Controllers\Core\ModulesListController::class)->except(['create', 'edit', 'show']);

    Route::resource('permissions', \App\Http\Controllers\Core\PermissionsController::class)->except(['create', 'edit', 'show']);
    Route::post('permissions/toggle-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'toggleStandard'])->name('permissions.toggleStandard');
    Route::delete('permissions/delete-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'deleteStandard'])->name('permissions.deleteStandard');

    Route::get('roles-permissions', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'index'])->name('roles-permissions.index');
    Route::post('roles-permissions/toggle', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'togglePermission'])->name('roles-permissions.toggle');
    Route::post('roles-permissions/toggle-navigation', [\App\Http\Controllers\Core\RolesPermissionsController::class, 'toggleNavigationVisibility'])->name('roles-permissions.toggle-navigation');

    // Users routes with permission middleware
    Route::middleware('permission:users.view')->group(function () {
        Route::get('users', [\App\Http\Controllers\Core\UsersController::class, 'index'])->name('users.index');
    });
    Route::middleware('permission:users.create')->group(function () {
        Route::post('users', [\App\Http\Controllers\Core\UsersController::class, 'store'])->name('users.store');
    });
    Route::middleware('permission:users.edit')->group(function () {
        Route::put('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'update'])->name('users.update');
        Route::patch('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'update']);
        Route::post('users/send-password-reset', [\App\Http\Controllers\Core\UsersController::class, 'sendPasswordResetLink'])->name('users.send-password-reset');
    });
    Route::middleware('permission:users.delete')->group(function () {
        Route::delete('users/{user}', [\App\Http\Controllers\Core\UsersController::class, 'destroy'])->name('users.destroy');
    });

    Route::get('audit-log', [\App\Http\Controllers\Core\AuditLogController::class, 'index'])->name('audit-log.index');
    Route::get('audit-log/{audit}', [\App\Http\Controllers\Core\AuditLogController::class, 'show'])->name('audit-log.show');

    Route::get('notifications', [\App\Http\Controllers\Core\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/inbox', [\App\Http\Controllers\Core\NotificationController::class, 'inbox'])->name('notifications.inbox');
    Route::post('notifications/portal', [\App\Http\Controllers\Core\NotificationController::class, 'sendPortalNotification'])->name('notifications.send-portal');
    Route::post('notifications/email', [\App\Http\Controllers\Core\NotificationController::class, 'sendEmail'])->name('notifications.send-email');
    Route::post('notifications/sms', [\App\Http\Controllers\Core\NotificationController::class, 'sendSms'])->name('notifications.send-sms');
    Route::post('notifications/mark-all-read', [\App\Http\Controllers\Core\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{notification}/read', [\App\Http\Controllers\Core\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');

    // Articles routes with permission middleware
    Route::middleware('permission:articles.view')->group(function () {
        Route::get('articles', [\App\Http\Controllers\Core\ArticlesController::class, 'index'])->name('articles.index');
    });
    Route::middleware('permission:articles.create')->group(function () {
        Route::post('articles', [\App\Http\Controllers\Core\ArticlesController::class, 'store'])->name('articles.store');
    });
    Route::middleware('permission:articles.edit')->group(function () {
        Route::put('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'update'])->name('articles.update');
        Route::patch('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'update']);
        Route::post('articles/{article}/media', [\App\Http\Controllers\Core\ArticlesController::class, 'uploadMedia'])->name('articles.media.upload');
        Route::delete('articles/{article}/media/{mediaId}', [\App\Http\Controllers\Core\ArticlesController::class, 'deleteMedia'])->name('articles.media.delete');
    });
    Route::middleware('permission:articles.delete')->group(function () {
        Route::delete('articles/{article}', [\App\Http\Controllers\Core\ArticlesController::class, 'destroy'])->name('articles.destroy');
    });

    // Galleries routes with permission middleware
    Route::middleware('permission:galleries.view')->group(function () {
        Route::get('galleries', [\App\Http\Controllers\Core\GalleriesController::class, 'index'])->name('galleries.index');
    });
    Route::middleware('permission:galleries.create')->group(function () {
        Route::post('galleries', [\App\Http\Controllers\Core\GalleriesController::class, 'store'])->name('galleries.store');
    });
    Route::middleware('permission:galleries.edit')->group(function () {
        Route::put('galleries/{gallery}', [\App\Http\Controllers\Core\GalleriesController::class, 'update'])->name('galleries.update');
        Route::patch('galleries/{gallery}', [\App\Http\Controllers\Core\GalleriesController::class, 'update']);
        Route::post('galleries/{gallery}/photos', [\App\Http\Controllers\Core\GalleriesController::class, 'uploadPhotos'])->name('galleries.photos.upload');
        Route::delete('galleries/{gallery}/photos/{mediaId}', [\App\Http\Controllers\Core\GalleriesController::class, 'deletePhoto'])->name('galleries.photos.delete');
        Route::post('galleries/{gallery}/photos/reorder', [\App\Http\Controllers\Core\GalleriesController::class, 'reorderPhotos'])->name('galleries.photos.reorder');
        Route::post('galleries/{gallery}/photos/{mediaId}/tags', [\App\Http\Controllers\Core\GalleriesController::class, 'syncPhotoTags'])->name('galleries.photos.tags');
        Route::post('galleries/{gallery}/cover', [\App\Http\Controllers\Core\GalleriesController::class, 'setCover'])->name('galleries.cover.set');
    });
    Route::middleware('permission:galleries.delete')->group(function () {
        Route::delete('galleries/{gallery}', [\App\Http\Controllers\Core\GalleriesController::class, 'destroy'])->name('galleries.destroy');
    });

    // Contact inquiries (admin)
    Route::middleware('permission:contact-inquiries.view')->group(function () {
        Route::get('contact-inquiries', [\App\Http\Controllers\Core\ContactInquiriesController::class, 'index'])->name('contact-inquiries.index');
        Route::get('contact-inquiries/{contactInquiry}', [\App\Http\Controllers\Core\ContactInquiriesController::class, 'show'])->name('contact-inquiries.show');
    });
    Route::middleware('permission:contact-inquiries.edit')->group(function () {
        Route::post('contact-inquiries/{contactInquiry}/reply', [\App\Http\Controllers\Core\ContactInquiriesController::class, 'reply'])->name('contact-inquiries.reply');
        Route::patch('contact-inquiries/{contactInquiry}/status', [\App\Http\Controllers\Core\ContactInquiriesController::class, 'updateStatus'])->name('contact-inquiries.status');
    });
    Route::middleware('permission:contact-inquiries.delete')->group(function () {
        Route::delete('contact-inquiries/{contactInquiry}', [\App\Http\Controllers\Core\ContactInquiriesController::class, 'destroy'])->name('contact-inquiries.destroy');
    });

    // Settings routes
    Route::middleware('permission:settings.view')->group(function () {
        Route::get('settings', [\App\Http\Controllers\Core\SettingsController::class, 'index'])->name('settings.index');
    });
    Route::middleware('permission:settings.edit')->group(function () {
        Route::patch('settings/{key}', [\App\Http\Controllers\Core\SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/watermark', [\App\Http\Controllers\Core\SettingsController::class, 'storeWatermark'])->name('settings.watermark.store');
        Route::delete('settings/watermark', [\App\Http\Controllers\Core\SettingsController::class, 'deleteWatermark'])->name('settings.watermark.delete');
        Route::post('settings/photographer-photos', [\App\Http\Controllers\Core\SettingsController::class, 'uploadPhotographerPhotos'])->name('settings.photographer-photos.store');
        Route::patch('settings/photographer-photos/{photographerPhoto}/usage', [\App\Http\Controllers\Core\SettingsController::class, 'updatePhotographerPhotoUsage'])->name('settings.photographer-photos.usage');
        Route::delete('settings/photographer-photos/{photographerPhoto}', [\App\Http\Controllers\Core\SettingsController::class, 'deletePhotographerPhoto'])->name('settings.photographer-photos.delete');
    });

    Route::get('user/config', [\App\Http\Controllers\UserConfigController::class, 'show'])->name('user.config.show');
    Route::post('user/config', [\App\Http\Controllers\UserConfigController::class, 'update'])->name('user.config.update');
    Route::post('user/config/batch', [\App\Http\Controllers\UserConfigController::class, 'updateBatch'])->name('user.config.batch');
});

require __DIR__.'/auth.php';

Route::post('/locale', \App\Http\Controllers\LocaleController::class)->name('locale.update');
