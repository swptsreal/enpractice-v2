import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Lock, Check, Info, Receipt, RefreshCw } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { useAsyncData } from '../../hooks/useAsyncData';
import { creditApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { formatDateTime } from '../../lib/datetime';
import { CREDIT_MODES } from '../../features/credits/creditConstants';

/**
 * Action code -> STATIC i18n key.
 *
 * Interpolating the key (`credits.action.${code}`) would need a `defaultValue`
 * fallback for an unknown code, and the i18n audit fails on inline `defaultValue` in
 * a component — correctly, because that is how an untranslated surface hides. A
 * lookup gives the same safety with keys the audit can see, and an unknown code falls
 * back to the raw code rather than to nothing.
 */
const ACTION_LABEL_KEYS = {
    AI_CHAT: 'credits.action.AI_CHAT',
    AI_EXPLAIN: 'credits.action.AI_EXPLAIN',
    VOCABULARY_TEST_GENERATE: 'credits.action.VOCABULARY_TEST_GENERATE',
    IELTS_START: 'credits.action.IELTS_START',
    WRITING_START: 'credits.action.WRITING_START',
    WRITING_PRACTICE_START: 'credits.action.WRITING_PRACTICE_START',
    WRITING_PRACTICE_GENERATE: 'credits.action.WRITING_PRACTICE_GENERATE',
    SPEAKING_START: 'credits.action.SPEAKING_START',
};

/**
 * Credits — `/credits`.
 *
 * This page exists to make the free/paid boundary LEGIBLE, which is a `PRODUCT.md`
 * commitment. Two consequences shape it:
 *
 *  1. **The cost table lists every action, including the free ones.** Showing only
 *     what costs money implies everything else might too. The free rows carry a
 *     check glyph and say so, so a reader can see the size of the free surface
 *     rather than infer it.
 *  2. **A DISABLED action is shown as unavailable, not as free.** The backend
 *     returns `mode: DISABLED` with `cost: 0` for features that are switched off
 *     (verified: `AI_CHAT` currently comes back that way). Rendering that as
 *     "0 credits" would advertise a feature as free that cannot be used at all,
 *     which is exactly the kind of half-truth this page is meant to prevent.
 *
 * Transactions come from `GET /credits/transactions` in the standard
 * `PageResponse` shape (`items`/`page`).
 */
export default function CreditsPage() {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);

    const balanceLoader = useCallback(() => creditApi.getBalance().then(unwrapData), []);
    const costsLoader = useCallback(() => creditApi.getCosts().then(unwrapData), []);
    const txLoader = useCallback(() => creditApi.getTransactions({ page: 0, size: 20 }).then(readPage), []);

    const balance = useAsyncData(balanceLoader, 'credits-balance');
    const costs = useAsyncData(costsLoader, 'credits-costs');
    const transactions = useAsyncData(txLoader, 'credits-transactions');

    const costRows = useMemo(() => costs.data ?? [], [costs.data]);

    const { freeActions, paidActions, disabledActions } = useMemo(() => {
        const free = [];
        const paid = [];
        const disabled = [];
        for (const row of costRows) {
            if (row.mode === CREDIT_MODES.DISABLED) disabled.push(row);
            else if (Number(row.cost) > 0) paid.push(row);
            else free.push(row);
        }
        return { freeActions: free, paidActions: paid, disabledActions: disabled };
    }, [costRows]);

    const reloadAll = () => {
        balance.reload();
        costs.reload();
        transactions.reload();
    };

    return (
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <p className="t-micro muted">{t('credits.subtitle')}</p>

            <AsyncBoundary
                loading={balance.loading && costs.loading}
                error={balance.error ?? costs.error}
                onRetry={reloadAll}
                skeleton={<SkeletonCard lines={3} />}
                isEmpty={false}
            >
                {/* --- balance ------------------------------------------------- */}
                <Card level="hero" padding="xl" className="flex flex-col gap-5 md:flex-row md:items-center">
                    <Lexi mood="happy" size="lg" />
                    <div className="min-w-0 flex-1">
                        <span className="t-micro muted">{t('credits.balanceLabel')}</span>
                        <div className="flex items-baseline gap-3">
                            <span className="font-mono text-5xl font-bold tabular-nums text-[var(--teal)]">
                                {balance.data?.availableBalance ?? '—'}
                            </span>
                            {balance.data?.reservedBalance > 0 ? (
                                <Chip tone="amber" icon={Lock}>
                                    {t('credits.reserved', { count: balance.data.reservedBalance })}
                                </Chip>
                            ) : null}
                        </div>
                        <p className="t-body soft mt-2">{t('credits.balanceNote')}</p>
                    </div>
                </Card>

                {/* --- what costs what ----------------------------------------- */}
                <Card level="edge" padding="xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="t-h3">{t('credits.costsTitle')}</h2>
                        {disabledActions.length > 0 ? (
                            <Chip tone="neutral">{t('credits.someUnavailable', { count: disabledActions.length })}</Chip>
                        ) : null}
                    </div>

                    <ul className="mt-3.5 flex flex-col gap-2">
                        {[...paidActions, ...freeActions, ...disabledActions].map((row) => {
                            const disabled = row.mode === CREDIT_MODES.DISABLED;
                            const observed = row.mode === CREDIT_MODES.OBSERVE;
                            return (
                                <li key={row.actionCode}>
                                    <RowBox center>
                                        <span aria-hidden="true" className={disabled ? 'text-[var(--ink-faint)]' : 'text-[var(--teal)]'}>
                                            {Number(row.cost) > 0 ? <Coins size={18} /> : <Check size={18} />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">
                                                {ACTION_LABEL_KEYS[row.actionCode]
                                                    ? t(ACTION_LABEL_KEYS[row.actionCode])
                                                    : row.actionCode}
                                            </strong>
                                            {observed ? (
                                                <span className="t-micro muted">{t('credits.observeNote')}</span>
                                            ) : null}
                                        </span>
                                        <span className="shrink-0 text-right">
                                            {disabled ? (
                                                <Chip tone="neutral">{t('credits.unavailable')}</Chip>
                                            ) : Number(row.cost) > 0 ? (
                                                <span className="t-mono text-[var(--amber)]">
                                                    {t('credits.costAmount', { count: row.cost })}
                                                </span>
                                            ) : (
                                                <span className="t-label text-[var(--correct)]">{t('credits.free')}</span>
                                            )}
                                        </span>
                                    </RowBox>
                                </li>
                            );
                        })}
                    </ul>

                    <p className="t-micro muted mt-3.5 flex items-start gap-2">
                        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {t('credits.freeSurfaceNote')}
                    </p>
                </Card>

                {/* --- transactions -------------------------------------------- */}
                <Card level="edge" padding="xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="t-h3">{t('credits.transactionsTitle')}</h2>
                        <Button size="sm" variant="ghost" onClick={reloadAll}>
                            <RefreshCw size={15} aria-hidden="true" />
                            {t('common.retry')}
                        </Button>
                    </div>

                    <AsyncBoundary
                        loading={transactions.loading}
                        error={transactions.error}
                        isEmpty={!transactions.loading && !transactions.error && (transactions.data?.items?.length ?? 0) === 0}
                        onRetry={transactions.reload}
                        skeleton={<SkeletonCard lines={2} />}
                        emptyTitle={t('credits.noTransactionsTitle')}
                        emptyBody={t('credits.noTransactionsBody')}
                    >
                        <ul className="mt-3 flex flex-col gap-2">
                            {(transactions.data?.items ?? []).slice(0, showAll ? undefined : 5).map((tx) => {
                                const credit = Number(tx.amount) > 0;
                                return (
                                    <li key={tx.id}>
                                        <RowBox center>
                                            <span
                                                aria-hidden="true"
                                                className={
                                                    'grid size-9 shrink-0 place-items-center rounded-[var(--r-sm)] ' +
                                                    (credit ? 'bg-[var(--correct-soft)] text-[var(--correct)]' : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]')
                                                }
                                            >
                                                <Receipt size={16} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <strong className="t-label block text-[var(--ink)]">
                                                    {tx.actionCode ?? tx.sourceType ?? tx.transactionType}
                                                </strong>
                                                <span className="t-micro muted">
                                                    {formatDateTime(tx.createdAt) ?? '—'}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-right">
                                                {/* Sign is part of the message, and the label
                                                    carries it too so colour is not the only cue. */}
                                                <span
                                                    className={
                                                        't-mono block ' +
                                                        (credit ? 'text-[var(--correct)]' : 'text-[var(--ink-muted)]')
                                                    }
                                                >
                                                    {credit ? '+' : ''}
                                                    {tx.amount}
                                                </span>
                                                <span className="t-micro muted">
                                                    {t('credits.balanceAfter', { count: tx.availableBalanceAfter })}
                                                </span>
                                            </span>
                                        </RowBox>
                                    </li>
                                );
                            })}
                        </ul>

                        {(transactions.data?.items?.length ?? 0) > 5 ? (
                            <Button size="sm" variant="ghost" className="mt-3" onClick={() => setShowAll((v) => !v)}>
                                {showAll ? t('credits.showLess') : t('credits.showAll', { count: transactions.data.items.length })}
                            </Button>
                        ) : null}
                    </AsyncBoundary>
                </Card>
            </AsyncBoundary>

            <div className="flex flex-wrap gap-2">
                <ButtonLink to="/home" variant="primary">
                    {t('nav.home')}
                </ButtonLink>
                <ButtonLink to="/vocabulary" variant="ghost">
                    {t('nav.vocabTest')}
                </ButtonLink>
            </div>

            <Stat value={balance.data?.status ?? '—'} label={t('credits.walletStatus')} />
        </div>
    );
}
