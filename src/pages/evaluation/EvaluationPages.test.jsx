import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

/**
 * Evaluation and review config.
 *
 * EVALUATION — the honesty rule is structural, and it has two halves verified against the
 * running backend:
 *   - `bandProgress` is `{ current: 0, previous: 0 }` for EVERY skill on a new account, so
 *     a zero must render as "not measured" and never as "band 0.0".
 *   - a delta needs BOTH measurements; with `previous: 0` there is nothing to compare
 *     against, so the tile shows no change rather than a fabricated improvement.
 *
 * REVIEW CONFIG — the screen's job is to remove the two reasons people skip review: not
 * knowing what will be reviewed, and not knowing how long it takes. So both numbers must
 * be real and both must be on screen before the button.
 */
const getProfile = vi.fn();
const getReviewCounts = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    profileApi: { getProfile: (...a) => getProfile(...a), updateProfile: vi.fn() },
    recordsApi: { getReviewCounts: (...a) => getReviewCounts(...a) },
}));

const { i18nReady } = await import('../../i18n');
const { default: EvaluationPage } = await import('./EvaluationPage');
const { default: ReviewConfigPage } = await import('./ReviewConfigPage');
const { estimateMinutes } = await import('../../features/evaluation/useEvaluation');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** The real new-account payload: every band zero, but weakSkills populated. */
const NEW_ACCOUNT = {
    bandProgress: {
        listening: { current: 0, previous: 0 },
        reading: { current: 0, previous: 0 },
        writing: { current: 0, previous: 0 },
        speaking: { current: 0, previous: 0 },
        overall: { current: 0, previous: 0 },
    },
    weakSkills: ['Academic Vocabulary', 'Map Labeling'],
    recommendedPractice: [
        {
            id: 'profile-r1',
            title: 'Diagnostic Test',
            description: 'Take a short Listening test to assess your baseline.',
            type: 'LISTENING',
            estimatedTime: '15 mins',
            path: '/ielts?mode=quick&skill=LISTENING',
            reason: 'We need a baseline to personalize your learning path.',
        },
    ],
    vocabProgress: { totalWords: 0, masteredWords: 0, reviewingWords: 0 },
    dictionaryStats: { totalWords: 0, favoriteWords: 0, wordsToReviewToday: 0, learningWords: 0, masteredWords: 0 },
};

/** An account that has actually been measured. */
const MEASURED = {
    ...NEW_ACCOUNT,
    bandProgress: {
        listening: { current: 6.5, previous: 6 },
        reading: { current: 7, previous: 7 },
        writing: { current: 0, previous: 0 },
        speaking: { current: 5.5, previous: 0 },
        overall: { current: 6.3, previous: 6 },
    },
};

function renderWith(node) {
    return render(
        <MemoryRouter>
            <LocationProbe />
            {node}
        </MemoryRouter>
    );
}

/**
 * The current URL, so a test can assert what a press NAVIGATED TO rather than what it rendered.
 *
 * The setup step's whole job is to compose a URL for the session step; asserting that a button
 * exists would pass even if the selection never reached it.
 */
let currentUrl = '';

function LocationProbe() {
    const location = useLocation();
    currentUrl = `${location.pathname}${location.search}`;
    return null;
}

const lastNavigation = () => currentUrl;

describe('estimateMinutes', () => {
    it('is 0 for nothing, so the screen can say "nothing to review"', () => {
        expect(estimateMinutes(0)).toBe(0);
        expect(estimateMinutes(null)).toBe(0);
    });

    it('never rounds a real session down to 0 minutes', () => {
        /* "1 word · 0 minutes" would read as broken. */
        expect(estimateMinutes(1)).toBe(1);
    });

    it('scales with the count', () => {
        expect(estimateMinutes(34)).toBe(9);
    });
});

