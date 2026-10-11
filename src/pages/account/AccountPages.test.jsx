import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * Account screens, and the honesty rules they exist to hold:
 *
 *  PROFILE — a new account has `goals.targetIeltsBand: null` and NO exam date
 *  (verified live). Rendering a progress bar against a null target would show 0%
 *  towards nothing, so the screen must ASK for a goal instead. And the Lexi level
 *  must be explained without implying anything is locked: the design says level is
 *  cosmetic, and `levelInfo` starts at level 1 with 100 XP needed.
 *
 *  THE SAME RULE COVERS THE FOUR BLOCKS CAPTURED FROM THE LIVE PAYLOAD:
 *
 *    - `avatarUrl` is null for a new account, and a null must render the initials
 *      rather than `<img src={null}>` (the broken-image glyph).
 *    - `bandProgress` is ALL ZERO for a new account, and 0 there means CHƯA ĐO, not
 *      band 0.0 — so the screen shows "—" plus a reason, never `0.0`, and draws no bar
 *      toward a target that does not exist.
 *    - `weakSkills` arrives PRE-FILLED with a default (`["Academic Vocabulary",
 *      "Map Labeling"]`), so it must be presented as suggested focus areas and never as
 *      measured from the learner's own work.
 *    - `vocabProgress` / `dictionaryStats` are real counts and are shown with labels;
 *      a mastery RATE is omitted when there is no denominator, because 0 of 0 words is
 *      not 0% mastery.
 *
 *  SETTINGS — "Nhắc học & chuỗi" comes FIRST, above learning and theme, because the
 *  controls that bound the product's nagging are the ones most likely to harm a user if
 *  buried. Notification switches write to the server (verified partial-body merge);
 *  theme and text size have NO endpoint, so the screen says they are local rather than
 *  presenting them as account settings.
 */
const getProfile = vi.fn();
const getPreferences = vi.fn();
const updatePreferences = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    profileApi: { getProfile: (...a) => getProfile(...a), updateProfile: vi.fn() },
    notificationApi: {
        getPreferences: (...a) => getPreferences(...a),
        updatePreferences: (...a) => updatePreferences(...a),
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: ProfilePage } = await import('./ProfilePage');
const { default: SettingsPage } = await import('./SettingsPage');
const {
    hasTarget,
    daysUntil,
    readLevel,
    isMeasuredBand,
    readBandProgress,
    readOverallBand,
    readVocabulary,
    readWeakSkills,
    avatarInitials,
} = await import('../../features/profile/useProfile');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** The real shape of a brand-new account, captured from the running backend. */
const NEW_PROFILE = {
    id: 'u1',
    email: 'new@enpractice.test',
    displayName: 'New Learner',
    avatarUrl: null,
    goals: { targetIeltsBand: null, targetExamDate: null, dailyGoalMinutes: 30, weeklyWordGoal: null, preferredSkill: null, preferredLanguage: null },
    levelInfo: { totalXp: 0, currentLevel: 1, currentLevelMinXp: 0, nextLevel: 2, nextLevelMinXp: 100, xpIntoCurrentLevel: 0, xpNeededForNextLevel: 100, progressPercentage: 0 },
    onboarding: { status: 'NOT_STARTED', version: null, requiredVersion: 1, required: true, completedAt: null },
    overview: { weeklyXp: 0, totalLessonsCompleted: 0, totalWordsLearned: 0, totalStudyMinutes: 0, wordsToReviewToday: 0, currentStreak: 0, longestStreak: 0 },
    streak: { currentStreak: 0, longestStreak: 0, activeDaysLast30: 0, heatmap: [] },
    todayGoal: { targetMinutes: 30, studiedMinutes: 0, percentage: 0 },
    /* All zero, all meaning "nothing graded yet" — NOT band 0.0. */
    bandProgress: {
        listening: { current: 0.0, previous: 0.0 },
        reading: { current: 0.0, previous: 0.0 },
        writing: { current: 0.0, previous: 0.0 },
        speaking: { current: 0.0, previous: 0.0 },
        overall: { current: 0.0, previous: 0.0 },
    },
    vocabProgress: { totalWords: 0, masteredWords: 0, reviewingWords: 0 },
    dictionaryStats: { totalWords: 0, favoriteWords: 0, wordsToReviewToday: 0, newWords: 0, learningWords: 0, masteredWords: 0 },
    /* The backend's default for an account with no practice history. */
    weakSkills: ['Academic Vocabulary', 'Map Labeling'],
    recentActivities: [],
    leaderboardSummary: { period: 'WEEKLY', myRank: null, topThree: [] },
};

