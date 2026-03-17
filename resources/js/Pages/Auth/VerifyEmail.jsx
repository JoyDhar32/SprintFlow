import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="text-center mb-4">
                <div style={{ fontSize: '3rem' }}>📧</div>
                <h4 className="fw-bold mt-2">Verify your email</h4>
            </div>

            <p className="text-muted small mb-3">
                Thanks for signing up! Before getting started, please verify your email address by clicking the link we sent you.
            </p>

            {status === 'verification-link-sent' && (
                <div className="alert alert-success small py-2 mb-3">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit}>
                <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={processing}
                    style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                >
                    {processing ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                    ) : 'Resend Verification Email'}
                </button>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="btn btn-link text-muted small text-decoration-none"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
