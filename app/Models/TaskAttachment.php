<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'url',
        'size_formatted',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The task this attachment belongs to.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * The user who uploaded this attachment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Get the public URL for this attachment.
     */
    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    /**
     * Get a human-readable representation of the file size.
     */
    public function getSizeFormattedAttribute(): string
    {
        $bytes = (int) $this->size;

        if ($bytes < 1_024) {
            return $bytes . ' B';
        }

        if ($bytes < 1_048_576) {
            return round($bytes / 1_024, 1) . ' KB';
        }

        if ($bytes < 1_073_741_824) {
            return round($bytes / 1_048_576, 1) . ' MB';
        }

        return round($bytes / 1_073_741_824, 2) . ' GB';
    }
}
