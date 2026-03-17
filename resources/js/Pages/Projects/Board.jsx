import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import Sortable from 'sortablejs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TaskCard from '@/Components/TaskCard';
import TaskModal from '@/Components/TaskModal';

const COLUMNS = [
    { key: 'todo', label: 'To Do', colorClass: 'col-todo', headerColor: '#94a3b8' },
    { key: 'in_progress', label: 'In Progress', colorClass: 'col-in_progress', headerColor: '#3b82f6' },
    { key: 'in_review', label: 'In Review', colorClass: 'col-in_review', headerColor: '#f59e0b' },
    { key: 'done', label: 'Done', colorClass: 'col-done', headerColor: '#22c55e' },
];

const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

/* ─── Task Detail Panel ──────────────────────────────────────────────── */
function TaskDetailPanel({ task, onClose, members, onUpdate }) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(task?.title || '');
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const titleInputRef = useRef(null);

    useEffect(() => {
        if (task) {
            setTitleValue(task.title);
            setEditingTitle(false);
            setCommentText('');
        }
    }, [task?.id]);

    useEffect(() => {
        if (editingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [editingTitle]);

    if (!task) return null;

    const handleTitleSave = () => {
        if (titleValue.trim() && titleValue !== task.title) {
            router.put(`/tasks/${task.id}`, { title: titleValue }, { preserveScroll: true, onSuccess: () => onUpdate && onUpdate() });
        }
        setEditingTitle(false);
    };

    const handleFieldChange = (field, value) => {
        router.put(`/tasks/${task.id}`, { [field]: value }, { preserveScroll: true, onSuccess: () => onUpdate && onUpdate() });
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        router.post(`/tasks/${task.id}/comments`, { content: commentText }, {
            preserveScroll: true,
            onSuccess: () => {
                setCommentText('');
                onUpdate && onUpdate();
            },
            onFinish: () => setSubmittingComment(false),
        });
    };

    const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

    return (
        <div
            className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
            style={{ width: 420, zIndex: 1040, borderLeft: '1px solid #e9ecef' }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold" style={{ fontSize: '0.75rem' }}>
                        #{task.id}
                    </span>
                    {task.project && (
                        <span className="text-muted small">{task.project.key}</span>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2">
                    {task.project && (
                        <Link
                            href={`/tasks/${task.id}`}
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '0.8rem' }}
                        >
                            Open full page ↗
                        </Link>
                    )}
                    <button className="btn-close" onClick={onClose} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-grow-1 overflow-auto p-3">
                {/* Title */}
                <div className="mb-3">
                    {editingTitle ? (
                        <input
                            ref={titleInputRef}
                            className="form-control fw-semibold"
                            style={{ fontSize: '1.05rem' }}
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTitleSave();
                                if (e.key === 'Escape') { setTitleValue(task.title); setEditingTitle(false); }
                            }}
                        />
                    ) : (
                        <h5
                            className="fw-semibold mb-0"
                            style={{ cursor: 'pointer', lineHeight: 1.4 }}
                            onClick={() => setEditingTitle(true)}
                            title="Click to edit"
                        >
                            {task.title}
                        </h5>
                    )}
                </div>

                {/* Meta fields */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <label className="form-label small text-muted fw-medium mb-1">Status</label>
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
                    <div className="col-6">
                        <label className="form-label small text-muted fw-medium mb-1">Priority</label>
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
                    <div className="col-6">
                        <label className="form-label small text-muted fw-medium mb-1">Assignee</label>
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
                    </div>
                    <div className="col-6">
                        <label className="form-label small text-muted fw-medium mb-1">Due Date</label>
                        <input
                            type="date"
                            className={`form-control form-control-sm${overdue ? ' border-danger' : ''}`}
                            value={task.due_date ? task.due_date.slice(0, 10) : ''}
                            onChange={(e) => handleFieldChange('due_date', e.target.value || null)}
                        />
                        {overdue && <div className="text-danger" style={{ fontSize: '0.72rem' }}>Overdue!</div>}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                    <label className="form-label small text-muted fw-medium mb-1">Description</label>
                    <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Add a description..."
                        defaultValue={task.description || ''}
                        onBlur={(e) => {
                            if (e.target.value !== (task.description || '')) {
                                handleFieldChange('description', e.target.value);
                            }
                        }}
                        style={{ fontSize: '0.9rem', resize: 'vertical' }}
                    />
                </div>

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                    <div className="mb-3">
                        <label className="form-label small text-muted fw-medium mb-1">Labels</label>
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

                {/* Comments */}
                <div className="mb-3">
                    <h6 className="fw-semibold mb-3">💬 Comments ({task.comments?.length ?? 0})</h6>
                    {task.comments && task.comments.map((comment) => (
                        <div key={comment.id} className="d-flex gap-2 mb-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
                                style={{
                                    width: 30,
                                    height: 30,
                                    background: '#4f46e5',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {comment.user?.name?.slice(0, 2).toUpperCase() || '?'}
                            </div>
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="fw-semibold small">{comment.user?.name}</span>
                                    <span className="text-muted" style={{ fontSize: '0.73rem' }}>
                                        {comment.created_at
                                            ? new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </span>
                                </div>
                                <div
                                    className="p-2 rounded"
                                    style={{ background: '#f8f9fa', fontSize: '0.88rem', lineHeight: 1.5 }}
                                >
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add comment form */}
                    <form onSubmit={handleAddComment} className="mt-3">
                        <div className="d-flex gap-2">
                            <textarea
                                className="form-control form-control-sm"
                                rows={2}
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ resize: 'none' }}
                            />
                        </div>
                        <div className="text-end mt-2">
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={!commentText.trim() || submittingComment}
                                style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                            >
                                {submittingComment ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Activity */}
                {task.activities && task.activities.length > 0 && (
                    <div>
                        <h6 className="fw-semibold mb-3">🕐 Activity</h6>
                        {task.activities.map((activity, i) => (
                            <div key={i} className="activity-item mb-3">
                                <div className="activity-dot" style={{ background: '#4f46e5' }} />
                                <div className="small text-dark" style={{ lineHeight: 1.4 }}>
                                    <strong>{activity.user?.name}</strong> {activity.description}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                                    {activity.created_at
                                        ? new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Board Component ───────────────────────────────────────────── */
export default function Board({ project, tasks: initialTasks = [], members = [], auth }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createColumn, setCreateColumn] = useState('todo');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const sortableRefs = useRef({});
    const columnRefs = useRef({});

    // Group tasks by status
    const getColumnTasks = useCallback((status) => {
        return tasks
            .filter((t) => {
                if (t.status !== status) return false;
                if (filterAssignee && String(t.assignee_id) !== filterAssignee) return false;
                if (filterPriority && t.priority !== filterPriority) return false;
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
                }
                return true;
            })
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }, [tasks, filterAssignee, filterPriority, searchQuery]);

    // Initialise SortableJS for each column
    useEffect(() => {
        COLUMNS.forEach(({ key }) => {
            const el = columnRefs.current[key];
            if (!el) return;

            if (sortableRefs.current[key]) {
                sortableRefs.current[key].destroy();
            }

            sortableRefs.current[key] = Sortable.create(el, {
                group: 'kanban',
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                draggable: '.kanban-card',
                onEnd(evt) {
                    const taskId = parseInt(evt.item.dataset.taskId);
                    const newStatus = evt.to.dataset.column;
                    const oldStatus = evt.from.dataset.column;

                    // Collect new order for destination column
                    const destIds = Array.from(evt.to.querySelectorAll('.kanban-card'))
                        .map((el) => parseInt(el.dataset.taskId));

                    // Optimistic update
                    setTasks((prev) =>
                        prev.map((t) =>
                            t.id === taskId
                                ? { ...t, status: newStatus, position: destIds.indexOf(taskId) }
                                : t
                        )
                    );

                    // Persist status change
                    if (newStatus !== oldStatus) {
                        router.put(
                            `/tasks/${taskId}`,
                            { status: newStatus },
                            { preserveScroll: true, preserveState: true }
                        );
                    }

                    // Persist reorder
                    router.post(
                        '/tasks/reorder',
                        { column: newStatus, order: destIds },
                        { preserveScroll: true, preserveState: true }
                    );
                },
            });
        });

        return () => {
            Object.values(sortableRefs.current).forEach((s) => s.destroy());
            sortableRefs.current = {};
        };
    }, [tasks.length]); // re-init only when task count changes (new tasks added)

    // Laravel Echo real-time updates
    useEffect(() => {
        if (typeof window === 'undefined' || !window.Echo) return;

        const channel = window.Echo.private(`project.${project.id}`);
        channel.listen('.task.updated', (e) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === e.task.id ? { ...t, ...e.task } : t))
            );
            if (selectedTask?.id === e.task.id) {
                setSelectedTask((prev) => ({ ...prev, ...e.task }));
            }
        });
        channel.listen('.task.created', (e) => {
            setTasks((prev) => [...prev, e.task]);
        });
        channel.listen('.task.deleted', (e) => {
            setTasks((prev) => prev.filter((t) => t.id !== e.taskId));
        });

        return () => {
            window.Echo.leave(`project.${project.id}`);
        };
    }, [project.id]);

    const handleCardClick = (task) => {
        // Fetch fresh task data with comments and activities
        router.get(
            `/tasks/${task.id}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['task'],
                onSuccess: (page) => {
                    setSelectedTask(page.props.task || task);
                },
            }
        );
        setSelectedTask(task); // optimistic open
    };

    const handlePanelUpdate = () => {
        router.reload({ only: ['tasks'], preserveScroll: true, onSuccess: (page) => {
            setTasks(page.props.tasks || tasks);
            if (selectedTask) {
                const updated = (page.props.tasks || tasks).find((t) => t.id === selectedTask.id);
                if (updated) setSelectedTask(updated);
            }
        }});
    };

    const clearFilters = () => {
        setFilterAssignee('');
        setFilterPriority('');
        setSearchQuery('');
    };

    const hasFilters = filterAssignee || filterPriority || searchQuery;

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    <Link href="/projects" className="text-muted text-decoration-none small">Projects</Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold">{project.name}</span>
                    <span
                        className="badge ms-1"
                        style={{ background: (project.color || '#4f46e5') + '20', color: project.color || '#4f46e5', fontSize: '0.72rem', fontWeight: 700 }}
                    >
                        {project.key}
                    </span>
                </div>
            }
        >
            <Head title={`${project.name} Board`} />

            <div className="p-3" style={{ paddingRight: selectedTask ? '440px' : undefined }}>
                {/* Board toolbar */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="input-group input-group-sm" style={{ width: 220 }}>
                            <span className="input-group-text bg-white border-end-0">🔍</span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Assignee filter */}
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 160 }}
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                        >
                            <option value="">All Assignees</option>
                            {members.map((m) => (
                                <option key={m.id} value={String(m.id)}>{m.name}</option>
                            ))}
                        </select>

                        {/* Priority filter */}
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 140 }}
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            {PRIORITY_ORDER.map((p) => (
                                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                        </select>

                        {hasFilters && (
                            <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="btn btn-sm btn-outline-secondary"
                        >
                            ⚙️ Settings
                        </Link>
                        <button
                            className="btn btn-sm btn-primary"
                            style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                            onClick={() => { setCreateColumn('todo'); setShowCreateModal(true); }}
                        >
                            + Add Task
                        </button>
                    </div>
                </div>

                {/* Kanban board */}
                <div className="kanban-board">
                    {COLUMNS.map((col) => {
                        const colTasks = getColumnTasks(col.key);
                        return (
                            <div key={col.key} className={`kanban-column ${col.colorClass}`}>
                                {/* Column header */}
                                <div className="kanban-column-header">
                                    <span className="d-flex align-items-center gap-2">
                                        <span
                                            className="rounded-circle"
                                            style={{ width: 10, height: 10, background: col.headerColor, display: 'inline-block' }}
                                        />
                                        {col.label}
                                    </span>
                                    <div className="d-flex align-items-center gap-1">
                                        <span className="column-count">{colTasks.length}</span>
                                        <button
                                            className="btn btn-sm p-0 ms-1 text-muted"
                                            style={{ lineHeight: 1, width: 24, height: 24, border: 'none', background: 'none' }}
                                            onClick={() => { setCreateColumn(col.key); setShowCreateModal(true); }}
                                            title={`Add task to ${col.label}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Cards drop zone */}
                                <div
                                    className="kanban-cards"
                                    ref={(el) => { columnRefs.current[col.key] = el; }}
                                    data-column={col.key}
                                >
                                    {colTasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onClick={() => handleCardClick(task)}
                                        />
                                    ))}

                                    {colTasks.length === 0 && (
                                        <div
                                            className="text-center text-muted py-4"
                                            style={{ fontSize: '0.8rem', pointerEvents: 'none', userSelect: 'none' }}
                                        >
                                            {hasFilters ? 'No matching tasks' : 'Drop tasks here'}
                                        </div>
                                    )}
                                </div>

                                {/* Add task footer */}
                                <div className="p-2 pt-0">
                                    <button
                                        className="btn btn-sm w-100 text-muted"
                                        style={{ background: 'rgba(0,0,0,0.04)', border: '1px dashed #d1d5db', fontSize: '0.82rem' }}
                                        onClick={() => { setCreateColumn(col.key); setShowCreateModal(true); }}
                                    >
                                        + Add task
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Task detail panel */}
            {selectedTask && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="d-md-none position-fixed top-0 start-0 w-100 h-100"
                        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
                        onClick={() => setSelectedTask(null)}
                    />
                    <TaskDetailPanel
                        task={selectedTask}
                        members={members}
                        onClose={() => setSelectedTask(null)}
                        onUpdate={handlePanelUpdate}
                    />
                </>
            )}

            {/* Create task modal */}
            <TaskModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                projectId={project.id}
                columnStatus={createColumn}
                members={members}
                onTaskCreated={(newTask) => setTasks(prev => [...prev, newTask])}
            />
        </AuthenticatedLayout>
    );
}
