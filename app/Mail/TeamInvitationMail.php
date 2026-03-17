<?php

namespace App\Mail;

use App\Models\Team;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeamInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Team   $team,
        public User   $inviter,
        public string $acceptUrl,
        public string $role,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->inviter->name} invited you to join {$this->team->name} on SprintFlow",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.team-invitation',
            with: [
                'team'      => $this->team,
                'inviter'   => $this->inviter,
                'acceptUrl' => $this->acceptUrl,
                'role'      => $this->role,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
