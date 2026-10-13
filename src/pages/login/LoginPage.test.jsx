import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The LOGIN PAYLOAD, pinned.
 *
 * This screen calls the ported `AuthContext`, whose signatures are POSITIONAL:
 * `login(email, password)` and `register(email, password, displayName)`. v2 shipped
 * `login({ email, password })`, so `email` reached the API as an OBJECT and the backend
 * answered:
 *
 *   MismatchedInputException: Cannot deserialize value of type `java.lang.String`
 *   from Object value (token `JsonToken.START_OBJECT`)
 *    ... LoginRequest["email"]
 *
 * The body was `{ email: { email, password }, password: undefined }` — and axios drops
 * the `undefined` key, which is why only `email` is named in the error.
 *
 * Nothing caught it: the unit suite mocks the `api` module, so it agreed with an
 * implementation the runtime rejected. `App.test.jsx` renders routes but never submits
 * this form. So the assertion below is deliberately about the SHAPE of the payload at
 * the API boundary — `typeof email === 'string'` is the exact thing the backend requires.
 */

const loginMock = vi.fn();
const registerMock = vi.fn();

const SESSION = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessTokenExpiresAt: '2026-10-11T23:59:59Z',
    refreshTokenExpiresAt: '2026-11-11T23:59:59Z',
    user: { id: 'u1', email: 'learner@example.com', displayName: 'Minh' },
};

vi.mock('../../api', () => ({
    hasRefreshToken: () => false,
    isTokenExpired: () => true,
    refreshAccessToken: async () => null,
    getAuthSession: () => null,
    setAuthSession: () => {},
    clearAuthSession: () => {},
}));

vi.mock('../../api/authApi', () => ({
    authApi: {
        login: (...args) => loginMock(...args),
        register: (...args) => registerMock(...args),
        getMe: async () => ({}),
    },
}));

vi.mock('../../api/recordsApi', () => ({ recordsApi: {} }));
vi.mock('../../api/dictionaryApi', () => ({ default: {} }));

const { i18nReady } = await import('../../i18n');
const { AuthProvider } = await import('../../contexts/AuthContext');
const { default: LoginPage } = await import('./LoginPage');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    vi.clearAllMocks();
    loginMock.mockResolvedValue(SESSION);
    registerMock.mockResolvedValue(SESSION);
});

function renderLogin() {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        </MemoryRouter>
    );
}

describe('LoginPage — the payload the API receives', () => {
    it('sends email and password as STRINGS on login', async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.type(screen.getByLabelText('Mật khẩu'), 'MatKhau123');
        await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

        await waitFor(() => expect(loginMock).toHaveBeenCalledTimes(1));
        const payload = loginMock.mock.calls[0][0];

        expect(payload).toEqual({ email: 'learner@example.com', password: 'MatKhau123' });
        /* The exact defect: an object here is what Jackson refuses to read as a String. */
        expect(typeof payload.email).toBe('string');
        expect(typeof payload.password).toBe('string');
    });

    it('sends displayName as a third string on register', async () => {
        const user = userEvent.setup();
        renderLogin();

        await user.click(screen.getByRole('tab', { name: 'Đăng ký' }));
        await user.type(screen.getByLabelText('Tên hiển thị'), 'Minh');
        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.type(screen.getByLabelText('Mật khẩu'), 'MatKhau123');
        /* The submit button reuses `login.register` ('Đăng ký'), the same label as the mode
           tab — which is why these queries are by ROLE: the tabs are `role="tab"`. */
        await user.click(screen.getByRole('button', { name: 'Đăng ký' }));

        await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
        const payload = registerMock.mock.calls[0][0];

        expect(payload).toEqual({
            email: 'learner@example.com',
            password: 'MatKhau123',
            displayName: 'Minh',
        });
        expect(typeof payload.email).toBe('string');
        expect(typeof payload.displayName).toBe('string');
    });
});
