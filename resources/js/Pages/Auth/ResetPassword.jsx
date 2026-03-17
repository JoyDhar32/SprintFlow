import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <h4 className="fw-bold mb-4">Reset your password</h4>

            <form onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">New Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="new-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Min. 8 characters"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password_confirmation" className="form-label fw-medium">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        className={`form-control${errors.password_confirmation ? ' is-invalid' : ''}`}
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    {errors.password_confirmation && (
                        <div className="invalid-feedback">{errors.password_confirmation}</div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={processing}
                    style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                >
                    {processing ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
                    ) : 'Reset Password'}
                </button>
            </form>
        </GuestLayout>
    );
}
