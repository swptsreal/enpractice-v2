import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';

/**
 * Khung chung của 4 màn auth: đăng nhập, quên mật khẩu, đặt lại mật khẩu, xác thực email.
 *
 * Vì sao tách ra: bốn màn dùng CÙNG một cột marketing và cùng một card 460px. Chép cột đó bốn lần
 * thì lần sau sửa một câu quảng bá phải sửa bốn chỗ và chắc chắn sẽ lệch.
 *
 * Cột trái bị bỏ hẳn dưới 1024px thay vì xếp lên trên — một panel marketing phía trên form đẩy form
 * xuống dưới màn hình điện thoại, đúng thứ duy nhất màn đăng nhập không được làm.
 */
export function AuthSplit({ children }) {
    const { t } = useTranslation();

    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            <aside className="hidden flex-col gap-6 border-r-2 border-[var(--border)] bg-[var(--teal-soft)] p-10 lg:flex">
                <div className="flex items-center gap-2.5">
                    <Lexi mood="idle" size="xs" eager />
                    <strong className="t-h3">{t('common.appName')}</strong>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-5">
                    <Lexi mood="excited" size="xl" label={t('login.lexiGreeting')} />
                    <h2 className="t-display">{t('login.heroTitle')}</h2>
                    <p className="t-body-lg soft max-w-[36ch]">{t('login.heroBody')}</p>
                    <ul className="flex flex-col gap-3">
                        {[t('login.benefit1'), t('login.benefit2'), t('login.benefit3')].map((line) => (
                            <li key={line} className="flex items-start gap-3">
                                <span className="text-[var(--teal)]" aria-hidden="true">
                                    <Check size={18} />
                                </span>
                                <span className="t-body">{line}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="t-micro muted">{t('login.illustrationNote')}</p>
            </aside>

            <main className="grid place-items-center p-5">
                <Card level="raised" padding="xl" className="w-full max-w-[460px]">
                    {children}
                </Card>
            </main>
        </div>
    );
}
