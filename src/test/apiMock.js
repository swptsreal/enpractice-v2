import { vi } from 'vitest';

/**
 * Keep tests off the network.
 *
 * `App.test.jsx` mounts real routes, and those routes now fetch. Without this,
 * the smoke test issues real HTTP requests: it is slow, it fails differently on a
 * machine that happens to have a backend running, and it logs a stream of axios
 * lines into the test output.
 *
 * The api module is replaced with empty stubs, so every screen renders its real
 * EMPTY state. That is the right default for a routing test — it asserts the
 * screen mounts and its chrome renders, without pretending to test data. Tests
 * that care about payloads (HomePage, IeltsListPage) mock `../api` themselves
 * with concrete fixtures, and their own `vi.mock` takes precedence for those
 * modules.
 */
vi.mock('../api', () => {
    /** A proxy that answers any property with a no-op async function. */
    const asyncStub = new Proxy(
        {},
        {
            get: () => async () => ({}),
        }
    );

    return new Proxy(
        {
            /* the pieces the app imports by name rather than as a namespace */
            axiosClient: {},
            ApiError: class ApiError extends Error {
                constructor(message, status) {
                    super(message);
                    this.status = status;
                }
            },
            getCurrentLanguage: () => 'vi',
            hasToken: () => false,
            getToken: () => null,
            setToken: () => {},
            removeToken: () => {},
            getAuthSession: () => null,
            setAuthSession: () => {},
            clearAuthSession: () => {},
            hasRefreshToken: () => false,
            hasValidAccessToken: () => false,
            isTokenExpired: () => true,
            refreshAccessToken: async () => null,
            ensureValidAccessToken: async () => null,
        },
        {
            /** Every `<domain>Api` resolves to the async stub. */
            get: (target, prop) => {
                if (prop in target) return target[prop];
                if (typeof prop === 'string' && prop.endsWith('Api')) return asyncStub;
                return undefined;
            },
        }
    );
});
