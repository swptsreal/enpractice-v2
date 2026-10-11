import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Mic,
    PenLine,
    BookMarked,
    Sparkles,
    Check,
    ArrowRight,
    ShieldCheck,
    Lock,
} from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card } from '../../components/ui/Card';
import { ButtonLink } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Primitives';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Landing — `/` (screen 01). The only public, persuasive surface in the product.
 *
 * WHAT THIS PAGE MAY NOT SAY is the constraint that shapes all of it. `PRODUCT.md` is
 * explicit: **no user numbers, no testimonials, no band-improvement claims, no pricing
 * claims**, and nothing invented as social proof. So there is no logo wall, no avatar
 * row, no "10,000 students", and no "improve your band by 1.0" — not because the page
 * would look better with them, but because none of it would be true.
 *
 * The product illustration is LABELLED as an illustration, using the established fake
 * browser-chrome device with a caption reading "Minh hoạ sản phẩm, không phải bài làm
 * của người dùng thật." A screenshot-shaped mock without that label is the most common
 * way a landing page lies.
 *
 * The FAQ uses native `<details>` with the first item open — no JavaScript disclosure
 * widget, so it works before hydration and is keyboard-accessible for free. The "is the
 * core learning really free" question is answered at the same honesty level the product
 * commits to elsewhere: which parts cost and which do not.
 *
 * The guest trial is a PEER action, not a footnote, matching the login screen.
 */
