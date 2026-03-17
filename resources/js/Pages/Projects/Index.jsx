import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const STATUS_CONFIG = {
    active: { label: 'Active', bg: '#dcfce7', text: '#16a34a' },
    planning: { label: 'Planning', bg: '#dbeafe', text: '#2563eb' },
    on_hold: { label: 'On Hold', bg: '#fef9c3', text: '#ca8a04' },
    completed: { label: 'Completed', bg: '#f3f4f6', text: '#6b7280' },
    archived: { label: 'Archived', bg: '#f3f4f6', text: '#9ca3af' },
};

function ProjectCard({ project }) {
    const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
    const progress = project.tasks_count > 0
        ? Math.round((project.completed_tasks ?? 0) / project.tasks_count * 100)
        : 0;

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, overflow: 'hidden' }}>
            {/* Color accent top bar */}
            <div style={{ height: 6, background: project.color || '#4f46e5' }} />
            <div className="card-body d-flex flex-column">
                {/* Header row */}
                <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span
                                className="badge fw-bold"
                                style={{ background: (project.color || '#4f46e5') + '20', color: project.color || '#4f46e5', fontSize: '0.7rem' }}
                            >
                                {project.key}
                            </span>
                            <span
                                className="badge"
                                style={{ background: status.bg, color: status.text, fontSize: '0.7rem', fontWeight: 600 }}
                            >
                                {status.label}
                            </span>
                        </div>
                        <h6 className="mb-0 fw-semibold" style={{ lineHeight: 1.3 }}>
                            {project.name}
                        </h6>
                    </div>
                </div>

                {project.description && (
                    <p
                        className="text-muted small mb-2 flex-grow-1"
                        style={{
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {project.description}
                    </p>
                )}

                {/* Team */}
                {project.team && (
                    <div className="text-muted small mb-3">
                        👥 {project.team.name}
                    </div>
                )}

                {/* Progress */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>{project.completed_tasks ?? 0} / {project.tasks_count ?? 0} tasks</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: 5, borderRadius: 10 }}>
                        <div
                            className="progress-bar"
                            style={{
                                width: `${progress}%`,
                                background: project.color || '#4f46e5',
                                borderRadius: 10,
                            }}
                        />
                    </div>
                </div>

                {/* Dates */}
                {(project.start_date || project.end_date) && (
                    <div className="d-flex gap-3 text-muted mb-3" style={{ fontSize: '0.78rem' }}>
                        {project.start_date && (
                            <span>📅 {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                        {project.end_date && (
                            <span>🏁 {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="d-flex gap-2 mt-auto">
                    <Link
                        href={`/projects/${project.id}/board`}
                        className="btn btn-sm btn-primary flex-grow-1"
                        style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                    >
                        Open Board
                    </Link>
                    <Link
                        href={`/projects/${project.id}/edit`}
                        className="btn btn-sm btn-outline-secondary"
                    >
                        ⚙️
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ProjectsIndex({ projects = [] }) {
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = projects.filter((p) => {
        if (statusFilter && p.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(q) || (p.key || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <AuthenticatedLayout
            header={<h1 className="h5 mb-0 fw-semibold">Projects</h1>}
        >
            <Head title="Projects" />

            <div className="p-4">
                {/* Toolbar */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="input-group input-group-sm" style={{ width: 220 }}>
                            <span className="input-group-text bg-white border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 150 }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                    <Link
                        href="/projects/create"
                        className="btn btn-primary"
                        style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                    >
                        + New Project
                    </Link>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '4rem' }}>📁</div>
                        <h5 className="mt-3 text-muted">
                            {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
                        </h5>
                        {projects.length === 0 && (
                            <Link
                                href="/projects/create"
                                className="btn btn-primary mt-3"
                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                            >
                                Create your first project
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="row g-3">
                        {filtered.map((project) => (
                            <div key={project.id} className="col-md-6 col-xl-4">
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
