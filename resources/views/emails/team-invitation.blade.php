<x-mail::message>
# You've been invited to join **{{ $team->name }}**

**{{ $inviter->name }}** has invited you to join the **{{ $team->name }}** team on SprintFlow as a **{{ ucfirst($role) }}**.

@if($team->description)
> {{ $team->description }}
@endif

<x-mail::button :url="$acceptUrl" color="primary">
Accept Invitation →
</x-mail::button>

This invitation expires in **7 days**.

If you don't have an account yet, you'll be asked to register first — your invitation will be waiting for you automatically.

If you weren't expecting this, you can safely ignore this email.

Thanks,
{{ config('app.name') }}

---
<small>If the button doesn't work, paste this link into your browser: {{ $acceptUrl }}</small>
</x-mail::message>
