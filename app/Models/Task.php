<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'position',
        'project_id',
        'reporter_id',
        'assignee_id',
        'due_date',
        'completed_at',
        'estimated_hours',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'priority_color',
        'status_badge',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date'     => 'date',
            'completed_at' => 'datetime',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The project this task belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * The user who reported (created) this task.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * The user assigned to this task (nullable).
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id')->withDefault();
    }

    /**
     * Comments on this task, ordered chronologically.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at');
    }

    /**
     * Activity records for this task (polymorphic).
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    /**
     * Labels attached to this task.
     */
    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(TaskLabel::class, 'label_task');
    }

    /**
     * File attachments on this task.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /**
     * Scope a query to tasks with a specific status.
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to tasks with a specific priority.
     */
    public function scopeByPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to tasks assigned to a specific user.
     */
    public function scopeByAssignee(Builder $query, int $userId): Builder
    {
        return $query->where('assignee_id', $userId);
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Get the Bootstrap text-color class for this task's priority.
     */
    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            'critical' => 'text-danger',
            'high'     => 'text-warning',
            'medium'   => 'text-primary',
            'low'      => 'text-success',
            default    => 'text-secondary',
        };
    }

    /**
     * Get the Bootstrap badge class for this task's status.
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'backlog'     => 'badge bg-secondary',
            'todo'        => 'badge bg-light text-dark',
            'in_progress' => 'badge bg-primary',
            'in_review'   => 'badge bg-warning text-dark',
            'done'        => 'badge bg-success',
            'cancelled'   => 'badge bg-danger',
            default       => 'badge bg-secondary',
        };
    }
}
