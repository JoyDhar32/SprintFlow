import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const typeIcons = {
    task_assigned: '📋',
    comment: '💬',
    mention: '@',
    due_soon: '⏰',
    status_changed: '🔄',
    default: '🔔',
};

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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function NotificationDropdown({ unreadCount = 0 }) {
    const [notifications, setNotifications] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [count, setCount] = useState(unreadCount);

    // Sync count from shared props on every page visit
    useEffect(() => { setCount(unreadCount); }, [unreadCount]);

    const loadNotifications = () => {
        if (loaded) return;
        window.axios.get('/notifications').then(res => {
            setNotifications(res.data.data || res.data.notifications || []);
            setLoaded(true);
        });
    };

    const handleMarkAllRead = (e) => {
        e.stopPropagation();
        window.axios.post('/notifications/read-all').then(() => {
            setCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            window.axios.post(`/notifications/${notification.id}/read`).then(() => {
                setCount(c => Math.max(0, c - 1));
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                ));
            });
        }
        if (notification.url) {
            router.visit(notification.url);
        }
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-sm btn-outline-secondary position-relative rounded-circle"
                style={{ width: 36, height: 36, padding: 0 }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Notifications"
                onClick={loadNotifications}
            >
                🔔
                {count > 0 && (
                    <span className="notification-badge">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>
            <div className="dropdown-menu dropdown-menu-end shadow" style={{ width: 340, maxHeight: 420, overflowY: 'auto' }}>
                <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                    <h6 className="mb-0 fw-semibold">Notifications</h6>
                    {count > 0 && (
                        <button
                            className="btn btn-link btn-sm text-decoration-none p-0"
                            style={{ fontSize: '0.8rem' }}
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {!loaded ? (
                    <div className="text-center py-4 text-muted small">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <div style={{ fontSize: '2rem' }}>🔔</div>
                        <div className="small mt-1">No notifications</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <div style={{ fontSize: '2rem' }}>🔔</div>
                        <div className="small mt-1">No notifications</div>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <button
                            key={notification.id}
                            className={`dropdown-item d-flex align-items-start gap-2 py-2 px-3 text-start${!notification.read_at ? ' bg-primary bg-opacity-10' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                            style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                        >
                            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>
                                {typeIcons[notification.type] || typeIcons.default}
                            </span>
                            <div className="flex-grow-1 overflow-hidden">
                                <div className="small text-dark" style={{ lineHeight: 1.4 }}>
                                    {notification.data?.message || 'New notification'}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {timeAgo(notification.created_at)}
                                </div>
                            </div>
                            {!notification.read_at && (
                                <span
                                    className="rounded-circle bg-primary"
                                    style={{ width: 8, height: 8, flexShrink: 0, marginTop: 6 }}
                                />
                            )}
                        </button>
                    ))
                )}

                {notifications.length > 0 && (
                    <>
                        <div className="dropdown-divider" />
                        <a className="dropdown-item text-center small text-primary" href="/notifications">
                            View all notifications
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
