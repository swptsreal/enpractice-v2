import { useCallback, useMemo, useState } from 'react';
import { leaderboardApi, rewardMissionApi, challengeApi, xpMilestoneApi, inventoryApi } from '../../api';
import { unwrapData, readPage } from '../../api/envelope';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * Leaderboard, reward missions, XP milestones, inventory and weekly challenges.
 *
 * Contracts CONFIRMED against the running backend:
 *
 *   GET /leaderboard?period&page&size -> { myRank, topUsers[], page }
 *        entry { rank, userId, displayName, avatarUrl, targetBand, xp, currentStreak,
 *                rankChange, rankChangeDirection }
 *   GET /leaderboard/summary          -> { period, myRank, topThree[] }
 *   GET /xp/history?page&size         -> { totalXP, weeklyXP, history[], page }
 *   GET /user/reward-missions         -> ARRAY of mission objects (not a page)
 *        { code, name, active, trigger, repeatPolicy, conditions,
 *          rewardDefinitions[{ itemCode, quantity, type } | { amount, expiryDays, type }],
 *          rewardItemCodes[], rewardItems[], status, claimedAt, progress{current,target,label} }
 *   GET /user/xp-milestones           -> ARRAY (not a page)
 *        { code, requiredTotalXp, rewardItemCodes[], rewardItems[], eligible, claimed,
 *          grantedItems[] }
 *   POST /user/xp-milestones/{code}/claim -> { code, grantedItems[] }
 *   GET /user/inventory?page&size     -> PageResponse
 *        item { id, item{ id, code, type, usageType, name, description, assetUrl,
 *                         rarity, active, metadata }, grantSource, grantSourceId,
 *                grantedAt, equipped, used, usedAt }
 *   GET /user/challenges/weekly/current -> { weekStart, weekEnd, challenges[] }
 *        { definitionId, code, title, description, currentValue, targetValue,
 *          progressPercent, remainingValue, rewardXp, status, completed,
 *          weekStart, weekEnd, completedAt, rewardGrantedAt }
 *
 * FIVE THINGS THAT MATTER AND ARE EASY TO GET WRONG:
 *
 *  1. **`myRank` is NULL for an account with no XP.** Verified. The screen must say
 *     "unranked" rather than render rank 0, which would look like first place or last.
 *  2. **Ranks are NOT unique in the response.** Two accounts with 50 XP both came back
 *     as `rank: 1`. So the list must not key on rank, and a tie must not be presented as
 *     a single winner.
 *  3. **There is NO claim endpoint for reward missions.** `RewardMissionStatus` is only
 *     `LOCKED` or `CLAIMED`, and a completed mission carries `claimedAt` — rewards are
 *     granted automatically. The screen therefore must NOT render a "Claim" button: a
 *     button that does nothing is worse than none.
 *  4. **`/user/reward-missions` returns a bare ARRAY**, not a page. `readPage` would
 *     silently yield zero items, so it is handled separately. `/user/xp-milestones` is a
 *     bare array too, and `/user/inventory` IS a page — the three differ.
 *  5. **XP MILESTONES DO have a claim endpoint** (`POST /user/xp-milestones/{code}/claim`,
 *     verified: 200 `{code, grantedItems[]}`, and 400 VALIDATION_ERROR
 *     "Not enough XP to claim milestone" below the threshold — a real route, not a 404).
 *     `eligible` STAYS TRUE after claiming, so the button must key on `eligible &&
 *     !claimed`; checking `eligible` alone offers a claim that always fails with
 *     "Milestone already claimed".
 */

export const LEADERBOARD_PERIODS = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];

export function useLeaderboard({ period = 'WEEKLY', page = 0, size = 20 } = {}) {
    const key = `leaderboard|${period}|${page}|${size}`;
    const loader = useCallback(
        () => leaderboardApi.getLeaderboard({ period, page, size }).then(unwrapData),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);

    return {
        myRank: data?.myRank ?? null,
        entries: data?.topUsers ?? [],
        totalPages: data?.page?.totalPages ?? 0,
        totalElements: data?.page?.totalElements ?? 0,
        loading,
        error,
        reload,
    };
}

