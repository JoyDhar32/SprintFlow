import { useState, useEffect } from 'react';

export default function TaskModal({ show, onClose, projectId, columnStatus = 'todo', members = [], onTaskCreated }) {
    const emptyForm = {
        title: '',
        description: '',
        status: columnStatus,
        priority: 'medium',
        assignee_id: '',
        due_date: '',
        project_id: projectId,
    };

    const [data, setData] = useState(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setData(prev => ({ ...prev, status: columnStatus }));
    }, [columnStatus]);

    useEffect(() => {
        if (!show) {
            setData(emptyForm);
            setErrors({});
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        window.axios.post('/tasks', data)
            .then(res => {
                setData(emptyForm);
                onClose();
                // Notify the board to add the new task
                if (onTaskCreated) onTaskCreated(res.data.task);
            })
            .catch(err => {
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors || {});
                }
            })
            .finally(() => setProcessing(false));
    };

    const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1040 }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ zIndex: 1050 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-semibold">Create New Task</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-medium">
                                        Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control${errors.title ? ' is-invalid' : ''}`}
                                        placeholder="Enter task title..."
                                        value={data.title}
                                        onChange={(e) => set('title', e.target.value)}
                                        autoFocus
                                    />
                                    {errors.title && (
                                        <div className="invalid-feedback">{errors.title[0] ?? errors.title}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-medium">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder="Add a description..."
                                        value={data.description}
                                        onChange={(e) => set('description', e.target.value)}
                                    />
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">Status</label>
                                        <select
                                            className="form-select"
                                            value={data.status}
                                            onChange={(e) => set('status', e.target.value)}
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="in_review">In Review</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">Priority</label>
                                        <select
                                            className="form-select"
                                            value={data.priority}
                                            onChange={(e) => set('priority', e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">Assignee</label>
                                        <select
                                            className="form-select"
                                            value={data.assignee_id}
                                            onChange={(e) => set('assignee_id', e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium">Due Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={data.due_date}
                                            onChange={(e) => set('due_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                    style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
