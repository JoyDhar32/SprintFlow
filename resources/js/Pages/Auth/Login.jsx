import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h4 className="fw-bold mb-1">Welcome back</h4>
            <p className="text-muted small mb-4">Sign in to your SprintFlow account</p>

            {status && (
                <div className="alert alert-success small py-2">{status}</div>
            )}

            <form onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3 form-check">
                    <input
                        id="remember"
                        type="checkbox"
                        className="form-check-input"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="remember">
                        Remember me
                    </label>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-muted small text-decoration-none"
                        >
                            Forgot password?
                        </Link>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={processing}
                        style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)', marginLeft: 'auto' }}
                    >
                        {processing ? (
                            <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
                        ) : 'Sign in'}
                    </button>
                </div>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="text-decoration-none fw-medium" style={{ color: 'var(--sf-primary)' }}>
                        Sign up free
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
