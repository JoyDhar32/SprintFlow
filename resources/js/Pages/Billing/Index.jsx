import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PLAN_META = {
    free:     { icon: '🆓', accent: '#6b7280', light: '#f3f4f6', gradient: 'linear-gradient(135deg,#9ca3af,#6b7280)' },
    basic:    { icon: '🚀', accent: '#6366f1', light: '#eef2ff', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)' },
    standard: { icon: '⚡', accent: '#8b5cf6', light: '#f5f3ff', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' },
    premium:  { icon: '👑', accent: '#0ea5e9', light: '#f0f9ff', gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
};

const STATUS_MAP = {
    active:   { bg: '#f0fdf4', text: '#16a34a', label: 'Active' },
    trialing: { bg: '#f0f9ff', text: '#0ea5e9', label: 'Trial' },
    past_due: { bg: '#fefce8', text: '#ca8a04', label: 'Past Due' },
    canceled: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelled' },
};

export default function BillingIndex({ plans, currentPlan, subscription, memberLimit }) {
    const { auth } = usePage().props;
    const meta     = PLAN_META[currentPlan] || PLAN_META.free;
    const plan     = plans[currentPlan];
    const status   = STATUS_MAP[subscription?.status] || STATUS_MAP.active;

    const membersUsed  = 0; // could be passed from backend later
    const memberPct    = Math.min(100, Math.round((membersUsed / memberLimit) * 100));

    const handleCancel = () => {
        if (!confirm('Cancel your subscription? You keep access until the billing period ends.')) return;
        router.post('/billing/cancel');
    };

    const handleResume  = () => router.post('/billing/resume');
    const handlePortal  = () => { window.location.href = '/billing/portal'; };
    const handleUpgrade = (slug) => router.post('/billing/checkout', { plan: slug });

    return (
        <AuthenticatedLayout header={<h1 className="h5 mb-0 fw-semibold">Billing</h1>}>
            <Head title="Billing" />

            <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>

                {/* ── Current plan hero card ── */}
                <div
                    style={{
                        borderRadius: 20,
                        background: meta.gradient,
                        padding: '1.75rem 2rem',
                        color: '#fff',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 8px 32px ${meta.accent}40`,
                    }}
                >
                    {/* decorative circle */}
                    <div style={{
                        position: 'absolute', right: -30, top: -30,
                        width: 160, height: 160, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                    }} />
                    <div style={{
                        position: 'absolute', right: 60, bottom: -50,
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.07)',
                    }} />

                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3" style={{ position: 'relative' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.75, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                                Current Plan
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span style={{ fontSize: '2rem' }}>{meta.icon}</span>
                                <div>
                                    <div style={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
                                        {plan?.name ?? 'Free'}
                                    </div>
                                    {subscription && (
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                marginTop: 6,
                                                background: status.bg,
                                                color: status.text,
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                padding: '2px 10px',
                                                borderRadius: 20,
                                            }}
                                        >
                                            {status.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Grace period warning */}
                            {subscription?.on_grace && (
                                <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem' }}>
                                    ⚠️ Cancels on <strong>{subscription.ends_at}</strong>
                                    <button
                                        onClick={handleResume}
                                        style={{ marginLeft: 10, background: '#fff', color: meta.accent, border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Resume
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-end">
                            {currentPlan !== 'free' && (
                                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
                                    ${(plan.price / 100).toFixed(2)}
                                    <span style={{ fontSize: '0.9rem', fontWeight: 400, opacity: 0.75 }}>/mo</span>
                                </div>
                            )}
                            <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: 4 }}>
                                👥 {memberLimit} member{memberLimit !== 1 ? 's' : ''} per team
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2 flex-wrap" style={{ marginTop: '1.25rem', position: 'relative' }}>
                        {subscription && !subscription.cancelled && (
                            <button
                                onClick={handlePortal}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    border: '1.5px solid rgba(255,255,255,0.4)',
                                    borderRadius: 8,
                                    padding: '7px 16px',
                                    fontSize: '0.83rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                🧾 Manage Billing
                            </button>
                        )}
                        <Link
                            href="/pricing"
                            style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: meta.accent,
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 16px',
                                fontSize: '0.83rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            {currentPlan === 'free' ? '✨ Upgrade Plan' : '🔄 Change Plan'}
                        </Link>
                        {subscription && !subscription.cancelled && !subscription.on_grace && (
                            <button
                                onClick={handleCancel}
                                style={{
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.65)',
                                    border: '1.5px solid rgba(255,255,255,0.25)',
                                    borderRadius: 8,
                                    padding: '7px 16px',
                                    fontSize: '0.83rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Stats row ── */}
                <div className="row g-3 mb-4">
                    {[
                        {
                            icon: '👥',
                            label: 'Member Limit',
                            value: memberLimit === 1 ? 'Solo' : `${memberLimit} members`,
                            bg: meta.light,
                            color: meta.accent,
                        },
                        {
                            icon: '📋',
                            label: 'Plan',
                            value: plan?.name ?? 'Free',
                            bg: '#fafafa',
                            color: '#374151',
                        },
                        {
                            icon: '💳',
                            label: 'Billing',
                            value: subscription?.status === 'active' ? 'Monthly' : 'Not active',
                            bg: '#fafafa',
                            color: '#374151',
                        },
                    ].map((s, i) => (
                        <div key={i} className="col-md-4">
                            <div
                                style={{
                                    background: s.bg,
                                    borderRadius: 14,
                                    padding: '1.1rem 1.25rem',
                                    border: '1.5px solid #f3f4f6',
                                }}
                            >
                                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{s.icon}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {s.label}
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, marginTop: 2 }}>
                                    {s.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Available plans ── */}
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Available Plans
                    </span>
                    <Link href="/pricing" style={{ fontSize: '0.8rem', color: meta.accent, fontWeight: 600, textDecoration: 'none' }}>
                        View full comparison →
                    </Link>
                </div>

                <div className="row g-3">
                    {['basic', 'standard', 'premium'].map((slug) => {
                        const p      = plans[slug];
                        const m      = PLAN_META[slug];
                        const isCurr = currentPlan === slug;
                        const price  = (p.price / 100).toFixed(2);

                        return (
                            <div key={slug} className="col-md-4">
                                <div
                                    style={{
                                        background: '#fff',
                                        borderRadius: 14,
                                        border: isCurr ? `2px solid ${m.accent}` : '1.5px solid #f3f4f6',
                                        padding: '1.25rem',
                                        boxShadow: isCurr ? `0 4px 20px ${m.accent}20` : '0 2px 8px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <span
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 9,
                                                background: m.light,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                            }}
                                        >
                                            {m.icon}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Up to {p.member_limit} members</div>
                                        </div>
                                        {isCurr && (
                                            <span
                                                className="ms-auto"
                                                style={{
                                                    background: m.light,
                                                    color: m.accent,
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: 20,
                                                }}
                                            >
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: m.accent, marginBottom: '0.85rem' }}>
                                        ${price}
                                        <span style={{ fontSize: '0.78rem', fontWeight: 400, color: '#9ca3af' }}>/mo</span>
                                    </div>

                                    {isCurr ? (
                                        <button disabled style={{ width: '100%', padding: '7px', borderRadius: 8, border: `1.5px solid ${m.accent}`, background: 'transparent', color: m.accent, fontWeight: 600, fontSize: '0.82rem', cursor: 'default' }}>
                                            ✓ Current Plan
                                        </button>
                                    ) : !p.stripe_price ? (
                                        <button disabled style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af', fontWeight: 600, fontSize: '0.82rem', cursor: 'not-allowed' }}>
                                            Not Configured
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(slug)}
                                            style={{
                                                width: '100%',
                                                padding: '7px',
                                                borderRadius: 8,
                                                border: 'none',
                                                background: m.gradient,
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {currentPlan === 'free' || plans[currentPlan]?.price < p.price ? 'Upgrade' : 'Downgrade'} →
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stripe not configured notice */}
                {!plans.basic?.stripe_price && (
                    <div
                        style={{
                            marginTop: '1.5rem',
                            background: '#fffbeb',
                            border: '1.5px solid #fde68a',
                            borderRadius: 12,
                            padding: '0.9rem 1.25rem',
                            fontSize: '0.83rem',
                            color: '#92400e',
                        }}
                    >
                        <strong>Developer:</strong> Run <code>php artisan stripe:setup-plans</code> and add the price IDs to <code>.env</code> to enable payments.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