describe('EvaluationPage — a zero band is NOT a score', () => {
    it('shows a dash, not 0.0, for an unmeasured overall band', async () => {
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText('Band ước tính từ dữ liệu luyện tập')).toBeInTheDocument();
        expect(screen.queryByText('0.0')).not.toBeInTheDocument();
        expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('explains WHY it is a dash rather than a score', async () => {
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<EvaluationPage />);

        const note = await screen.findByText(/0.0 là một điểm số còn đây là chưa đo được/);
        expect(note.textContent).toMatch(/chưa làm bài nào được chấm/);
    });

    it('labels every skill as not measured when nothing has been sat', async () => {
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText('Bốn kỹ năng')).toBeInTheDocument();
        expect(screen.getAllByText('Chưa đo được')).toHaveLength(4);
    });

    it('shows a real band and its measured delta when both exist', async () => {
        getProfile.mockResolvedValue(envelope(MEASURED));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText('6.3')).toBeInTheDocument();
        expect(screen.getByText('6.5')).toBeInTheDocument();
        /* listening 6.5 vs 6 = +0.5 */
        expect(screen.getByText('+0.5')).toBeInTheDocument();
    });

    it('shows NO delta for a skill with no previous measurement', async () => {
        /* speaking is 5.5 with previous 0 — there is nothing to compare against, so a
           delta here would be fabricated. */
        getProfile.mockResolvedValue(envelope(MEASURED));
        renderWith(<EvaluationPage />);

        await screen.findByText('6.3');
        /* Only listening has a real delta, so exactly one delta chip exists. */
        expect(screen.getAllByText(/^\+0\.5$/)).toHaveLength(1);
        expect(screen.queryByText('+5.5')).not.toBeInTheDocument();
    });

    it('labels the band an estimate and states the normal tolerance', async () => {
        getProfile.mockResolvedValue(envelope(MEASURED));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText(/không phải kết quả thi chính thức/)).toBeInTheDocument();
        expect(screen.getByText(/±0.5 giữa các lần đo là bình thường/)).toBeInTheDocument();
    });

    it('shows the REAL weak skills the backend tracks, not an empty placeholder', async () => {
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText('Academic Vocabulary')).toBeInTheDocument();
        expect(screen.getByText('Map Labeling')).toBeInTheDocument();
        /* and is precise that these are tracked areas, not measured failures */
        expect(screen.getByText(/không phải danh sách lỗi bạn đã mắc/)).toBeInTheDocument();
    });

    it('shows a recommendation WITH its reason', async () => {
        /* A recommendation without its reason is just an instruction. */
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<EvaluationPage />);

        expect(await screen.findByText('Diagnostic Test')).toBeInTheDocument();
        expect(screen.getByText(/We need a baseline/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Bắt đầu/ })).toHaveAttribute(
            'href',
            '/ielts?mode=quick&skill=LISTENING'
        );
    });
});

/**
 * The review SETUP step, rebuilt around the endpoints that exist.
 *
 * These replaced nine tests that asserted the previous design — four hand-picked "content" modes,
 * a third "Mixed" direction, a local preference described as the server's, the schedule intervals,
 * and a "để sau" link. Only one of the four modes had a server meaning, "Mixed" could not be stored
 * in the server's single `direction` string, and the start button handed off to the flashcard mode
 * instead of running a session. A test that pins a wrong design is worse than no test: it makes the
 * wrong design look deliberate.
 */
