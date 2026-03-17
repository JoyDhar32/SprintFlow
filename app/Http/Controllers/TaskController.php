<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
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
     * Verify the authenticated user has access to the project that owns
     * this task. Aborts with 403 on failure.
     */
    protected function authorizeTaskAccess(Task $task): void
    {
        $userTeamIds = Auth::user()->teams()->pluck('teams.id');

        if (! $userTeamIds->contains($task->project->team_id)) {
            abort(403, 'You do not have access to this task.');
        }
    }

    // -------------------------------------------------------------------------
    // Resource Actions
    // -------------------------------------------------------------------------

    /**
     * List tasks with optional filters.
     *
     * Returns JSON when the request expects JSON (AJAX / API calls), otherwise
     * renders an Inertia page.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = Auth::user();
        $userTeamIds = $user->teams()->pluck('teams.id');
        $projectIds  = Project::whereIn('team_id', $userTeamIds)->pluck('id');

        $query = Task::whereIn('project_id', $projectIds)
            ->with(['assignee', 'reporter', 'labels', 'project'])
            ->orderBy('position');

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->integer('project_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('assignee_id')) {
            $query->where('assignee_id', $request->integer('assignee_id'));
        }

        $tasks = $query->get();

        if ($request->expectsJson()) {
            return response()->json(['tasks' => $tasks]);
        }

        return Inertia::render('Tasks/Index', [
            'tasks'   => $tasks,
            'filters' => $request->only(['project_id', 'status', 'priority', 'assignee_id']),
        ]);
    }

    /**
     * Store a newly created task.
     *
     * Always returns a JSON response so the Kanban board can optimistically
     * update without a full page reload.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'status'          => ['nullable', 'string', 'in:backlog,todo,in_progress,in_review,done,cancelled'],
            'priority'        => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'project_id'      => ['required', 'integer', 'exists:projects,id'],
            'assignee_id'     => ['nullable', 'integer', 'exists:users,id'],
            'due_date'        => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = Auth::user();

        // Ensure the user can access the target project
        $project = Project::findOrFail($validated['project_id']);
        $userTeamIds = $user->teams()->pluck('teams.id');

        if (! $userTeamIds->contains($project->team_id)) {
            abort(403, 'You do not have access to this project.');
        }

        // Calculate next position within the status column
        $status = $validated['status'] ?? 'backlog';
        $maxPosition = Task::where('project_id', $validated['project_id'])
            ->where('status', $status)
            ->max('position') ?? 0;

        $task = Task::create([
            'title'           => $validated['title'],
            'description'     => $validated['description'] ?? null,
            'status'          => $status,
            'priority'        => $validated['priority'] ?? 'medium',
            'project_id'      => $validated['project_id'],
            'reporter_id'     => $user->id,
            'assignee_id'     => $validated['assignee_id'] ?? null,
            'due_date'        => $validated['due_date'] ?? null,
            'estimated_hours' => $validated['estimated_hours'] ?? null,
            'position'        => $maxPosition + 1,
        ]);

        $this->logActivity($user, $task, 'created', ['task_title' => $task->title]);

        // Notify the assignee if one was set and it is not the reporter themselves
        if ($task->assignee_id && $task->assignee_id !== $user->id) {
            $this->createNotification(
                userId: $task->assignee_id,
                actorId: $user->id,
                type: 'task_assigned',
                message: "{$user->name} assigned you to \"{$task->title}\".",
                data: [
                    'task_id'      => $task->id,
                    'task_title'   => $task->title,
                    'project_id'   => $task->project_id,
                ],
                url: route('tasks.show', $task),
            );
        }

        return response()->json([
            'task' => $task->load(['assignee', 'reporter', 'labels']),
        ], 201);
    }

    /**
     * Display a single task with all its relations.
     */
    public function show(Task $task): Response
    {
        $this->authorizeTaskAccess($task);

        $task->load([
            'project.team',
            'reporter',
            'assignee',
            'labels',
            'comments.user',
            'attachments.user',
            'activities.user',
        ]);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    /**
     * Update the specified task.
     *
     * Tracks changes to status, assignee and priority, logs an activity record
     * for each, and notifies the newly assigned user when the assignee changes.
     * Returns the updated task as JSON.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTaskAccess($task);

        $validated = $request->validate([
            'title'           => ['sometimes', 'required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'status'          => ['sometimes', 'string', 'in:backlog,todo,in_progress,in_review,done,cancelled'],
            'priority'        => ['sometimes', 'string', 'in:low,medium,high,urgent'],
            'assignee_id'     => ['nullable', 'integer', 'exists:users,id'],
            'due_date'        => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = Auth::user();

        // --- Track changes before applying them ---
        $oldStatus   = $task->status;
        $oldAssignee = $task->assignee_id;
        $oldPriority = $task->priority;

        // Handle completed_at automatically
        if (isset($validated['status']) && $validated['status'] === 'done' && $oldStatus !== 'done') {
            $validated['completed_at'] = Carbon::now();
        } elseif (isset($validated['status']) && $validated['status'] !== 'done') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);

        // Log status change
        if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
            $this->logActivity($user, $task, 'status_changed', [
                'from'       => $oldStatus,
                'to'         => $validated['status'],
                'task_title' => $task->title,
            ]);
        }

        // Log priority change
        if (isset($validated['priority']) && $validated['priority'] !== $oldPriority) {
            $this->logActivity($user, $task, 'priority_changed', [
                'from'       => $oldPriority,
                'to'         => $validated['priority'],
                'task_title' => $task->title,
            ]);
        }

        // Log and notify on assignee change
        $newAssignee = array_key_exists('assignee_id', $validated) ? $validated['assignee_id'] : $oldAssignee;

        if (array_key_exists('assignee_id', $validated) && $validated['assignee_id'] !== $oldAssignee) {
            $this->logActivity($user, $task, 'assignee_changed', [
                'from'       => $oldAssignee,
                'to'         => $validated['assignee_id'],
                'task_title' => $task->title,
            ]);

            if ($newAssignee && $newAssignee !== $user->id) {
                $this->createNotification(
                    userId: $newAssignee,
                    actorId: $user->id,
                    type: 'task_assigned',
                    message: "{$user->name} assigned you to \"{$task->title}\".",
                    data: [
                        'task_id'    => $task->id,
                        'task_title' => $task->title,
                        'project_id' => $task->project_id,
                    ],
                    url: route('tasks.show', $task),
                );
            }
        }

        return response()->json([
            'task' => $task->load(['assignee', 'reporter', 'labels']),
        ]);
    }

    /**
     * Delete the specified task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorizeTaskAccess($task);

        $user = Auth::user();

        $this->logActivity($user, $task, 'deleted', [
            'task_title' => $task->title,
            'project_id' => $task->project_id,
        ]);

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }

    /**
     * Bulk-update task positions and statuses used by Kanban drag-and-drop.
     *
     * Expects a JSON body with a "tasks" array of objects, each containing
     * at minimum: { id, status, position }.
     */
    public function updateOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tasks'            => ['required', 'array'],
            'tasks.*.id'       => ['required', 'integer', 'exists:tasks,id'],
            'tasks.*.status'   => ['required', 'string', 'in:backlog,todo,in_progress,in_review,done,cancelled'],
            'tasks.*.position' => ['required', 'integer', 'min:0'],
        ]);

        $user = Auth::user();
        $userTeamIds = $user->teams()->pluck('teams.id');

        DB::transaction(function () use ($validated, $userTeamIds) {
            foreach ($validated['tasks'] as $item) {
                $task = Task::with('project')->findOrFail($item['id']);

                if (! $userTeamIds->contains($task->project->team_id)) {
                    abort(403, 'You do not have access to one or more tasks.');
                }

                $oldStatus = $task->status;

                $updateData = [
                    'position' => $item['position'],
                    'status'   => $item['status'],
                ];

                // Auto-complete when moved to done column
                if ($item['status'] === 'done' && $oldStatus !== 'done') {
                    $updateData['completed_at'] = Carbon::now();
                } elseif ($item['status'] !== 'done' && $oldStatus === 'done') {
                    $updateData['completed_at'] = null;
                }

                $task->update($updateData);
            }
        });

        return response()->json(['message' => 'Task order updated successfully.']);
    }
}
