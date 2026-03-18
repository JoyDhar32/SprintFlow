import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ inviteEmail = '' }) {
    const fromInvite = !!inviteEmail;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: inviteEmail,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <h4 className="fw-bold mb-1">Create your account</h4>
            <p className="text-muted small mb-4">Start managing projects with SprintFlow</p>

            <form onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-medium">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        className={`form-control${errors.name ? ' is-invalid' : ''}`}
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}${fromInvite ? ' bg-light' : ''}`}
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => !fromInvite && setData('email', e.target.value)}
                        readOnly={fromInvite}
                        placeholder="you@example.com"
                        required
                    />
                    {fromInvite && (
                        <div className="form-text">This email is tied to your invitation and cannot be changed.</div>
                    )}
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        required
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
                        placeholder="Repeat your password"
                        required
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
                        <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                    ) : 'Create Account'}
                </button>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                    Already have an account?{' '}
                    <Link href={route('login')} className="text-decoration-none fw-medium" style={{ color: 'var(--sf-primary)' }}>
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
