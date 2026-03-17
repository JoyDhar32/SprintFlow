<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Share global data to ALL Inertia pages.
     * auth.user, flash messages, unread notification count.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'role'       => $user->role,
                    'avatar_url' => $user->avatar_url,
                    'bio'        => $user->bio,
                ] : null,
            ],

            // Unread notification count (cached per request)
            'unread_notifications' => fn () => $user
                ? Notification::where('user_id', $user->id)->whereNull('read_at')->count()
                : 0,

            // Flash messages from redirects
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],

            // App config for frontend
            'app' => [
                'name' => config('app.name'),
                'url'  => config('app.url'),
            ],

            // Subscription info
            'subscription' => fn () => $user ? [
                'plan'         => $user->activePlanSlug(),
                'plan_name'    => $user->planName(),
                'member_limit' => $user->memberLimit(),
                'active'       => $user->subscribed('default'),
            ] : null,
        ];
    }
}