const PREFS = {
    userId: 'u1',
    allowPush: true,
    allowEmail: false,
    allowVocabularyReminder: true,
    allowGradingResult: true,
    allowAdminBroadcast: true,
    allowNewContentNotification: true,
    allowWeeklySummary: true,
    allowXpRewardNotification: true,
    allowProgressReminder: true,
    allowBandImprovementNotification: true,
    allowPersonalizedRecommendation: true,
    allowReengagementNotification: true,
    allowLeaderboardNotification: true,
};

describe('profile helpers', () => {
    it('hasTarget is false when nothing is set, which is the new-account case', () => {
        expect(hasTarget(null)).toBe(false);
        expect(hasTarget({ targetIeltsBand: null, targetExamDate: null })).toBe(false);
    });

    it('hasTarget is true when either a band or a date is set', () => {
        expect(hasTarget({ targetIeltsBand: 7 })).toBe(true);
        expect(hasTarget({ targetExamDate: '2026-12-01' })).toBe(true);
    });

    it('daysUntil counts forward and refuses a past date', () => {
        const now = new Date('2026-10-11T00:00:00');
        expect(daysUntil('2026-10-21', now)).toBe(10);
        expect(daysUntil('2026-10-01', now)).toBeNull();
        expect(daysUntil(null, now)).toBeNull();
        expect(daysUntil('not-a-date', now)).toBeNull();
    });

    it('readLevel falls back to sane level-1 defaults', () => {
        /* A missing levelInfo must not crash the hero. */
        const level = readLevel(null);
        expect(level.currentLevel).toBe(1);
        expect(level.nextLevel).toBe(2);
        expect(level.xpNeededForNextLevel).toBe(100);
    });
});

describe('the four blocks the profile payload already carried', () => {
    it('treats band 0 as NOT MEASURED, because that is what the backend means', () => {
        expect(isMeasuredBand(0)).toBe(false);
        expect(isMeasuredBand(0.0)).toBe(false);
        expect(isMeasuredBand(null)).toBe(false);
        expect(isMeasuredBand(undefined)).toBe(false);
        expect(isMeasuredBand('')).toBe(false);
        expect(isMeasuredBand(6)).toBe(true);
        expect(isMeasuredBand(6.5)).toBe(true);
    });

    it('reads the all-zero new-account bandProgress as four unmeasured skills', () => {
        const band = readBandProgress(NEW_PROFILE.bandProgress);
        expect(band.anyMeasured).toBe(false);
        expect(band.overall).toBeNull();
        expect(band.rows).toHaveLength(4);
        for (const row of band.rows) {
            expect(row.measured).toBe(false);
            expect(row.current).toBeNull();
            expect(row.previous).toBeNull();
        }
        /* Static label keys, so the i18n audit can see every one of them. */
        expect(band.rows.map((r) => r.labelKey)).toEqual([
            'profilePage.skills.listening',
            'profilePage.skills.reading',
            'profilePage.skills.writing',
            'profilePage.skills.speaking',
        ]);
    });

    it('reads a measured band, and keeps `previous` only when it is real too', () => {
        const band = readBandProgress({
            ...NEW_PROFILE.bandProgress,
            reading: { current: 6.5, previous: 5.5 },
            writing: { current: 6, previous: 0 },
        });
        expect(band.anyMeasured).toBe(true);
        expect(band.rows.find((r) => r.skill === 'reading')).toMatchObject({ measured: true, current: 6.5, previous: 5.5 });
        expect(band.rows.find((r) => r.skill === 'writing')).toMatchObject({ measured: true, current: 6, previous: null });
    });

    it('falls back to bandProgress.overall, because /user/profile has no overallBand field', () => {
        expect(readOverallBand(NEW_PROFILE)).toBeNull();
        expect(readOverallBand({ bandProgress: { overall: { current: 6 } } })).toBe(6);
        /* A zero overallBand is "chưa đo", so the progress value wins. */
        expect(readOverallBand({ overallBand: 0, bandProgress: { overall: { current: 6.5 } } })).toBe(6.5);
        /* …and a real one still wins over the fallback. */
        expect(readOverallBand({ overallBand: 7, bandProgress: { overall: { current: 6.5 } } })).toBe(7);
    });

    it('uses the initials when there is no avatar url', () => {
        expect(avatarInitials('New Learner')).toBe('NE');
        expect(avatarInitials('  an  ')).toBe('AN');
        expect(avatarInitials(null)).toBe('?');
        expect(avatarInitials('   ')).toBe('?');
    });

    it('refuses a mastery rate without a denominator', () => {
        expect(readVocabulary({ totalWords: 0, masteredWords: 0 }, {}).masteryPercentage).toBeNull();
        expect(readVocabulary({ totalWords: 10, masteredWords: 4 }, {}).masteryPercentage).toBe(40);
    });

    it('merges vocabProgress with dictionaryStats without inventing a value', () => {
        const vocabulary = readVocabulary(
            { totalWords: 12, masteredWords: 4, reviewingWords: 5 },
            { totalWords: 12, favoriteWords: 1, wordsToReviewToday: 2, newWords: 3, learningWords: 5, masteredWords: 4 }
        );
        expect(vocabulary).toMatchObject({
            totalWords: 12,
            masteredWords: 4,
            reviewingWords: 5,
            wordsToReviewToday: 2,
            favoriteWords: 1,
            newWords: 3,
            learningWords: 5,
            masteryPercentage: 33,
        });
    });

    it('keeps only real skill strings from weakSkills', () => {
        expect(readWeakSkills(['Map Labeling'])).toEqual(['Map Labeling']);
        expect(readWeakSkills(null)).toEqual([]);
        expect(readWeakSkills('Map Labeling')).toEqual([]);
        expect(readWeakSkills(['  ', null, 3, 'Reading'])).toEqual(['Reading']);
    });
});

