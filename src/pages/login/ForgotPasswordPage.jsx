import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, MailCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, inputClass } from '../../components/ui/Primitives';
import { authApi } from '../../api/authApi';
import { AuthSplit } from './AuthSplit';

/**
 * Quên mật khẩu — `/forgot-password`.
 *
 * Không có nhánh "email không tồn tại": backend trả 200 và cùng một câu cho mọi địa chỉ, nên màn
 * này không được bịa ra một kết quả khác. Khác biệt duy nhất người dùng thấy là 429 khi bấm quá
 * nhanh, và câu đó nói rõ phải chờ bao lâu.
 */
export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await authApi.forgotPassword({ email });
            setSent(true);
        } catch (err) {
            const status = err?.status ?? err?.response?.status;
            if (status === 429) setError(t('security.forgot.rateLimited'));
            else if (status === 400) setError(t('security.forgot.invalidEmail'));
            else if (!status) setError(t('common.error.network'));
            else setError(t('common.error.generic'));
        } finally {
            setBusy(false);
        }
    }

    return (
        <AuthSplit>
            <Link
                to="/login"
                className="flex min-h-11 items-center gap-2 text-[0.8125rem] font-bold text-[var(--ink-soft)]"
            >
                <ArrowLeft size={16} aria-hidden="true" />
                {t('security.forgot.backToLogin')}
            </Link>

            {sent ? (
                <div className="mt-4 flex flex-col gap-3" role="status" aria-live="polite">
                    <span className="text-[var(--teal)]" aria-hidden="true">
                        <MailCheck size={32} />
                    </span>
                    <h1 className="t-h1">{t('security.forgot.sentTitle')}</h1>
                    <p className="t-body muted">{t('security.forgot.sentBody')}</p>
                    <p className="t-micro muted">{t('security.forgot.sentHint')}</p>
                    <Link to="/login" className="t-label mt-2 text-[var(--teal)] underline underline-offset-4">
                        {t('security.forgot.backToLogin')}
                    </Link>
                </div>
            ) : (
                <>
                    <h1 className="t-h1 mt-4">{t('security.forgot.title')}</h1>
                    <p className="t-body muted mt-1">{t('security.forgot.body')}</p>

                    <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                        <Field id="email" label={t('login.email')} error={error}>
                            <input
                                id="email"
                                type="email"
                                className={inputClass}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                            />
                        </Field>

                        <Button type="submit" size="lg" block disabled={busy || !email}>
                            {busy ? t('common.loading') : t('security.forgot.submit')}
                        </Button>
                    </form>

                    <div className="mt-4 flex items-start gap-2.5 rounded-[var(--r-card)] bg-[var(--info-soft)] p-3">
                        <span className="mt-0.5 shrink-0 text-[var(--info)]" aria-hidden="true">
                            <Info size={16} />
                        </span>
                        <p className="t-micro">{t('security.forgot.linkNote')}</p>
                    </div>
                </>
            )}
        </AuthSplit>
    );
}
