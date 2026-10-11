import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Trash2, Plus, X, Volume2, Layers, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, Stat, SkeletonCard } from '../../components/ui/Primitives';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { MasteryRing } from '../../components/vocabulary/MasteryRing';
import { cn } from '../../lib/cn';
import { formatDate, isDue } from '../../lib/datetime';
import {
    useDictionaryStats,
    useDictionaryWords,
    useWordMutations,
    MEMORY_FILTERS,
} from '../../features/vocabulary/useDictionary';

/**
 * Vocabulary notebook — `/dictionary`.
 *
 * Layout: list plus a detail aside at >=1024px; below that the detail becomes its
 * own block under the list rather than a modal, because a modal over a filtered
 * list loses the filter on close.
 *
 * The organising idea is MEMORY, not the alphabet. `proficiencyLevel` (0-5) drives
 * the mastery ring and the tier colour, and the "hay quên" filter sorts by what is
 * about to be forgotten. v1's dictionary sorts by `created_at` and offers no
 * memory affordance at all, which is why a notebook in v1 is a list you write to
 * and never read.
 *
 * Search is debounced so typing "mitigate" issues one request rather than eight,
 * and the hook sequences responses so a slow reply for "mit" cannot overwrite the
 * results for "mitigate".
 */
export default function DictionaryPage() {
    const { t } = useTranslation();

    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [memory, setMemory] = useState('all');
    const [tag, setTag] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [composing, setComposing] = useState(false);
    const [draft, setDraft] = useState({ word: '', meaning: '', note: '' });

    const stats = useDictionaryStats();

    const memoryFilter = MEMORY_FILTERS.find((f) => f.id === memory) ?? MEMORY_FILTERS[0];
    const query = useMemo(
        () => ({
            keyword,
            tag,
            /* "forgetful" means the low tiers that are about to lapse; the others map
               straight onto a proficiencyLevel the backend filters on. */
            proficiencyLevel: memory === 'forgetful' ? 1 : memoryFilter.level,
            /* `created_at`, never `updated_at`: the backend bumps `updatedAt` on a
               favourite toggle, so sorting by it drags the row the user just touched
               to the other end of the list. `created_at` never changes, which keeps
               the notebook still under a toggle. See `useDictionaryWords`. */
            sortBy: memory === 'forgetful' ? 'next_review_at' : 'created_at',
            /* Newest first is where a just-added word has to appear. */
            sortDir: memory === 'forgetful' ? 'asc' : 'desc',
            size: 50,
        }),
        [keyword, tag, memory, memoryFilter.level]
    );

    const words = useDictionaryWords(query);
    const { toggleFavorite, remove, addWord, busyId, error: mutationError } = useWordMutations();

    /* Debounce the text input only. Filter clicks are discrete and should be instant. */
    function onKeywordChange(value) {
        setKeywordInput(value);
        window.clearTimeout(onKeywordChange.timer);
        onKeywordChange.timer = window.setTimeout(() => setKeyword(value), 300);
    }

    const allTags = useMemo(
        () => [...new Set(words.items.flatMap((w) => w.tags ?? []))].slice(0, 12),
        [words.items]
    );

    const selected = words.items.find((w) => w.id === selectedId) ?? words.items[0] ?? null;

    async function onAdd(e) {
        e.preventDefault();
        if (!draft.word.trim() || !draft.meaning.trim()) return;
        try {
            const created = await addWord({
                word: draft.word.trim(),
                meaning: draft.meaning.trim(),
                note: draft.note.trim(),
                sourceType: 'MANUAL',
            });
            setDraft({ word: '', meaning: '', note: '' });
            setComposing(false);
            /* Put the new word at the TOP of the list that is on screen and select
               it, instead of refetching. A refetch would have re-rendered the whole
               list through the skeleton and — with the sort this screen used to
               send — dropped the word the user just wrote at the BOTTOM. */
            if (created?.id) {
                words.prependItem(created);
                setSelectedId(created.id);
            } else {
                words.reload();
            }
        } catch {
            /* `useWordMutations` holds the error; the alert below renders it. */
        }
        stats.reload();
    }

    async function onDelete(id) {
        try {
            await remove(id);
            /* In place: the rows around it must not move, and the list must not
               flash through the skeleton to prove a row is gone. */
            words.dropItem(id);
            if (selectedId === id) setSelectedId(null);
            stats.reload();
        } catch {
            /* the alert below */
        }
    }

    async function onToggleFavorite(word) {
        const next = !word.isFavorite;
        /* OPTIMISTIC AND IN PLACE. The row keeps its position because nothing
           refetches: `PATCH /dictionary/{id}/favorite` bumps `updatedAt` on the
           server (verified live), so re-asking for the page is exactly what moved
           the word to the end of the list. */
        words.patchItem(word.id, { isFavorite: next });
        try {
            const saved = await toggleFavorite(word.id);
            /* Reconcile with only the field this endpoint owns. The PATCH response
               carries a STALE `updatedAt` (it answers 13:29:54 while the stored row
               already says 13:30:02), so spreading the whole object back into the
               row would write a wrong timestamp into the UI. */
            if (typeof saved?.isFavorite === 'boolean') {
                words.patchItem(word.id, { isFavorite: saved.isFavorite });
            }
        } catch {
            /* Roll back: a star that stays filled after a rejected write is a lie. */
            words.patchItem(word.id, { isFavorite: word.isFavorite });
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* --- stats ---------------------------------------------------- */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat value={stats.stats?.totalWords ?? '—'} label={t('dictionary.statTotal')} tone="teal" />
                <Stat value={stats.stats?.wordsToReviewToday ?? '—'} label={t('dictionary.statDue')} tone="amber" />
                <Stat value={stats.stats?.learningWords ?? '—'} label={t('dictionary.statLearning')} />
                <Stat value={stats.stats?.masteredWords ?? '—'} label={t('dictionary.statMastered')} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="t-micro muted">{t('dictionary.subtitle')}</p>
                <div className="flex gap-2">
                    <ButtonLink to="/dictionary/review" size="sm" variant="primary">
                        <Layers size={16} aria-hidden="true" />
                        {t('dictionary.startReview')}
                    </ButtonLink>
                    <Button size="sm" variant="secondary" onClick={() => setComposing((v) => !v)}>
                        <Plus size={15} aria-hidden="true" />
                        {t('dictionary.addWord')}
                    </Button>
                </div>
            </div>

            {/* --- add form ------------------------------------------------- */}
            {composing ? (
                <Card level="edge" padding="xl">
                    <form onSubmit={onAdd} className="flex flex-col gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="t-micro muted">{t('dictionary.fieldWord')}</span>
                                <input
                                    className="min-h-12 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                                    value={draft.word}
                                    onChange={(e) => setDraft((d) => ({ ...d, word: e.target.value }))}
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="t-micro muted">{t('dictionary.fieldMeaning')}</span>
                                <input
                                    className="min-h-12 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                                    value={draft.meaning}
                                    onChange={(e) => setDraft((d) => ({ ...d, meaning: e.target.value }))}
                                    required
                                />
                            </label>
                        </div>
                        <label className="flex flex-col gap-1.5">
                            <span className="t-micro muted">{t('dictionary.fieldNote')}</span>
                            <input
                                className="min-h-12 rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
                                value={draft.note}
                                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                            />
                        </label>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" variant="primary">
                                {t('common.save')}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setComposing(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : null}

            {/* --- search + filters ---------------------------------------- */}
            <div className="flex flex-col gap-3">
                <label className="relative flex items-center">
                    <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 text-[var(--ink-muted)]" />
                    <span className="sr-only">{t('dictionary.searchLabel')}</span>
                    <input
                        className="min-h-12 w-full rounded-[var(--r-control)] border-2 border-[var(--border-strong)] bg-[var(--surface)] pl-11 pr-3.5"
                        placeholder={t('dictionary.searchPlaceholder')}
                        value={keywordInput}
                        onChange={(e) => onKeywordChange(e.target.value)}
                    />
                </label>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('dictionary.memoryFilterLabel')}>
                    {MEMORY_FILTERS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            aria-pressed={memory === f.id}
                            onClick={() => setMemory(f.id)}
                            className={cn(
                                'min-h-11 rounded-[var(--r-control)] px-3.5 text-sm font-bold',
                                memory === f.id
                                    ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                    : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                            )}
                        >
                            {t(f.labelKey)}
                        </button>
                    ))}
                    {tag ? (
                        <button
                            type="button"
                            onClick={() => setTag(null)}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--r-control)] bg-[var(--amber-soft)] px-3.5 text-sm font-bold text-[var(--ink)]"
                        >
                            #{tag}
                            <X size={14} aria-hidden="true" />
                        </button>
                    ) : null}
                </div>

                {allTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {allTags.map((tg) => (
                            <button key={tg} type="button" onClick={() => setTag(tg)} aria-pressed={tag === tg}>
                                <Chip tone={tag === tg ? 'teal' : 'neutral'}>#{tg}</Chip>
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            {/* A mutation (favourite / add / delete) fails separately from the list
                request, so `AsyncBoundary` cannot report it: without this line a
                rejected write would roll the row back silently. */}
            {mutationError ? (
                <p role="alert" className="t-micro flex items-center gap-2 text-[var(--wrong)]">
                    <AlertTriangle size={14} aria-hidden="true" />
                    {t('common.error.generic')}
                </p>
            ) : null}

            {/* --- list + detail ------------------------------------------- */}
            <AsyncBoundary
                loading={words.loading}
                error={words.error}
                isEmpty={!words.loading && !words.error && words.items.length === 0}
                onRetry={words.reload}
                skeleton={
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 5 }, (_, i) => (
                            <SkeletonCard key={i} lines={2} />
                        ))}
                    </div>
                }
                emptyTitle={keyword || tag || memory !== 'all' ? t('dictionary.noMatchTitle') : t('dictionary.emptyTitle')}
                emptyBody={keyword || tag || memory !== 'all' ? t('dictionary.noMatchBody') : t('dictionary.emptyBody')}
                emptyAction={
                    keyword || tag || memory !== 'all' ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                setKeywordInput('');
                                setKeyword('');
                                setTag(null);
                                setMemory('all');
                            }}
                        >
                            {t('dictionary.clearFilters')}
                        </Button>
                    ) : (
                        <Button size="sm" variant="primary" onClick={() => setComposing(true)}>
                            {t('dictionary.addWord')}
                        </Button>
                    )
                }
            >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <ul className="flex flex-col gap-2">
                        {words.items.map((w) => {
                            const isSelected = selected?.id === w.id;
                            return (
                                <li key={w.id}>
                                    <RowBox
                                        center
                                        className={cn(
                                            'cursor-pointer transition-colors',
                                            isSelected && 'border-2 border-[var(--teal)]'
                                        )}
                                        onClick={() => setSelectedId(w.id)}
                                    >
                                        <MasteryRing level={w.proficiencyLevel} size="sm" showLabel={false} />
                                        <span className="min-w-0 flex-1">
                                            <strong className="t-label block text-[var(--ink)]">{w.word}</strong>
                                            <span className="t-micro muted block truncate">
                                                {w.ipa ? `${w.ipa} · ` : ''}
                                                {w.meaning}
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                aria-label={w.isFavorite ? t('dictionary.unfavorite') : t('dictionary.favorite')}
                                                aria-pressed={Boolean(w.isFavorite)}
                                                disabled={busyId === w.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleFavorite(w);
                                                }}
                                            >
                                                <Star
                                                    size={16}
                                                    aria-hidden="true"
                                                    fill={w.isFavorite ? 'var(--amber)' : 'none'}
                                                    color={w.isFavorite ? 'var(--amber)' : 'currentColor'}
                                                />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                iconOnly
                                                aria-label={`${t('common.delete')}: ${w.word}`}
                                                disabled={busyId === w.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(w.id);
                                                }}
                                            >
                                                <Trash2 size={16} aria-hidden="true" />
                                            </Button>
                                        </span>
                                    </RowBox>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Detail. Sticky beside the list at lg; a normal block below it on
                        small screens, so no modal and no lost filters. */}
                    {selected ? (
                        <aside className="lg:sticky lg:top-4 lg:self-start">
                            <Card level="edge" padding="xl" className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="t-h2 break-words">{selected.word}</h2>
                                        <p className="t-micro muted">
                                            {[selected.ipa, selected.wordType].filter(Boolean).join(' · ') || '—'}
                                        </p>
                                    </div>
                                    <MasteryRing level={selected.proficiencyLevel} size="md" />
                                </div>

                                <p className="t-body-lg">{selected.meaning}</p>
                                {selected.explanation ? <p className="t-body soft">{selected.explanation}</p> : null}
                                {selected.note ? (
                                    <p className="t-micro muted border-l-2 border-[var(--border-strong)] pl-3">{selected.note}</p>
                                ) : null}

                                {(selected.examples ?? []).length > 0 ? (
                                    <ul className="flex flex-col gap-2">
                                        {selected.examples.map((ex, i) => (
                                            <li key={i} className="t-body soft italic">
                                                {ex.sentence ?? ex.text ?? JSON.stringify(ex)}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                {(selected.tags ?? []).length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.tags.map((tg) => (
                                            <Chip key={tg} tone="neutral">
                                                #{tg}
                                            </Chip>
                                        ))}
                                    </div>
                                ) : null}

                                <dl className="t-micro muted grid grid-cols-2 gap-2 border-t-2 border-[var(--border)] pt-3">
                                    <div>
                                        <dt>{t('dictionary.reviewCount')}</dt>
                                        <dd className="t-label">{selected.reviewCount ?? 0}</dd>
                                    </div>
                                    <div>
                                        <dt>{t('dictionary.nextReview')}</dt>
                                        <dd className="t-label">
                                            {/* A word ALWAYS has a nextReviewAt — a freshly
                                                added one comes back with a date hours ahead
                                                (verified live). So the question is whether
                                                that date has PASSED, not whether the field
                                                is set; "has a date" would label every word
                                                "due now". */}
                                            {isDue(selected.nextReviewAt)
                                                ? t('dictionary.dueNow')
                                                : (formatDate(selected.nextReviewAt) ?? t('dictionary.notScheduled'))}
                                        </dd>
                                    </div>
                                </dl>

                                <p className="t-micro muted flex items-center gap-1.5">
                                    <Volume2 size={14} aria-hidden="true" />
                                    {t('dictionary.ttsNote')}
                                </p>
                            </Card>
                        </aside>
                    ) : null}
                </div>
            </AsyncBoundary>

            <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => { words.reload(); stats.reload(); }}>
                    <RefreshCw size={15} aria-hidden="true" />
                    {t('common.retry')}
                </Button>
            </div>
        </div>
    );
}
