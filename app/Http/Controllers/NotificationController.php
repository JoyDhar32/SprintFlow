<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Return a paginated list of the authenticated user's notifications,
     * newest first.
     */
    public function index(): JsonResponse
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->with('actor')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Mark a single notification as read.
     *
     * Only the owning user may mark their own notification read.
     */
    public function markRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'You may not update this notification.');
        }

        $notification->markAsRead();

        return response()->json([
            'message'      => 'Notification marked as read.',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark every unread notification belonging to the authenticated user
     * as read in a single query.
     */
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }
}
