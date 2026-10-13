import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Lock } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, inputClass } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sign in / sign up.
 *
 * v1's Login is a split panel: a marketing column on the left, a 460px card on the
 * right, and the marketing column is REMOVED below 1024px rather than stacked —
 * because a marketing panel above a login form pushes the form below the fold on a
 * phone, which is the one thing a login screen must not do. v2 keeps that.
 *
 * This screen exists in the build for a second reason: `RequireAuth` redirects
 * here, and a redirect target that is not a route is an infinite loop (login falls
 * through to the catch-all, which sends the visitor back to the guarded route).
 */
export default function LoginPage() {
    const { t } = useTranslation();
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.redirectTo ?? '/home';

    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const isRegister = mode === 'register';

    async function onSubmit(event) {
        event.preventDefault();
        setError(null);
        setBusy(true);
        try {
            /* POSITIONAL ARGUMENTS, NOT AN OBJECT.
               `AuthContext` is part of the verbatim-ported v1 layer, and its signatures
               are `login(email, password)` / `register(email, password, displayName)`.
               Passing one object made `email` arrive at the API as an OBJECT, and the
               backend answered
                 MismatchedInputException: Cannot deserialize value of type
                 java.lang.String from Object value (token START_OBJECT)
                 ... LoginRequest["email"]
               The body was `{ email: { email, password }, password: undefined }`, and
               `axios` drops the undefined key — which is why the error names `email`
               at column 10 and nothing else. */
            if (isRegister) {
                await register(email, password, displayName);
            } else {
                await login(email, password);
            }
            navigate(redirectTo, { replace: true });
        } catch (err) {
            /* 401 is the expected "wrong credentials" answer; anything else is a
               different problem and gets its own message rather than a blanket
               "something went wrong". */
            const status = err?.status ?? err?.response?.status;
            if (status === 401 || status === 400) setError(t('login.errorCredentials'));
            else if (!status) setError(t('common.error.network'));
            else setError(t('common.error.generic'));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            {/* marketing column: desktop only */}
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
                    <div
                        role="tablist"
                        aria-label={t('login.modeLabel')}
                        className="flex gap-1 rounded-[var(--r-control)] bg-[var(--surface-alt)] p-1"
                    >
                        {[
                            { id: 'login', label: t('common.login') },
                            { id: 'register', label: t('login.register') },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={mode === id}
                                onClick={() => {
                                    setMode(id);
                                    setError(null);
                                }}
                                className={
                                    'min-h-10 flex-1 rounded-[var(--r-sm)] text-sm font-bold ' +
                                    (mode === id
                                        ? 'bg-[var(--surface)] text-[var(--ink)] shadow-[0_2px_0_0_var(--border)]'
                                        : 'text-[var(--ink-muted)]')
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <h1 className="t-h1 mt-5">{isRegister ? t('login.register') : t('common.login')}</h1>
                    <p className="t-body muted mt-1">{t('login.subtitle')}</p>

                    <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                        {isRegister ? (
                            <Field id="displayName" label={t('login.displayName')}>
                                <input
                                    id="displayName"
                                    className={inputClass}
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </Field>
                        ) : null}

                        <Field id="email" label={t('login.email')}>
                            <input
                                id="email"
                                type="email"
                                className={inputClass}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </Field>

                        <Field
                            id="password"
                            label={t('login.password')}
                            help={isRegister ? t('login.passwordHint') : undefined}
                            error={error}
                        >
                            <input
                                id="password"
                                type="password"
                                className={inputClass}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                                required
                            />
                        </Field>

                        <Button type="submit" size="lg" block disabled={busy}>
                            <Lock size={16} aria-hidden="true" />
                            {busy ? t('common.loading') : isRegister ? t('login.register') : t('common.login')}
                        </Button>
                    </form>

                    <div className="my-5 flex items-center gap-3">
                        <span className="h-0.5 flex-1 bg-[var(--border)]" />
                        <span className="t-micro muted">{t('login.or')}</span>
                        <span className="h-0.5 flex-1 bg-[var(--border)]" />
                    </div>

                    <a
                        href="/vocabulary"
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] text-[0.9375rem] font-extrabold text-[var(--ink)]"
                    >
                        <Sparkles size={18} aria-hidden="true" />
                        {t('login.guestTrial')}
                    </a>
                    <p className="t-micro muted mt-3 text-center">{t('login.guestNote')}</p>
                </Card>
            </main>
        </div>
    );
}
