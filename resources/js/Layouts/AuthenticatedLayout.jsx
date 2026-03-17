import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, unread_notifications = 0, flash = {}, subscription } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('sf-theme') === 'dark';
    });

    const currentUrl = usePage().url;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('sf-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const isActive = (path) => currentUrl.startsWith(path);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: '🏠', match: '/dashboard' },
        { href: '/tasks', label: 'My Tasks', icon: '✅', match: '/tasks' },
        { href: '/projects', label: 'Projects', icon: '📁', match: '/projects' },
        { href: '/teams', label: 'Teams', icon: '👥', match: '/teams' },
        { href: '/pricing', label: 'Pricing', icon: '💎', match: '/pricing' },
        { href: '/billing', label: 'Billing', icon: '💳', match: '/billing' },
        { href: '/profile', label: 'Settings', icon: '⚙️', match: '/profile' },
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div>
            {/* Sidebar Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sf-sidebar d-flex flex-column${sidebarOpen ? ' open' : ''}`}>
                {/* Brand */}
                <Link href="/dashboard" className="sf-sidebar-brand">
                    ⚡ SprintFlow
                </Link>

                {/* Navigation */}
                <nav className="flex-grow-1 py-3">
                    <ul className="nav flex-column">
                        {navLinks.map((link) => (
                            <li className="nav-item" key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`nav-link d-flex align-items-center${isActive(link.match) ? ' active' : ''}`}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Bottom user info */}
                <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                            style={{
                                width: 36,
                                height: 36,
                                background: 'rgba(255,255,255,0.2)',
                                fontSize: '0.8rem',
                                flexShrink: 0,
                            }}
                        >
                            {getInitials(user.name)}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-white fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
                                {user.name}
                            </div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                                <span
                                    className="badge"
                                    style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 600,
                                        background: 'rgba(255,255,255,0.15)',
                                        color: '#c4b5fd',
                                        padding: '2px 6px',
                                    }}
                                >
                                    {subscription?.plan_name ?? 'Free'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className="sf-main d-flex flex-column">
                {/* Top Header */}
                <header className="sf-header d-flex align-items-center justify-content-between">
                    {/* Left: hamburger + breadcrumb */}
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-sm btn-outline-secondary d-md-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <div>
                            {header ? (
                                header
                            ) : (
                                <span className="fw-semibold text-dark">SprintFlow</span>
                            )}
                        </div>
                    </div>

                    {/* Right: dark mode + notifications + user */}
                    <div className="d-flex align-items-center gap-2">
                        {/* Dark mode toggle */}
                        <button
                            className="btn btn-sm btn-outline-secondary rounded-circle"
                            style={{ width: 36, height: 36, padding: 0 }}
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Flash messages */}
                        {flash.success && (
                            <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
                                <div className="alert alert-success alert-dismissible shadow-sm mb-0" role="alert" style={{ minWidth: 280 }}>
                                    <i className="bi bi-check-circle-fill me-2"></i>{flash.success}
                                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            </div>
                        )}
                        {flash.error && (
                            <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
                                <div className="alert alert-danger alert-dismissible shadow-sm mb-0" role="alert" style={{ minWidth: 280 }}>
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{flash.error}
                                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        <NotificationDropdown unreadCount={unread_notifications} />

                        {/* User dropdown */}
                        <div className="dropdown">
                            <button
                                className="btn btn-sm d-flex align-items-center gap-2"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{ background: 'none', border: 'none' }}
                            >
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
                                    style={{
                                        width: 34,
                                        height: 34,
                                        background: 'var(--sf-primary)',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {getInitials(user.name)}
                                </div>
                                <span className="d-none d-sm-inline text-dark fw-medium" style={{ fontSize: '0.9rem' }}>
                                    {user.name}
                                </span>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                    <path d="M6 8L1 3h10z" />
                                </svg>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                <li>
                                    <div className="dropdown-item-text">
                                        <div className="fw-semibold">{user.name}</div>
                                        <div className="text-muted small">{user.email}</div>
                                    </div>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <Link className="dropdown-item" href={route('profile.edit')}>
                                        👤 Profile
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        🚪 Log Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-grow-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
