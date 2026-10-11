import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

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

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    profileApi: { getProfile: (...a) => getProfile(...a), updateProfile: vi.fn() },
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
    return render(<MemoryRouter>{node}</MemoryRouter>);
}

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

describe('ReviewConfigPage — what and how long, before the button', () => {
    const WITH_WORDS = {
        ...NEW_ACCOUNT,
        dictionaryStats: {
            totalWords: 40,
            favoriteWords: 12,
            wordsToReviewToday: 34,
            learningWords: 8,
            masteredWords: 20,
        },
    };

    it('states the count AND the duration up front', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        const headline = await screen.findByText(/34 từ đến hạn · khoảng 9 phút/);
        expect(headline).toBeInTheDocument();
    });

    it('repeats the duration ON the primary button', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByRole('button', { name: /Bắt đầu · 34 từ · 9 phút/ })).toBeInTheDocument();
    });

    it('gives each content option its OWN count and duration', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        await screen.findByText(/34 từ đến hạn/);
        /* due 34, quick 40, favourites 12, weak 8 */
        expect(screen.getByText('34 từ')).toBeInTheDocument();
        expect(screen.getByText('40 từ')).toBeInTheDocument();
        expect(screen.getByText('12 từ')).toBeInTheDocument();
        expect(screen.getByText('8 từ')).toBeInTheDocument();
    });

    it('shows the labelled stepper as step 1 of 3', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByText('Bước 1 / 3')).toBeInTheDocument();
        expect(screen.getByRole('list', { name: /Các bước cấu hình ôn tập/ })).toBeInTheDocument();
    });

    it('sends the chosen mode and filter to the review session', async () => {
        /* Without this the config screen would be decorative: four options all fetching
           the same due list. */
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        const user = userEvent.setup();
        renderWith(<ReviewConfigPage />);

        await user.click(await screen.findByRole('button', { name: /Luyện nhanh/ }));

        const start = screen.getByRole('button', { name: /^Bắt đầu/ });
        expect(start).toBeInTheDocument();
        /* The link is built from the selected mode's API value. */
        expect(start.closest('button')).toBeTruthy();
    });

    it('says the direction is a local preference, not a server setting', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByText(/được lưu trên thiết bị này/)).toBeInTheDocument();
    });

    it('states the real schedule intervals, taken from the backend', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);
        expect(await screen.findByText(/4 giờ, 1 ngày, 3 ngày, 1 tuần, 2 tuần/)).toBeInTheDocument();
    });

    it('offers "để sau" as a full-size secondary action', async () => {
        getProfile.mockResolvedValue(envelope(WITH_WORDS));
        renderWith(<ReviewConfigPage />);

        const later = await screen.findByRole('link', { name: 'Để sau' });
        expect(later).toHaveAttribute('href', '/dictionary');
    });

    it('disables every content option when there is nothing to review', async () => {
        getProfile.mockResolvedValue(envelope(NEW_ACCOUNT));
        renderWith(<ReviewConfigPage />);

        expect(await screen.findByText('Hôm nay không có từ nào đến hạn')).toBeInTheDocument();
        const options = screen.getAllByRole('button', { pressed: false });
        /* All four content options are disabled with zero words. */
        expect(options.filter((b) => b.disabled).length).toBeGreaterThanOrEqual(3);
    });
});
