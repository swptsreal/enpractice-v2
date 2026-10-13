import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The three gamification screens, and the product's gamification ethics applied
 * structurally rather than as tone of voice:
 *
 *  - **Unranked is a real state.** `myRank` is null for an account with no XP (verified),
 *    and rendering rank 0 would read as either first or last place.
 *  - **A TIE IS A TIE.** Verified: two accounts with 50 XP both came back as `rank: 1`.
 *    The list must not present that as a single winner.
 *  - **THERE IS NO CLAIM ENDPOINT FOR REWARD MISSIONS.** `RewardMissionStatus` is only
 *    LOCKED or CLAIMED, and a completed mission carries `claimedAt`. Rewards are granted
 *    automatically, so a "Claim" button there would be a control that does nothing.
 *  - **BUT XP MILESTONES *DO* HAVE ONE.** `POST /user/xp-milestones/{code}/claim` answers
 *    200 (verified) and 400 "Not enough XP to claim milestone" below the threshold — a
 *    404 would mean the route did not exist. So the milestone list is the ONE block that
 *    gets a claim button, and only for `eligible && !claimed`: `eligible` stays TRUE
 *    after claiming, so keying on `eligible` alone offers a press that always fails.
 *  - **The rewards screen must call all four sources**, not only the XP history.
 *  - **Only real credit values are shown.** `rewardDefinitions` mixes CREDIT and
 *    INVENTORY_ITEM entries; converting an item into a credit figure would invent an
 *    exchange rate the backend never states.
 */
const getLeaderboard = vi.fn();
const getXpHistory = vi.fn();
const getMissions = vi.fn();
const getCurrentWeekly = vi.fn();
const getAllMilestones = vi.fn();
const claimMilestone = vi.fn();
const getInventory = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    leaderboardApi: {
        getLeaderboard: (...a) => getLeaderboard(...a),
        getXpHistory: (...a) => getXpHistory(...a),
    },
    rewardMissionApi: { getMissions: (...a) => getMissions(...a) },
    challengeApi: { getCurrentWeekly: (...a) => getCurrentWeekly(...a) },
    xpMilestoneApi: { getAll: (...a) => getAllMilestones(...a), claim: (...a) => claimMilestone(...a) },
    inventoryApi: { getMine: (...a) => getInventory(...a) },
}));

const { i18nReady } = await import('../../i18n');
const { default: LeaderboardPage } = await import('./LeaderboardPage');
const { default: RewardsPage } = await import('./RewardsPage');
const { default: ChallengesPage } = await import('./ChallengesPage');
const {
    creditValueOf,
    xpValueOf,
    milestoneState,
    milestoneRewardNames,
    inventoryTypeLabelKey,
} = await import('../../features/gamification/useGamification');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** The exact tie the backend returned: two accounts on 50 XP, both rank 1. */
const TIED_ENTRIES = [
    { rank: 1, userId: 'u-a', displayName: 'Flow', xp: 50, currentStreak: 0, rankChange: 0, rankChangeDirection: 'NEW' },
    { rank: 1, userId: 'u-b', displayName: 'VF', xp: 50, currentStreak: 0, rankChange: 0, rankChangeDirection: 'NEW' },
    { rank: 2, userId: 'u-c', displayName: 'Wr', xp: 15, currentStreak: 3, rankChange: 1, rankChangeDirection: 'UP' },
];

const leaderboardPage = (myRank, entries = TIED_ENTRIES) =>
    envelope({ myRank, topUsers: entries, page: { page: 0, size: 20, totalElements: entries.length, totalPages: 1 } });

function renderWith(node) {
    return render(<MemoryRouter>{node}</MemoryRouter>);
}

beforeAll(() => {
    getXpHistory.mockResolvedValue(envelope({ totalXP: 0, weeklyXP: 0, history: [], page: {} }));
    getMissions.mockResolvedValue(envelope([]));
    getAllMilestones.mockResolvedValue(envelope([]));
    getInventory.mockResolvedValue(envelope({ page: 0, size: 8, totalElements: 0, totalPages: 0, items: [] }));
});

