import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

const TABS = [
    { key: 'profile',  label: 'Profile',       icon: '👤' },
    { key: 'password', label: 'Password',       icon: '🔒' },
    { key: 'danger',   label: 'Danger Zone',    icon: '⚠️' },
];

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, subscription } = usePage().props;
    const user = auth.user;
    const [tab, setTab] = useState('profile');

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <AuthenticatedLayout header={<h1 className="h5 mb-0 fw-semibold">Settings</h1>}>
            <Head title="Settings" />

            <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>

                {/* ── Profile hero ── */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
                        borderRadius: 20,
                        padding: '2rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(79,70,229,0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* decorative circles */}
                    <div style={{ position:'absolute', right:-20, top:-20, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
                    <div style={{ position:'absolute', right:80, bottom:-40, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

                    <div
                        style={{
                            width: 72, height: 72, borderRadius: 18,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            border: '2px solid rgba(255,255,255,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', fontWeight: 800, flexShrink: 0,
                            position: 'relative',
                        }}
                    >
                        {initials}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {user.name}
                        </div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: 4 }}>{user.email}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {user.role === 'admin' ? '⚡ Admin' : '👤 Member'}
                            </span>
                            {subscription && (
                                <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    💎 {subscription.plan_name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tab layout ── */}
                <div className="row g-4">
                    {/* Sidebar tabs */}
                    <div className="col-md-3">
                        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #f3f4f6', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            {TABS.map((t, i) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        border: 'none',
                                        borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
                                        background: tab === t.key ? '#eef2ff' : '#fff',
                                        color: tab === t.key ? '#4f46e5' : t.key === 'danger' ? '#dc2626' : '#374151',
                                        fontWeight: tab === t.key ? 700 : 500,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderLeft: tab === t.key ? '3px solid #4f46e5' : '3px solid transparent',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-md-9">
                        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            {tab === 'profile'  && <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />}
                            {tab === 'password' && <UpdatePasswordForm />}
                            {tab === 'danger'   && <DeleteUserForm />}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
