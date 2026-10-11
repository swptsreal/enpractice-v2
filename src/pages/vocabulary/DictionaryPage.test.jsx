import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const getStats = vi.fn();
const searchWords = vi.fn();
const getDueReviews = vi.fn();
const reviewWord = vi.fn();

vi.mock('../../api', () => ({
    dictionaryApi: {
        getStats: (...a) => getStats(...a),
        searchWords: (...a) => searchWords(...a),
        getDueReviews: (...a) => getDueReviews(...a),
        reviewWord: (...a) => reviewWord(...a),
        toggleFavorite: vi.fn(),
        deleteWord: vi.fn(),
        updateWord: vi.fn(),
        addWord: vi.fn(),
    },
}));

const { i18nReady } = await import('../../i18n');
const { MasteryRing } = await import('../../components/vocabulary/MasteryRing');
const { default: DictionaryPage } = await import('./DictionaryPage');
const { RECALL_OPTIONS } = await import('../../features/vocabulary/useDictionary');

beforeAll(async () => {
    await i18nReady;
});

const word = (over = {}) => ({
    id: 'w1',
    word: 'mitigate',
    ipa: '/ˈmɪtɪɡeɪt/',
    wordType: 'verb',
    meaning: 'làm giảm bớt',
    proficiencyLevel: 1,
    isFavorite: false,
    reviewCount: 2,
    nextReviewAt: '2026-10-20T00:00:00Z',
    tags: ['environment'],
    examples: [],
    ...over,
});

const statsBody = (over = {}) => ({
    data: {
        success: true,
        data: {
            totalWords: 8,
            favoriteWords: 1,
            wordsToReviewToday: 2,
            newWords: 3,
            learningWords: 3,
            masteredWords: 2,
            ...over,
        },
    },
});

/** Spring Page shape — `content` + `number`, which is what /dictionary returns. */
const springPage = (items) => ({
    data: {
        success: true,
        data: { content: items, number: 0, size: 20, totalElements: items.length, totalPages: 1 },
    },
});

describe('MasteryRing', () => {
    it('renders an accessible name carrying the value and the tier', async () => {
        render(<MasteryRing level={3} />);
        /* 3 of 5 = 60%, which lands in the amber "remembering" tier. */
        const img = screen.getByRole('img');
        expect(img).toHaveAccessibleName(/3\/5/);
        expect(img).toHaveAccessibleName(/Đang nhớ/);
    });

    it('states the tier in TEXT, not only in colour', () => {
        /* Colour alone fails WCAG 2.1 SC 1.4.1, and this is a metric where colour
           carries the entire message. */
        const { container } = render(<MasteryRing level={0} />);
        expect(container.textContent).toMatch(/Hay quên/);
    });

    it('drops the visible label at size=sm but keeps the accessible name', () => {
        const { container } = render(<MasteryRing level={5} showLabel={false} />);
        expect(screen.getByRole('img')).toHaveAccessibleName(/5\/5/);
        // the tier word is not rendered visually...
        expect(container.textContent).not.toMatch(/Đã nhớ/);
        // ...but it is still announced
        expect(screen.getByRole('img')).toHaveAccessibleName(/Đã nhớ/);
    });

    it('clamps out-of-range levels instead of drawing a broken arc', () => {
        render(<MasteryRing level={99} />);
        expect(screen.getByRole('img')).toHaveAccessibleName(/5\/5/);
        const { unmount } = render(<MasteryRing level={-4} />);
        expect(screen.getAllByRole('img')[1]).toHaveAccessibleName(/0\/5/);
        unmount();
    });

    it('survives a null level, which is what a missing field gives', () => {
        render(<MasteryRing level={null} />);
        expect(screen.getByRole('img')).toHaveAccessibleName(/0\/5/);
    });
});

