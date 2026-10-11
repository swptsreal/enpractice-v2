import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/** The api module is mocked so the states can be asserted deterministically. */
const getTests = vi.fn();
vi.mock('../../api', () => ({
    ieltsApi: { getTests: (...a) => getTests(...a) },
    ApiError: class ApiError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
        }
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: IeltsListPage } = await import('./IeltsListPage');

beforeAll(async () => {
    await i18nReady;
});
beforeEach(() => vi.clearAllMocks());

function renderList(path = '/ielts') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <IeltsListPage />
        </MemoryRouter>
    );
}

/** The real paginated envelope, captured from the backend on 2026-10-11. */
const page = (items, extra = {}) => ({
    data: {
        success: true,
        message: 'OK',
        data: { page: 0, size: 24, totalElements: items.length, totalPages: 1, items, ...extra },
    },
});

describe('IeltsListPage', () => {
    it('unwraps the envelope and links each card to the take route with the id', async () => {
        getTests.mockResolvedValue(
            page([
                {
                    id: '3b093e0d-2bd1-401a-9ad6-5c354c4ca06a',
                    title: 'IELTS Academic 19 Reading Test 3',
                    skill: 'READING',
                    timeLimitMinutes: 60,
                    difficulty: 'MEDIUM',
                    totalQuestions: 40,
                },
                {
                    id: 'c960997c-aba6-4466-a9ca-e4ad8dda1c75',
                    title: 'IELTS Academic 19 Listening Test 3',
                    skill: 'LISTENING',
                    timeLimitMinutes: 60,
                    difficulty: 'MEDIUM',
                    totalQuestions: 38,
                },
            ])
        );

        renderList();

        expect(await screen.findByText('IELTS Academic 19 Reading Test 3')).toBeInTheDocument();
        expect(screen.getByText('IELTS Academic 19 Listening Test 3')).toBeInTheDocument();

        /* The visible label is only "Bat dau", so the test title is folded into
           the accessible name — otherwise a grid gives a screen reader that many
           identical targets. */
        const link = screen.getByRole('link', {
            name: /^Bắt đầu: IELTS Academic 19 Reading Test 3$/,
        });
        expect(link.getAttribute('href')).toBe(
            '/ielts/take?testId=3b093e0d-2bd1-401a-9ad6-5c354c4ca06a'
        );
    });

    it('shows the skill, question count and time limit from the real fields', async () => {
        getTests.mockResolvedValue(
            page([
                {
                    id: 'x',
                    title: 'Reading Test',
                    skill: 'READING',
                    timeLimitMinutes: 60,
                    difficulty: 'HARD',
                    totalQuestions: 40,
                },
            ])
        );

        renderList();

        expect(await screen.findByText('Reading')).toBeInTheDocument();
        expect(screen.getByText('40 câu · 60 phút')).toBeInTheDocument();
        expect(screen.getByText('Khó')).toBeInTheDocument();
    });

    it('falls back to a generic skill chip for a code it does not know', async () => {
        getTests.mockResolvedValue(page([{ id: 'y', title: 'Mystery', skill: 'GRAMMAR' }]));

        renderList();

        // must render something, and must not leak a raw i18n key
        expect(await screen.findByText('Tất cả')).toBeInTheDocument();
        expect(screen.queryByText(/ielts\.skill/)).not.toBeInTheDocument();
    });

    it('shows a real empty state, not an error, when the library is empty', async () => {
        getTests.mockResolvedValue(page([]));

        renderList();

        expect(await screen.findByText('Chưa có đề nào')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /test từ vựng/i })).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the network error with a retry when the backend is unreachable', async () => {
        getTests.mockRejectedValue(new Error('Network Error'));

        renderList();

        await waitFor(() => {
            expect(screen.getByText('Không kết nối được tới máy chủ')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
    });

    it('does not offer a login action for a 500 — retry is the right offer', async () => {
        getTests.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

        renderList();

        await waitFor(() => {
            expect(screen.getByText('Máy chủ đang gặp sự cố')).toBeInTheDocument();
        });
        expect(screen.queryByRole('link', { name: /^đăng nhập$/i })).not.toBeInTheDocument();
    });
});

/**
 * The Listening/Reading switch shipped doing nothing: all three pills pointed at
 * `/ielts`, no `skill` reached the request, and the list was hard-coded to
 * `{ page, size }`. The value the backend actually accepts is asserted here
 * because the failure mode is invisible in a render — the screen looks identical
 * either way, which is exactly why it survived review.
 *
 * Verified against the running backend:
 *   ?skill=LISTENING -> 200 (7 items, all LISTENING)   ?skill=READING -> 200 (8 items)
 *   ?skill=listening -> 400 "No enum constant ...Skill.listening"
 *   ?skill=SPEAKING  -> 400, no such enum member
 */
describe('IeltsListPage — the skill filter', () => {
    it('sends the skill the backend enum accepts, not the lowercase route key', async () => {
        getTests.mockResolvedValue(page([{ id: 'r', title: 'Reading Test', skill: 'READING' }]));

        renderList('/ielts?skill=READING');
        await screen.findByText('Reading Test');

        expect(getTests).toHaveBeenCalledWith({ page: 0, size: 24, skill: 'READING' });
    });

    it('normalises a hand-edited URL instead of turning the list into a 400', async () => {
        getTests.mockResolvedValue(page([{ id: 'l', title: 'Listening Test', skill: 'LISTENING' }]));

        renderList('/ielts?skill=listening');
        await screen.findByText('Listening Test');

        expect(getTests).toHaveBeenCalledWith({ page: 0, size: 24, skill: 'LISTENING' });
    });

    it('sends NO skill at all for a value the enum cannot parse', async () => {
        getTests.mockResolvedValue(page([{ id: 'r', title: 'Reading Test', skill: 'READING' }]));

        renderList('/ielts?skill=SPEAKING');
        await screen.findByText('Reading Test');

        expect(getTests).toHaveBeenCalledWith({ page: 0, size: 24 });
    });

    it('marks the pressed filter as current — and no other pill', async () => {
        getTests.mockResolvedValue(page([{ id: 'l', title: 'Listening Test', skill: 'LISTENING' }]));

        renderList('/ielts?skill=LISTENING');
        await screen.findByText('Listening Test');

        expect(screen.getByRole('link', { name: 'Listening' })).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('link', { name: 'Reading' })).not.toHaveAttribute('aria-current');
        expect(screen.getByRole('link', { name: 'Tất cả' })).not.toHaveAttribute('aria-current');
        /* Writing and Speaking route to their own modules; they are not a value of
           this list's filter and must never read as the pressed one. */
        expect(screen.getByRole('link', { name: 'Writing' })).not.toHaveAttribute('aria-current');
        expect(screen.getByRole('link', { name: 'Speaking' })).not.toHaveAttribute('aria-current');
    });

    it('says the FILTER found nothing, instead of claiming the library is empty', async () => {
        getTests.mockResolvedValue(page([]));

        renderList('/ielts?skill=LISTENING');

        expect(await screen.findByText('Chưa tìm thấy đề phù hợp. Hãy thử đổi bộ lọc nhé.')).toBeInTheDocument();
        // "go practise vocabulary" is the right advice for an empty library, not for an empty filter
        expect(screen.queryByRole('link', { name: /test từ vựng/i })).not.toBeInTheDocument();
    });
});

