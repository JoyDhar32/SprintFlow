import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const PRIORITY_COLORS = {
    low: { bg: '#dcfce7', text: '#16a34a' },
    medium: { bg: '#fef9c3', text: '#ca8a04' },
    high: { bg: '#fee2e2', text: '#dc2626' },
    urgent: { bg: '#ede9fe', text: '#7c3aed' },
};

const STATUS_COLORS = {
    todo: { bg: '#f1f5f9', text: '#64748b', label: 'To Do' },
    in_progress: { bg: '#dbeafe', text: '#2563eb', label: 'In Progress' },
    in_review: { bg: '#fef3c7', text: '#d97706', label: 'In Review' },
    done: { bg: '#dcfce7', text: '#16a34a', label: 'Done' },
};

function PriorityBadge({ priority }) {
    const config = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
    return (
        <span
            className="badge"
            style={{ background: config.bg, color: config.text, fontWeight: 600, fontSize: '0.72rem' }}
        >
            {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
        </span>
    );
}

function StatusBadge({ status }) {
    const config = STATUS_COLORS[status] || STATUS_COLORS.todo;
    return (
        <span
            className="badge"
            style={{ background: config.bg, color: config.text, fontWeight: 600, fontSize: '0.72rem' }}
        >
            {config.label}
        </span>
    );
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}

export default function Dashboard({ auth, stats = {}, recentTasks = [], upcomingTasks = [], projects = [], recentActivity = [] }) {
    const user = auth.user;

    const statCards = [
        {
            label: 'Total Tasks',
            value: stats.total_tasks ?? 0,
            icon: '📋',
            iconBg: '#ede9fe',
            change: stats.total_tasks_change,
        },
        {
            label: 'In Progress',
            value: stats.in_progress ?? 0,
            icon: '🔄',
            iconBg: '#dbeafe',
            change: null,
        },
        {
            label: 'Completed This Week',
            value: stats.completed_this_week ?? 0,
            icon: '✅',
            iconBg: '#dcfce7',
            change: stats.completed_change,
        },
        {
            label: 'Due Soon',
            value: stats.due_soon ?? 0,
            icon: '⏰',
            iconBg: '#fef3c7',
            change: null,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h1 className="h5 mb-0 fw-semibold">Dashboard</h1>
            }
        >
            <Head title="Dashboard" />

            <div className="p-4">
                {/* Welcome banner */}
                <div
                    className="rounded-3 mb-4 p-4"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff' }}
                >
                    <div className="row align-items-center">
                        <div className="col">
                            <h4 className="fw-bold mb-1">
                                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]}! 👋
                            </h4>
                            <p className="mb-0 opacity-75">
                                You have{' '}
                                <strong>{stats.in_progress ?? 0}</strong> tasks in progress and{' '}
                                <strong>{stats.due_soon ?? 0}</strong> due soon.
                            </p>
                        </div>
                        <div className="col-auto d-none d-md-block">
                            <div style={{ fontSize: '4rem', opacity: 0.3 }}>⚡</div>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="row g-3 mb-4">
                    {statCards.map((card, i) => (
                        <div className="col-sm-6 col-xl-3" key={i}>
                            <div className="stat-card h-100">
                                <div className="d-flex align-items-start justify-content-between">
                                    <div>
                                        <div className="text-muted small mb-1">{card.label}</div>
                                        <div className="h3 mb-0 fw-bold">{card.value}</div>
                                        {card.change !== undefined && card.change !== null && (
                                            <div className={`small mt-1 ${card.change >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {card.change >= 0 ? '▲' : '▼'} {Math.abs(card.change)} from last week
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="stat-icon"
                                        style={{ background: card.iconBg }}
                                    >
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    {/* Recent Tasks */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                                <h6 className="mb-0 fw-semibold">My Recent Tasks</h6>
                                <Link href="/tasks" className="btn btn-sm btn-outline-primary">
                                    View all
                                </Link>
                            </div>
                            <div className="card-body p-0">
                                {recentTasks.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <div style={{ fontSize: '3rem' }}>📋</div>
                                        <div className="mt-2">No tasks yet</div>
                                        <Link href="/projects" className="btn btn-primary btn-sm mt-3">
                                            Browse Projects
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr className="table-light">
                                                    <th className="border-0 ps-4 fw-semibold text-muted small">Task</th>
                                                    <th className="border-0 fw-semibold text-muted small">Project</th>
                                                    <th className="border-0 fw-semibold text-muted small">Priority</th>
                                                    <th className="border-0 fw-semibold text-muted small">Status</th>
                                                    <th className="border-0 fw-semibold text-muted small">Due Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentTasks.map((task) => (
                                                    <tr key={task.id}>
                                                        <td className="ps-4">
                                                            <Link
                                                                href={`/tasks/${task.id}`}
                                                                className="text-decoration-none fw-medium text-dark"
                                                                style={{ fontSize: '0.9rem' }}
                                                            >
                                                                {task.title}
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            {task.project ? (
                                                                <Link
                                                                    href={`/projects/${task.project.id}/board`}
                                                                    className="text-decoration-none text-muted small"
                                                                >
                                                                    {task.project.name}
                                                                </Link>
                                                            ) : '—'}
                                                        </td>
                                                        <td><PriorityBadge priority={task.priority} /></td>
                                                        <td><StatusBadge status={task.status} /></td>
                                                        <td>
                                                            <span className={`small ${isOverdue(task.due_date) && task.status !== 'done' ? 'text-danger fw-semibold' : 'text-muted'}`}>
                                                                {isOverdue(task.due_date) && task.status !== 'done' ? '⚠️ ' : ''}
                                                                {formatDate(task.due_date)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="col-lg-4">
                        {/* Upcoming tasks */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="mb-0 fw-semibold">⏰ Due Soon</h6>
                            </div>
                            <div className="card-body p-0">
                                {upcomingTasks.length === 0 ? (
                                    <div className="text-center py-4 text-muted small">
                                        No upcoming deadlines
                                    </div>
                                ) : (
                                    <ul className="list-group list-group-flush">
                                        {upcomingTasks.map((task) => (
                                            <li key={task.id} className="list-group-item border-0 py-2 px-3">
                                                <Link
                                                    href={`/tasks/${task.id}`}
                                                    className="text-decoration-none d-flex align-items-start gap-2"
                                                >
                                                    <div className="flex-grow-1">
                                                        <div className="small fw-medium text-dark" style={{ lineHeight: 1.3 }}>
                                                            {task.title}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {task.project?.name}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`small fw-semibold text-nowrap ${isOverdue(task.due_date) ? 'text-danger' : 'text-warning'}`}
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        {formatDate(task.due_date)}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="mb-0 fw-semibold">🕐 Recent Activity</h6>
                            </div>
                            <div className="card-body">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-3 text-muted small">No recent activity</div>
                                ) : (
                                    recentActivity.map((activity, i) => (
                                        <div key={i} className="activity-item mb-3">
                                            <div
                                                className="activity-dot"
                                                style={{ background: '#4f46e5' }}
                                            />
                                            <div className="small text-dark" style={{ lineHeight: 1.4 }}>
                                                {activity.description}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                                                {timeAgo(activity.created_at)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects quick access */}
                {projects.length > 0 && (
                    <div className="mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-semibold mb-0">📁 My Projects</h6>
                            <Link href="/projects" className="btn btn-sm btn-outline-primary">View all</Link>
                        </div>
                        <div className="row g-3">
                            {projects.slice(0, 4).map((project) => (
                                <div className="col-sm-6 col-xl-3" key={project.id}>
                                    <Link
                                        href={`/projects/${project.id}/board`}
                                        className="text-decoration-none"
                                    >
                                        <div className="card border-0 shadow-sm h-100 project-card" style={{ cursor: 'pointer', transition: 'transform 0.15s' }}>
                                            <div
                                                className="card-header border-0"
                                                style={{
                                                    background: project.color || '#4f46e5',
                                                    height: 6,
                                                    padding: 0,
                                                    borderRadius: '8px 8px 0 0',
                                                }}
                                            />
                                            <div className="card-body py-3 px-3">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: (project.color || '#4f46e5') + '20',
                                                            color: project.color || '#4f46e5',
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {project.key}
                                                    </span>
                                                </div>
                                                <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                                                    {project.name}
                                                </div>
                                                {project.team && (
                                                    <div className="text-muted small">{project.team.name}</div>
                                                )}
                                                {project.tasks_count !== undefined && (
                                                    <div className="mt-2">
                                                        <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.73rem' }}>
                                                            <span>{project.completed_tasks ?? 0}/{project.tasks_count} tasks</span>
                                                            <span>{project.tasks_count > 0 ? Math.round((project.completed_tasks ?? 0) / project.tasks_count * 100) : 0}%</span>
                                                        </div>
                                                        <div className="progress" style={{ height: 4 }}>
                                                            <div
                                                                className="progress-bar"
                                                                style={{
                                                                    width: project.tasks_count > 0 ? `${Math.round((project.completed_tasks ?? 0) / project.tasks_count * 100)}%` : '0%',
                                                                    background: project.color || '#4f46e5',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
