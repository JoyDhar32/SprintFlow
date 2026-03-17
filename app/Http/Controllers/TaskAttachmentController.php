<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TaskAttachmentController extends Controller
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

    // -------------------------------------------------------------------------
    // Attachment Actions
    // -------------------------------------------------------------------------

    /**
     * Upload and store a file attachment for the given task.
     *
     * Files are stored at storage/app/public/attachments/task-{id}/
     * with a unique filename to prevent collisions.
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240', // 10 MB in kilobytes
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip,rar,7z,mp4,mov,avi,mp3,wav',
            ],
        ]);

        $user = Auth::user();
        $file = $request->file('file');

        // Build a collision-safe filename: uuid + original extension
        $originalName = $file->getClientOriginalName();
        $extension    = $file->getClientOriginalExtension();
        $filename     = Str::uuid() . '.' . $extension;

        // Store under public disk so Storage::url() works correctly
        $directory = "attachments/task-{$task->id}";
        $path      = $file->storeAs($directory, $filename, 'public');

        $attachment = TaskAttachment::create([
            'task_id'       => $task->id,
            'user_id'       => $user->id,
            'filename'      => $filename,
            'original_name' => $originalName,
            'mime_type'     => $file->getMimeType(),
            'size'          => $file->getSize(),
            'path'          => $path,
        ]);

        $this->logActivity($user, $task, 'attachment_added', [
            'attachment_id'   => $attachment->id,
            'original_name'   => $originalName,
            'task_title'      => $task->title,
        ]);

        return response()->json([
            'attachment' => $attachment->load('user'),
        ], 201);
    }

    /**
     * Delete the specified attachment from storage and the database.
     *
     * Any team member who uploaded the file (or an admin) may remove it.
     * For simplicity we restrict deletion to the uploader.
     */
    public function destroy(TaskAttachment $attachment): JsonResponse
    {
        $user = Auth::user();

        if ($attachment->user_id !== $user->id) {
            abort(403, 'You may only delete your own attachments.');
        }

        // Remove the physical file from disk
        if (Storage::disk('public')->exists($attachment->path)) {
            Storage::disk('public')->delete($attachment->path);
        }

        $task = $attachment->task;

        $this->logActivity($user, $task, 'attachment_removed', [
            'original_name' => $attachment->original_name,
            'task_title'    => $task->title,
        ]);

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted successfully.']);
    }
}