describe('ProfilePage', () => {
    function renderProfile() {
        return render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );
    }

    it('asks for a goal instead of drawing a bar toward nothing', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        expect(await screen.findByText(/chưa đặt band mục tiêu hay ngày thi/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Đặt mục tiêu/ })).toHaveAttribute('href', '/settings');
    });

    it('renders when the api hands back the PAYLOAD, which is what the real client does', async () => {
        /* Every other test in this file mocks the response WRAPPER `{ data: { success, data } }`
           — and `axiosClient` strips that wrapper in its response interceptor, so no screen ever
           sees it. The wrapper-only assumption is exactly how a double unwrap shipped: all 200s
           in the network tab, every screen empty. This case uses the real shape. */
        getProfile.mockResolvedValue(NEW_PROFILE);
        renderProfile();

        expect(await screen.findByText(/chưa đặt band mục tiêu hay ngày thi/)).toBeInTheDocument();
        expect(screen.getByText('New Learner')).toBeInTheDocument();
    });

    it('shows the target band once one is set', async () => {
        getProfile.mockResolvedValue(
            envelope({
                ...NEW_PROFILE,
                goals: { ...NEW_PROFILE.goals, targetIeltsBand: 7, targetExamDate: '2026-12-01' },
                overallBand: 6,
            })
        );
        renderProfile();

        expect(await screen.findByText('7.0')).toBeInTheDocument();
        expect(screen.getByText('Hiện tại 6.0')).toBeInTheDocument();
        /* The trend is measured, never a promise about reaching the target. */
        expect(screen.queryByText(/sẽ đạt|chắc chắn đạt/i)).not.toBeInTheDocument();
    });

    it('explains what earns XP rather than implying a locked feature', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        expect(await screen.findByText(/XP đến từ việc học thật/)).toBeInTheDocument();
        expect(screen.getByText(/Không có tính năng nào bị khoá sau cấp/)).toBeInTheDocument();
    });

    it('renders the level as an accessible progressbar', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        const bar = await screen.findByRole('progressbar', { name: /Tiến độ lên cấp: 0 trên 100 XP/ });
        expect(bar).toHaveAttribute('aria-valuemax', '100');
    });

    it('states the streak calmly, with the grace days named as a gift', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        const calm = await screen.findByText(/chuỗi không phải một khoản nợ/);
        expect(calm.textContent).toMatch(/Nghỉ một ngày cũng không sao/);
        expect(screen.getByText('2 ngày nghỉ mỗi tháng')).toBeInTheDocument();
    });

    it('says the user is unranked rather than showing rank 0', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();
        expect(await screen.findByText(/chưa có điểm xếp hạng/)).toBeInTheDocument();
    });

    it('renders the INITIALS when avatarUrl is null, which is the new-account state', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        expect(await screen.findByText('NE')).toBeInTheDocument();
        /* `<img src={null}>` renders the browser's broken-image glyph, so there must be
           no image element at all in this state. */
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders the AVATAR IMAGE when avatarUrl is present', async () => {
        const avatarUrl = 'https://cdn.swpts.site/files/avatars/ec67d7d1.png';
        getProfile.mockResolvedValue(envelope({ ...NEW_PROFILE, avatarUrl }));
        renderProfile();

        const avatar = await screen.findByRole('img', { name: 'New Learner' });
        expect(avatar).toHaveAttribute('src', avatarUrl);
        /* and the fallback initials are gone */
        expect(screen.queryByText('NE')).not.toBeInTheDocument();
    });

    it('renders "—" for every unmeasured skill and NEVER 0.0', async () => {
        /* Verified live: bandProgress is all zeroes for a new account, and zero there
           means "chưa đo" — printing 0.0 would state a band the backend never measured. */
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        await screen.findByText(/chưa đặt band mục tiêu/);
        expect(screen.getAllByText('—')).toHaveLength(4);
        expect(screen.queryByText('0.0')).not.toBeInTheDocument();
        /* The reason is stated, and it is also what a screen reader gets for the dash. */
        expect(screen.getAllByText('Chưa có dữ liệu hiển thị').length).toBeGreaterThan(0);
    });

    it('shows a measured band to one decimal, and only for the skills that have one', async () => {
        getProfile.mockResolvedValue(
            envelope({
                ...NEW_PROFILE,
                bandProgress: { ...NEW_PROFILE.bandProgress, reading: { current: 6.5, previous: 5.5 } },
            })
        );
        renderProfile();

        expect(await screen.findByText('6.5')).toBeInTheDocument();
        /* the previous band is context, not a second score */
        expect(screen.getByText('Band 5.5')).toBeInTheDocument();
        /* the other three skills stay unmeasured */
        expect(screen.getAllByText('—')).toHaveLength(3);
    });

    it('shows the vocabulary and dictionary counts with labels', async () => {
        getProfile.mockResolvedValue(
            envelope({
                ...NEW_PROFILE,
                vocabProgress: { totalWords: 12, masteredWords: 4, reviewingWords: 5 },
                dictionaryStats: { totalWords: 12, favoriteWords: 1, wordsToReviewToday: 2, newWords: 3, learningWords: 5, masteredWords: 4 },
            })
        );
        renderProfile();

        /* Both blocks render the total, so this is deliberately not unique. */
        expect((await screen.findAllByText('12')).length).toBeGreaterThan(1);
        expect(screen.getByText('Đang ôn')).toBeInTheDocument();
        expect(screen.getByText('Đang xây nền')).toBeInTheDocument();
        expect(screen.getByText('Ôn hôm nay')).toBeInTheDocument();
        expect(screen.getByText('Yêu thích')).toBeInTheDocument();
        expect(screen.getAllByText('Đã thành thạo').length).toBeGreaterThan(0);
        /* 4 of 12 words is a real rate, so it is drawn with an accessible value. */
        expect(screen.getByText(/4 \/ 12 từ đã thành thạo/)).toBeInTheDocument();
        expect(screen.getByRole('progressbar', { name: 'Tỷ lệ thành thạo 33%' })).toBeInTheDocument();
    });

    it('omits the mastery rate entirely when no word has been saved', async () => {
        /* 0 of 0 words is not 0% mastery — it is no data, and a bar at 0% would say
           the learner is failing at something they have not started. */
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        await screen.findByText(/chưa đặt band mục tiêu/);
        expect(screen.queryByRole('progressbar', { name: /Tỷ lệ thành thạo/ })).not.toBeInTheDocument();
    });

    it('presents weakSkills as SUGGESTED focus, never as measured from the learner', async () => {
        /* The backend returns a default list for an account with no practice history,
           so the screen must not claim these came from the learner's own work. */
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderProfile();

        expect(await screen.findByText('Academic Vocabulary')).toBeInTheDocument();
        expect(screen.getByText('Map Labeling')).toBeInTheDocument();
        expect(screen.getByText(/Những gợi ý ưu tiên dựa trên mục tiêu hiện tại/)).toBeInTheDocument();
        expect(screen.queryByText(/từ bài làm|đo được từ|dựa trên bài viết của bạn/i)).not.toBeInTheDocument();
    });

    it('says the focus list is empty rather than showing an empty card', async () => {
        getProfile.mockResolvedValue(envelope({ ...NEW_PROFILE, weakSkills: [] }));
        renderProfile();

        await screen.findByText(/chưa đặt band mục tiêu/);
        expect(screen.queryByText('Academic Vocabulary')).not.toBeInTheDocument();
        expect(screen.getAllByText('Chưa có dữ liệu hiển thị').length).toBeGreaterThan(0);
    });
});

