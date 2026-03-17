import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <h4 className="fw-bold mb-1">Confirm Password</h4>
            <p className="text-muted small mb-4">
                This is a secure area. Please confirm your password before continuing.
            </p>

            <form onSubmit={submit}>
                <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Your password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={processing}
                    style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                >
                    {processing ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Confirming...</>
                    ) : 'Confirm Password'}
                </button>
            </form>
        </GuestLayout>
    );
}
