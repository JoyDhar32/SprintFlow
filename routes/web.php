<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamInvitationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\BillingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Stripe webhook (must be outside auth middleware, CSRF-exempt via Cashier)
Route::post('/stripe/webhook', '\Laravel\Cashier\Http\Controllers\WebhookController@handleWebhook')
    ->name('cashier.webhook');

// Pricing page (public)
Route::get('/pricing', [BillingController::class, 'pricing'])->name('billing.pricing');

// Team invitations (token-based, semi-public)
Route::get('/invitations/{token}', [TeamInvitationController::class, 'show'])->name('invitations.accept');
Route::post('/invitations/{token}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept.post');

// Landing page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Billing & Subscriptions
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/billing/success', [BillingController::class, 'success'])->name('billing.success');
    Route::get('/billing/portal', [BillingController::class, 'portal'])->name('billing.portal');
    Route::post('/billing/cancel', [BillingController::class, 'cancel'])->name('billing.cancel');
    Route::post('/billing/resume', [BillingController::class, 'resume'])->name('billing.resume');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Teams
    Route::resource('teams', TeamController::class);
    Route::post('/teams/{team}/invite', [TeamInvitationController::class, 'invite'])->name('teams.invite');
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('teams.members.remove');
    Route::put('/teams/{team}/members/{user}', [TeamController::class, 'updateMember'])->name('teams.members.update');

    // Projects
    Route::resource('projects', ProjectController::class);
    Route::get('/projects/{project}/board', [ProjectController::class, 'board'])->name('projects.board');

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tasks/reorder', [TaskController::class, 'updateOrder'])->name('tasks.reorder');

    // Task Comments
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::put('/comments/{comment}', [TaskCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');

    // Task Attachments
    Route::post('/tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('attachments.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});

require __DIR__.'/auth.php';
