const PRIORITY_CONFIG = {
    low: { label: 'Low', color: '#22c55e', icon: '▼' },
    medium: { label: 'Medium', color: '#f59e0b', icon: '■' },
    high: { label: 'High', color: '#ef4444', icon: '▲' },
    urgent: { label: 'Urgent', color: '#7c3aed', icon: '⚡' },
};

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onClick }) {
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const overdue = isOverdue(task.due_date);

    return (
        <div
            className="kanban-card"
            style={{ borderLeft: `3px solid ${priority.color}` }}
            onClick={onClick}
            data-task-id={task.id}
        >
            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {task.labels.slice(0, 3).map((label, i) => (
                        <span
                            key={i}
                            className="badge"
                            style={{
                                background: label.color || '#6366f1',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                padding: '2px 6px',
                            }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <div
                className="fw-medium mb-2"
                style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {task.title}
            </div>

            {/* Footer row */}
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    {/* Priority */}
                    <span
                        className="badge"
                        style={{
                            background: priority.color + '20',
                            color: priority.color,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                        }}
                    >
                        {priority.icon} {priority.label}
                    </span>

                    {/* Due date */}
                    {task.due_date && (
                        <span
                            className="small"
                            style={{
                                fontSize: '0.75rem',
                                color: overdue ? '#ef4444' : '#6b7280',
                                fontWeight: overdue ? 600 : 400,
                            }}
                        >
                            {overdue ? '⚠️ ' : '📅 '}
                            {formatDate(task.due_date)}
                        </span>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Comment count */}
                    {task.comments_count > 0 && (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            💬 {task.comments_count}
                        </span>
                    )}

                    {/* Attachment count */}
                    {task.attachments_count > 0 && (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            📎 {task.attachments_count}
                        </span>
                    )}

                    {/* Assignee avatar */}
                    {task.assignee && (
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                            style={{
                                width: 24,
                                height: 24,
                                background: 'var(--sf-primary)',
                                fontSize: '0.65rem',
                                flexShrink: 0,
                            }}
                            title={task.assignee.name}
                        >
                            {task.assignee.avatar ? (
                                <img
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    className="rounded-circle"
                                    style={{ width: 24, height: 24, objectFit: 'cover' }}
                                />
                            ) : (
                                getInitials(task.assignee.name)
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
