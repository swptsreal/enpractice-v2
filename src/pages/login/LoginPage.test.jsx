import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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

/**
 * Cổng xác thực email, nhìn từ màn đăng nhập.
 *
 * Hai đường vào app đều phải dừng ở màn xác thực: đăng ký mới (chưa có mail) và đăng nhập khi email
 * chưa xác thực. Nếu màn này hiện "Email hoặc mật khẩu không đúng" cho trường hợp thứ hai, người
 * dùng sẽ đi đổi mật khẩu trong khi mật khẩu của họ hoàn toàn đúng.
 */
describe('LoginPage — the email verification gate', () => {
    function renderWithVerifyRoute() {
        return render(
            <MemoryRouter initialEntries={['/login']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/verify-email" element={<p>verify screen</p>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );
    }

    it('sends a new registration to the check-inbox screen instead of into the app', async () => {
        const user = userEvent.setup();
        registerMock.mockResolvedValue({
            email: 'learner@example.com',
            verificationRequired: true,
            resendAvailableAt: '2026-10-30T07:01:00Z',
        });
        renderWithVerifyRoute();

        await user.click(screen.getByRole('tab', { name: 'Đăng ký' }));
        await user.type(screen.getByLabelText('Tên hiển thị'), 'Minh');
        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.type(screen.getByLabelText('Mật khẩu'), 'MatKhau123');
        await user.click(screen.getByRole('button', { name: 'Đăng ký' }));

        expect(await screen.findByText('verify screen')).toBeInTheDocument();
    });

    it('turns a blocked login into a trip to the verification screen, not a wrong-password error', async () => {
        const user = userEvent.setup();
        loginMock.mockRejectedValue(
            Object.assign(new Error('blocked'), {
                status: 403,
                data: { reason: 'EMAIL_NOT_VERIFIED', email: 'learner@example.com' },
            })
        );
        renderWithVerifyRoute();

        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.type(screen.getByLabelText('Mật khẩu'), 'MatKhau123');
        await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

        expect(await screen.findByText('verify screen')).toBeInTheDocument();
        expect(screen.queryByText('Email hoặc mật khẩu không đúng')).not.toBeInTheDocument();
    });
});
