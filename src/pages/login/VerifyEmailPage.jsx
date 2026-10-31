import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { maskEmail } from '../../lib/mask';
import { AuthSplit } from './AuthSplit';

/**
 * Xác thực email — `/verify-email?token=…` hoặc `/verify-email?email=…`.
 *
 * HAI trạng thái trên cùng một route, vì chúng là hai nửa của một việc:
 *
 *   không có token → "kiểm tra hộp thư" (sau khi đăng ký, hoặc sau khi đăng nhập bị chặn)
 *   có token       → một nút "Xác nhận email", POST khi bấm
 *
 * Token KHÔNG được tiêu thụ lúc mount: Gmail/Outlook prefetch link trong mail, nên một GET tự xác
 * thực sẽ xác thực và đăng nhập hộ nhà cung cấp mail chứ không phải người dùng.
 */
export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email') ?? '';

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [errorReason, setErrorReason] = useState(null);

    async function onConfirm() {
        setBusy(true);
        setError(null);
        setErrorReason(null);
        try {
            await verifyEmail(token);
            navigate('/home', { replace: true });
        } catch (err) {
            const status = err?.status ?? err?.response?.status;
            const reason = err?.data?.reason ?? err?.response?.data?.data?.reason;
            if (status === 400 && reason) setErrorReason(reason);
            else if (!status) setError(t('common.error.network'));
            else setError(t('common.error.generic'));
        } finally {
            setBusy(false);
        }
    }

    const expired = errorReason === 'TOKEN_EXPIRED' || errorReason === 'TOKEN_USED';

    return (
        <AuthSplit>
            <div className="text-center">
                <span className="inline-flex text-[var(--teal)]" aria-hidden="true">
                    <MailCheck size={36} />
                </span>

                <h1 className="t-h1 mt-3">{token ? t('security.verify.confirmTitle') : t('security.verify.title')}</h1>
                <p className="t-body muted mt-1.5">
                    {token
                        ? t('security.verify.confirmBody')
                        : email
                          ? t('security.verify.body', { email: maskEmail(email) })
                          : t('security.verify.bodyNoEmail')}
                </p>

                {error ? (
                    <p className="t-micro mt-3" style={{ color: 'var(--wrong)' }} role="alert">
                        {error}
                    </p>
                ) : null}

                {errorReason ? (
                    <p className="t-micro mt-3" style={{ color: 'var(--wrong)' }} role="alert">
                        {errorReason === 'TOKEN_EXPIRED'
                            ? t('security.verify.expiredBody')
                            : errorReason === 'TOKEN_USED'
                              ? t('security.verify.usedBody')
                              : t('security.verify.invalidBody')}
                    </p>
                ) : null}

                <div className="mt-5 flex flex-col gap-2.5">
                    {token && !expired ? (
                        <Button size="lg" block onClick={onConfirm} disabled={busy}>
                            {busy ? t('common.loading') : t('security.verify.confirm')}
                        </Button>
                    ) : null}
                </div>

                <p className="t-micro muted mt-3">{t('security.verify.spamHint')}</p>

                <Link to="/login" className="t-micro mt-2 inline-block text-[var(--teal)] underline underline-offset-4">
                    {t('security.verify.otherAccount')}
                </Link>
            </div>
        </AuthSplit>
    );
}
