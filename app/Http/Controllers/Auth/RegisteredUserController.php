<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeamInvitation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Auto-accept pending invitation if one exists in session
        if ($token = session()->pull('invitation_token')) {
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

        return redirect(route('dashboard', absolute: false));
    }
}
