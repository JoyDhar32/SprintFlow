import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PRIORITY_CONFIG = {
    low: { label: 'Low', color: '#22c55e', bg: '#dcfce7' },
    medium: { label: 'Medium', color: '#f59e0b', bg: '#fef9c3' },
    high: { label: 'High', color: '#ef4444', bg: '#fee2e2' },
    urgent: { label: 'Urgent', color: '#7c3aed', bg: '#ede9fe' },
};

const STATUS_CONFIG = {
    todo: { label: 'To Do', color: '#64748b', bg: '#f1f5f9' },
    in_progress: { label: 'In Progress', color: '#2563eb', bg: '#dbeafe' },
    in_review: { label: 'In Review', color: '#d97706', bg: '#fef3c7' },
    done: { label: 'Done', color: '#16a34a', bg: '#dcfce7' },
};

function timeAgo(dateString) {
    if (!dateString) return '';
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

export default function TaskShow({ task, members = [], auth }) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(task.title);
    const [editingDesc, setEditingDesc] = useState(false);
    const [descValue, setDescValue] = useState(task.description || '');
    const titleRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({ content: '' });

    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

    const handleTitleSave = () => {
        if (titleValue.trim() && titleValue !== task.title) {
            router.put(`/tasks/${task.id}`, { title: titleValue }, { preserveScroll: true });
        }
        setEditingTitle(false);
    };

    const handleDescSave = () => {
        if (descValue !== (task.description || '')) {
            router.put(`/tasks/${task.id}`, { description: descValue }, { preserveScroll: true });
        }
        setEditingDesc(false);
    };

    const handleFieldChange = (field, value) => {
        router.put(`/tasks/${task.id}`, { [field]: value }, { preserveScroll: true });
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!data.content.trim()) return;
        post(`/tasks/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    {task.project && (
                        <>
                            <Link href="/projects" className="text-muted text-decoration-none small">Projects</Link>
                            <span className="text-muted">/</span>
                            <Link href={`/projects/${task.project.id}/board`} className="text-muted text-decoration-none small">
                                {task.project.name}
                            </Link>
                            <span className="text-muted">/</span>
                        </>
                    )}
                    <span className="fw-semibold text-truncate" style={{ maxWidth: 300 }}>{task.title}</span>
                </div>
            }
        >
            <Head title={task.title} />

            <div className="p-4">
                <div className="row g-4">
                    {/* Main content */}
                    <div className="col-lg-8">
                        {/* Task ID + status bar */}
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold">
                                #{task.id}
                            </span>
                            {task.project && (
                                <span className="text-muted small">{task.project.key}-{task.id}</span>
                            )}
                            <span
                                className="badge"
                                style={{ background: status.bg, color: status.color, fontWeight: 600 }}
                            >
                                {status.label}
                            </span>
                            <span
                                className="badge"
                                style={{ background: priority.bg, color: priority.color, fontWeight: 600 }}
                            >
                                {priority.label} Priority
                            </span>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            {editingTitle ? (
                                <input
                                    ref={titleRef}
                                    autoFocus
                                    className="form-control fw-bold"
                                    style={{ fontSize: '1.5rem' }}
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleTitleSave();
                                        if (e.key === 'Escape') { setTitleValue(task.title); setEditingTitle(false); }
                                    }}
                                />
                            ) : (
                                <h1
                                    className="fw-bold mb-0"
                                    style={{ fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1.3 }}
                                    onClick={() => setEditingTitle(true)}
                                    title="Click to edit title"
                                >
                                    {task.title}
                                    <span className="ms-2 text-muted" style={{ fontSize: '0.8rem', fontWeight: 400 }}>✏️</span>
                                </h1>
                            )}
                        </div>

                        {/* Description */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                                <h6 className="mb-0 fw-semibold">Description</h6>
                                {!editingDesc && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setEditingDesc(true)}
                                    >
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {editingDesc ? (
                                    <div>
                                        <textarea
                                            autoFocus
                                            className="form-control mb-3"
                                            rows={6}
                                            value={descValue}
                                            onChange={(e) => setDescValue(e.target.value)}
                                            placeholder="Add a description..."
                                        />
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleDescSave}
                                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => { setDescValue(task.description || ''); setEditingDesc(false); }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ minHeight: 60, cursor: 'pointer', lineHeight: 1.7 }}
                                        onClick={() => setEditingDesc(true)}
                                        className={task.description ? 'text-dark' : 'text-muted'}
                                    >
                                        {task.description || 'Add a description...'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="mb-0 fw-semibold">
                                    💬 Comments ({task.comments?.length ?? 0})
                                </h6>
                            </div>
                            <div className="card-body">
                                {task.comments && task.comments.length > 0 && (
                                    <div className="mb-4">
                                        {task.comments.map((comment) => (
                                            <div key={comment.id} className="d-flex gap-3 mb-4">
                                                <div
                                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        background: `hsl(${(comment.user?.id ?? 0) * 57 % 360}, 65%, 50%)`,
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    {comment.user?.name?.slice(0, 2).toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="fw-semibold">{comment.user?.name}</span>
                                                        <span className="text-muted small">{timeAgo(comment.created_at)}</span>
                                                    </div>
                                                    <div
                                                        className="p-3 rounded"
                                                        style={{ background: '#f8f9fa', lineHeight: 1.6, fontSize: '0.9rem' }}
                                                    >
                                                        {comment.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add comment */}
                                <form onSubmit={handleCommentSubmit}>
                                    <div className="d-flex gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                background: 'var(--sf-primary)',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            {auth.user.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1">
                                            <textarea
                                                className={`form-control mb-2${errors.content ? ' is-invalid' : ''}`}
                                                rows={3}
                                                placeholder="Add a comment..."
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                            />
                                            {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-sm"
                                                disabled={!data.content.trim() || processing}
                                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                            >
                                                {processing ? 'Posting...' : 'Post Comment'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Activity timeline */}
                        {task.activities && task.activities.length > 0 && (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h6 className="mb-0 fw-semibold">🕐 Activity</h6>
                                </div>
                                <div className="card-body">
                                    {task.activities.map((activity, i) => (
                                        <div key={i} className="activity-item mb-3">
                                            <div
                                                className="activity-dot"
                                                style={{ background: '#4f46e5' }}
                                            />
                                            <div className="small text-dark" style={{ lineHeight: 1.5 }}>
                                                <strong>{activity.user?.name}</strong> {activity.description}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                                                {timeAgo(activity.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm sticky-top" style={{ top: 80 }}>
                            <div className="card-header bg-white border-bottom py-3">
                                <h6 className="mb-0 fw-semibold">Task Details</h6>
                            </div>
                            <div className="card-body">
                                {/* Status */}
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-medium">Status</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={task.status}
                                        onChange={(e) => handleFieldChange('status', e.target.value)}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-medium">Priority</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={task.priority}
                                        onChange={(e) => handleFieldChange('priority', e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                {/* Assignee */}
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-medium">Assignee</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={task.assignee_id || ''}
                                        onChange={(e) => handleFieldChange('assignee_id', e.target.value || null)}
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    {task.assignee && (
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                                style={{ width: 24, height: 24, background: 'var(--sf-primary)', fontSize: '0.65rem' }}
                                            >
                                                {task.assignee.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="small">{task.assignee.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Reporter */}
                                {task.reporter && (
                                    <div className="mb-3">
                                        <label className="form-label small text-muted fw-medium">Reporter</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                                style={{ width: 24, height: 24, background: '#6366f1', fontSize: '0.65rem' }}
                                            >
                                                {task.reporter.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="small">{task.reporter.name}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Due date */}
                                <div className="mb-3">
                                    <label className="form-label small text-muted fw-medium">Due Date</label>
                                    <input
                                        type="date"
                                        className={`form-control form-control-sm${overdue ? ' border-danger' : ''}`}
                                        value={task.due_date ? task.due_date.slice(0, 10) : ''}
                                        onChange={(e) => handleFieldChange('due_date', e.target.value || null)}
                                    />
                                    {overdue && (
                                        <div className="text-danger small mt-1">⚠️ This task is overdue</div>
                                    )}
                                </div>

                                {/* Project */}
                                {task.project && (
                                    <div className="mb-3">
                                        <label className="form-label small text-muted fw-medium">Project</label>
                                        <div>
                                            <Link
                                                href={`/projects/${task.project.id}/board`}
                                                className="text-decoration-none d-flex align-items-center gap-2"
                                            >
                                                <span
                                                    className="badge fw-bold"
                                                    style={{
                                                        background: (task.project.color || '#4f46e5') + '20',
                                                        color: task.project.color || '#4f46e5',
                                                        fontSize: '0.72rem',
                                                    }}
                                                >
                                                    {task.project.key}
                                                </span>
                                                <span className="small">{task.project.name}</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label small text-muted fw-medium">Labels</label>
                                        <div className="d-flex flex-wrap gap-1">
                                            {task.labels.map((label, i) => (
                                                <span
                                                    key={i}
                                                    className="badge"
                                                    style={{ background: label.color || '#6366f1', color: '#fff', fontSize: '0.75rem' }}
                                                >
                                                    {label.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <hr />

                                {/* Timestamps */}
                                <div className="small text-muted">
                                    <div className="mb-1">
                                        Created {timeAgo(task.created_at)}
                                    </div>
                                    <div>
                                        Updated {timeAgo(task.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