describe('the state derived from the two milestone booleans', () => {
    it('is `claimed` first, because eligible stays TRUE after claiming', () => {
        /* Verified live: after a successful claim the list still reports
           `eligible: true, claimed: true`. Keying the button on `eligible` alone would
           offer a press that always fails with "Milestone already claimed". */
        expect(milestoneState({ eligible: true, claimed: true })).toBe('claimed');
        expect(milestoneState({ eligible: true, claimed: false })).toBe('claimable');
        expect(milestoneState({ eligible: false, claimed: false })).toBe('locked');
        expect(milestoneState(null)).toBe('locked');
    });

    it('names the grant with the item the backend names, not a code', () => {
        expect(milestoneRewardNames({ rewardItems: [{ name: 'Bronze Avatar Frame' }, { name: '' }, {}] })).toEqual([
            'Bronze Avatar Frame',
        ]);
        expect(milestoneRewardNames({})).toEqual([]);
    });

    it('refuses a type label for a type the locale does not know', () => {
        expect(inventoryTypeLabelKey('REWARD_CARD')).toBe('rewards.inventory.types.REWARD_CARD');
        expect(inventoryTypeLabelKey('MYSTERY_BOX')).toBeNull();
    });
});

describe('creditValueOf / xpValueOf — only stated values', () => {
    it('sums CREDIT entries', () => {
        expect(
            creditValueOf({
                rewardDefinitions: [
                    { type: 'CREDIT', amount: 45, expiryDays: 30 },
                    { type: 'CREDIT', amount: 5 },
                ],
            })
        ).toBe(50);
    });

    it('IGNORES inventory items rather than guessing their worth', () => {
        /* Converting an itemCode into a credit figure means inventing an exchange rate. */
        expect(
            creditValueOf({
                rewardDefinitions: [
                    { type: 'INVENTORY_ITEM', itemCode: 'daily_learning_reward', quantity: 1 },
                ],
            })
        ).toBeNull();
    });

    it('returns null rather than 0 when there is no credit reward', () => {
        /* null lets the screen omit the chip; 0 would render "0 credits", which reads as
           a reward worth nothing. */
        expect(creditValueOf({ rewardDefinitions: [] })).toBeNull();
        expect(creditValueOf({})).toBeNull();
    });

    it('reads XP rewards separately', () => {
        expect(xpValueOf({ rewardDefinitions: [{ type: 'XP', amount: 40 }] })).toBe(40);
        expect(xpValueOf({ rewardDefinitions: [{ type: 'CREDIT', amount: 40 }] })).toBeNull();
    });
});

