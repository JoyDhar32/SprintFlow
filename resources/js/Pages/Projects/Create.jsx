import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const PROJECT_COLORS = [
    '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
    '#0284c7', '#6366f1',
];

export default function ProjectCreate({ teams = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        key: '',
        description: '',
        team_id: '',
        color: '#4f46e5',
        start_date: '',
        end_date: '',
        status: 'planning',
    });

    // Auto-generate key from name
    useEffect(() => {
        if (data.name) {
            const generated = data.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 6);
            setData('key', generated);
        }
    }, [data.name]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    <Link href="/projects" className="text-muted text-decoration-none small">Projects</Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold">New Project</span>
                </div>
            }
        >
            <Head title="Create Project" />

            <div className="p-4">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4">Create New Project</h4>

                                <form onSubmit={handleSubmit}>
                                    {/* Color preview bar */}
                                    <div
                                        className="rounded mb-4"
                                        style={{ height: 6, background: data.color, transition: 'background 0.2s' }}
                                    />

                                    {/* Name */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">
                                            Project Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                            placeholder="e.g. Website Redesign"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>

                                    {/* Key */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">
                                            Project Key <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control font-monospace${errors.key ? ' is-invalid' : ''}`}
                                            placeholder="e.g. WEB"
                                            value={data.key}
                                            onChange={(e) => setData('key', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                            maxLength={6}
                                        />
                                        <div className="form-text">2-6 uppercase letters used as task prefix (e.g. WEB-1)</div>
                                        {errors.key && <div className="invalid-feedback">{errors.key}</div>}
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            placeholder="What is this project about?"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>

                                    {/* Team + Status */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Team</label>
                                            <select
                                                className={`form-select${errors.team_id ? ' is-invalid' : ''}`}
                                                value={data.team_id}
                                                onChange={(e) => setData('team_id', e.target.value)}
                                            >
                                                <option value="">No team</option>
                                                {teams.map((team) => (
                                                    <option key={team.id} value={team.id}>{team.name}</option>
                                                ))}
                                            </select>
                                            {errors.team_id && <div className="invalid-feedback">{errors.team_id}</div>}
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
                                            </select>
                                        </div>
                                    </div>

                                    {/* Dates */}
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

                                    {/* Color picker */}
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
                                                        transition: 'transform 0.1s',
                                                    }}
                                                    onClick={() => setData('color', color)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                            style={{ background: 'var(--sf-primary)', borderColor: 'var(--sf-primary)' }}
                                        >
                                            {processing ? (
                                                <><span className="spinner-border spinner-border-sm me-2" />Creating...</>
                                            ) : 'Create Project'}
                                        </button>
                                        <Link href="/projects" className="btn btn-outline-secondary">
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
