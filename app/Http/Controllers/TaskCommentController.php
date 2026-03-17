<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
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

    // -------------------------------------------------------------------------
    // Comment Actions
    // -------------------------------------------------------------------------

    /**
     * Store a new comment on the given task.
     *
     * Creates activity log and notifies the task's assignee and reporter
     * (excluding the comment author to avoid self-notifications).
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:10000'],
        ]);

        $user = Auth::user();

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        // Log the comment activity against the task
        $this->logActivity($user, $task, 'commented', [
            'comment_id' => $comment->id,
            'task_title' => $task->title,
        ]);

        // Collect unique recipients: assignee and reporter, excluding the author
        $recipients = collect([$task->assignee_id, $task->reporter_id])
            ->filter()
            ->unique()
            ->reject(fn ($id) => $id === $user->id);

        foreach ($recipients as $recipientId) {
            $this->createNotification(
                userId: $recipientId,
                actorId: $user->id,
                type: 'task_comment',
                message: "{$user->name} commented on \"{$task->title}\".",
                data: [
                    'task_id'    => $task->id,
                    'task_title' => $task->title,
                    'comment_id' => $comment->id,
                ],
                url: route('tasks.show', $task),
            );
        }

        return response()->json([
            'comment' => $comment->load('user'),
        ], 201);
    }

    /**
     * Update the specified comment. Only the original author may edit.
     */
    public function update(Request $request, TaskComment $comment): JsonResponse
    {
        $user = Auth::user();

        if ($comment->user_id !== $user->id) {
            abort(403, 'You may only edit your own comments.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:10000'],
        ]);

        $comment->update(['content' => $validated['content']]);

        return response()->json([
            'comment' => $comment->load('user'),
        ]);
    }

    /**
     * Delete the specified comment. Only the original author may delete.
     */
    public function destroy(TaskComment $comment): JsonResponse
    {
        $user = Auth::user();

        if ($comment->user_id !== $user->id) {
            abort(403, 'You may only delete your own comments.');
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }
}