export function useXpHistory({ page = 0, size = 10 } = {}) {
    const key = `xp-history|${page}|${size}`;
    const loader = useCallback(
        () => leaderboardApi.getXpHistory({ page, size }).then(unwrapData),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);

    return {
        totalXp: data?.totalXP ?? 0,
        weeklyXp: data?.weeklyXP ?? 0,
        history: data?.history ?? [],
        loading,
        error,
        reload,
    };
}

export function useRewardMissions() {
    const loader = useCallback(() => rewardMissionApi.getMissions().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'reward-missions');

    const missions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const { claimable, locked, claimed } = useMemo(() => {
        /* Status is only LOCKED or CLAIMED, so anything not claimed is still in progress.
           "claimable" here means COMPLETE BUT UNCLAIMED, which the backend grants itself —
           it exists so the screen can explain that, not so it can offer a button. */
        const inProgress = [];
        const done = [];
        for (const mission of missions) {
            if (mission.status === 'CLAIMED') done.push(mission);
            else inProgress.push(mission);
        }
        return { claimable: [], locked: inProgress, claimed: done };
    }, [missions]);

    return { missions, locked, claimed, claimable, loading, error, reload };
}

/**
 * The credit value of a mission's rewards.
 *
 * `rewardDefinitions` mixes types: `{ type: 'CREDIT', amount, expiryDays }` and
 * `{ type: 'INVENTORY_ITEM', itemCode, quantity }`. Only the CREDIT entries are summed,
 * because that is the one a learner can reason about — dressing an inventory item up as
 * a credit figure would be inventing an exchange rate.
 */
export function creditValueOf(mission) {
    const defs = mission?.rewardDefinitions ?? [];
    const total = defs
        .filter((d) => d.type === 'CREDIT' && Number.isFinite(Number(d.amount)))
        .reduce((sum, d) => sum + Number(d.amount), 0);
    return total > 0 ? total : null;
}

export function xpValueOf(mission) {
    const defs = mission?.rewardDefinitions ?? [];
    const total = defs
        .filter((d) => d.type === 'XP' && Number.isFinite(Number(d.amount)))
        .reduce((sum, d) => sum + Number(d.amount), 0);
    return total > 0 ? total : null;
}

/* ------------------------------------------------------------ xp milestones */

/** Static keys for the three milestone states; a template key is invisible to the audit. */
export const MILESTONE_STATE_LABEL_KEYS = {
    claimed: 'rewards.milestones.states.claimed',
    claimable: 'rewards.milestones.states.claimable',
    locked: 'rewards.milestones.states.locked',
};

/** `claimed | claimable | locked` — derived, because the backend sends two booleans. */
export function milestoneState(milestone) {
    if (milestone?.claimed) return 'claimed';
    return milestone?.eligible ? 'claimable' : 'locked';
}

/** The names of the items a milestone grants. The list endpoint always sends them. */
export function milestoneRewardNames(milestone) {
    const items = milestone?.rewardItems ?? [];
    return items.map((item) => item?.name).filter((name) => typeof name === 'string' && name !== '');
}

export function useXpMilestones() {
    const loader = useCallback(() => xpMilestoneApi.getAll().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'xp-milestones');

    const [claiming, setClaiming] = useState(null);
    const [claimError, setClaimError] = useState(null);

    const milestones = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const { claimable, locked, claimed } = useMemo(() => {
        const open = [];
        const blocked = [];
        const done = [];
        for (const milestone of milestones) {
            const state = milestoneState(milestone);
            if (state === 'claimed') done.push(milestone);
            else if (state === 'claimable') open.push(milestone);
            else blocked.push(milestone);
        }
        return { claimable: open, locked: blocked, claimed: done };
    }, [milestones]);

    /* Resolves to null on failure and records the reason, so a caller can render
       `rewards.errors.claimMilestone` instead of an unhandled rejection. */
    const claim = useCallback(
        async (code) => {
            setClaiming(code);
            setClaimError(null);
            try {
                const result = await xpMilestoneApi.claim(code).then(unwrapData);
                reload();
                return result;
            } catch (err) {
                setClaimError(err);
                return null;
            } finally {
                setClaiming(null);
            }
        },
        [reload]
    );

    return { milestones, claimable, locked, claimed, claim, claiming, claimError, loading, error, reload };
}

/* -------------------------------------------------------------- inventory */

