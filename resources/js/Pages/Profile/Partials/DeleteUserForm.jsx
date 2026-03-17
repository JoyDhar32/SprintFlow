import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess:  () => closeModal(),
            onError:    () => passwordInput.current?.focus(),
            onFinish:   () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <div>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <h5 style={{ fontWeight: 700, color: '#dc2626', margin: 0, fontSize: '1rem' }}>⚠️ Delete Account</h5>
                <p style={{ color: '#9ca3af', fontSize: '0.83rem', margin: '4px 0 0' }}>
                    This will permanently delete your account and all associated data.
                </p>
            </div>

            <div style={{ padding: '1.75rem' }}>
                <div style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: 12,
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    color: '#7f1d1d',
                    lineHeight: 1.6,
                }}>
                    <strong>Warning:</strong> Once deleted, your account cannot be recovered. All your projects,
                    tasks, and team memberships will be permanently removed.
                </div>

                <button
                    onClick={() => setConfirming(true)}
                    style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: 10,
                        border: '1.5px solid #dc2626',
                        background: 'transparent',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}
                >
                    Delete My Account
                </button>
            </div>

            {/* Confirmation modal */}
            {confirming && (
                <>
                    <div
                        onClick={closeModal}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1040,
                            backdropFilter: 'blur(2px)',
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#fff',
                        borderRadius: 20,
                        padding: '2rem',
                        width: '100%',
                        maxWidth: 440,
                        zIndex: 1050,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
                            <h5 style={{ fontWeight: 800, color: '#111', marginBottom: 8 }}>Delete your account?</h5>
                            <p style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                                This action is permanent and cannot be undone. Enter your password to confirm.
                            </p>
                        </div>

                        <form onSubmit={deleteUser}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                                    Your Password
                                </label>
                                <input
                                    type="password"
                                    ref={passwordInput}
                                    className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                    style={{ borderRadius: 10, fontSize: '0.9rem' }}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    autoFocus
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        flex: 1, padding: '0.65rem',
                                        borderRadius: 10,
                                        border: '1.5px solid #e5e7eb',
                                        background: '#fff',
                                        color: '#374151',
                                        fontWeight: 600,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{
                                        flex: 1, padding: '0.65rem',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: processing ? '#f87171' : '#dc2626',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.88rem',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {processing ? 'Deleting…' : 'Yes, Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
