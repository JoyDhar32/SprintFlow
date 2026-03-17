import { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const ROLE_COLORS = {
    owner: { bg: '#ede9fe', text: '#7c3aed' },
    admin: { bg: '#dbeafe', text: '#2563eb' },
    member: { bg: '#f3f4f6', text: '#6b7280' },
};

function MemberRow({ member, team, currentUserRole }) {
    const isOwner = member.pivot?.role === 'owner';
    const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';
    const role = member.pivot?.role || 'member';
    const roleConfig = ROLE_COLORS[role] || ROLE_COLORS.member;

    const handleRemove = () => {
        if (!confirm(`Remove ${member.name} from the team?`)) return;
        router.delete(`/teams/${team.slug}/members/${member.id}`, { preserveScroll: true });
    };

    const handleRoleChange = (newRole) => {
        router.put(`/teams/${team.slug}/members/${member.id}`, { role: newRole }, { preserveScroll: true });
    };

    return (
        <div className="d-flex align-items-center gap-3 py-2 border-bottom">
            <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                style={{
                    width: 40,
                    height: 40,
                    background: `hsl(${(member.id * 57) % 360}, 65%, 50%)`,
                    fontSize: '0.85rem',
                }}
            >
                {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-grow-1">
                <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{member.name}</div>
                <div className="text-muted small">{member.email}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
                {canManage && !isOwner ? (
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 120 }}
                        value={role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                ) : (
                    <span
                        className="badge"
                        style={{ background: roleConfig.bg, color: roleConfig.text, fontWeight: 600, fontSize: '0.72rem' }}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                )}
                {canManage && !isOwner && (
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleRemove}
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    );
}

export default function TeamShow({ team, auth }) {
    const { subscription } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const currentUserRole = team.members?.find((m) => m.id === auth.user.id)?.pivot?.role || 'member';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'member',
    });

    const handleInvite = (e) => {
        e.preventDefault();
        post(route('teams.invite', team.slug), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    <Link href="/teams" className="text-muted text-decoration-none small">Teams</Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold">{team.name}</span>
                </div>
            }
        >
            <Head title={team.name} />

            <div className="p-4">
                {/* Team header */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-4">
                            <div
                                className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                style={{ width: 64, height: 64, background: 'var(--sf-primary)', fontSize: '1.5rem' }}
                            >
                                {team.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                                <h4 className="fw-bold mb-1">{team.name}</h4>
                                {team.description && (
                                    <p className="text-muted mb-2">{team.description}</p>
                                )}
                                <div className="d-flex gap-3 text-muted small">
                                    <span>👥 {team.members?.length ?? 0} members</span>
                                    <span>📁 {team.projects?.length ?? 0} projects</span>
                                    <span>📅 Created {new Date(team.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                                <Link
                                    href={`/teams/${team.slug}/edit`}
                                    className="btn btn-outline-secondary btn-sm"
                                >
                                    ⚙️ Edit Team
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                    {[
                        { key: 'overview', label: '📊 Overview' },
                        { key: 'members', label: `👥 Members (${team.members?.length ?? 0})` },
                        { key: 'projects', label: `📁 Projects (${team.projects?.length ?? 0})` },
                    ].map((tab) => (
                        <li className="nav-item" key={tab.key}>
                            <button
                                className={`nav-link${activeTab === tab.key ? ' active fw-semibold' : ' text-muted'}`}
                                onClick={() => setActiveTab(tab.key)}
                                style={{ border: 'none', background: 'none' }}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Overview tab */}
                {activeTab === 'overview' && (
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon" style={{ background: '#ede9fe' }}>👥</div>
                                    <div>
                                        <div className="h3 mb-0 fw-bold">{team.members?.length ?? 0}</div>
                                        <div className="text-muted small">Members</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon" style={{ background: '#dbeafe' }}>📁</div>
                                    <div>
                                        <div className="h3 mb-0 fw-bold">{team.projects?.length ?? 0}</div>
                                        <div className="text-muted small">Projects</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
                                    <div>
                                        <div className="h3 mb-0 fw-bold">{team.completed_tasks ?? 0}</div>
                                        <div className="text-muted small">Tasks Completed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members tab */}
                {activeTab === 'members' && (
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="mb-0 fw-semibold">Team Members</h6>
                                </div>
                                <div className="card-body px-3 py-0">
                                    {team.members?.length === 0 ? (
                                        <div className="text-center py-4 text-muted">No members yet</div>
                                    ) : (
                                        team.members?.map((member) => (
                                            <MemberRow
                                                key={member.id}
                                                member={member}
                                                team={team}
                                                currentUserRole={currentUserRole}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom py-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h6 className="mb-0 fw-semibold">Invite Member</h6>
                                            {subscription && (
                                                <span className="badge" style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem' }}>
                                                    {subscription.plan_name} · {subscription.member_limit} max
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleInvite}>
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium">Email Address</label>
                                                <input
                                                    type="email"
                                                    className={`form-control${errors.email ? ' is-invalid' : ''}`}
                                                    placeholder="colleague@example.com"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                />
                                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-medium">Role</label>
                                                <select
                                                    className="form-select"
                                                    value={data.role}
                                                    onChange={(e) => setData('role', e.target.value)}
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100"
                                                disabled={processing}
                                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                            >
                                                {processing ? 'Sending...' : 'Send Invitation'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects tab */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="d-flex justify-content-end mb-3">
                            <Link
                                href={`/projects/create?team_id=${team.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                            >
                                + New Project
                            </Link>
                        </div>

                        {!team.projects || team.projects.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <div style={{ fontSize: '3rem' }}>📁</div>
                                <div className="mt-2">No projects in this team yet</div>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {team.projects.map((project) => (
                                    <div key={project.id} className="col-md-6 col-xl-4">
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
                                            <div style={{ height: 5, background: project.color || '#4f46e5' }} />
                                            <div className="card-body">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span
                                                        className="badge fw-bold"
                                                        style={{
                                                            background: (project.color || '#4f46e5') + '20',
                                                            color: project.color || '#4f46e5',
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {project.key}
                                                    </span>
                                                </div>
                                                <h6 className="fw-semibold mb-1">{project.name}</h6>
                                                {project.description && (
                                                    <p className="text-muted small mb-2" style={{ lineHeight: 1.4 }}>
                                                        {project.description?.slice(0, 80)}{project.description?.length > 80 ? '...' : ''}
                                                    </p>
                                                )}
                                                <Link
                                                    href={`/projects/${project.id}/board`}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    Open Board
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