describe('LeaderboardPage', () => {
    it('says UNRANKED when myRank is null, instead of showing rank 0', async () => {
        /* myRank is null for a no-XP account, which is the real new-account state. */
        getLeaderboard.mockResolvedValue(leaderboardPage(null));
        renderWith(<LeaderboardPage />);

        expect(await screen.findByText(/chưa có điểm xếp hạng/)).toBeInTheDocument();
        /* Assert the RANK is absent rather than that no zero appears anywhere: XP is
           legitimately 0 for this account and is shown as a stat. */
        expect(screen.queryByText('Vị trí của bạn · Tuần này')).not.toBeInTheDocument();
        expect(screen.getByText('XP của bạn')).toBeInTheDocument();
    });

    it('shows the real rank, XP and distance to the next rank when ranked', async () => {
        getLeaderboard.mockResolvedValue(
            leaderboardPage({ rank: 7, totalParticipants: 42, xp: 120, xpToNextRank: 30, rankChange: 2, rankChangeDirection: 'UP' })
        );
        renderWith(<LeaderboardPage />);

        expect(await screen.findByText('7')).toBeInTheDocument();
        expect(screen.getByText(/trong 42 người/)).toBeInTheDocument();
        expect(screen.getByText(/Còn 30 XP/)).toBeInTheDocument();
    });

    it('renders a TIE as a tie, keyed by user, not as one winner', async () => {
        /* Two accounts on 50 XP both came back rank 1. Both rows must render. */
        getLeaderboard.mockResolvedValue(leaderboardPage({ rank: 3, xp: 10, xpToNextRank: 5, rankChange: 0 }));
        renderWith(<LeaderboardPage />);

        expect(await screen.findByText('Flow')).toBeInTheDocument();
        expect(screen.getByText('VF')).toBeInTheDocument();
        expect(screen.getAllByText(/đồng hạng/).length).toBeGreaterThan(0);
    });

    it('states the period, because a rank means nothing without it', async () => {
        getLeaderboard.mockResolvedValue(leaderboardPage({ rank: 3, xp: 10, xpToNextRank: 5, rankChange: 0 }));
        const user = userEvent.setup();
        renderWith(<LeaderboardPage />);

        await screen.findByText('Flow');
        await user.click(screen.getByRole('button', { name: 'Tháng này' }));
        expect(getLeaderboard).toHaveBeenLastCalledWith(expect.objectContaining({ period: 'MONTHLY' }));
    });

    it('carries the ethics note, so rank is framed rather than implied', async () => {
        getLeaderboard.mockResolvedValue(leaderboardPage({ rank: 3, xp: 10, xpToNextRank: 5, rankChange: 0 }));
        renderWith(<LeaderboardPage />);
        expect(await screen.findByText(/Không có phần thưởng nào bị khoá sau thứ hạng/)).toBeInTheDocument();
    });
});

describe('RewardsPage', () => {
    const MISSION = {
        code: 'daily_plan_finisher',
        name: 'Complete Today’s Learning Plan',
        active: true,
        status: 'LOCKED',
        rewardDefinitions: [
            { type: 'INVENTORY_ITEM', itemCode: 'daily_learning_reward', quantity: 1 },
            { type: 'CREDIT', amount: 45, expiryDays: 30 },
        ],
        progress: { current: 0, target: 3, label: '0/3 daily tasks completed' },
    };

    it('offers NO claim button, because the backend grants automatically', async () => {
        /* RewardMissionStatus is only LOCKED/CLAIMED and there is no claim endpoint. */
        getMissions.mockResolvedValue(envelope([MISSION]));
        renderWith(<RewardsPage />);

        await screen.findByText(/Complete Today/);
        expect(screen.queryByRole('button', { name: /Nhận|Claim/i })).not.toBeInTheDocument();
        expect(screen.getByText(/được trao tự động/)).toBeInTheDocument();
    });

    it('shows the real credit value and omits the inventory item', async () => {
        getMissions.mockResolvedValue(envelope([MISSION]));
        renderWith(<RewardsPage />);

        expect(await screen.findByText('45 credit')).toBeInTheDocument();
        expect(screen.queryByText(/daily_learning_reward/)).not.toBeInTheDocument();
    });

    it('renders progress as an accessible progressbar', async () => {
        getMissions.mockResolvedValue(envelope([MISSION]));
        renderWith(<RewardsPage />);

        const bar = await screen.findByRole('progressbar', { name: /Learning Plan: 0 trên 3/ });
        expect(bar).toHaveAttribute('aria-valuenow', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '3');
    });

    it('separates granted missions from ones still in progress', async () => {
        getMissions.mockResolvedValue(
            envelope([MISSION, { ...MISSION, code: 'done_one', name: 'Finished Thing', status: 'CLAIMED', claimedAt: '2026-10-11T00:00:00Z' }])
        );
        renderWith(<RewardsPage />);

        expect((await screen.findAllByText(/Đã (claim|nhận)/i)).length).toBeGreaterThan(0);
        expect(screen.getByText('Finished Thing')).toBeInTheDocument();
    });

    it('states that XP cannot be bought', async () => {
        getMissions.mockResolvedValue(envelope([MISSION]));
        renderWith(<RewardsPage />);
        expect(await screen.findByText(/không thể mua/)).toBeInTheDocument();
    });
});

