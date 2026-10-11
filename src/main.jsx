import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n, { i18nReady } from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import AppProviders from './providers/AppProviders';
import App from './App';
import './styles/index.css';
import './styles/lexi.css';

/**
 * The provider tree.
 *
 * v1's `AppProviders` wrapped everything in antd's `StyleProvider` +
 * `ConfigProvider` + a `ThemeProvider` and bridged locales into antd. None of
 * that survives v2: there is no component library to configure, and theming is a
 * CSS file. What remains is only what the app genuinely needs.
 *
 *   I18nextProvider   the instance is created outside React, so it is injected.
 *   AppProviders      document lang + dayjs locale, both driven by i18n.
 *   AuthProvider      the root of the context graph: Credit, RealtimeStomp and
 *                     VocabularyExplain all read `useAuth()`. Mounted here rather
 *                     than in a lazy shell because the landing page and the
 *                     header both need to know whether a session exists.
 *
 * Deliberately NOT here: Credit, RealtimeStomp and VocabularyExplain. v1 put
 * those in the lazy `AppShell` for a measured reason — the landing page uses none
 * of them, and importing them statically pulls the STOMP client into the first
 * download. v2 keeps that split.
 */
i18nReady.then(() => {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <I18nextProvider i18n={i18n}>
                <AppProviders>
                    <BrowserRouter>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </BrowserRouter>
                </AppProviders>
            </I18nextProvider>
        </StrictMode>
    );
});