describe('RECALL_OPTIONS — the mapping onto the real 0-5 scale', () => {
    it('uses only scores the backend accepts', () => {
        /* ReviewWordRequest is @Min(0) @Max(5); posting 9 is rejected with 400. */
        for (const option of RECALL_OPTIONS) {
            expect(option.score).toBeGreaterThanOrEqual(0);
            expect(option.score).toBeLessThanOrEqual(5);
        }
    });

    it('orders the four options from worst to best recall', () => {
        const scores = RECALL_OPTIONS.map((o) => o.score);
        expect(scores).toEqual([...scores].sort((a, b) => a - b));
        expect(RECALL_OPTIONS).toHaveLength(4);
    });

    it('keeps the score that holds the level apart from the one that raises it', () => {
        /* Verified live: 0 and 2 hold level 0, 4 moves it to 1, 5 moves it to 2. */
        expect(RECALL_OPTIONS.find((o) => o.id === 'forgot').score).toBe(0);
        expect(RECALL_OPTIONS.find((o) => o.id === 'hard').score).toBe(2);
        expect(RECALL_OPTIONS.find((o) => o.id === 'good').score).toBe(4);
        expect(RECALL_OPTIONS.find((o) => o.id === 'easy').score).toBe(5);
    });

    it('gives every option a distinct label so no two buttons look identical', () => {
        const labels = RECALL_OPTIONS.map((o) => o.labelKey);
        expect(new Set(labels).size).toBe(labels.length);
    });
});

describe('DictionaryPage — the notebook', () => {
    function renderPage() {
        return render(
            <MemoryRouter>
                <DictionaryPage />
            </MemoryRouter>
        );
    }

    it('renders the four memory stats from the real stats endpoint', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([word()]));
        renderPage();

        /* "mitigate" renders in BOTH the list row and the detail aside, so the
           singular query throws on multiple matches rather than failing to find it.
           That duplication is the intended >=1024px layout, not a bug. */
        expect((await screen.findAllByText('mitigate')).length).toBeGreaterThan(0);
        expect(screen.getByText('Tổng số từ')).toBeInTheDocument();
        expect(screen.getByText('Cần ôn hôm nay')).toBeInTheDocument();
        /* 'Dang hoc' is BOTH a stat label and a filter button, so the singular query is
           ambiguous by design. Assert it is present rather than unique. */
        expect(screen.getAllByText('Đang học').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Đã nhớ').length).toBeGreaterThan(0);
    });

    it('does not render a table, so the list never scrolls sideways on mobile', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([word()]));
        const { container } = renderPage();
        await screen.findAllByText('mitigate');
        expect(container.querySelector('table')).toBeNull();
    });

    it('offers every memory filter as a pressed-state toggle', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([word()]));
        renderPage();
        await screen.findAllByText('mitigate');

        const group = screen.getByRole('group', { name: /lọc theo mức ghi nhớ/i });
        const buttons = group.querySelectorAll('button');
        expect(buttons).toHaveLength(5);
        // "Tất cả" starts pressed, and aria-pressed communicates it
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
        expect(buttons[1]).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows a distinct empty state, not an error, when the notebook is empty', async () => {
        getStats.mockResolvedValue(statsBody({ totalWords: 0 }));
        searchWords.mockResolvedValue(springPage([]));
        renderPage();

        expect(await screen.findByText('Sổ tay đang trống')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('differentiates "no match" from "empty notebook"', async () => {
        /* A filtered list with no results is not the same situation as having no
           words at all, and telling a user with 200 words that their notebook is
           empty is worse than saying nothing. */
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([]));
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByPlaceholderText(/tìm theo từ hoặc nghĩa/i), 'zzz');
        await waitFor(
            () => {
                expect(screen.getByText('Không tìm thấy từ nào')).toBeInTheDocument();
            },
            { timeout: 2000 }
        );
    });

    it('favourites a word through the toggle without a page reload', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([word()]));
        const { dictionaryApi } = await import('../../api');
        dictionaryApi.toggleFavorite.mockResolvedValue({ data: { success: true, data: word({ isFavorite: true }) } });

        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('mitigate');

        await user.click(screen.getByRole('button', { name: /yêu thích/i }));
        expect(dictionaryApi.toggleFavorite).toHaveBeenCalledWith('w1');
    });
});

/**
 * The order of the notebook is a bug the user reported twice, and it has two
 * halves that must not come back:
 *
 *   "toggle favorite màn có load lại, từ đó từ bị đẩy xuống cuối danh sách"
 *   "Từ mới thêm cũng bị đẩy xuống cuối list"
 *
 * Both were caused by the same pair of decisions: `PATCH /dictionary/{id}/favorite`
 * bumps the row's `updatedAt` (verified live: 13:29:54 → 13:30:02), the screen
 * sorted by `updated_at`, and every mutation answered by re-fetching the page. So
 * the row the user touched came back at the far end of a list that had also
 * flashed through its skeleton. And a word added just now is the newest
 * `updated_at` there is, so a refetch dropped it at the bottom too.
 */