/**
 * The three blocks the rewards screen never called. Shapes below are copied from the
 * running backend, not invented:
 *
 *   GET /user/xp-milestones -> [{ code, requiredTotalXp, rewardItemCodes, rewardItems,
 *                                 eligible, claimed, grantedItems }]
 *   GET /user/inventory     -> { page, size, totalElements, totalPages, items: [
 *                                 { id, item{...}, grantSource, grantedAt, equipped,
 *                                   used, usedAt }] }
 */
describe('RewardsPage — milestones, missions and the inventory', () => {
    const MILESTONE = {
        code: 'XP_REWARD_1000',
        requiredTotalXp: 1000,
        rewardItemCodes: ['bronze_frame'],
        rewardItems: [
            {
                id: 'd7fcfe82-1d09-4d6e-90ea-91310b412d34',
                code: 'bronze_frame',
                type: 'AVATAR_FRAME',
                usageType: 'EQUIPPABLE',
                name: 'Bronze Avatar Frame',
                description: 'Achieved upon accumulating 1000 xp',
                assetUrl: 'https://cdn.swpts.site/files/inventory/bronze-frame.png',
                rarity: 'COMMON',
                active: true,
                metadata: {},
            },
        ],
        eligible: false,
        claimed: false,
        grantedItems: [],
    };

    const INVENTORY_ITEM = {
        id: 'ee0367ba-2426-4032-a824-7a426042a38c',
        item: {
            id: '530ef5de-a4eb-4d57-8c04-b43478fbd81f',
            code: 'reward_card_50k',
            type: 'REWARD_CARD',
            usageType: 'CONSUMABLE',
            name: '50K Reward Card',
            description: 'Redeemable reward card worth 50,000 VND',
            assetUrl: 'https://cdn.swpts.site/files/inventory/reward-card-50k.png',
            rarity: 'COMMON',
            active: true,
            metadata: {},
        },
        grantSource: 'ADMIN_GRANT',
        grantSourceId: 'probe',
        grantedAt: '2026-10-11T13:30:52.078672Z',
        equipped: false,
        used: false,
        usedAt: null,
    };

    const EMPTY = envelope({ page: 0, size: 8, totalElements: 0, totalPages: 0, items: [] });
    const inventoryPage = (items) =>
        envelope({ page: 0, size: 8, totalElements: items.length, totalPages: 1, items });

    /** One real mission, so the "inventory is empty" case is not confused with it. */
    const BLOCK_MISSION = {
        code: 'weekly_challenge_finisher',
        name: 'Complete Weekly Challenge',
        active: true,
        trigger: 'WEEKLY_CHALLENGE_COMPLETED',
        repeatPolicy: 'ONCE_PER_WEEK',
        conditions: {},
        rewardDefinitions: [{ itemCode: 'weekly_learning_reward', quantity: 1, type: 'INVENTORY_ITEM' }],
        rewardItemCodes: ['weekly_learning_reward'],
        rewardItems: [],
        status: 'LOCKED',
        claimedAt: null,
        progress: { current: 0, target: 1, label: '0/1 weekly challenges completed' },
    };

    beforeEach(() => {
        getXpHistory.mockResolvedValue(envelope({ totalXP: 0, weeklyXP: 0, history: [], page: {} }));
        getMissions.mockResolvedValue(envelope([]));
        getAllMilestones.mockResolvedValue(envelope([]));
        getInventory.mockResolvedValue(EMPTY);
        claimMilestone.mockResolvedValue(envelope({ code: 'XP_REWARD_1000', grantedItems: [] }));
    });

    it('calls xp-milestones, reward-missions and XP history on mount, and inventory only on its tab', async () => {
        /* THE TAB IS A REQUEST BOUNDARY, not just a visual one. The inventory used to be fetched by
           the screen on mount, as the seventh of nine stacked blocks, so every visit paid for it —
           even though the mockup puts it behind a tab. It is now fetched by its own tab component,
           which is why it is NOT called until the tab is opened. */
        getAllMilestones.mockResolvedValue(envelope([MILESTONE]));
        getMissions.mockResolvedValue(envelope([BLOCK_MISSION]));
        getInventory.mockResolvedValue(inventoryPage([INVENTORY_ITEM]));
        const user = userEvent.setup();
        /* Call counts are snapshotted rather than reset: this file's `beforeEach` sets return
           values without clearing counts, so `not.toHaveBeenCalled()` would read the tests that ran
           before it. */
        const inventoryCallsBefore = getInventory.mock.calls.length;
        renderWith(<RewardsPage />);

        await screen.findByText('Bronze Avatar Frame');
        expect(getAllMilestones).toHaveBeenCalled();
        expect(getMissions).toHaveBeenCalled();
        expect(getXpHistory).toHaveBeenCalled();
        expect(getInventory.mock.calls.length).toBe(inventoryCallsBefore);

        await user.click(screen.getByRole('tab', { name: 'Vật phẩm' }));
        await waitFor(() => expect(getInventory.mock.calls.length).toBeGreaterThan(inventoryCallsBefore));
    });

    it('shows a locked milestone with its real reward and required XP, and NO claim button', async () => {
        getAllMilestones.mockResolvedValue(envelope([MILESTONE]));
        renderWith(<RewardsPage />);

        expect(await screen.findByText('Bronze Avatar Frame')).toBeInTheDocument();
        /* `rewards.xp` formats the threshold the backend stated. */
        expect(screen.getByText('1000 XP')).toBeInTheDocument();
        expect(screen.getByText(/Đang khóa/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Claim|Nhận/i })).not.toBeInTheDocument();
    });

    it('offers a CLAIM button for an eligible milestone, because the route EXISTS', async () => {
        getAllMilestones.mockResolvedValue(envelope([{ ...MILESTONE, eligible: true }]));
        const user = userEvent.setup();
        renderWith(<RewardsPage />);

        const claimButton = await screen.findByRole('button', { name: /Claim|Nhận/i });
        expect(screen.getByText(/Có thể (claim|nhận)/i)).toBeInTheDocument();

        await user.click(claimButton);
        await waitFor(() => expect(claimMilestone).toHaveBeenCalledWith('XP_REWARD_1000'));
    });

    it('does NOT offer a claim once claimed, even though eligible stays true', async () => {
        getAllMilestones.mockResolvedValue(envelope([{ ...MILESTONE, eligible: true, claimed: true }]));
        renderWith(<RewardsPage />);

        expect(await screen.findByText(/Đã (claim|nhận)/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Claim|Nhận/i })).not.toBeInTheDocument();
    });

    it('reports a FAILED claim instead of silently doing nothing', async () => {
        getAllMilestones.mockResolvedValue(envelope([{ ...MILESTONE, eligible: true }]));
        claimMilestone.mockRejectedValue(new Error('boom'));
        const user = userEvent.setup();
        renderWith(<RewardsPage />);

        await user.click(await screen.findByRole('button', { name: /Claim|Nhận/i }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/mốc XP|milestone/i));
    });

    it('says why the milestone list is empty rather than drawing an empty section', async () => {
        getAllMilestones.mockResolvedValue(envelope([]));
        renderWith(<RewardsPage />);
        expect(await screen.findByText('Chưa có mốc thưởng khả dụng.')).toBeInTheDocument();
    });

    it('lists the inventory with a translated type, never a raw enum', async () => {
        getInventory.mockResolvedValue(inventoryPage([INVENTORY_ITEM]));
        const user = userEvent.setup();
        renderWith(<RewardsPage />);

        await user.click(screen.getByRole('tab', { name: 'Vật phẩm' }));

        expect(await screen.findByText('50K Reward Card')).toBeInTheDocument();
        /* `getAllByText`: the type name also appears as one of the filter pills, which is the point
           — one word for the category, in the filter and on the item. */
        expect(screen.getAllByText(/Thẻ thưởng/).length).toBeGreaterThan(1);
        expect(screen.queryByText('REWARD_CARD')).not.toBeInTheDocument();
    });

    it('uses the inventory empty state for an empty inventory instead of inventing items', async () => {
        getInventory.mockResolvedValue(EMPTY);
        getMissions.mockResolvedValue(envelope([BLOCK_MISSION]));
        const user = userEvent.setup();
        renderWith(<RewardsPage />);

        await user.click(screen.getByRole('tab', { name: 'Vật phẩm' }));

        /* The DEDICATED key, not the generic "no rewards yet": an empty filter and an account with
           nothing are different answers, and the locale carries both. */
        expect(await screen.findByText('Chưa có vật phẩm trong bộ lọc này.')).toBeInTheDocument();
    });
});

