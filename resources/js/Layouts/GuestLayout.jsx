import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div
            className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
            style={{ background: '#f8f9fa' }}
        >
            <div className="mb-4">
                <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
                    <span style={{ fontSize: '2rem' }}>⚡</span>
                    <span className="fw-bold fs-4" style={{ color: '#1e1b4b' }}>SprintFlow</span>
                </Link>
            </div>

            <div
                className="card border-0 shadow-sm w-100"
                style={{ maxWidth: 440, borderRadius: 12 }}
            >
                <div className="card-body p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
