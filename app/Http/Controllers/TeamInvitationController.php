<?php

namespace App\Http\Controllers;

use App\Mail\TeamInvitationMail;
use App\Models\Notification;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TeamInvitationController extends Controller
{
    /**
     * Send an invitation email to the given address.
     */
    public function invite(Request $request, Team $team): RedirectResponse
    {
        $actor = Auth::user();

        // Only team members may invite
        if (! $team->members()->where('user_id', $actor->id)->exists()) {
            abort(403);
        }

        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role'  => ['sometimes', 'in:admin,member'],
        ]);

        $email = strtolower(trim($request->email));
        $role  = $request->role ?? 'member';

        // Check subscription member limit
        $owner       = User::find($team->owner_id);
        $memberLimit = $owner->memberLimit();
        $currentCount = $team->members()->count();

        if ($currentCount >= $memberLimit) {
            return redirect()->back()->with(
                'error',
                "Your {$owner->planName()} plan allows up to {$memberLimit} member(s). Upgrade to invite more."
            );
        }

        // Already a member?
        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $team->members()->where('user_id', $existingUser->id)->exists()) {
            return redirect()->back()->with('error', 'That person is already a member of this team.');
        }

        // Pending invite already exists?
        $existing = TeamInvitation::where('team_id', $team->id)
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'An invitation has already been sent to that email.');
        }

        // Create the invitation record
        $invitation = TeamInvitation::create([
            'team_id'    => $team->id,
            'invited_by' => $actor->id,
            'email'      => $email,
            'role'       => $role,
            'token'      => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        $acceptUrl = route('invitations.accept', $invitation->token);

        // Send invitation email
        Mail::to($email)->send(new TeamInvitationMail($team, $actor, $acceptUrl, $role));

        // Notify existing user in-app as well
        if ($existingUser) {
            Notification::create([
                'user_id'  => $existingUser->id,
                'actor_id' => $actor->id,
                'type'     => 'team_invite',
                'message'  => "{$actor->name} invited you to join \"{$team->name}\".",
                'data'     => ['team_id' => $team->id, 'team_name' => $team->name],
                'url'      => $acceptUrl,
            ]);
        }

        // Dev convenience: show the link in the flash when using log/array driver
        $mailer = config('mail.default');
        $extra  = in_array($mailer, ['log', 'array'])
            ? " (Dev: <a href=\"{$acceptUrl}\">{$acceptUrl}</a>)"
            : '';

        return redirect()->back()->with('success', "Invitation sent to {$email}.{$extra}");
    }

    /**
     * Show the accept-invitation page.
     */
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = TeamInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->with(['team', 'inviter'])
            ->firstOrFail();

        if ($invitation->isExpired()) {
            return redirect()->route('dashboard')->with('error', 'This invitation has expired.');
        }

        // Store token so unauthenticated visitors can auto-accept after register/login
        if (! Auth::check()) {
            session(['invitation_token' => $token]);
        }

        return Inertia::render('Invitations/Accept', [
            'invitation' => [
                'token'   => $invitation->token,
                'email'   => $invitation->email,
                'role'    => $invitation->role,
                'team'    => ['name' => $invitation->team->name, 'description' => $invitation->team->description],
                'inviter' => ['name' => $invitation->inviter->name],
                'expires' => $invitation->expires_at->diffForHumans(),
            ],
        ]);
    }

    /**
     * Accept the invitation.
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = TeamInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->with('team')
            ->firstOrFail();

        if ($invitation->isExpired()) {
            return redirect()->route('dashboard')->with('error', 'This invitation has expired.');
        }

        // Must be logged in — redirect to login/register if not
        if (! Auth::check()) {
            session(['invitation_token' => $token]);
            return redirect()->route('register')->with(
                'status',
                "Create your account to join {$invitation->team->name}."
            );
        }

        $user = Auth::user();

        // Email must match unless admin is accepting on behalf
        if (strtolower($user->email) !== strtolower($invitation->email)) {
            return redirect()->route('dashboard')
                ->with('error', "This invitation was sent to {$invitation->email}. Please log in with that account.");
        }

        // Attach to team
        $team = $invitation->team;

        if (! $team->members()->where('user_id', $user->id)->exists()) {
            $team->members()->attach($user->id, [
                'role'      => $invitation->role,
                'joined_at' => now(),
            ]);
        }

        // Mark accepted
        $invitation->update(['accepted_at' => now()]);

        return redirect()->route('teams.show', $team->slug)
            ->with('success', "Welcome to {$team->name}!");
    }
}