describe('DictionaryPage — a mutation never reorders the list', () => {
    function renderPage() {
        return render(
            <MemoryRouter>
                <DictionaryPage />
            </MemoryRouter>
        );
    }

    /** The words of the list rows, in the order they are on screen. */
    function rowWords() {
        return screen
            .getAllByRole('listitem')
            .map((li) => li.querySelector('strong')?.textContent);
    }

    const three = [
        word({ id: 'w1', word: 'alpha' }),
        word({ id: 'w2', word: 'bravo' }),
        word({ id: 'w3', word: 'charlie' }),
    ];

    it('keeps the favourited row exactly where it was, and does not re-ask the server', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage(three));
        const { dictionaryApi } = await import('../../api');
        /* The real response of the endpoint: the full row, with the toggled flag.
           Its `updatedAt` is stale (the server bumps it on flush), which is why the
           page copies only `isFavorite` back into the row. */
        dictionaryApi.toggleFavorite.mockResolvedValue({
            data: { success: true, data: word({ id: 'w2', word: 'bravo', isFavorite: true }) },
        });

        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('alpha');
        expect(rowWords()).toEqual(['alpha', 'bravo', 'charlie']);

        const listCallsBefore = searchWords.mock.calls.length;
        /* The star on the MIDDLE row — the row that used to jump to the end. */
        await user.click(screen.getAllByRole('button', { name: /yêu thích/i })[1]);

        expect(dictionaryApi.toggleFavorite).toHaveBeenCalledWith('w2');
        // position unchanged...
        expect(rowWords()).toEqual(['alpha', 'bravo', 'charlie']);
        // ...and the row that changed is the one that shows the change
        expect(screen.getAllByRole('button', { name: /yêu thích/i })[1]).toHaveAttribute('aria-pressed', 'true');
        // NO refetch: the list is not re-requested, so it cannot reorder or flash
        expect(searchWords.mock.calls.length).toBe(listCallsBefore);
    });

    it('rolls the star back when the write is rejected', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage(three));
        const { dictionaryApi } = await import('../../api');
        dictionaryApi.toggleFavorite.mockRejectedValue(Object.assign(new Error('nope'), { status: 500 }));

        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('alpha');

        await user.click(screen.getAllByRole('button', { name: /yêu thích/i })[1]);

        // a filled star after a failed write would be a lie
        expect(screen.getAllByRole('button', { name: /yêu thích/i })[1]).toHaveAttribute('aria-pressed', 'false');
        expect(rowWords()).toEqual(['alpha', 'bravo', 'charlie']);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('puts a newly added word at the TOP and does not refetch the list either', async () => {
        getStats.mockResolvedValue(statsBody());
        searchWords.mockResolvedValue(springPage([word({ id: 'w1', word: 'mitigate' })]));
        const { dictionaryApi } = await import('../../api');
        /* Note `createdAt: null` — the POST response carries no timestamps (verified
           live), so the row cannot be re-sorted client-side from it. It does not
           need to be: the new word is placed first, where the user is looking. */
        dictionaryApi.addWord.mockResolvedValue({
            data: {
                success: true,
                data: word({ id: 'w9', word: 'resilient', meaning: 'kiên cường', isFavorite: false, createdAt: null }),
            },
        });

        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('mitigate');

        await user.click(screen.getByRole('button', { name: /thêm từ/i }));
        await user.type(screen.getByLabelText(/^Từ$/), 'resilient');
        await user.type(screen.getByLabelText(/^Nghĩa$/), 'kiên cường');

        const listCallsBefore = searchWords.mock.calls.length;
        await user.click(screen.getByRole('button', { name: /^Lưu$/ }));

        expect(dictionaryApi.addWord).toHaveBeenCalledTimes(1);
        expect(rowWords()[0]).toBe('resilient');
        expect(searchWords.mock.calls.length).toBe(listCallsBefore);
    });
});
