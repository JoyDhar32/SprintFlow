import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateProfileInformationForm({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [saved, setSaved] = useState(false);

    const { data, setData, patch, errors, processing } = useForm({
        name:  user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            },
        });
    };

    return (
        <div>
            {/* Section header */}
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <h5 style={{ fontWeight: 700, color: '#111', margin: 0, fontSize: '1rem' }}>Profile Information</h5>
                <p style={{ color: '#9ca3af', fontSize: '0.83rem', margin: '4px 0 0' }}>
                    Update your name and email address.
                </p>
            </div>

            <form onSubmit={submit} style={{ padding: '1.75rem' }}>
                <div className="row g-3">
                    {/* Avatar preview */}
                    <div className="col-12 mb-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0,
                            }}>
                                {data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>{data.name || 'Your Name'}</div>
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{data.email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="col-md-6">
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            className={`form-control${errors.name ? ' is-invalid' : ''}`}
                            style={{ borderRadius: 10, fontSize: '0.9rem' }}
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            autoFocus
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            className={`form-control${errors.email ? ' is-invalid' : ''}`}
                            style={{ borderRadius: 10, fontSize: '0.9rem' }}
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    {/* Unverified email notice */}
                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="col-12">
                            <div style={{ background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#92400e' }}>
                                ⚠️ Your email is unverified.{' '}
                                <Link href={route('verification.send')} method="post" as="button" style={{ color: '#b45309', fontWeight: 600 }}>
                                    Resend verification email
                                </Link>
                                {status === 'verification-link-sent' && (
                                    <span style={{ color: '#16a34a', marginLeft: 8 }}>✓ Sent!</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: 10,
                            border: 'none',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>
                    {saved && (
                        <span style={{ fontSize: '0.83rem', color: '#16a34a', fontWeight: 600 }}>
                            ✓ Saved successfully
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
