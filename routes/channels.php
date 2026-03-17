<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Project;
use App\Models\Task;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. Given a channel name and a callback, Laravel will
| return a JSON response indicating whether the authenticated user can
| listen to the channel.
|
*/

// User private channel - notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Project channel - authenticated team members only
Broadcast::channel('project.{projectId}', function ($user, $projectId) {
    $project = Project::find($projectId);

    if (!$project) {
        return false;
    }

    // Check if user belongs to the team that owns this project
    return $user->teams()->where('team_id', $project->team_id)->exists();
});

// Task channel - for real-time comments
Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    $task = Task::with('project')->find($taskId);

    if (!$task) {
        return false;
    }

    return $user->teams()->where('team_id', $task->project->team_id)->exists();
});
