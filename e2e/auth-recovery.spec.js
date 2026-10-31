import { expect, test } from '@playwright/test';

/**
 * Luồng khôi phục tài khoản, chạy trên dev server thật với API được stub.
 *
 * Vì sao stub: gửi mail thật hay đốt token thật trong một test lặp lại được là không thể — token
 * chỉ tồn tại trong hộp thư. Stub ở ranh giới HTTP vẫn kiểm tra được đúng thứ dễ sai nhất: BODY của
 * từng request và HÀNH VI của màn sau khi có câu trả lời.
 *
 * Bốn điều được khoá:
 *
 *   1. đăng ký/đăng nhập bị chặn đưa người dùng tới màn xác thực, không phải vào app;
 *   2. màn xác thực KHÔNG gọi API lúc load (mail scanner prefetch link);
 *   3. màn đặt lại mật khẩu không gửi gì khi hai ô chưa khớp;
 *   4. email trên màn xác thực đã được che.
 */
const envelope = (data) => ({ success: true, message: 'OK', data });

const SESSION = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    accessTokenExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    user: {
        id: 'u1',
        email: 'learner@example.com',
        displayName: 'Minh',
        role: 'USER',
        membershipTier: 'FREE',
        membershipActive: true,
        emailVerified: true,
    },
};

test.describe('auth recovery', () => {
    test('a blocked login goes to the verification screen, not a wrong-password error', async ({ page }) => {
        const state = {};

        await page.route('**/api/auth/login', async (route) => {
            state.body = route.request().postDataJSON();
            return route.fulfill({
                status: 403,
                json: {
                    success: false,
                    code: 'EMAIL_NOT_VERIFIED',
                    message: 'Vui lòng xác thực email để đăng nhập',
                    data: { reason: 'EMAIL_NOT_VERIFIED', email: 'learner@example.com' },
                },
            });
        });

        await page.goto('/login');
        await page.getByLabel('Email').fill('learner@example.com');
        await page.getByLabel('Mật khẩu').fill('MatKhau123');
        await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

        await expect(page).toHaveURL(/\/verify-email\?email=/);
        await expect(page.getByRole('heading', { name: 'Kiểm tra hộp thư' })).toBeVisible();

        /* Body must be two strings — an object here is exactly what Jackson refused before. */
        expect(state.body).toEqual({ email: 'learner@example.com', password: 'MatKhau123' });
        expect(typeof state.body.email).toBe('string');
    });

    test('registering lands on the check-inbox state and never opens a session', async ({ page }) => {
        const state = {};
        await page.route('**/api/auth/register', async (route) => {
            state.body = route.request().postDataJSON();
            return route.fulfill({
                status: 201,
                json: envelope({
                    email: 'learner@example.com',
                    verificationRequired: true,
                    resendAvailableAt: new Date(Date.now() + 60_000).toISOString(),
                }),
            });
        });

        await page.goto('/login');
        await page.getByRole('tab', { name: 'Đăng ký' }).click();
        await page.getByLabel('Tên hiển thị').fill('Minh');
        await page.getByLabel('Email').fill('learner@example.com');
        await page.getByLabel('Mật khẩu').fill('MatKhau123');
        await page.getByRole('button', { name: 'Đăng ký', exact: true }).click();

        await expect(page).toHaveURL(/\/verify-email\?email=/);
        expect(state.body).toEqual({
            email: 'learner@example.com',
            password: 'MatKhau123',
            displayName: 'Minh',
        });
        /* No token was stored: there is no session to restore. */
        const stored = await page.evaluate(() => localStorage.getItem('en_practice_refresh_token'));
        expect(stored).toBeNull();
    });

    test('the verification screen masks the address and consumes the token only on click', async ({ page }) => {
        const state = { verifyCalls: 0, resendBody: null };

        await page.route('**/api/auth/verify-email', async (route) => {
            state.verifyCalls += 1;
            state.verifyBody = route.request().postDataJSON();
            return route.fulfill({ json: envelope(SESSION) });
        });
        await page.route('**/api/auth/resend-verification', async (route) => {
            state.resendBody = route.request().postDataJSON();
            return route.fulfill({ json: envelope(null) });
        });

        await page.goto('/verify-email?token=raw-token&email=learner@example.com');

        await expect(page.getByText('le***@example.com')).toBeVisible();
        /* Mail scanners prefetch the link: loading the page must not verify anything. */
        expect(state.verifyCalls).toBe(0);

        await page.getByRole('button', { name: 'Xác nhận email' }).click();

        await expect(page).toHaveURL(/\/home/);
        expect(state.verifyBody).toEqual({ token: 'raw-token' });
    });

    test('resending verification sends the address it was opened with', async ({ page }) => {
        const state = {};
        await page.route('**/api/auth/resend-verification', async (route) => {
            state.body = route.request().postDataJSON();
            return route.fulfill({ json: envelope(null) });
        });

        await page.goto('/verify-email?email=learner@example.com');
        await page.getByRole('button', { name: /Gửi lại email/ }).click();

        await expect(page.getByText(/Đã gửi lại/)).toBeVisible();
        expect(state.body).toEqual({ email: 'learner@example.com' });
    });

    test('forgot-password sends one string and answers with the same generic sentence', async ({ page }) => {
        const state = {};
        await page.route('**/api/auth/forgot-password', async (route) => {
            state.body = route.request().postDataJSON();
            return route.fulfill({ json: envelope(null) });
        });

        await page.goto('/forgot-password');
        await page.getByLabel('Email').fill('learner@example.com');
        await page.getByRole('button', { name: 'Gửi liên kết' }).click();

        await expect(page.getByText(/Nếu email tồn tại/)).toBeVisible();
        expect(state.body).toEqual({ email: 'learner@example.com' });
    });

    test('reset-password refuses to spend the token while the two fields disagree', async ({ page }) => {
        const state = { calls: 0 };

        await page.route('**/api/auth/reset-password', async (route) => {
            state.calls += 1;
            state.body = route.request().postDataJSON();
            return route.fulfill({ json: envelope(null) });
        });

        await page.goto('/reset-password?token=raw-token');
        await page.getByLabel('Mật khẩu mới').fill('MatKhauMoi123');
        await page.getByLabel('Nhập lại mật khẩu mới').fill('MatKhauMoi124');

        await expect(page.getByText('Hai mật khẩu chưa khớp.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Lưu mật khẩu mới' })).toBeDisabled();
        expect(state.calls).toBe(0);

        await page.getByLabel('Nhập lại mật khẩu mới').fill('MatKhauMoi123');
        await page.getByRole('button', { name: 'Lưu mật khẩu mới' }).click();

        await expect(page.getByRole('heading', { name: 'Đã đổi mật khẩu' })).toBeVisible();
        expect(state.body).toEqual({ token: 'raw-token', newPassword: 'MatKhauMoi123' });
    });
});
