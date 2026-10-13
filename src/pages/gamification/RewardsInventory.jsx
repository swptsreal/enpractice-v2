import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AsyncBoundary } from '../../components/ui/AsyncBoundary';
import { Chip, SkeletonCard } from '../../components/ui/Primitives';
import { cn } from '../../lib/cn';
import { formatDate } from '../../lib/datetime';
import {
    inventoryTypeLabelKey,
    useInventory,
    useInventoryActions,
} from '../../features/gamification/useGamification';

/**
 * The inventory tab of Rewards — extracted so the redesign could be written without touching the
 * milestones / missions / history code beside it.
 *
 * ── WHY IT IS A GRID OF TILES, NOT A LIST OF ROWS ─────────────────────────────
 *
 * The review's complaint was "inventory chưa hợp lý". Three things were wrong and all three are
 * structural rather than cosmetic:
 *
 *  1. **It was the seventh block of nine** in a single 820px column, below the milestones, an info
 *     card, in-progress missions and already-claimed missions. The mockup makes it a tab.
 *  2. **It fetched `{ page: 0, size: 8 }` and rendered it as a flat list** — no paging, no filters,
 *     even though the endpoint accepts `inventoryItemType`, `used` and `name` and returns
 *     `totalElements`/`totalPages`. Eight rows was the whole inventory, forever, with the total
 *     printed above it and no way to reach the rest.
 *  3. **A type the locale did not know rendered no label at all**, and the row never showed the
 *     item's own art, description or the one action it has. `inventoryApi` exposes `equip`,
 *     `useItem` and `unequip`, and the screen offered none of them.
 *
 * ── WHAT IS STILL DELIBERATELY ABSENT ─────────────────────────────────────────
 *
 * There is no "locked" tile. The item CATALOGUE is admin-only
 * (`/api/admin/inventory/items`, `@PreAuthorize("hasRole('ADMIN')")`), so a learner's inventory
 * contains only what they own and a locked card would have no data behind it.
 */