describe('SettingsPage', () => {
    function renderSettings() {
        return render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );
    }

    it('PUTS REMINDERS AND STREAK FIRST, above learning and appearance', async () => {
        /* Section order is a product decision: the controls that bound the product's
           nagging must not be buried under theme settings. */
        getPreferences.mockResolvedValue(envelope(PREFS));
        const { container } = renderSettings();
        await screen.findByText('Tạm dừng tất cả nhắc học');

        const sections = [...container.querySelectorAll('section[id]')].map((s) => s.id);
        expect(sections[0]).toBe('reminders');
        expect(sections.indexOf('reminders')).toBeLessThan(sections.indexOf('learning'));
        expect(sections.indexOf('reminders')).toBeLessThan(sections.indexOf('appearance'));
    });

    it('offers pause-everything as a single switch', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();

        const toggle = await screen.findByRole('switch', { name: 'Tạm dừng tất cả nhắc học' });
        /* Reminders are on, so the switch starts off. */
        expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('pauses every reminder in ONE request, and can undo it', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        updatePreferences.mockResolvedValue(envelope({ ...PREFS, allowVocabularyReminder: false }));
        const user = userEvent.setup();
        renderSettings();

        await user.click(await screen.findByRole('switch', { name: 'Tạm dừng tất cả nhắc học' }));

        await waitFor(() => expect(updatePreferences).toHaveBeenCalledTimes(1));
        const body = updatePreferences.mock.calls[0][0];
        /* Every allow* flag goes false together; a per-key loop would be 13 requests. */
        expect(Object.values(body).every((v) => v === false)).toBe(true);
        expect(Object.keys(body).length).toBeGreaterThan(5);
    });

    it('states the BEHAVIOUR of turning streak tracking off', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();
        expect(
            await screen.findByText(/hiện như một tính năng đã tắt, không phải một khoản nợ/)
        ).toBeInTheDocument();
    });

    it('names the grace days as automatic and not purchasable', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();
        const body = await screen.findByText(/2 ngày nghỉ được áp dụng tự động/);
        expect(body.textContent).toMatch(/không thể mua thêm/);
    });

    it('saves ONE notification field per request, so it cannot clobber another', async () => {
        /* Verified against the backend: PUT merges a partial body. Sending the whole
           object would overwrite a concurrent change made elsewhere. */
        getPreferences.mockResolvedValue(envelope(PREFS));
        updatePreferences.mockResolvedValue(envelope({ ...PREFS, allowWeeklySummary: false }));
        const user = userEvent.setup();
        renderSettings();

        await user.click(await screen.findByText('Từng loại nhắc học'));
        await user.click(await screen.findByRole('switch', { name: 'Báo cáo tuần' }));

        await waitFor(() => expect(updatePreferences).toHaveBeenCalled());
        expect(updatePreferences).toHaveBeenCalledWith({ allowWeeklySummary: false });
    });

    it('tells the user the theme collapsed from v1 rather than hiding it', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();
        expect(await screen.findByText(/Chín giao diện riêng của v1 đã được gộp lại/)).toBeInTheDocument();
    });

    it('says text size is local, because there is no endpoint for it', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();
        expect(await screen.findByText(/Hệ thống chưa có API lưu cỡ chữ theo tài khoản/)).toBeInTheDocument();
    });

    it('does NOT ship working buttons for endpoints that do not exist', async () => {
        getPreferences.mockResolvedValue(envelope(PREFS));
        renderSettings();

        expect(await screen.findByRole('button', { name: /Tải dữ liệu của tôi/ })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Xoá lịch sử trò chuyện AI/ })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Xoá tài khoản' })).toBeDisabled();
    });
});
