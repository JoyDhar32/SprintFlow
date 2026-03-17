<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo',
        'owner_id',
    ];

    // -------------------------------------------------------------------------
    // Boot
    // -------------------------------------------------------------------------

    /**
     * Bootstrap the model and auto-generate a slug from the name on creation.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Team $team): void {
            if (empty($team->slug)) {
                $team->slug = Str::slug($team->name);
            }
        });

        static::updating(function (Team $team): void {
            if ($team->isDirty('name') && empty($team->slug)) {
                $team->slug = Str::slug($team->name);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Route Model Binding
    // -------------------------------------------------------------------------

    /**
     * Use the slug column for route model binding.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The user who owns this team.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * The members belonging to this team.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Projects associated with this team.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
