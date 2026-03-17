import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PROJECT_COLORS = [
    '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
    '#0284c7', '#6366f1',
];

export default function ProjectEdit({ project, teams = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        team_id: project.team_id || '',
        color: project.color || '#4f46e5',
        start_date: project.start_date ? project.start_date.slice(0, 10) : '',
        end_date: project.end_date ? project.end_date.slice(0, 10) : '',
        status: project.status || 'active',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    <Link href="/projects" className="text-muted text-decoration-none small">Projects</Link>
                    <span className="text-muted">/</span>
                    <Link href={`/projects/${project.id}/board`} className="text-muted text-decoration-none small">
                        {project.name}
                    </Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold">Settings</span>
                </div>
            }
        >
            <Head title={`Edit ${project.name}`} />

            <div className="p-4">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h4 className="fw-bold mb-0">Project Settings</h4>
                                    <Link
                                        href={`/projects/${project.id}/board`}
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        ← Back to Board
                                    </Link>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Color preview bar */}
                                    <div
                                        className="rounded mb-4"
                                        style={{ height: 6, background: data.color, transition: 'background 0.2s' }}
                                    />

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">
                                            Project Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">
                                            Project Key <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control font-monospace${errors.key ? ' is-invalid' : ''}`}
                                            value={data.key}
                                            onChange={(e) => setData('key', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                            maxLength={6}
                                        />
                                        {errors.key && <div className="invalid-feedback">{errors.key}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Team</label>
                                            <select
                                                className="form-select"
                                                value={data.team_id}
                                                onChange={(e) => setData('team_id', e.target.value)}
                                            >
                                                <option value="">No team</option>
                                                {teams.map((team) => (
                                                    <option key={team.id} value={team.id}>{team.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Status</label>
                                            <select
                                                className="form-select"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                            >
                                                <option value="planning">Planning</option>
                                                <option value="active">Active</option>
                                                <option value="on_hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Project Color</label>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {PROJECT_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className="rounded-circle border-0"
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        background: color,
                                                        outline: data.color === color ? `3px solid ${color}` : 'none',
                                                        outlineOffset: 2,
                                                        cursor: 'pointer',
                                                        boxShadow: data.color === color ? '0 0 0 2px #fff' : 'none',
                                                    }}
                                                    onClick={() => setData('color', color)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                            style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                        >
                                            {processing ? (
                                                <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                                            ) : 'Save Changes'}
                                        </button>
                                        <Link href={`/projects/${project.id}/board`} className="btn btn-outline-secondary">
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
