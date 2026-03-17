<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'key',
        'description',
        'color',
        'status',
        'team_id',
        'owner_id',
        'start_date',
        'end_date',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'task_count',
        'completed_task_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'status'     => 'string',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The team this project belongs to.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * The user who owns this project.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Tasks belonging to this project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Labels defined for this project.
     */
    public function labels(): HasMany
    {
        return $this->hasMany(TaskLabel::class);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    /**
     * Scope a query to tasks with a given status.
     */
    public function scopeTasksByStatus(Builder $query, string $status): Builder
    {
        return $query->whereHas('tasks', function (Builder $q) use ($status): void {
            $q->where('status', $status);
        });
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Get the total number of tasks in this project.
     */
    public function getTaskCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    /**
     * Get the number of completed (done) tasks in this project.
     */
    public function getCompletedTaskCountAttribute(): int
    {
        return $this->tasks()->where('status', 'done')->count();
    }
}
