import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Coins, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip, ProgressBar } from '../../components/ui/Primitives';
import { PathNode } from '../../components/ui/PathNode';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Lexi } from '../../components/mascot/Lexi';
import { cn } from '../../lib/cn';
import { useCredit } from '../../contexts/CreditContextCore';
import { getCreditCostDisplay } from '../../features/credits/creditPolicy';
import {
    NODE_STATES,
    REASON_LABEL_KEYS,
    STATE_LABEL_KEYS,
    formatBand,
    isMeasuredBand,
    isPressable,
    nodeTitleKey,
    progressFor,
    unitTitleParts,
    useLearningPath,
} from '../../features/learning/useLearningPath';

/**
 * Learning path — `/path` (screen 06).
 *
 * WHAT THIS SCREEN IS FOR. Home answers "what do I do today". This answers "how far am I from
 * the band I want, and what is the next small step" — it is the only surface that shows a
 * SEQUENCE. So every node is a step the learner can finish in one sitting, and its state comes
 * from the server (§4 of `_design/LEARNING-PATH.md`), computed from the work that actually
 * happened: answered questions per question type, completed attempts, graded submissions, the
 * vocabulary queue that is due.
 *
 * NOTHING HERE IS ESTIMATED. No "predicted band", no percentage towards a target that has no
 * measurement, no node whose state is decoration. Three specific consequences:
 *
 *  - **A band of 0 and the absence of a band look identical on the wire**, so both render as
 *    "chưa đo" with the explanation. Printing "band 0.0" to a learner who has not sat anything
 *    would state a result that does not exist.
 *  - **A locked node is still readable and still labelled.** It is disabled, not hidden: the
 *    learner needs to see that there IS a next step and what unlocks it, which is the entire
 *    point of showing a path instead of a list.
 *  - **The cost of a node is on the node, before it is pressed.** `costActionCode` is resolved
 *    through the credit provider, which already holds the live price list, so the number shown
 *    is the number the action will charge — there is no second copy of the price to drift.
 *
 * The one request behind it returns the goal, the position and the current unit together,
 * because the ordering rule lives on the server and the client must not re-derive it.
 */
