import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Loader2, Trash2, UserRound } from 'lucide-react';
import { Lexi } from '../../components/mascot/Lexi';
import { Card, RowBox } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Chip, EmptyState, SkeletonCard } from '../../components/ui/Primitives';
import { cn } from '../../lib/cn';
import { speakingApi } from '../../api';
import { TEMPLATE_FILTERS } from '../../features/speaking/customSpeakingFilters';

/**
 * The template column of screen 27 — vertical rows beside the form.
 *
 * ONE ACTION PER ROW: "Dùng" fills the six fields of the form. It does not start a conversation
 * and it cannot spend credit; the charge stays on the form's start button. A row whose
 * configuration is currently in the form says "Đang dùng" instead — still one control.
 *
 * An own template carries one extra icon, delete, because the row's verb must stay "Dùng" and a
 * second labelled button would compete with it. Deletion asks before it happens.
 *
 * The list is a scrollport, not the page: 15 seeded templates plus the learner's own would push
 * the form off screen. On a phone the column comes first and its height is capped, so the form is
 * one short scroll away; on a wide screen it sticks beside the form while the form scrolls.
 */
export function CustomSpeakingTemplatePicker({
    containerRef,
    templates,
    loading,
    error,
    filter,
    onFilterChange,
    appliedId,
    onApply,
    onRetry,
    onDeleted,
}) {
    const { t } = useTranslation();
    const [confirmingId, setConfirmingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const visible = templates.filter((template) => {
        if (filter === 'mine') return template.source === 'USER';
        return template.group === filter;
    });

    async function remove(templateId) {
        setDeletingId(templateId);
        setDeleteError(null);
        try {
            await speakingApi.deleteCustomSpeakingTemplate(templateId);
            setConfirmingId(null);
            onDeleted();
        } catch {
            setDeleteError(t('customSpeaking.deleteError'));
        } finally {
            setDeletingId(null);
        }
    }

    const empty =
        filter === 'mine'
            ? {
                  title: t('customSpeaking.mineEmptyTitle'),
                  body: t('customSpeaking.mineEmptyBody'),
              }
            : {
                  title: t('customSpeaking.emptyTemplatesTitle'),
                  body: t('customSpeaking.emptyTemplatesBody'),
              };

    return (
        <aside
            ref={containerRef}
            aria-labelledby="template-picker-title"
            className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-3"
        >
            <h2 className="t-h3" id="template-picker-title">
                {t('customSpeaking.templatesHeading')}
            </h2>

            <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label={t('customSpeaking.filterLabel')}
            >
                {TEMPLATE_FILTERS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        aria-pressed={filter === option.id}
                        onClick={() => onFilterChange(option.id)}
                        className={cn(
                            'min-h-9 rounded-[var(--r-chip)] px-3 text-xs font-bold',
                            filter === option.id
                                ? 'bg-[var(--teal)] text-[var(--on-teal)]'
                                : 'bg-[var(--surface-alt)] text-[var(--ink-muted)]'
                        )}
                    >
                        {t(option.labelKey)}
                    </button>
                ))}
            </div>

            {deleteError ? (
                <p role="alert" className="t-micro text-[var(--wrong)]">
                    {deleteError}
                </p>
            ) : null}

            {loading ? (
                <div className="flex flex-col gap-2" aria-busy="true">
                    {Array.from({ length: 4 }, (_, index) => (
                        <SkeletonCard key={index} lines={2} />
                    ))}
                </div>
            ) : error ? (
                <Card level="flat" padding="lg" role="alert" className="flex flex-col gap-2">
                    <p className="t-micro flex items-start gap-2">
                        <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--wrong)]" />
                        {t('customSpeaking.loadError')}
                    </p>
                    <Button size="sm" variant="secondary" onClick={onRetry}>
                        {t('common.retry')}
                    </Button>
                </Card>
            ) : visible.length === 0 ? (
                <EmptyState
                    title={empty.title}
                    body={empty.body}
                    lexi={<Lexi mood="sleepy" size="sm" />}
                />
            ) : (
                <ul className="flex max-h-[46vh] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[calc(100dvh-320px)]">
                    {visible.map((template) => {
                        const own = template.source === 'USER';
                        const applied = appliedId === template.id;
                        const deleting = deletingId === template.id;
                        return (
                            <li key={template.id}>
                                <RowBox center className="flex-wrap gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {template.level ? (
                                                <Chip tone="outline">{template.level}</Chip>
                                            ) : null}
                                            {template.group ? (
                                                <Chip tone="outline">
                                                    {t(`customSpeaking.group.${template.group}`)}
                                                </Chip>
                                            ) : null}
                                            {own ? (
                                                <Chip tone="teal" icon={UserRound}>
                                                    {t('customSpeaking.ownChip')}
                                                </Chip>
                                            ) : null}
                                        </div>
                                        <strong className="t-label mt-1.5 block">{template.title}</strong>
                                        <span className="t-micro muted mt-0.5 block line-clamp-2">
                                            {template.summary || template.topic}
                                        </span>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        {applied ? (
                                            <Button size="sm" variant="ghost" disabled>
                                                <Check size={15} aria-hidden="true" />
                                                {t('customSpeaking.inUse')}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => onApply(template)}
                                            >
                                                {t('customSpeaking.useTemplate')}
                                            </Button>
                                        )}
                                        {own ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                iconOnly
                                                aria-label={t('customSpeaking.deleteTemplateAria')}
                                                onClick={() => setConfirmingId(template.id)}
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </RowBox>

                                {confirmingId === template.id ? (
                                    <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                                        <span className="t-micro text-[var(--wrong)]">
                                            {t('customSpeaking.deleteQuestion')}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            disabled={deleting}
                                            onClick={() => remove(template.id)}
                                        >
                                            {deleting ? (
                                                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                                            ) : null}
                                            {t('customSpeaking.deleteTemplate')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setConfirmingId(null)}
                                        >
                                            {t('customSpeaking.cancelAction')}
                                        </Button>
                                    </div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}

            <ButtonLink to="/custom-speaking/history" variant="ghost" size="sm" className="self-start">
                {t('customSpeaking.historyLink')}
            </ButtonLink>
        </aside>
    );
}
