import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PLANS = [
    {
        slug: 'basic',
        badge: null,
        accent: '#6366f1',
        accentLight: '#eef2ff',
        icon: '🚀',
    },
    {
        slug: 'standard',
        badge: 'Most Popular',
        accent: '#8b5cf6',
        accentLight: '#f5f3ff',
        icon: '⚡',
    },
    {
        slug: 'premium',
        badge: 'Best Value',
        accent: '#0ea5e9',
        accentLight: '#f0f9ff',
        icon: '👑',
    },
];

function PlanCard({ meta, plan, isCurrent, isAuthenticated, onSubscribe }) {
    const price   = (plan.price / 100).toFixed(2);
    const noStripe = !plan.stripe_price;

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: 20,
                padding: meta.badge ? '2px' : 0,
                background: meta.badge
                    ? `linear-gradient(135deg, ${meta.accent}, #a78bfa)`
                    : 'transparent',
            }}
        >
            {meta.badge && (
                <div
                    style={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: `linear-gradient(90deg, ${meta.accent}, #a78bfa)`,
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '4px 14px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                        zIndex: 2,
                    }}
                >
                    {meta.badge}
                </div>
            )}

            <div
                style={{
                    background: '#fff',
                    borderRadius: meta.badge ? 18 : 20,
                    border: meta.badge ? 'none' : '1.5px solid #e5e7eb',
                    padding: '2rem',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: meta.badge
                        ? '0 8px 40px rgba(99,102,241,0.18)'
                        : '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 16px 48px ${meta.accent}28`;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = meta.badge
                        ? '0 8px 40px rgba(99,102,241,0.18)'
                        : '0 2px 12px rgba(0,0,0,0.06)';
                }}
            >
                {/* Icon + Name */}
                <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: meta.accentLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                        }}
                    >
                        {meta.icon}
                    </span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>{plan.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{plan.description}</div>
                    </div>
                </div>

                {/* Price */}
                <div className="mb-4" style={{ lineHeight: 1 }}>
                    <span style={{ fontSize: '2.6rem', fontWeight: 800, color: meta.accent }}>
                        ${price}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', marginLeft: 4 }}>/month</span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f3f4f6', marginBottom: '1.2rem' }} />

                {/* Features */}
                <ul className="list-unstyled flex-grow-1 mb-4" style={{ margin: 0 }}>
                    {plan.features.map((f, i) => (
                        <li key={i} className="d-flex align-items-start gap-2 mb-2">
                            <span
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    background: meta.accentLight,
                                    color: meta.accent,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    flexShrink: 0,
                                    marginTop: 1,
                                }}
                            >
                                ✓
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.4 }}>{f}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                    <button
                        disabled
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: 10,
                            border: `1.5px solid ${meta.accent}`,
                            background: 'transparent',
                            color: meta.accent,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'default',
                        }}
                    >
                        ✓ Current Plan
                    </button>
                ) : noStripe ? (
                    <button
                        disabled
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: 10,
                            border: '1.5px solid #e5e7eb',
                            background: '#f9fafb',
                            color: '#9ca3af',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'not-allowed',
                        }}
                    >
                        Not Available
                    </button>
                ) : isAuthenticated ? (
                    <button
                        onClick={() => onSubscribe(meta.slug)}
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: 10,
                            border: 'none',
                            background: `linear-gradient(135deg, ${meta.accent}, #a78bfa)`,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            letterSpacing: '0.01em',
                        }}
                    >
                        Get {plan.name} →
                    </button>
                ) : (
                    <Link
                        href="/register"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: 10,
                            border: 'none',
                            background: `linear-gradient(135deg, ${meta.accent}, #a78bfa)`,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        Get Started →
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function Pricing({ plans, currentPlan }) {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth?.user;

    const handleSubscribe = (slug) => {
        router.post('/billing/checkout', { plan: slug });
    };

    return (
        <AuthenticatedLayout header={<h1 className="h5 mb-0 fw-semibold">Pricing</h1>}>
            <Head title="Pricing" />

            <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
                {/* Header */}
                <div className="text-center mb-5">
                    <span
                        className="badge mb-3"
                        style={{
                            background: '#eef2ff',
                            color: '#6366f1',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '6px 14px',
                            borderRadius: 20,
                        }}
                    >
                        💎 Plans & Pricing
                    </span>
                    <h2 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#111', letterSpacing: '-0.02em' }}>
                        The right plan for your team
                    </h2>
                    <p className="text-muted mt-2" style={{ maxWidth: 480, margin: '0 auto', fontSize: '1rem' }}>
                        Start free. Upgrade whenever your team grows. Cancel anytime.
                    </p>

                    {currentPlan !== 'free' && (
                        <div
                            className="d-inline-flex align-items-center gap-2 mt-3"
                            style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: 10,
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                color: '#16a34a',
                                fontWeight: 600,
                            }}
                        >
                            ✓ You're on the <strong style={{ marginLeft: 3 }}>{plans[currentPlan]?.name}</strong> plan
                        </div>
                    )}
                </div>

                {/* Plan cards */}
                <div className="row g-4 align-items-stretch mb-5">
                    {PLANS.map((meta) => {
                        const plan = plans[meta.slug];
                        if (!plan) return null;
                        return (
                            <div key={meta.slug} className="col-md-4" style={{ paddingTop: meta.badge ? 16 : 0 }}>
                                <PlanCard
                                    meta={meta}
                                    plan={plan}
                                    isCurrent={currentPlan === meta.slug}
                                    isAuthenticated={isAuthenticated}
                                    onSubscribe={handleSubscribe}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Comparison table */}
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1.5px solid #e5e7eb',
                        overflow: 'hidden',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    }}
                >
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                        <h6 style={{ fontWeight: 700, color: '#111', margin: 0 }}>Plan Comparison</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ fontSize: '0.88rem' }}>
                            <thead style={{ background: '#fafafa' }}>
                                <tr>
                                    <th style={{ padding: '0.9rem 1.5rem', color: '#6b7280', fontWeight: 600, border: 'none' }}>Feature</th>
                                    {['Free', 'Basic', 'Standard', 'Premium'].map(n => (
                                        <th key={n} style={{ padding: '0.9rem 1rem', textAlign: 'center', color: '#111', fontWeight: 700, border: 'none' }}>{n}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Team Members', values: ['1', '3', '50', '100'] },
                                    { label: 'Projects', values: ['∞', '∞', '∞', '∞'] },
                                    { label: 'Kanban Board', values: [true, true, true, true] },
                                    { label: 'Task Comments', values: [true, true, true, true] },
                                    { label: 'Priority Support', values: [false, false, true, true] },
                                    { label: 'Dedicated Onboarding', values: [false, false, false, true] },
                                    { label: 'Price / month', values: ['Free', '$9.99', '$29.99', '$49.99'] },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.85rem 1.5rem', color: '#374151', fontWeight: 500 }}>{row.label}</td>
                                        {row.values.map((v, j) => (
                                            <td key={j} style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#374151' }}>
                                                {v === true  && <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>}
                                                {v === false && <span style={{ color: '#d1d5db' }}>—</span>}
                                                {typeof v === 'string' && <span style={{ fontWeight: j === 0 ? 400 : 600 }}>{v}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="row g-3 mt-4">
                    {[
                        { q: 'Can I upgrade or downgrade anytime?', a: 'Yes — changes take effect immediately and are prorated automatically.' },
                        { q: 'What happens if I cancel?', a: 'You keep your plan until the billing period ends, then drop to Free.' },
                        { q: 'Are payments secure?', a: 'All payments go through Stripe. We never store your card details.' },
                        { q: 'What counts as a team member?', a: 'Any user invited to a team you own. The limit applies per team.' },
                    ].map((item, i) => (
                        <div key={i} className="col-md-6">
                            <div
                                style={{
                                    background: '#fafafa',
                                    border: '1.5px solid #f3f4f6',
                                    borderRadius: 12,
                                    padding: '1rem 1.25rem',
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: 4 }}>{item.q}</div>
                                <div style={{ fontSize: '0.83rem', color: '#6b7280', lineHeight: 1.5 }}>{item.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
