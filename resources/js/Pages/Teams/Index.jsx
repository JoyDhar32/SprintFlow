import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function TeamCard({ team }) {
    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body d-flex flex-column p-4">
                {/* Icon + name */}
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold"
                        style={{
                            width: 48,
                            height: 48,
                            background: 'var(--sf-primary)',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                        }}
                    >
                        {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h6 className="mb-0 fw-semibold">{team.name}</h6>
                        <div className="text-muted small">
                            {team.members_count ?? 0} member{team.members_count !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {team.description ? (
                    <p
                        className="text-muted small mb-3 flex-grow-1"
                        style={{
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {team.description}
                    </p>
                ) : (
                    <div className="flex-grow-1" />
                )}

                {/* Stats */}
                <div className="d-flex gap-3 mb-3 text-muted" style={{ fontSize: '0.82rem' }}>
                    <span>👥 {team.members_count ?? 0} members</span>
                    <span>📁 {team.projects_count ?? 0} projects</span>
                </div>

                {/* Member avatars */}
                {team.members && team.members.length > 0 && (
                    <div className="d-flex mb-3" style={{ marginLeft: 0 }}>
                        {team.members.slice(0, 5).map((member, i) => (
                            <div
                                key={member.id}
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold border border-white"
                                style={{
                                    width: 28,
                                    height: 28,
                                    background: `hsl(${(member.id * 57) % 360}, 65%, 50%)`,
                                    fontSize: '0.65rem',
                                    marginLeft: i > 0 ? -8 : 0,
                                    zIndex: 5 - i,
                                    position: 'relative',
                                }}
                                title={member.name}
                            >
                                {member.name.slice(0, 2).toUpperCase()}
                            </div>
                        ))}
                        {team.members_count > 5 && (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-semibold border border-white"
                                style={{
                                    width: 28,
                                    height: 28,
                                    background: '#e9ecef',
                                    color: '#6b7280',
                                    fontSize: '0.65rem',
                                    marginLeft: -8,
                                }}
                            >
                                +{team.members_count - 5}
                            </div>
                        )}
                    </div>
                )}

                <Link
                    href={`/teams/${team.slug}`}
                    className="btn btn-outline-primary btn-sm"
                >
                    View Team →
                </Link>
            </div>
        </div>
    );
}

export default function TeamsIndex({ teams = [] }) {
    return (
        <AuthenticatedLayout
            header={<h1 className="h5 mb-0 fw-semibold">Teams</h1>}
        >
            <Head title="Teams" />

            <div className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <p className="text-muted mb-0">Manage your teams and collaborate with members.</p>
                    </div>
                    <Link
                        href="/teams/create"
                        className="btn btn-primary"
                        style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                    >
                        + Create Team
                    </Link>
                </div>

                {teams.length === 0 ? (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '4rem' }}>👥</div>
                        <h5 className="mt-3 text-muted">No teams yet</h5>
                        <p className="text-muted">Create a team to start collaborating with others.</p>
                        <Link
                            href="/teams/create"
                            className="btn btn-primary mt-2"
                            style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                        >
                            Create your first team
                        </Link>
                    </div>
                ) : (
                    <div className="row g-3">
                        {teams.map((team) => (
                            <div key={team.id} className="col-md-6 col-xl-4">
                                <TeamCard team={team} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
