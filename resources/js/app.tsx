import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/stores/store';
import { fetchCart } from '@/stores/cartSlice';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        // If an authenticated user is present on initial page load, fetch their cart
        try {
            // props has initialPage.props when using Inertia
            const initialProps: any = props;
            const user = initialProps?.initialPage?.props?.auth?.user;
            if (user) {
                store.dispatch(fetchCart() as any);
            }
        } catch (e) {
            // ignore
        }

        root.render(
            <StrictMode>
                <Provider store={store}>
                    <App {...props} />
                </Provider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#1447e6',
    },
});

// This will set light / dark mode on load...
initializeTheme();
