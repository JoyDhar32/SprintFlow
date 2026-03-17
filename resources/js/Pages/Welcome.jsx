import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to SprintFlow" />

            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)' }}>

                {/* Navbar */}
                <nav className="navbar navbar-expand-lg px-4 px-lg-5 py-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="container-xl">
                        <a className="navbar-brand fw-bold fs-4 text-white" href="#">
                            ⚡ SprintFlow
                        </a>
                        <div className="ms-auto d-flex gap-2">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="btn btn-light btn-sm px-4">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="btn btn-outline-light btn-sm px-4">
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="btn btn-light btn-sm px-4">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <div className="container-xl px-4 px-lg-5 py-5 mt-4 text-center text-white">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="mb-3">
                                <span className="badge px-3 py-2 rounded-pill fw-semibold"
                                    style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                    🚀 Project Management, Reimagined
                                </span>
                            </div>
                            <h1 className="display-4 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
                                Ship faster with<br />
                                <span style={{ color: '#a5b4fc' }}>SprintFlow</span>
                            </h1>
                            <p className="lead mb-5 opacity-75" style={{ maxWidth: 580, margin: '0 auto 2rem' }}>
                                A modern project management platform built for agile teams.
                                Kanban boards, real-time collaboration, task tracking — everything your team needs to move fast.
                            </p>
                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="btn btn-light btn-lg px-5 fw-semibold">
                                        Open Dashboard →
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('register')} className="btn btn-light btn-lg px-5 fw-semibold">
                                            Start for free →
                                        </Link>
                                        <Link href={route('login')} className="btn btn-outline-light btn-lg px-5">
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="container-xl px-4 px-lg-5 py-5 mt-2">
                    <div className="row g-4">
                        {[
                            {
                                icon: '🗂️',
                                title: 'Kanban Boards',
                                desc: 'Drag-and-drop tasks across customizable columns. Visualize your workflow and keep the team aligned.',
                            },
                            {
                                icon: '⚡',
                                title: 'Real-time Updates',
                                desc: 'See task changes, comments and notifications the moment they happen — no refresh needed.',
                            },
                            {
                                icon: '👥',
                                title: 'Team Collaboration',
                                desc: 'Invite team members, assign tasks, track who\'s working on what with full activity history.',
                            },
                            {
                                icon: '📊',
                                title: 'Priority Tracking',
                                desc: 'Mark tasks as Low, Medium, High or Urgent. Filter the board to focus on what matters most.',
                            },
                            {
                                icon: '💬',
                                title: 'Task Comments',
                                desc: 'Discuss directly on tasks. Full comment threads with activity timeline keep context intact.',
                            },
                            {
                                icon: '🔔',
                                title: 'Smart Notifications',
                                desc: 'Get notified when you\'re assigned a task or someone comments. In-app notifications, real-time.',
                            },
                        ].map((f, i) => (
                            <div className="col-md-6 col-lg-4" key={i}>
                                <div className="h-100 p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <div className="mb-3" style={{ fontSize: '2rem' }}>{f.icon}</div>
                                    <h5 className="fw-semibold text-white mb-2">{f.title}</h5>
                                    <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div className="container-xl px-4 px-lg-5 py-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-white mb-2">Simple, transparent pricing</h2>
                        <p style={{ color: 'rgba(255,255,255,0.65)' }}>Start free. Upgrade as your team grows.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {[
                            {
                                name: 'Basic',
                                price: '$9.99',
                                limit: '3 members',
                                features: ['Unlimited projects', 'Kanban boards', 'Task management', 'Comments'],
                                highlight: false,
                            },
                            {
                                name: 'Standard',
                                price: '$29.99',
                                limit: '50 members',
                                features: ['Unlimited projects', 'Kanban boards', 'Task management', 'Comments', 'Priority support'],
                                highlight: true,
                            },
                            {
                                name: 'Premium',
                                price: '$49.99',
                                limit: '100 members',
                                features: ['Unlimited projects', 'Kanban boards', 'Task management', 'Comments', 'Priority support', 'Dedicated onboarding'],
                                highlight: false,
                            },
                        ].map((plan) => (
                            <div className="col-md-4" key={plan.name} style={{ maxWidth: 320 }}>
                                <div
                                    className="p-4 rounded-3 h-100 d-flex flex-column"
                                    style={{
                                        background: plan.highlight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                                        border: plan.highlight ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.12)',
                                    }}
                                >
                                    {plan.highlight && (
                                        <div className="text-center mb-2">
                                            <span className="badge rounded-pill px-3" style={{ background: '#a5b4fc', color: '#1e1b4b', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    <h5 className="fw-bold text-white mb-1">{plan.name}</h5>
                                    <div className="mb-1">
                                        <span className="fw-bold text-white" style={{ fontSize: '1.8rem' }}>{plan.price}</span>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}> / month</span>
                                    </div>
                                    <div className="mb-3 small" style={{ color: '#a5b4fc', fontWeight: 600 }}>👥 {plan.limit}</div>
                                    <ul className="list-unstyled flex-grow-1 mb-4">
                                        {plan.features.map((f) => (
                                            <li key={f} className="mb-1 small" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                                <span style={{ color: '#a5b4fc', marginRight: 6 }}>✓</span>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className="btn fw-semibold w-100"
                                        style={plan.highlight
                                            ? { background: '#fff', color: '#4f46e5', border: 'none' }
                                            : { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
                                        }
                                    >
                                        Get started →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Demo credentials */}
                <div className="container-xl px-4 px-lg-5 py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="p-4 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <h5 className="fw-semibold text-white mb-3">🎭 Try the Demo</h5>
                                <p className="small mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    Use any of these accounts — password is <code className="text-white bg-transparent">password</code> for all
                                </p>
                                <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
                                    <span className="badge px-3 py-2 fw-normal"
                                        style={{ background: 'rgba(255,255,255,0.15)', color: '#e0e7ff', fontSize: '0.82rem' }}>
                                        info@joydhar.com
                                    </span>
                                </div>
                                <Link href={route('login')} className="btn btn-light px-5 fw-semibold">
                                    Log in now →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center py-4" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
                    Built with Laravel + React + Bootstrap 5 &nbsp;·&nbsp; ⚡ SprintFlow
                </footer>
            </div>
        </>
    );
}