describe('IeltsListPage — the card', () => {
    it('tells the skill and the difficulty apart by tone, not only by text', async () => {
        getTests.mockResolvedValue(
            page([
                {
                    id: 'r',
                    title: 'Reading Test',
                    skill: 'READING',
                    difficulty: 'EASY',
                    totalQuestions: 40,
                    timeLimitMinutes: 60,
                },
                {
                    id: 'l',
                    title: 'Listening Test',
                    skill: 'LISTENING',
                    difficulty: 'HARD',
                    totalQuestions: 38,
                    timeLimitMinutes: 30,
                },
            ])
        );

        renderList();
        await screen.findByText('Reading Test');

        /* Scoped to a card: "Reading"/"Listening" also name the filter pills. */
        const reading = within(screen.getByText('Reading Test').closest('li'));
        const listening = within(screen.getByText('Listening Test').closest('li'));

        const readingTag = reading.getByText('Reading');
        const listeningTag = listening.getByText('Listening');
        const easyTag = reading.getByText('Dễ');
        const hardTag = listening.getByText('Khó');

        /* Only Chip tones that already have a measured pair in tokens.css are used
           (`npm run verify:contrast`): teal/teal-soft, info/info-soft,
           correct/correct-soft, wrong/wrong-soft. */
        expect(readingTag.className).toContain('--teal-soft');
        expect(listeningTag.className).toContain('--info-soft');
        expect(easyTag.className).toContain('--correct-soft');
        expect(hardTag.className).toContain('--wrong-soft');

        // four tags, four different looks — the point of the report item
        expect(new Set([readingTag.className, listeningTag.className, easyTag.className, hardTag.className]).size).toBe(4);
    });

    it('separates the title, the meta line and the action instead of stacking them flush', async () => {
        getTests.mockResolvedValue(
            page([
                {
                    id: 'r',
                    title: 'Reading Test',
                    skill: 'READING',
                    difficulty: 'EASY',
                    totalQuestions: 40,
                    timeLimitMinutes: 60,
                },
            ])
        );

        renderList();
        await screen.findByText('Reading Test');

        // breathing room under the title
        expect(screen.getByText('40 câu · 60 phút').className).toContain('mt-2');

        // the action sits at the card's bottom AND keeps a gap under the meta text
        const action = screen.getByRole('link', { name: /^Bắt đầu: Reading Test$/ });
        expect(action.parentElement.className).toContain('mt-auto');
        expect(action.parentElement.className).toContain('pt-5');
    });
});