export default function RewardsInventory() {
    const { t } = useTranslation();
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [usageFilter, setUsageFilter] = useState('ALL');
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 8;

    const inventory = useInventory({
        page,
        size: PAGE_SIZE,
        inventoryItemType: typeFilter === 'ALL' ? undefined : typeFilter,
        /* `UNUSED` is `used: false`, not `used: undefined` — "not used yet" is a real filter the API
           implements, and leaving it out would return everything. */
        used: usageFilter === 'ALL' ? undefined : usageFilter === 'USED',
    });
    const actions = useInventoryActions(inventory.reload);

    const canLoadMore = (page + 1) * PAGE_SIZE < inventory.totalElements;

    /* Changing a filter resets to page 0: page 2 of a different filter is a different list, and
       keeping the page number would silently skip the first page of the new result. */
    function changeFilter({ type = typeFilter, usage = usageFilter }) {
        setTypeFilter(type);
        setUsageFilter(usage);
        setPage(0);
    }

    return (
        <div id="rw-inventory" role="tabpanel" aria-labelledby="rw-inventory-tab" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="t-h3 flex items-center gap-2">
                        <Package size={18} aria-hidden="true" />
                        {t('rewards.inventory.title')}
                    </h2>
                    <p className="t-micro muted">{t('rewards.inventory.subtitle')}</p>
                </div>
                <Chip tone="neutral">{t('rewards.inventory.totalItems', { total: inventory.totalElements })}</Chip>
            </div>

            {/* The filters are the endpoint's own query parameters, so each one really narrows the
               request rather than the eight rows already on screen. */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('rewards.inventory.filtersLabel')}>
                {['ALL', 'BADGE', 'AVATAR_FRAME', 'REWARD_CARD'].map((value) => (
                    <button
                        key={`type-${value}`}
                        type="button"
                        aria-pressed={typeFilter === value}
                        onClick={() => changeFilter({ type: value })}
                        className={cn(
                            'min-h-11 rounded-[var(--r-chip)] border-2 px-3.5 text-sm font-bold',
                            typeFilter === value
                                ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]'
                                : 'border-[var(--border)] text-[var(--ink-soft)]'
                        )}
                    >
                        {t(`rewards.inventory.filters.${value}`)}
                    </button>
                ))}
                {['ALL', 'UNUSED', 'USED'].map((value) => (
                    <button
                        key={`usage-${value}`}
                        type="button"
                        aria-pressed={usageFilter === value}
                        onClick={() => changeFilter({ usage: value })}
                        className={cn(
                            'min-h-11 rounded-[var(--r-chip)] border-2 px-3.5 text-sm font-semibold',
                            usageFilter === value
                                ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal)]'
                                : 'border-[var(--border)] text-[var(--ink-muted)]'
                        )}
                    >
                        {t(`rewards.inventory.usageFilters.${value}`)}
                    </button>
                ))}
            </div>

            <AsyncBoundary
                loading={inventory.loading}
                error={inventory.error}
                isEmpty={!inventory.loading && !inventory.error && inventory.items.length === 0}
                onRetry={inventory.reload}
                /* The skeleton is a grid in the SHAPE of the result, not a stack of rows. */
                skeleton={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }, (_, i) => (
                            <SkeletonCard key={i} lines={3} />
                        ))}
                    </div>
                }
                /* The dedicated key, not the generic `rewards.emptyTitle`: "no items in this filter"
                   and "no rewards at all" are different answers. */
                emptyTitle={t('rewards.inventory.empty')}
                emptyMood="sleepy"
            >
                <div className="flex flex-col gap-3">
                    {actions.actionError ? (
                        <p role="alert" className="t-micro text-[var(--wrong)]">
                            {t('common.error.generic')}
                        </p>
                    ) : null}

                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {inventory.items.map((row) => {
                            const typeKey = inventoryTypeLabelKey(row.item?.type);
                            const busy = actions.pendingId === row.id;
                            /* `usageType` decides which action exists at all: a CONSUMABLE is used,
                               an EQUIPPABLE is equipped or unequipped. Offering both on every tile
                               would offer actions the item cannot perform. */
                            const consumable = row.item?.usageType === 'CONSUMABLE';

                            return (
                                <li key={row.id}>
                                    <Card
                                        level="edge"
                                        padding="lg"
                                        className="flex h-full flex-col items-center gap-3 text-center"
                                    >
                                        {row.item?.assetUrl ? (
                                            <img
                                                src={row.item.assetUrl}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="size-16 rounded-[var(--r-card)] object-cover"
                                            />
                                        ) : (
                                            <span
                                                aria-hidden="true"
                                                className="grid size-16 place-items-center rounded-[var(--r-card)] bg-[var(--surface-alt)] text-[var(--teal)]"
                                            >
                                                <Package size={28} />
                                            </span>
                                        )}

                                        <div className="min-w-0">
                                            <strong className="t-label block">
                                                {/* `code` is the fallback, not the section title:
                                                    a missing name used to render "Kho vật phẩm"
                                                    as if it were the item's own name. */}
                                                {row.item?.name ?? row.item?.code ?? '—'}
                                            </strong>
                                            {/* Type AND state, joined — never colour alone. */}
                                            <span className="t-micro muted block">
                                                {[
                                                    typeKey ? t(typeKey) : null,
                                                    row.equipped
                                                        ? t('rewards.inventory.equipped')
                                                        : row.used
                                                          ? t('rewards.inventory.used')
                                                          : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                            {row.item?.description ? (
                                                <span className="t-micro muted mt-1 block">{row.item.description}</span>
                                            ) : null}
                                            {row.grantedAt ? (
                                                <span className="t-micro muted mt-1 block">{formatDate(row.grantedAt)}</span>
                                            ) : null}
                                        </div>

                                        <div className="mt-auto w-full">
                                            {consumable ? (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    block
                                                    disabled={row.used || busy}
                                                    onClick={() => actions.use(row)}
                                                >
                                                    {row.used ? t('rewards.inventory.used') : t('rewards.inventory.use')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant={row.equipped ? 'ghost' : 'primary'}
                                                    size="sm"
                                                    block
                                                    disabled={busy}
                                                    onClick={() => actions.toggleEquip(row)}
                                                >
                                                    {row.equipped
                                                        ? t('rewards.inventory.unequip')
                                                        : t('rewards.inventory.equip')}
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </AsyncBoundary>

            {canLoadMore ? (
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => setPage((current) => current + 1)}>
                        {t('rewards.inventory.loadMore')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
