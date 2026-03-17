<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Auto-accept pending invitation if one exists in session
        if ($token = session()->pull('invitation_token')) {
            $user = Auth::user();
            $invitation = TeamInvitation::where('token', $token)
                ->whereNull('accepted_at')
                ->with('team')
                ->first();

            if ($invitation && ! $invitation->isExpired() &&
                strtolower($user->email) === strtolower($invitation->email)) {
                $team = $invitation->team;
                if (! $team->members()->where('user_id', $user->id)->exists()) {
                    $team->members()->attach($user->id, [
                        'role'      => $invitation->role,
                        'joined_at' => now(),
                    ]);
                }
                $invitation->update(['accepted_at' => now()]);
                return redirect()->route('teams.show', $team->slug)
                    ->with('success', "Welcome to {$team->name}!");
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
