<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskLabel;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    // -------------------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------------------

    /**
     * Create an activity log entry for any subject model.
     *
     * @param  User   $user       The user performing the action.
     * @param  mixed  $subject    The Eloquent model being acted upon.
     * @param  string $action     A short verb describing the action.
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
     * @param  string $type     A short type identifier.
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

    /**
     * Abort with 403 if the authenticated user's teams do not include this
     * project's team.
     */
    protected function authorizeProjectAccess(Project $project): void
    {
        $userTeamIds = Auth::user()->teams()->pluck('teams.id');

        if (! $userTeamIds->contains($project->team_id)) {
            abort(403, 'You do not have access to this project.');
        }
    }

    // -------------------------------------------------------------------------
    // Resource Actions
    // -------------------------------------------------------------------------

    /**
     * List all projects accessible to the authenticated user through their teams.
     */
    public function index(): Response
    {
        $teamIds = Auth::user()->teams()->pluck('teams.id');

        $projects = Project::whereIn('team_id', $teamIds)
            ->with(['team', 'owner'])
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                'tasks as in_progress_tasks_count' => fn ($q) => $q->where('status', 'in_progress'),
            ])
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create(): Response
    {
        $teams = Auth::user()
            ->teams()
            ->orderBy('name')
            ->get(['teams.id', 'teams.name']);

        return Inertia::render('Projects/Create', [
            'teams' => $teams,
        ]);
    }

    /**
     * Store a newly created project and seed it with default labels.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'key'         => ['required', 'string', 'max:10', 'alpha', 'uppercase', 'unique:projects,key'],
            'team_id'     => ['required', 'integer', 'exists:teams,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color'       => ['nullable', 'string', 'max:20'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        // Ensure the user belongs to the chosen team
        $isMember = $user->teams()->where('teams.id', $validated['team_id'])->exists();

        if (! $isMember) {
            return redirect()
                ->back()
                ->withErrors(['team_id' => 'You do not belong to the selected team.'])
                ->withInput();
        }

        $project = Project::create([
            'name'        => $validated['name'],
            'key'         => strtoupper($validated['key']),
            'team_id'     => $validated['team_id'],
            'description' => $validated['description'] ?? null,
            'color'       => $validated['color'] ?? '#6366f1',
            'status'      => 'active',
            'owner_id'    => $user->id,
            'start_date'  => $validated['start_date'] ?? null,
            'end_date'    => $validated['end_date'] ?? null,
        ]);

        // Seed default labels
        $defaultLabels = [
            ['name' => 'Bug',           'color' => 'red'],
            ['name' => 'Feature',       'color' => 'blue'],
            ['name' => 'Enhancement',   'color' => 'green'],
            ['name' => 'Documentation', 'color' => 'gray'],
        ];

        foreach ($defaultLabels as $label) {
            TaskLabel::create([
                'name'       => $label['name'],
                'color'      => $label['color'],
                'project_id' => $project->id,
            ]);
        }

        $this->logActivity($user, $project, 'created', ['project_name' => $project->name]);

        return redirect()
            ->route('projects.board', $project)
            ->with('success', 'Project created successfully.');
    }

    /**
     * Redirect the canonical show URL to the board view.
     */
    public function show(Project $project): RedirectResponse
    {
        $this->authorizeProjectAccess($project);

        return redirect()->route('projects.board', $project);
    }

    /**
     * Display the Kanban board for the given project.
     *
     * Tasks are grouped by status and ordered by their position column so the
     * front-end can render columns without extra sorting.
     */
    public function board(Project $project): Response
    {
        $this->authorizeProjectAccess($project);

        $statuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];

        // Load all tasks for the project, grouped by status
        $allTasks = Task::where('project_id', $project->id)
            ->with(['assignee', 'reporter', 'labels'])
            ->orderBy('position')
            ->get();

        $tasksByStatus = collect($statuses)->mapWithKeys(function (string $status) use ($allTasks) {
            return [$status => $allTasks->where('status', $status)->values()];
        });

        // Project members are the members of the owning team
        $members = $project->team->members()->orderBy('name')->get(['users.id', 'users.name', 'users.email', 'users.avatar']);

        $project->load(['team', 'owner', 'labels']);

        return Inertia::render('Projects/Board', [
            'project'       => $project,
            'tasksByStatus' => $tasksByStatus,
            'members'       => $members,
            'statuses'      => $statuses,
        ]);
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit(Project $project): Response
    {
        $this->authorizeProjectAccess($project);

        $teams = Auth::user()
            ->teams()
            ->orderBy('name')
            ->get(['teams.id', 'teams.name']);

        return Inertia::render('Projects/Edit', [
            'project' => $project->load('team'),
            'teams'   => $teams,
        ]);
    }

    /**
     * Update the specified project's fields.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'key'         => ['required', 'string', 'max:10', 'alpha', 'uppercase', Rule::unique('projects', 'key')->ignore($project->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'color'       => ['nullable', 'string', 'max:20'],
            'status'      => ['nullable', 'string', 'in:active,archived,completed'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $project->update($validated);

        $this->logActivity(Auth::user(), $project, 'updated', ['project_name' => $project->name]);

        return redirect()
            ->route('projects.board', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Delete the specified project. Only the project owner may do this.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $user = Auth::user();

        if ($project->owner_id !== $user->id) {
            return redirect()
                ->back()
                ->with('error', 'Only the project owner can delete this project.');
        }

        $this->logActivity($user, $project, 'deleted', ['project_name' => $project->name]);

        $project->delete();

        return redirect()
            ->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Return the list of members for a project (team members).
     */
    public function members(Project $project): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $members = $project->team
            ->members()
            ->orderBy('name')
            ->get(['users.id', 'users.name', 'users.email', 'users.avatar']);

        return response()->json(['members' => $members]);
    }
}
