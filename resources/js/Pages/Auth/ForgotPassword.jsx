import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h4 className="fw-bold mb-1">Forgot password?</h4>
            <p className="text-muted small mb-4">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {status && (
                <div className="alert alert-success small py-2 mb-3">{status}</div>
            )}

            <form onSubmit={submit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email}
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={processing}
                    style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                >
                    {processing ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                    ) : 'Send Reset Link'}
                </button>
            </form>
        </GuestLayout>
    );
}