describe('ReviewConfigPage — the window, the group, the count', () => {
    const COUNTS = { unreviewed: 26, wrong: 8, all: 41 };

    it('states the real count and duration before the button', async () => {
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        /* 20 words at the documented pace (~16s each) is 5 minutes. " đến hạn" is the mockup's word
           — the screen reports what is waiting, it does not offer to do the learner a favour. */
        expect(await screen.findByText(/Bạn có 26 từ đến hạn.*khoảng 5 phút/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Bắt đầu ôn \(20 từ · 5 phút\)/ })).toBeInTheDocument();
    });

    it('does NOT restate its own controls under the headline, or predict the length twice', async () => {
        /* Frame 15's summary card is the headline ALONE, and the session length lives in the start
           button. This screen had grown a second sentence explaining its own controls and a
           `20 từ · ~5 phút` row under the slider — text the design never drew, and the tilde form
           appeared nowhere in it. Both are gone; the button still carries both numbers. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        await screen.findByRole('heading', { level: 2, name: /Bạn có 26 từ/ });
        expect(screen.queryByText(/phiên ôn chỉ gồm đúng những từ đó/)).toBeNull();
        expect(screen.queryByText(/~\s?\d+ phút/)).toBeNull();
        expect(screen.getByRole('button', { name: /Bắt đầu ôn \(20 từ · 5 phút\)/ })).toBeInTheDocument();
    });

    it('names the week and month inputs for screen readers, not with on-screen labels', async () => {
        /* The frame draws neither control, so a visible label here would be text the design never
           wrote — and an input with no accessible name is not an option either. `sr-only` is the one
           state that satisfies both, so this pins it: reachable by name, absent from the visible
           text. Asserting the class rather than `queryByText`, because an `sr-only` node is still a
           text node in the DOM. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        await screen.findByRole('heading', { level: 2, name: /Bạn có 26 từ/ });
        await user.click(screen.getByRole('button', { name: /^Tuần này$/ }));

        expect(screen.getByLabelText('Chọn tuần')).toBeInTheDocument();
        expect(screen.getByText('Chọn tuần')).toHaveClass('sr-only');
        expect(screen.queryByText('Chọn tháng')).toBeNull();
    });

    it('offers the three groups the endpoint can answer, each with its own count', async () => {
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        await screen.findByText(/Bạn có 26 từ/);
        expect(screen.getByRole('button', { name: /Từ chưa ôn/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Từ hay sai/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Toàn bộ từ/ })).toBeInTheDocument();
        expect(screen.getByText('26')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('41')).toBeInTheDocument();
    });

    it('offers exactly two directions and no invented "Mixed"', async () => {
        /* The server keeps ONE `direction` string verbatim and has no per-word direction, so a
           "Mixed" option could only ever have been a label that lied about the session. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByRole('button', { name: 'Anh → Việt' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Việt → Anh' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Trộn/ })).toBeNull();
    });

    it('opens as an entry point: no stepper and no back button', async () => {
        /* `/review` is reached from the rail and from the phone's tab bar, so a back button has
           nowhere honest to go and the "1 of 3" strip asked for attention before anything had been
           chosen. Both were removed deliberately — this is what stops them creeping back. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        await screen.findByRole('button', { name: /^Bắt đầu ôn/ });
        expect(screen.queryByText('Bước 1 / 3')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Quay lại' })).toBeNull();
        expect(screen.queryByRole('list', { name: 'Các bước của phiên ôn tập' })).toBeNull();
    });

    it('keeps the numbers on screen while a new window loads, instead of blanking the page', async () => {
        /* THE SCROLL BUG, pinned as a unit test: the refetch after a preset change used to swap the
           whole body for a skeleton. The scrollport (`<main id="main">`) then became shorter than the
           current scroll offset, the browser clamped it, and the page jumped to the top the instant
           the learner tapped a preset. Asserting on the skeleton rather than on `scrollY` because
           jsdom has no layout: if the old numbers stay mounted, the height cannot collapse. */
        let resolveSecond;
        getReviewCounts.mockResolvedValueOnce(envelope(COUNTS)).mockImplementationOnce(
            () => new Promise((resolve) => { resolveSecond = resolve; })
        );
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        const before = await screen.findByRole('heading', { level: 2, name: /Bạn có 26 từ/ });

        await user.click(screen.getByRole('button', { name: /^30 ngày$/ }));

        /* Mid-flight: the previous answer is still the one on screen, and the skeleton is absent. */
        expect(screen.getByRole('heading', { level: 2, name: /Bạn có 26 từ/ })).toBe(before);
        expect(screen.queryByText('Đang tải…')).toBeNull();
        expect(screen.getByRole('button', { name: /^30 ngày$/ })).toHaveAttribute('aria-pressed', 'true');

        resolveSecond(envelope({ unreviewed: 5, wrong: 2, all: 9 }));
        expect(await screen.findByRole('heading', { level: 2, name: /Bạn có 5 từ/ })).toBeInTheDocument();
    });

    it('carries the whole selection into the session URL', async () => {
        /* Without this the setup screen would be decorative: the same request every time. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        await user.click(await screen.findByRole('button', { name: /Từ hay sai/ }));
        await user.click(screen.getByRole('button', { name: 'Việt → Anh' }));
        await user.click(screen.getByRole('button', { name: /Tuần này/ }));
        await user.click(screen.getByRole('button', { name: /^Bắt đầu ôn/ }));

        const session = lastNavigation();
        expect(session.startsWith('/review/session?')).toBe(true);
        const query = new URLSearchParams(session.split('?')[1]);
        expect(query.get('rangeMode')).toBe('week');
        expect(query.get('group')).toBe('wrong');
        expect(query.get('direction')).toBe('VI_TO_EN');
        expect(query.get('week')).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('caps the count at what the chosen group actually has', async () => {
        /* Asking for 50 words when 8 are due is a promise the screen cannot keep. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        await user.click(await screen.findByRole('button', { name: /Từ hay sai/ }));

        const slider = screen.getByRole('slider');
        expect(slider).toHaveAttribute('max', '8');
        expect(slider).toHaveValue('8');
        expect(screen.getByRole('button', { name: /\(8 từ/ })).toBeInTheDocument();
    });

    it('keeps the count to ONE control', async () => {
        /* A slider and quick-pick chips are two controls for one number, and both would render as
           selected — the defect the mockup's own selection script exhibited. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByRole('slider')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Tất cả \(\d+\)$/ })).toBeNull();
        expect(screen.queryByRole('button', { name: '10' })).toBeNull();
    });

    it('refuses to start on a half-filled custom range', async () => {
        /* `from` without `to` reaches the server as "the last 7 days", which is not the window the
           screen is showing — so the button stays disabled rather than sending it. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        await user.click(await screen.findByRole('button', { name: /Tùy chỉnh/ }));
        await user.clear(screen.getByLabelText('Từ ngày'));

        expect(screen.getByRole('button', { name: /^Bắt đầu ôn/ })).toBeDisabled();
    });

    it('names the resolved dates, not the name of the chip that was pressed', async () => {
        /* The pressed chip already shows its own state, so the only question it cannot answer is
           "which days, exactly". "Tuần này" becomes a week the learner can check against a calendar.
           The note that this flow does not reschedule words used to be asserted here; it was removed
           from the screen because no mockup frame carries it, and the rule for this package is that a
           claim enters through the design, not through the implementation. */
        getReviewCounts.mockResolvedValue(envelope(COUNTS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByText(/^Đang chọn: \d{4}-\d{2}-\d{2} → \d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();
    });

    it('says there is nothing to review when the group is empty', async () => {
        getReviewCounts.mockResolvedValue(envelope({ unreviewed: 0, wrong: 0, all: 0 }));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByText('Chưa có từ nào phù hợp')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Bắt đầu ôn/ })).toBeDisabled();
    });
});


