import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function TeamEdit({ team }) {
    const { data, setData, put, processing, errors } = useForm({
        name: team.name || '',
        description: team.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('teams.update', team.slug));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="d-flex align-items-center gap-2">
                    <Link href="/teams" className="text-muted text-decoration-none small">Teams</Link>
                    <span className="text-muted">/</span>
                    <Link href={`/teams/${team.slug}`} className="text-muted text-decoration-none small">{team.name}</Link>
                    <span className="text-muted">/</span>
                    <span className="fw-semibold">Edit</span>
                </div>
            }
        >
            <Head title={`Edit ${team.name}`} />

            <div className="p-4">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4">Edit Team</h4>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-medium">
                                            Team Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-medium">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows={4}
                                            placeholder="What does this team work on?"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                        {errors.description && (
                                            <div className="text-danger small mt-1">{errors.description}</div>
                                        )}
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
                                        <Link href={`/teams/${team.slug}`} className="btn btn-outline-secondary">
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