describe('ChallengesPage', () => {
    const WEEK = {
        weekStart: '2026-10-04T17:00:00Z',
        weekEnd: '2026-10-11T17:00:00Z',
        challenges: [
            {
                definitionId: 'd1',
                code: 'WEEKLY_LEARNING_5',
                title: 'Giữ nhịp 5 phiên học',
                description: 'Hoàn thành 5 phiên học thật trong tuần này.',
                currentValue: 2,
                targetValue: 5,
                progressPercent: 40,
                remainingValue: 3,
                rewardXp: 40,
                status: 'IN_PROGRESS',
                completed: false,
            },
            {
                definitionId: 'd2',
                code: 'WEEKLY_WORDS_20',
                title: 'Học 20 từ mới',
                currentValue: 20,
                targetValue: 20,
                progressPercent: 100,
                remainingValue: 0,
                rewardXp: 30,
                status: 'COMPLETED',
                completed: true,
                rewardGrantedAt: '2026-10-10T00:00:00Z',
            },
        ],
    };

    it('leads with the challenge nearest completion', async () => {
        getCurrentWeekly.mockResolvedValue(envelope(WEEK));
        const { container } = renderWith(<ChallengesPage />);

        await screen.findAllByText('Giữ nhịp 5 phiên học');
        /* The active (incomplete) one is the hero; the completed one is in the list. */
        const hero = container.querySelector('.t-h3');
        expect(hero?.textContent ?? '').toMatch(/Giữ nhịp/);
    });

    it('reports remaining as a plain fact, not a warning', async () => {
        getCurrentWeekly.mockResolvedValue(envelope(WEEK));
        renderWith(<ChallengesPage />);

        const remaining = await screen.findByText(/Còn 3 nữa là xong/);
        expect(remaining.textContent).not.toMatch(/sắp|hết hạn|mất|nguy/i);
    });

    it('shows a granted challenge as granted rather than offering a claim', async () => {
        getCurrentWeekly.mockResolvedValue(envelope(WEEK));
        renderWith(<ChallengesPage />);

        expect(await screen.findByText(/Đã trao thưởng/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Nhận/i })).not.toBeInTheDocument();
    });

    it('puts the OPT-OUT on this screen, not only in Settings', async () => {
        /* The moment a user decides they do not want challenges is the moment they are
           looking at them, so the way out belongs here. */
        getCurrentWeekly.mockResolvedValue(envelope(WEEK));
        renderWith(<ChallengesPage />);

        const optOut = await screen.findByRole('link', { name: /Tắt trong cài đặt/ });
        expect(optOut).toHaveAttribute('href', '/settings');
    });

    it('totals the XP available across the week', async () => {
        getCurrentWeekly.mockResolvedValue(envelope(WEEK));
        renderWith(<ChallengesPage />);
        expect(await screen.findByText(/Tổng 70 XP/)).toBeInTheDocument();
    });

    it('shows an empty state instead of an error when the week has none', async () => {
        getCurrentWeekly.mockResolvedValue(envelope({ weekStart: null, weekEnd: null, challenges: [] }));
        renderWith(<ChallengesPage />);

        expect(await screen.findByText('Tuần này chưa có thử thách nào')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
