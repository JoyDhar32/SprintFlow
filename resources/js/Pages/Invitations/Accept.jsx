import { Head, router, usePage } from '@inertiajs/react';

export default function Accept({ invitation }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const emailMatch = isLoggedIn && auth.user.email.toLowerCase() === invitation.email.toLowerCase();

    const handleAccept = () => {
        router.post(`/invitations/${invitation.token}/accept`);
    };

    return (
        <>
            <Head title={`Join ${invitation.team.name}`} />

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '2.5rem',
                    maxWidth: 460,
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                }}>
                    {/* Logo */}
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                        ⚡ SprintFlow
                    </div>

                    {/* Team avatar */}
                    <div style={{
                        width: 72,
                        height: 72,
                        borderRadius: 18,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#fff',
                        margin: '0 auto 1.25rem',
                    }}>
                        {invitation.team.name.charAt(0).toUpperCase()}
                    </div>

                    <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        You're invited!
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        <strong style={{ color: '#374151' }}>{invitation.inviter.name}</strong> invited you to join{' '}
                        <strong style={{ color: '#4f46e5' }}>{invitation.team.name}</strong> as a{' '}
                        <strong style={{ color: '#374151' }}>{invitation.role}</strong>.
                    </p>

                    {invitation.team.description && (
                        <div style={{
                            background: '#f8fafc',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: 10,
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            marginBottom: '1.5rem',
                            textAlign: 'left',
                            lineHeight: 1.5,
                        }}>
                            {invitation.team.description}
                        </div>
                    )}

                    {/* Expiry notice */}
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                        ⏱ Expires {invitation.expires}
                    </div>

                    {isLoggedIn ? (
                        emailMatch ? (
                            <>
                                <button
                                    onClick={handleAccept}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem',
                                        borderRadius: 12,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        marginBottom: '0.75rem',
                                        letterSpacing: '0.01em',
                                    }}
                                >
                                    Accept & Join Team →
                                </button>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                                    Joining as {auth.user.email}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                background: '#fef2f2',
                                border: '1.5px solid #fecaca',
                                borderRadius: 10,
                                padding: '0.9rem',
                                fontSize: '0.85rem',
                                color: '#dc2626',
                                marginBottom: '0.75rem',
                            }}>
                                This invitation was sent to <strong>{invitation.email}</strong>.<br />
                                You're logged in as <strong>{auth.user.email}</strong>.<br />
                                Please log in with the correct account.
                            </div>
                        )
                    ) : (
                        <>
                            <a
                                href={`/register?email=${encodeURIComponent(invitation.email)}`}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.85rem',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    marginBottom: '0.75rem',
                                    textDecoration: 'none',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                Create Account & Join →
                            </a>
                            <a
                                href={`/login?email=${encodeURIComponent(invitation.email)}`}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 12,
                                    border: '1.5px solid #e5e7eb',
                                    background: '#fff',
                                    color: '#374151',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                }}
                            >
                                Already have an account? Log in
                            </a>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
