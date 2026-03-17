<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public \App\Models\TaskComment $comment)
    {
        $this->comment->load('user');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('task.' . $this->comment->task_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.added';
    }

    public function broadcastWith(): array
    {
        return ['comment' => $this->comment->toArray()];
    }
}
