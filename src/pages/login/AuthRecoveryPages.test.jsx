import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * Ba màn khôi phục tài khoản.
 *
 * Những gì được khoá lại ở đây là các quyết định KHÔNG hiển nhiên trên màn hình:
 *
 *   - "quên mật khẩu" chỉ gửi `{ email }` và luôn hiện cùng một câu trả lời, kể cả khi backend từ
 *     chối vì lý do khác — câu trả lời khác nhau là kênh dò tài khoản;
 *   - màn đặt lại KHÔNG gửi request khi hai ô mật khẩu chưa khớp (một token chỉ có một lần);
 *   - màn xác thực không tự tiêu thụ token lúc mount, chỉ khi bấm nút — vì mail scanner prefetch
 *     link và sẽ tự xác thực hộ nếu trang gọi API ngay.
 */
const forgotMock = vi.fn();
const resetMock = vi.fn();
const resendMock = vi.fn();
const verifyMock = vi.fn();

vi.mock('../../api/authApi', () => ({
    authApi: {
        forgotPassword: (...args) => forgotMock(...args),
        resetPassword: (...args) => resetMock(...args),
        resendVerification: (...args) => resendMock(...args),
    },
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ verifyEmail: (...args) => verifyMock(...args) }),
}));

const { i18nReady } = await import('../../i18n');
const { default: ForgotPasswordPage } = await import('./ForgotPasswordPage');
const { default: ResetPasswordPage } = await import('./ResetPasswordPage');
const { default: VerifyEmailPage } = await import('./VerifyEmailPage');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    vi.clearAllMocks();
});

function renderAt(path, element) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path={path.split('?')[0]} element={element} />
                <Route path="/home" element={<p>home</p>} />
                <Route path="/login" element={<p>login screen</p>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ForgotPasswordPage', () => {
    it('sends the email as a string and then shows one generic answer', async () => {
        const user = userEvent.setup();
        forgotMock.mockResolvedValue({ success: true });
        renderAt('/forgot-password', <ForgotPasswordPage />);

        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.click(screen.getByRole('button', { name: 'Gửi liên kết' }));

        await waitFor(() => expect(forgotMock).toHaveBeenCalledTimes(1));
        expect(forgotMock.mock.calls[0][0]).toEqual({ email: 'learner@example.com' });
        expect(typeof forgotMock.mock.calls[0][0].email).toBe('string');

        expect(await screen.findByText(/Nếu email tồn tại/)).toBeInTheDocument();
    });

    it('says how long to wait when the endpoint rate-limits', async () => {
        const user = userEvent.setup();
        forgotMock.mockRejectedValue(Object.assign(new Error('Too many'), { status: 429 }));
        renderAt('/forgot-password', <ForgotPasswordPage />);

        await user.type(screen.getByLabelText('Email'), 'learner@example.com');
        await user.click(screen.getByRole('button', { name: 'Gửi liên kết' }));

        expect(await screen.findByText('Bạn đã yêu cầu quá nhiều lần. Thử lại sau ít phút.')).toBeInTheDocument();
    });
});

describe('ResetPasswordPage', () => {
    it('refuses a link without a token before calling the API', async () => {
        renderAt('/reset-password', <ResetPasswordPage />);

        expect(screen.getByText('Liên kết không dùng được')).toBeInTheDocument();
        /* Không có token thì không được gọi endpoint: token rỗng chỉ tạo thêm nhiễu rate-limit. */
        expect(resetMock).not.toHaveBeenCalled();
    });

    it('does not send the password while the two fields disagree', async () => {
        const user = userEvent.setup();
        renderAt('/reset-password?token=raw-token', <ResetPasswordPage />);

        await user.type(screen.getByLabelText('Mật khẩu mới'), 'MatKhauMoi123');
        await user.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'MatKhauMoi124');

        expect(screen.getByText('Hai mật khẩu chưa khớp.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Lưu mật khẩu mới' })).toBeDisabled();
        expect(resetMock).not.toHaveBeenCalled();
    });

    it('sends the token and the new password, then points at the login screen', async () => {
        const user = userEvent.setup();
        resetMock.mockResolvedValue({ success: true });
        renderAt('/reset-password?token=raw-token', <ResetPasswordPage />);

        await user.type(screen.getByLabelText('Mật khẩu mới'), 'MatKhauMoi123');
        await user.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'MatKhauMoi123');
        await user.click(screen.getByRole('button', { name: 'Lưu mật khẩu mới' }));

        await waitFor(() => expect(resetMock).toHaveBeenCalledTimes(1));
        expect(resetMock.mock.calls[0][0]).toEqual({ token: 'raw-token', newPassword: 'MatKhauMoi123' });
        expect(await screen.findByText('Đã đổi mật khẩu')).toBeInTheDocument();
    });

    it('explains an expired link instead of a generic error', async () => {
        const user = userEvent.setup();
        resetMock.mockRejectedValue(
            Object.assign(new Error('expired'), {
                status: 400,
                data: { reason: 'TOKEN_EXPIRED' },
            })
        );
        renderAt('/reset-password?token=raw-token', <ResetPasswordPage />);

        await user.type(screen.getByLabelText('Mật khẩu mới'), 'MatKhauMoi123');
        await user.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'MatKhauMoi123');
        await user.click(screen.getByRole('button', { name: 'Lưu mật khẩu mới' }));

        expect(await screen.findByText(/Liên kết đã hết hạn/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Yêu cầu liên kết mới' })).toBeInTheDocument();
    });
});

describe('VerifyEmailPage', () => {
    it('masks the address on the check-inbox state', async () => {
        renderAt('/verify-email?email=learner@example.com', <VerifyEmailPage />);

        expect(screen.getByText(/le\*\*\*@example\.com/)).toBeInTheDocument();
        expect(screen.queryByText(/learner@example\.com/)).not.toBeInTheDocument();
    });

    it('does NOT consume the token on mount, only when the learner presses confirm', async () => {
        const user = userEvent.setup();
        verifyMock.mockResolvedValue({ id: 'u1' });
        renderAt('/verify-email?token=raw-token&email=learner@example.com', <VerifyEmailPage />);

        /* Mail scanners prefetch the link; a page-load request would verify a robot. */
        expect(verifyMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Xác nhận email' }));

        await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('raw-token'));
        expect(await screen.findByText('home')).toBeInTheDocument();
    });

    it('offers a resend when the link has expired', async () => {
        const user = userEvent.setup();
        verifyMock.mockRejectedValue(
            Object.assign(new Error('expired'), { status: 400, data: { reason: 'TOKEN_EXPIRED' } })
        );
        renderAt('/verify-email?token=raw-token&email=learner@example.com', <VerifyEmailPage />);

        await user.click(screen.getByRole('button', { name: 'Xác nhận email' }));

        expect(await screen.findByText(/Liên kết đã hết hạn/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gửi lại email/ })).toBeEnabled();
    });

    it('sends the resend request for the address it was opened with', async () => {
        const user = userEvent.setup();
        resendMock.mockResolvedValue({ success: true });
        renderAt('/verify-email?email=learner@example.com', <VerifyEmailPage />);

        await user.click(screen.getByRole('button', { name: /Gửi lại email/ }));

        await waitFor(() => expect(resendMock).toHaveBeenCalledWith({ email: 'learner@example.com' }));
        expect(await screen.findByText(/Đã gửi lại/)).toBeInTheDocument();
    });
});
