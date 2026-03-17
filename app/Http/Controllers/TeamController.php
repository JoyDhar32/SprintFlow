<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    // -------------------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------------------

    /**
     * Create an activity log entry for any subject model.
     *
     * @param  User   $user       The user performing the action.
     * @param  mixed  $subject    The Eloquent model being acted upon.
     * @param  string $action     A short verb describing the action (e.g. 'created').
     * @param  array  $properties Additional key/value metadata to store.
     */
    protected function logActivity(User $user, mixed $subject, string $action, array $properties = []): void
    {
        Activity::create([
            'user_id'      => $user->id,
            'subject_type' => get_class($subject),
            'subject_id'   => $subject->id,
            'action'       => $action,
            'properties'   => $properties,
        ]);
    }

    /**
     * Create a notification record for a user.
     *
     * @param  int    $userId   The recipient user's ID.
     * @param  int    $actorId  The user who triggered the notification.
     * @param  string $type     A short type identifier (e.g. 'team_invite').
     * @param  string $message  Human-readable notification message.
     * @param  array  $data     Arbitrary payload data.
     * @param  string $url      The URL the notification should link to.
     */
    protected function createNotification(
        int $userId,
        int $actorId,
        string $type,
        string $message,
        array $data,
        string $url
    ): void {
        Notification::create([
            'user_id'  => $userId,
            'actor_id' => $actorId,
            'type'     => $type,
            'message'  => $message,
            'data'     => $data,
            'url'      => $url,
        ]);
    }

    // -------------------------------------------------------------------------
    // Resource Actions
    // -------------------------------------------------------------------------

    /**
     * List all teams the authenticated user belongs to.
     */
    public function index(): Response
    {
        $teams = Auth::user()
            ->teams()
            ->withCount(['members', 'projects'])
            ->with('owner')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);
    }

    /**
     * Show the form for creating a new team.
     */
    public function create(): Response
    {
        return Inertia::render('Teams/Create');
    }

    /**
     * Store a newly created team and attach the owner as an admin member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = Auth::user();

        $team = Team::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'owner_id'    => $user->id,
        ]);

        // Attach owner as admin with the current timestamp
        $team->members()->attach($user->id, [
            'role'      => 'admin',
            'joined_at' => now(),
        ]);

        $this->logActivity($user, $team, 'created', ['team_name' => $team->name]);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Team created successfully.');
    }

    /**
     * Display the specified team with members and projects.
     */
    public function show(Team $team): Response
    {
        $this->authorizeTeamAccess($team);

        $team->load([
            'owner',
            'members' => fn ($q) => $q->withPivot('role', 'joined_at')->orderBy('name'),
            'projects' => fn ($q) => $q->withCount('tasks')->orderByDesc('created_at'),
        ]);

        return Inertia::render('Teams/Show', [
            'team' => $team,
        ]);
    }

    /**
     * Show the form for editing the specified team.
     */
    public function edit(Team $team): Response
    {
        $this->authorizeTeamAccess($team);

        return Inertia::render('Teams/Edit', [
            'team' => $team,
        ]);
    }

    /**
     * Update the specified team's name and/or description.
     */
    public function update(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeTeamAccess($team);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $team->update($validated);

        $this->logActivity(Auth::user(), $team, 'updated', ['team_name' => $team->name]);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Team updated successfully.');
    }

    /**
     * Delete the specified team. Only the team owner may do this.
     */
    public function destroy(Team $team): RedirectResponse
    {
        $user = Auth::user();

        if ($team->owner_id !== $user->id) {
            return redirect()
                ->back()
                ->with('error', 'Only the team owner can delete this team.');
        }

        $this->logActivity($user, $team, 'deleted', ['team_name' => $team->name]);

        $team->delete();

        return redirect()
            ->route('teams.index')
            ->with('success', 'Team deleted successfully.');
    }

    /**
     * Return the list of members for a given team (JSON).
     */
    public function members(Team $team): \Illuminate\Http\JsonResponse
    {
        $this->authorizeTeamAccess($team);

        $members = $team->members()
            ->withPivot('role', 'joined_at')
            ->orderBy('name')
            ->get();

        return response()->json(['members' => $members]);
    }

    /**
     * Update a member's role within the team.
     */
    public function updateMember(Request $request, Team $team, User $user): RedirectResponse
    {
        $this->authorizeTeamAccess($team);

        if ($team->owner_id === $user->id) {
            return redirect()->back()->with('error', 'The team owner\'s role cannot be changed.');
        }

        $request->validate(['role' => ['required', 'in:admin,member']]);

        $team->members()->updateExistingPivot($user->id, ['role' => $request->role]);

        return redirect()->back()->with('success', "{$user->name}'s role updated.");
    }

    /**
     * Remove a member from the team. Owners cannot be removed.
     */
    public function removeMember(Team $team, User $user): RedirectResponse
    {
        $this->authorizeTeamAccess($team);

        if ($team->owner_id === $user->id) {
            return redirect()
                ->back()
                ->with('error', 'The team owner cannot be removed.');
        }

        $team->members()->detach($user->id);

        $this->logActivity(Auth::user(), $team, 'member_removed', [
            'removed_user_id'   => $user->id,
            'removed_user_name' => $user->name,
        ]);

        return redirect()
            ->back()
            ->with('success', "{$user->name} has been removed from the team.");
    }

    // -------------------------------------------------------------------------
    // Authorization Helpers
    // -------------------------------------------------------------------------

    /**
     * Abort with 403 if the authenticated user does not belong to the team.
     */
    protected function authorizeTeamAccess(Team $team): void
    {
        $isMember = $team->members()->where('user_id', Auth::id())->exists();

        if (! $isMember) {
            abort(403, 'You do not have access to this team.');
        }
    }
}
