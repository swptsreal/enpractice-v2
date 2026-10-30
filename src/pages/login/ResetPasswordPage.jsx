import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, inputClass } from '../../components/ui/Primitives';
import { authApi } from '../../api/authApi';
import { AuthSplit } from './AuthSplit';

/**
 * Đặt lại mật khẩu — `/reset-password?token=…`.
 *
 * Token nằm trong URL vì nó đến từ mail. Trang chỉ ĐỌC token và gửi trong body của một POST: không
 * gửi kèm referrer, không đưa vào analytics, không log.
 *
 * Mật khẩu mới không được gửi lên server nếu hai ô không khớp — báo lỗi tại chỗ rẻ hơn một vòng
 * request và không đốt token chỉ vì gõ nhầm.
 */
export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);
    const [tokenError, setTokenError] = useState(null);

    const tooShort = password.length > 0 && password.length < 8;
    const mismatch = confirm.length > 0 && password !== confirm;
    const canSubmit = !busy && password.length >= 8 && password === confirm;

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await authApi.resetPassword({ token, newPassword: password });
            setDone(true);
        } catch (err) {
            const status = err?.status ?? err?.response?.status;
            const reason = err?.data?.reason ?? err?.response?.data?.data?.reason;

            if (status === 400 && reason) setTokenError(reason);
            else if (status === 400) setError(err?.message ?? t('common.error.generic'));
            else if (!status) setError(t('common.error.network'));
            else setError(t('common.error.generic'));
        } finally {
            setBusy(false);
        }
    }

    if (done) {
        return (
            <AuthSplit>
                <div className="flex flex-col gap-3" role="status" aria-live="polite">
                    <span className="text-[var(--correct)]" aria-hidden="true">
                        <ShieldCheck size={32} />
                    </span>
                    <h1 className="t-h1">{t('security.reset.successTitle')}</h1>
                    <p className="t-body muted">{t('security.reset.successBody')}</p>
                    <Link to="/login?reset=1" className="t-label text-[var(--teal)] underline underline-offset-4">
                        {t('security.reset.goToLogin')}
                    </Link>
                </div>
            </AuthSplit>
        );
    }

    if (!token) {
        return (
            <AuthSplit>
                <div className="flex flex-col gap-3">
                    <h1 className="t-h1">{t('security.reset.invalidTitle')}</h1>
                    <p className="t-body muted">{t('security.reset.invalidBody')}</p>
                    <Link
                        to="/forgot-password"
                        className="t-label text-[var(--teal)] underline underline-offset-4"
                    >
                        {t('security.reset.requestNew')}
                    </Link>
                </div>
            </AuthSplit>
        );
    }

    if (tokenError) {
        const message =
            tokenError === 'TOKEN_EXPIRED'
                ? t('security.reset.expiredBody')
                : tokenError === 'TOKEN_USED'
                  ? t('security.reset.usedBody')
                  : t('security.reset.invalidBody');

        return (
            <AuthSplit>
                <div className="flex flex-col gap-3">
                    <h1 className="t-h1">{t('security.reset.invalidTitle')}</h1>
                    <p className="t-body muted">{message}</p>
                    <Link
                        to="/forgot-password"
                        className="t-label text-[var(--teal)] underline underline-offset-4"
                    >
                        {t('security.reset.requestNew')}
                    </Link>
                </div>
            </AuthSplit>
        );
    }

    return (
        <AuthSplit>
            <h1 className="t-h1">{t('security.reset.title')}</h1>
            <p className="t-body muted mt-1">{t('security.reset.body')}</p>

            <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                <Field
                    id="newPassword"
                    label={t('security.reset.password')}
                    help={t('login.passwordHint')}
                    error={tooShort ? t('security.reset.tooShort') : null}
                >
                    <input
                        id="newPassword"
                        type="password"
                        className={inputClass}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </Field>

                <Field
                    id="confirmPassword"
                    label={t('security.reset.confirm')}
                    error={mismatch ? t('security.reset.mismatch') : null}
                >
                    <input
                        id="confirmPassword"
                        type="password"
                        className={inputClass}
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </Field>

                {error ? (
                    <p className="t-micro" style={{ color: 'var(--wrong)' }} role="alert">
                        {error}
                    </p>
                ) : null}

                <Button type="submit" size="lg" block disabled={!canSubmit}>
                    {busy ? t('common.loading') : t('security.reset.submit')}
                </Button>
            </form>

            <p className="t-micro muted mt-4">{t('security.reset.signOutNote')}</p>
        </AuthSplit>
    );
}