export default function LandingPage() {
    const { t } = useTranslation();
    const { isAuthenticated, loading } = useAuth();

    const SKILLS = [
        { icon: BookOpen, titleKey: 'landing.skillReadingTitle', bodyKey: 'landing.skillReadingBody' },
        { icon: Mic, titleKey: 'landing.skillSpeakingTitle', bodyKey: 'landing.skillSpeakingBody' },
        { icon: PenLine, titleKey: 'landing.skillWritingTitle', bodyKey: 'landing.skillWritingBody' },
        { icon: BookMarked, titleKey: 'landing.skillVocabTitle', bodyKey: 'landing.skillVocabBody' },
    ];

    const STEPS = [
        { n: 1, titleKey: 'landing.step1Title', bodyKey: 'landing.step1Body' },
        { n: 2, titleKey: 'landing.step2Title', bodyKey: 'landing.step2Body' },
        { n: 3, titleKey: 'landing.step3Title', bodyKey: 'landing.step3Body' },
    ];

    const FAQ = [
        { q: 'landing.faqFreeQ', a: 'landing.faqFreeA', open: true },
        { q: 'landing.faqPaidQ', a: 'landing.faqPaidA' },
        { q: 'landing.faqBandQ', a: 'landing.faqBandA' },
        { q: 'landing.faqStreakQ', a: 'landing.faqStreakA' },
    ];

    return (
        <div className="min-h-dvh bg-[var(--canvas)]">
            {/* --- sticky nav (68px) --------------------------------------- */}
            <header className="sticky top-0 z-40 border-b-2 border-[var(--border)] bg-[var(--surface)]">
                <nav
                    aria-label={t('landing.navLabel')}
                    className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center gap-3 px-4"
                >
                    <Link to="/" className="flex items-center gap-2.5">
                        <Lexi mood="idle" size="xs" eager />
                        <span className="t-h3">{t('common.appName')}</span>
                    </Link>

                    <span className="flex-1" />

                    <a href="#how" className="t-label hidden text-[var(--ink-soft)] md:inline">
                        {t('landing.navHow')}
                    </a>
                    <a href="#free" className="t-label hidden text-[var(--ink-soft)] md:inline">
                        {t('landing.navFree')}
                    </a>
                    <a href="#faq" className="t-label hidden text-[var(--ink-soft)] md:inline">
                        {t('landing.navFaq')}
                    </a>

                    {/* A signed-in visitor sees their destination, not a sign-in form. */}
                    {!loading && isAuthenticated ? (
                        <ButtonLink to="/home" size="sm" variant="primary">
                            {t('landing.goToApp')}
                        </ButtonLink>
                    ) : (
                        <>
                            <ButtonLink to="/login" size="sm" variant="ghost">
                                {t('common.login')}
                            </ButtonLink>
                            <ButtonLink to="/login" size="sm" variant="primary">
                                {t('landing.startFree')}
                            </ButtonLink>
                        </>
                    )}
                </nav>
            </header>

            <main id="main">
                {/* --- hero, asymmetric 1.05fr / .95fr ---------------------- */}
                <section className="mx-auto grid w-full max-w-[1120px] gap-8 px-4 pt-14 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="flex flex-col gap-4">
                        <Chip tone="teal" icon={Sparkles}>
                            {t('landing.eyebrow')}
                        </Chip>

                        {/* Two lines, both CTAs above the fold. */}
                        <h1 className="t-display">{t('landing.headline')}</h1>
                        <p className="t-body-lg soft max-w-[46ch]">{t('landing.subtext')}</p>

                        <div className="flex flex-wrap items-center gap-3">
                            <ButtonLink to="/login" size="lg" variant="primary">
                                {t('landing.startFree')}
                                <ArrowRight size={18} aria-hidden="true" />
                            </ButtonLink>
                            {/* The guest trial is a PEER action, at the same weight. */}
                            <ButtonLink to="/vocabulary/check" size="lg" variant="secondary">
                                {t('login.guestTrial')}
                            </ButtonLink>
                        </div>

                        <p className="t-micro muted">{t('landing.guestCaveat')}</p>
                        <p className="t-micro muted inline-flex items-center gap-1.5">
                            <Lock size={13} aria-hidden="true" />
                            {t('landing.noCard')}
                        </p>
                    </div>

                    {/* --- the labelled product illustration ----------------- */}
                    <figure className="m-0">
                        <div className="overflow-hidden rounded-[var(--r-card)] border-2 border-[var(--border-strong)] bg-[var(--surface)]">
                            {/* Fake browser chrome: the device that marks this as an
                                illustration rather than a screenshot of real data. */}
                            <div className="flex items-center gap-2 border-b-2 border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2">
                                <span aria-hidden="true" className="flex gap-1.5">
                                    <span className="size-2.5 rounded-full bg-[var(--border-strong)]" />
                                    <span className="size-2.5 rounded-full bg-[var(--border-strong)]" />
                                    <span className="size-2.5 rounded-full bg-[var(--border-strong)]" />
                                </span>
                                <span className="t-mono truncate text-[var(--ink-muted)]">
                                    enpractice.site/writing/submission
                                </span>
                            </div>

                            {/* A static, obviously-illustrative slice of a result. */}
                            <div className="flex flex-col gap-3 p-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-4xl font-bold text-[var(--teal)]">6.5</span>
                                    <Chip tone="neutral">{t('writing.type.TASK_2')}</Chip>
                                </div>
                                {['taskResponse', 'coherence', 'lexicalResource', 'grammar'].map((key, i) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="t-micro muted w-[9rem] shrink-0 truncate">
                                            {t(`writing.criterion.${key}`)}
                                        </span>
                                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                                            <span
                                                className="block h-full rounded-full bg-[var(--teal)]"
                                                style={{ width: `${[70, 72, 68, 74][i]}%` }}
                                            />
                                        </span>
                                    </div>
                                ))}
                                <span className="t-micro muted border-t-2 border-[var(--border)] pt-2">
                                    {t('landing.mockCaption')}
                                </span>
                            </div>
                        </div>
                        <figcaption className="t-micro muted mt-2">{t('landing.mockCaption')}</figcaption>
                    </figure>
                </section>

                {/* --- skills ---------------------------------------------- */}
                <section className="mx-auto w-full max-w-[1120px] px-4 py-12">
                    <h2 className="t-h2">{t('landing.skillsTitle')}</h2>
                    <p className="t-body soft mt-2 max-w-[60ch]">{t('landing.skillsBody')}</p>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {SKILLS.map(({ icon: Icon, titleKey, bodyKey }) => (
                            <li key={titleKey}>
                                <Card level="edge" padding="xl" className="flex h-full flex-col gap-2">
                                    <span aria-hidden="true" className="text-[var(--teal)]">
                                        <Icon size={22} />
                                    </span>
                                    <h3 className="t-h3">{t(titleKey)}</h3>
                                    <p className="t-body soft">{t(bodyKey)}</p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* --- vocabulary band ------------------------------------- */}
                <section className="border-y-2 border-[var(--border)] bg-[var(--surface)]">
                    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-12 md:flex-row md:items-center">
                        <Lexi mood="happy" size="lg" />
                        <div className="min-w-0 flex-1">
                            <h2 className="t-h2">{t('landing.vocabTitle')}</h2>
                            <p className="t-body soft mt-2 max-w-[62ch]">{t('landing.vocabBody')}</p>
                        </div>
                        <ButtonLink to="/vocabulary/check" size="md" variant="secondary">
                            {t('landing.tryLookup')}
                        </ButtonLink>
                    </div>
                </section>

                {/* --- how it works ---------------------------------------- */}
                <section id="how" className="mx-auto w-full max-w-[1120px] px-4 py-12">
                    <h2 className="t-h2">{t('landing.howTitle')}</h2>
                    <ol className="mt-6 grid gap-4 md:grid-cols-3">
                        {STEPS.map(({ n, titleKey, bodyKey }) => (
                            <li key={n}>
                                <Card level="flat" padding="xl" className="flex h-full flex-col gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="t-mono grid size-9 place-items-center rounded-[var(--r-sm)] bg-[var(--teal)] text-[var(--on-teal)]"
                                    >
                                        {n}
                                    </span>
                                    <h3 className="t-h3">{t(titleKey)}</h3>
                                    <p className="t-body soft">{t(bodyKey)}</p>
                                </Card>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* --- the free boundary, stated positively ---------------- */}
                <section id="free" className="border-y-2 border-[var(--border)] bg-[var(--surface)]">
                    <div className="mx-auto w-full max-w-[1120px] px-4 py-12">
                        <h2 className="t-h2 flex items-center gap-2">
                            <ShieldCheck size={22} aria-hidden="true" className="text-[var(--teal)]" />
                            {t('landing.freeTitle')}
                        </h2>
                        <p className="t-body soft mt-2 max-w-[62ch]">{t('landing.freeBody')}</p>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <Card level="edge" padding="xl" className="flex flex-col gap-2.5">
                                <h3 className="t-h3 text-[var(--correct)]">{t('landing.freeColumnTitle')}</h3>
                                <ul className="flex flex-col gap-2">
                                    {['freeItem1', 'freeItem2', 'freeItem3', 'freeItem4'].map((key) => (
                                        <li key={key} className="t-body flex items-start gap-2">
                                            <Check
                                                size={16}
                                                className="mt-1 shrink-0 text-[var(--correct)]"
                                                aria-hidden="true"
                                            />
                                            {t(`landing.${key}`)}
                                        </li>
                                    ))}
                                </ul>
                            </Card>

                            <Card level="edge" padding="xl" className="flex flex-col gap-2.5">
                                <h3 className="t-h3">{t('landing.paidColumnTitle')}</h3>
                                <ul className="flex flex-col gap-2">
                                    {['paidItem1', 'paidItem2', 'paidItem3'].map((key) => (
                                        <li key={key} className="t-body flex items-start gap-2">
                                            <Sparkles
                                                size={16}
                                                className="mt-1 shrink-0 text-[var(--amber)]"
                                                aria-hidden="true"
                                            />
                                            {t(`landing.${key}`)}
                                        </li>
                                    ))}
                                </ul>
                                {/* Points at the real table instead of quoting a price
                                    here, so there is one source of truth for costs. */}
                                <ButtonLink to="/credits" size="sm" variant="ghost" className="self-start">
                                    {t('landing.seeCosts')}
                                </ButtonLink>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* --- FAQ: native details, first open --------------------- */}
                <section id="faq" className="mx-auto w-full max-w-[820px] px-4 py-12">
                    <h2 className="t-h2">{t('landing.faqTitle')}</h2>
                    <div className="mt-5 flex flex-col gap-2">
                        {FAQ.map(({ q, a, open }) => (
                            <details
                                key={q}
                                open={open}
                                className="rounded-[var(--r-card)] border-2 border-[var(--border)] bg-[var(--surface)] p-4"
                            >
                                <summary className="t-label cursor-pointer">{t(q)}</summary>
                                <p className="t-body soft mt-2.5">{t(a)}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* --- closing CTA ----------------------------------------- */}
                <section className="border-t-2 border-[var(--border)] bg-[var(--surface)]">
                    <div className="mx-auto flex w-full max-w-[820px] flex-col items-center gap-4 px-4 py-14 text-center">
                        <Lexi mood="celebrate" size="lg" />
                        <h2 className="t-h1">{t('landing.ctaTitle')}</h2>
                        <p className="t-body soft max-w-[52ch]">{t('landing.ctaBody')}</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <ButtonLink to="/login" size="lg" variant="primary">
                                {t('landing.startFree')}
                            </ButtonLink>
                            <ButtonLink to="/vocabulary/check" size="lg" variant="secondary">
                                {t('login.guestTrial')}
                            </ButtonLink>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t-2 border-[var(--border)] bg-[var(--canvas)]">
                <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-4 px-4 py-6">
                    <span className="t-micro muted">
                        {t('common.appName')} · {t('common.slogan')}
                    </span>
                    <span className="flex-1" />
                    {/* Signing in is offered only to someone who is not signed in. A
                        footer inviting a logged-in visitor to log in is the kind of
                        small inconsistency that makes a page feel unattended. */}
                    {!loading && isAuthenticated ? (
                        <Link to="/home" className="t-micro text-[var(--teal)]">
                            {t('landing.goToApp')}
                        </Link>
                    ) : (
                        <Link to="/login" className="t-micro text-[var(--teal)]">
                            {t('common.login')}
                        </Link>
                    )}
                    <Link to="/credits" className="t-micro text-[var(--teal)]">
                        {t('nav.credits')}
                    </Link>
                </div>
            </footer>
        </div>
    );
}
