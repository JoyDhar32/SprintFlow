import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Laravel Echo + Pusher setup for real-time broadcasting.
 * Only initialised when a real Pusher key is provided.
 * Without it the app works normally — just without live updates.
 */
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;

if (pusherKey && pusherKey !== 'your-app-key') {
    Promise.all([import('laravel-echo'), import('pusher-js')]).then(([{ default: Echo }, { default: Pusher }]) => {
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: pusherKey,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            wsHost: import.meta.env.VITE_PUSHER_HOST
                ? import.meta.env.VITE_PUSHER_HOST
                : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
            wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
            wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
                },
            },
        });
    });
}