export default function LearningPathPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { path, loading, error, reload } = useLearningPath();
    const credit = useCredit();

    const unit = path?.unit ?? null;
    const nodes = unit?.nodes ?? [];
    const isDiagnostic = unit?.focusType === 'DIAGNOSTIC';

    /** A unit's name: translatable for generated focuses, the content's own title otherwise. */
    function unitTitle(candidate) {
        const parts = unitTitleParts(candidate);
        if (!parts) return '';
        if (!parts.typeKey) return candidate?.title ?? '';
        return [parts.skillKey ? t(parts.skillKey) : null, t(parts.typeKey)].filter(Boolean).join(' — ');
    }

    function openNode(node) {
        const url = node?.action?.url;
        if (!url) return;
        navigate(url);
    }

    const unitName = unitTitle(unit);
    const doneCount = typeof unit?.progress?.done === 'number' ? unit.progress.done : null;
    const totalCount = typeof unit?.progress?.total === 'number' ? unit.progress.total : null;

    return (
        <AsyncBoundary
            loading={loading}
            error={error}
            onRetry={reload}
            isEmpty={!loading && !error && !unit}
            emptyTitle={t('learningPath.emptyTitle')}
            emptyBody={t('learningPath.emptyBody')}
        >
            {/* `unit` is guarded HERE as well as in `isEmpty`, and that is not redundant: JSX
                children are built before `AsyncBoundary` decides what to render, so a bare
                `unit.index` would throw on the very first render — while the skeleton is
                still the thing on screen. */}
            {unit ? (
                <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
                {/* --- position: goal, unit, XP -------------------------------- */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="t-body muted min-w-0 flex-1">
                        {isMeasuredBand(path?.targetBand)
                            ? t('learningPath.goalLine', { band: formatBand(path.targetBand) })
                            : t('learningPath.noGoal')}
                        {!isMeasuredBand(path?.currentBand) ? (
                            <span className="block">{t('learningPath.notMeasured')}</span>
                        ) : (
                            <span className="block">
                                {t('learningPath.currentLine', { band: formatBand(path.currentBand) })}
                            </span>
                        )}
                    </p>
                    {typeof path?.xp === 'number' ? (
                        <Chip tone="teal" icon={Star}>
                            {t('learningPath.xp', { value: path.xp })}
                        </Chip>
                    ) : null}
                </div>

                {/* --- the current unit ---------------------------------------- */}
                <Card level="edge" radius="hero" padding="xl">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <Chip tone="amber">{t('learningPath.unitLabel', { index: unit.index })}</Chip>
                            <h2 className="t-h2 mt-2.5">{unitName}</h2>
                            <p className="t-micro muted mt-1">
                                {isDiagnostic
                                    ? t('learningPath.starterReason', { count: nodes.length })
                                    : t('learningPath.unitMeta', { count: nodes.length })}
                            </p>
                        </div>

                        {/* The diagnostic unit has no measurement to draw a bar against, so it
                            says what it is instead of showing 0 of 2. */}
                        {!isDiagnostic && doneCount !== null && totalCount ? (
                            <div className="min-w-[180px] flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="t-micro muted">{t('learningPath.unitProgress')}</span>
                                    <span className="t-micro font-mono tabular-nums">
                                        {t('learningPath.progressRatio', { done: doneCount, total: totalCount })}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={Math.round((doneCount / totalCount) * 100)}
                                    tone="amber"
                                    className="mt-1.5"
                                    label={t('learningPath.unitProgressLabel', {
                                        done: doneCount,
                                        total: totalCount,
                                    })}
                                />
                            </div>
                        ) : null}
                    </div>
                </Card>

                {/* --- the node chain ----------------------------------------- */}
                <ol className="flex list-none flex-col items-center">
                    {nodes.map((node, index) => {
                        const titleKey = nodeTitleKey(node);
                        const nodeName = titleKey ? t(titleKey) : (node.title ?? '');
                        const progress = progressFor(node);
                        const progressText = progress ? t(progress.key, progress.values) : null;
                        const stateLabel = t(STATE_LABEL_KEYS[node.state] ?? 'learningPath.stateLocked');
                        const costEntry = node.costActionCode ? credit.getCost(node.costActionCode) : null;
                        const cost = getCreditCostDisplay(costEntry);
                        const affordable =
                            !cost ||
                            credit.availableBalance == null ||
                            credit.availableBalance >= Number(costEntry?.cost ?? 0);
                        const toRight = index % 2 === 1;
                        /* The reason is shown for the node the learner is ON: that is where
                           "why this, now" is a real question. Under every node it would be
                           five explanations competing with five labels. */
                        const reasonKey =
                            node.state === NODE_STATES.CURRENT ? REASON_LABEL_KEYS[node.stateReason] : null;

                        return (
                            <li key={node.key} className="flex w-full flex-col items-center">
                                {index > 0 ? (
                                    <span aria-hidden="true" className="h-6 w-0.5 bg-[var(--border)]" />
                                ) : null}

                                <div
                                    className={cn(
                                        'flex w-full max-w-[560px] items-center gap-4',
                                        toRight && 'flex-row-reverse'
                                    )}
                                >
                                    <PathNode
                                        state={node.state}
                                        disabled={!isPressable(node)}
                                        onClick={() => openNode(node)}
                                        label={[nodeName, stateLabel, progressText]
                                            .filter(Boolean)
                                            .join(' — ')}
                                    />

                                    <div className={cn('min-w-0 flex-1', toRight && 'text-right')}>
                                        <strong className="t-label block">{nodeName}</strong>
                                        <span className="t-micro muted block">
                                            {[stateLabel, progressText].filter(Boolean).join(' · ')}
                                        </span>
                                        {reasonKey ? (
                                            <span className="t-micro block text-[var(--attention)]">
                                                {t(reasonKey)}
                                            </span>
                                        ) : null}
                                        {cost ? (
                                            <span className="mt-1.5 inline-flex">
                                                <Chip tone={affordable ? 'neutral' : 'amber'} icon={Coins}>
                                                    {/* The same amount label the other cost controls use,
                                                        inside a translated sentence: the helper decides
                                                        WHETHER a price applies, the locale decides the words. */}
                                                    {t('learningPath.costLine', { amount: cost.amountLabel })}
                                                </Chip>
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                {/* --- the next unit ----------------------------------------- */}
                {path?.nextUnit ? (
                    <Card level="flat" padding="xl" className="text-center">
                        <Lexi mood="idle" size="md" />
                        <h3 className="t-h3 mt-2">{t('learningPath.nextUnitTitle', { unit: unitTitle(path.nextUnit) })}</h3>
                        <p className="t-micro muted mt-1">
                            {t('learningPath.nextUnitHint', { index: unit?.index ?? 1 })}
                        </p>
                        {Array.isArray(path.nextUnit.topics) && path.nextUnit.topics.length > 0 ? (
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {path.nextUnit.topics.map((topic) => (
                                    <Chip key={topic}>{topic}</Chip>
                                ))}
                            </div>
                        ) : null}
                    </Card>
                ) : null}

                {/* The unit header already carries the goal; this is the one thing the screen
                    cannot show without a profile, so it is stated rather than implied. */}
                {!isMeasuredBand(path?.targetBand) ? (
                    <div className="text-center">
                        <Button variant="secondary" onClick={() => navigate('/onboarding')}>
                            {t('learningPath.setGoal')}
                        </Button>
                    </div>
                ) : null}
                </div>
            ) : null}
        </AsyncBoundary>
    );
}
