<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the main dashboard for the authenticated user.
     */
    public function index(): Response
    {
        $user = Auth::user()->load('teams');

        // Recent tasks assigned to the user (last 10), with project info
        $recentTasks = Task::where('assignee_id', $user->id)
            ->with(['project', 'labels', 'reporter'])
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get();

        // Upcoming tasks due within the next 7 days (assigned to user, not done/cancelled)
        $upcomingTasks = Task::where('assignee_id', $user->id)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [
                Carbon::today(),
                Carbon::today()->addDays(7),
            ])
            ->whereNotIn('status', ['done', 'cancelled'])
            ->with(['project', 'labels'])
            ->orderBy('due_date')
            ->get();

        // All projects the user can access through their teams
        $teamIds = $user->teams->pluck('id');
        $projects = Project::whereIn('team_id', $teamIds)
            ->with(['team', 'owner'])
            ->orderByDesc('updated_at')
            ->get();

        // ---- Stats ----
        $totalAssigned = Task::where('assignee_id', $user->id)->count();

        $completedThisWeek = Task::where('assignee_id', $user->id)
            ->where('status', 'done')
            ->whereBetween('completed_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->count();

        $inProgressCount = Task::where('assignee_id', $user->id)
            ->where('status', 'in_progress')
            ->count();

        $dueSoonCount = Task::where('assignee_id', $user->id)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDays(7)])
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $stats = [
            'total_tasks'         => $totalAssigned,
            'in_progress'         => $inProgressCount,
            'completed_this_week' => $completedThisWeek,
            'due_soon'            => $dueSoonCount,
        ];

        // Recent activity from user's accessible projects
        $recentActivity = \App\Models\Activity::whereIn(
            'subject_id',
            Task::whereIn('project_id', Project::whereIn('team_id', $teamIds)->pluck('id'))->pluck('id')
        )
            ->where('subject_type', Task::class)
            ->with('user')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'description' => $this->formatActivity($a),
                'created_at'  => $a->created_at,
            ]);

        return Inertia::render('Dashboard', compact(
            'recentTasks',
            'upcomingTasks',
            'projects',
            'stats',
            'recentActivity',
        ));
    }

    private function formatActivity(\App\Models\Activity $activity): string
    {
        $actor = $activity->user?->name ?? 'Someone';
        $props = $activity->properties ?? [];

        return match ($activity->action) {
            'created'         => "{$actor} created task \"{$props['task_title']}\"",
            'status_changed'  => "{$actor} moved \"{$props['task_title']}\" to " . ucfirst(str_replace('_', ' ', $props['to'] ?? '')),
            'priority_changed'=> "{$actor} changed priority of \"{$props['task_title']}\" to " . ucfirst($props['to'] ?? ''),
            'assignee_changed'=> "{$actor} reassigned \"{$props['task_title']}\"",
            'commented'       => "{$actor} commented on a task",
            'deleted'         => "{$actor} deleted task \"{$props['task_title']}\"",
            default           => "{$actor} updated a task",
        };
    }
}