/** Static type labels for the NINE backend values, not three. `InventoryItemType` is
    BADGE, AVATAR_FRAME, TITLE, EMOTE, STICKER, BACKGROUND, REWARD_CARD, CREDIT_PACK, OTHER — the
    first version of this map covered three, so a TITLE or BACKGROUND row rendered with no type at
    all, and a template key would have been invisible to `scripts/i18n-audit.mjs`. */
export const INVENTORY_TYPE_LABEL_KEYS = {
    BADGE: 'rewards.inventory.types.BADGE',
    AVATAR_FRAME: 'rewards.inventory.types.AVATAR_FRAME',
    REWARD_CARD: 'rewards.inventory.types.REWARD_CARD',
    TITLE: 'rewards.inventory.types.TITLE',
    EMOTE: 'rewards.inventory.types.EMOTE',
    STICKER: 'rewards.inventory.types.STICKER',
    BACKGROUND: 'rewards.inventory.types.BACKGROUND',
    CREDIT_PACK: 'rewards.inventory.types.CREDIT_PACK',
    OTHER: 'rewards.inventory.types.OTHER',
};

/** null rather than a raw type code when the backend adds a type the locale lacks. */
export function inventoryTypeLabelKey(type) {
    return INVENTORY_TYPE_LABEL_KEYS[type] ?? null;
}

/**
 * One page of the learner's inventory.
 *
 * THE FILTERS ARE THE API'S OWN, and they are passed through rather than applied client-side: the
 * endpoint accepts `inventoryItemType` (`InventoryItemType`), `used` (boolean) and `name`, and it
 * PAGES. Filtering a single fetched page in the browser would silently answer "no badges" for a
 * learner whose badges are on page 2.
 */
export function useInventory({ page = 0, size = 8, inventoryItemType, used } = {}) {
    const key = `inventory|${page}|${size}|${inventoryItemType ?? 'ALL'}|${used ?? 'ALL'}`;
    const loader = useCallback(
        () =>
            inventoryApi
                .getMine({
                    page,
                    size,
                    ...(inventoryItemType ? { inventoryItemType } : {}),
                    ...(typeof used === 'boolean' ? { used } : {}),
                })
                .then(readPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [key]
    );
    const { data, loading, error, reload } = useAsyncData(loader, key);

    return {
        items: data?.items ?? [],
        totalElements: data?.totalElements ?? 0,
        loading,
        error,
        reload,
    };
}

/**
 * The three actions an inventory row actually offers.
 *
 * `equip(userInventoryItemId)` and `useItem(userInventoryItemId)` take the ROW id, while
 * `unequip(type)` takes the item TYPE — an asymmetry of the API, not a choice here: unequipping
 * removes whatever is equipped in that slot, which is why it cannot take a row id.
 *
 * The error is kept and surfaced rather than swallowed: a failed equip that silently does nothing
 * leaves the learner pressing the same button.
 */
export function useInventoryActions(reload) {
    const [pendingId, setPendingId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const run = useCallback(
        async (row, action) => {
            setPendingId(row.id);
            setActionError(null);
            try {
                await action(row);
                await reload();
                return true;
            } catch (error) {
                setActionError(error);
                return false;
            } finally {
                setPendingId(null);
            }
        },
        [reload]
    );

    const equip = useCallback((row) => run(row, (r) => inventoryApi.equip(r.id)), [run]);
    const use = useCallback((row) => run(row, (r) => inventoryApi.useItem(r.id)), [run]);
    const unequip = useCallback(
        (row) => run(row, (r) => inventoryApi.unequip(r.item?.type ?? r.type)),
        [run]
    );

    /** Equipped items unequip; everything else equips. One control, two directions. */
    const toggleEquip = useCallback(
        (row) => (row.equipped ? unequip(row) : equip(row)),
        [equip, unequip]
    );

    return { equip, unequip, use, toggleEquip, pendingId, actionError };
}

export function useWeeklyChallenges() {
    const loader = useCallback(() => challengeApi.getCurrentWeekly().then(unwrapData), []);
    const { data, loading, error, reload } = useAsyncData(loader, 'weekly-challenges');

    const challenges = useMemo(() => data?.challenges ?? [], [data]);

    return {
        weekStart: data?.weekStart ?? null,
        weekEnd: data?.weekEnd ?? null,
        challenges,
        completedCount: challenges.filter((c) => c.completed).length,
        totalXpAvailable: challenges.reduce((sum, c) => sum + (Number(c.rewardXp) || 0), 0),
        loading,
        error,
        reload,
    };
}
