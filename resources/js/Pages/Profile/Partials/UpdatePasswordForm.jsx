import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput         = useRef();
    const currentPasswordInput  = useRef();
    const [saved, setSaved]     = useState(false);
    const [show, setShow]       = useState({ current: false, new: false, confirm: false });

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            },
            onError: () => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const toggle = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

    const PasswordField = ({ id, label, field, refProp, autoComplete }) => (
        <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    id={id}
                    ref={refProp}
                    type={show[field] ? 'text' : 'password'}
                    className={`form-control${errors[id] ? ' is-invalid' : ''}`}
                    style={{ borderRadius: 10, fontSize: '0.9rem', paddingRight: '2.8rem' }}
                    value={data[id]}
                    onChange={e => setData(id, e.target.value)}
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={() => toggle(field)}
                    style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: '#9ca3af', fontSize: '0.9rem', padding: 0,
                    }}
                >
                    {show[field] ? '🙈' : '👁️'}
                </button>
                {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <h5 style={{ fontWeight: 700, color: '#111', margin: 0, fontSize: '1rem' }}>Update Password</h5>
                <p style={{ color: '#9ca3af', fontSize: '0.83rem', margin: '4px 0 0' }}>
                    Use a strong, unique password to keep your account secure.
                </p>
            </div>

            <form onSubmit={submit} style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <PasswordField id="current_password" label="Current Password" field="current" refProp={currentPasswordInput} autoComplete="current-password" />
                    <PasswordField id="password"         label="New Password"     field="new"     refProp={passwordInput}        autoComplete="new-password" />
                    <PasswordField id="password_confirmation" label="Confirm New Password" field="confirm" autoComplete="new-password" />
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
                        {processing ? 'Updating…' : 'Update Password'}
                    </button>
                    {saved && (
                        <span style={{ fontSize: '0.83rem', color: '#16a34a', fontWeight: 600 }}>
                            ✓ Password updated
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
