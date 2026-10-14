import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The Writing module's distinctive behaviours, each verified against the running
 * backend before being written down here:
 *
 *  1. **Grading is asynchronous** — SUBMITTED → GRADING → GRADED, measured ~6 s. The
 *     screen must poll, say it is waiting, and never render a null band as a score.
 *  2. **The cost is on the submit button** before it is pressed.
 *  3. **The word count is information, not a gate** — a writer may submit under
 *     length, and blocking that would also lose their work.
 *  4. **Task text contains literal `<br>` tags**, which must become line breaks as
 *     TEXT and never be rendered as HTML.
 */
const getTasks = vi.fn();
const getTaskById = vi.fn();
const submitTask = vi.fn();
const getSubmissionById = vi.fn();
const getSubmissions = vi.fn();
const getHighestScores = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    writingApi: {
        getTasks: (...a) => getTasks(...a),
        getTaskById: (...a) => getTaskById(...a),
        submitTask: (...a) => submitTask(...a),
        getSubmissionById: (...a) => getSubmissionById(...a),
        getSubmissions: (...a) => getSubmissions(...a),
        getHighestScores: (...a) => getHighestScores(...a),
    },
}));

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => ({ cost: 1, mode: 'ENFORCE' }), availableBalance: 10 }),
    };
});

const { i18nReady } = await import('../../i18n');
const { default: WritingListPage } = await import('./WritingListPage');
const { default: WritingTakePage } = await import('./WritingTakePage');
const { default: WritingResultPage } = await import('./WritingResultPage');
const { textFromStoredHtml, countWords } = await import('../../features/writing/useWriting');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items) => envelope({ page: 0, size: 12, totalElements: items.length, totalPages: 1, items });

const TASK = {
    id: 'task-1',
    taskType: 'TASK_2',
    title: 'Some people dislike changes in their society',
    content: 'Some people dislike changes.<br>Why is this?',
    instruction: 'You should spend about 40 minutes.<br>Give reasons for your answer.',
    imageUrls: [],
    difficulty: null,
    timeLimitMinutes: 40,
    minWords: 250,
    maxWords: 300,
};

beforeAll(() => {
    getTasks.mockResolvedValue(page([TASK]));
    getHighestScores.mockResolvedValue(envelope([]));
    getSubmissions.mockResolvedValue(page([]));
});

describe('textFromStoredHtml — the backend sends literal <br>', () => {
    it('converts <br> to a real newline', () => {
        expect(textFromStoredHtml('a<br>b')).toBe('a\nb');
        expect(textFromStoredHtml('a<br/>b')).toBe('a\nb');
        expect(textFromStoredHtml('a<BR />b')).toBe('a\nb');
    });

    it('leaves other angle-bracket content as literal text', () => {
        /* The string is rendered as TEXT, so an unescaped tag must survive as
           characters rather than being interpreted or silently deleted. */
        expect(textFromStoredHtml('a <b>bold</b> c')).toBe('a <b>bold</b> c');
        expect(textFromStoredHtml('2 < 3')).toBe('2 < 3');
    });

    it('collapses the blank-line runs the tags leave behind', () => {
        expect(textFromStoredHtml('a<br><br><br>b')).toBe('a\n\nb');
    });

    it('handles null without throwing', () => {
        expect(textFromStoredHtml(null)).toBe('');
        expect(textFromStoredHtml(undefined)).toBe('');
    });
});

describe('countWords — what the live word counter uses', () => {
    it('counts whitespace-separated tokens', () => {
        expect(countWords('one two three')).toBe(3);
    });

    it('ignores leading, trailing and repeated whitespace', () => {
        expect(countWords('  one   two  \n three ')).toBe(3);
    });

    it('is 0 for empty input, so the submit guard works', () => {
        expect(countWords('')).toBe(0);
        expect(countWords('   \n  ')).toBe(0);
        expect(countWords(null)).toBe(0);
    });

    it('counts a multi-paragraph essay by words, not paragraphs', () => {
        expect(countWords('a b\n\nc d\ne')).toBe(5);
    });
});

describe('WritingListPage', () => {
    function renderList() {
        return render(
            <MemoryRouter>
                <WritingListPage />
            </MemoryRouter>
        );
    }

    it('shows the task with its word range and time limit', async () => {
        getTasks.mockResolvedValue(page([TASK]));
        renderList();

        expect(await screen.findByText(/dislike changes/)).toBeInTheDocument();
        expect(screen.getByText('250–300 từ')).toBeInTheDocument();
        /* "Task 2" is BOTH the card's type chip and a filter button, so the singular
           query is ambiguous by design. */
        expect(screen.getAllByText('Task 2').length).toBeGreaterThan(0);
    });

    it('offers a Task 1 / Task 2 filter as pressed-state toggles', async () => {
        getTasks.mockResolvedValue(page([TASK]));
        renderList();
        await screen.findByText(/dislike changes/);

        const group = screen.getByRole('group', { name: /lọc theo loại bài/i });
        const buttons = group.querySelectorAll('button');
        expect(buttons).toHaveLength(3); // All, Task 1, Task 2
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows "Đang chấm" for a submission still being marked, with no band', async () => {
        getTasks.mockResolvedValue(page([TASK]));
        getHighestScores.mockResolvedValue(
            envelope([{ taskId: 'task-1', attempted: true, submissionId: 's1', highestBandScore: null, status: 'GRADING' }])
        );
        renderList();

        expect(await screen.findByText('Đang chấm')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Xem trạng thái/ })).toBeInTheDocument();
    });

    it('shows the previous band to one decimal when it exists', async () => {
        /* The API returns 6 for what its own feedback calls band 6.0. */
        getTasks.mockResolvedValue(page([TASK]));
        getHighestScores.mockResolvedValue(
            envelope([{ taskId: 'task-1', attempted: true, submissionId: 's1', highestBandScore: 6, status: 'GRADED' }])
        );
        renderList();

        expect(await screen.findByText('6.0')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Viết lại/ })).toBeInTheDocument();
    });

    it('renders the difficulty LABEL, not the raw i18n key', async () => {
        /* The backend sends `EASY` while `ielts.difficulty` stores lowercase keys, so a
           template key printed the literal "ielts.difficulty.EASY" on the card. A static
           map also keeps the key visible to scripts/i18n-audit.mjs. */
        getTasks.mockResolvedValue(page([{ ...TASK, difficulty: 'EASY' }]));
        renderList();

        expect(await screen.findByText('Dễ')).toBeInTheDocument();
        expect(screen.queryByText('ielts.difficulty.EASY')).not.toBeInTheDocument();
    });

    it('gives the two card actions ONE size and ONE width, ranked by variant instead', async () => {
        getTasks.mockResolvedValue(page([TASK]));
        getHighestScores.mockResolvedValue(
            envelope([{ taskId: 'task-1', attempted: true, submissionId: 's1', highestBandScore: 6, status: 'GRADED' }])
        );
        renderList();

        const primary = await screen.findByRole('link', { name: /Viết lại/ });
        const secondary = screen.getByRole('link', { name: /Xem kết quả/ });

        /* The misalignment was a ButtonLink next to a bare text link, so both actions now
           carry the same size token and the same full width. */
        for (const action of [primary, secondary]) {
            expect(action.className).toMatch(/min-h-10/);
            expect(action.className).toMatch(/w-full/);
        }

        /* Hierarchy is carried by the variant: the main action is filled, the second is
           quiet — and it still navigates to the submission. */
        expect(primary.className).toMatch(/bg-\[var\(--teal\)\]/);
        expect(secondary.className).toMatch(/bg-transparent/);
        expect(secondary).toHaveAttribute('href', '/writing/submission/s1');
    });
});

describe('WritingTakePage', () => {
    function renderTake() {
        return render(
            <MemoryRouter initialEntries={['/writing/task/task-1']}>
                <Routes>
                    <Route path="/writing/task/:taskId" element={<WritingTakePage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('renders the task with <br> converted to real line breaks', async () => {
        getTaskById.mockResolvedValue(envelope(TASK));
        renderTake();

        const prompt = await screen.findByText(/Some people dislike changes\./);
        expect(prompt.textContent).toContain('\n');
        // and the raw tag must not be visible anywhere
        expect(prompt.textContent).not.toContain('<br>');
    });

    it('shows the cost on the submit button before it is pressed', async () => {
        getTaskById.mockResolvedValue(envelope(TASK));
        renderTake();
        expect(await screen.findByRole('button', { name: /Nộp bài · -1 credit/ })).toBeInTheDocument();
    });

    it('disables submit until there is text, and never on word count alone', async () => {
        getTaskById.mockResolvedValue(envelope(TASK));
        const user = userEvent.setup();
        renderTake();

        const button = await screen.findByRole('button', { name: /Nộp bài/ });
        expect(button).toBeDisabled();

        /* One short word: under the 250 target, but still submittable. The design is
           explicit that length is information, not a gate — and blocking here would
           also throw away whatever the writer had managed. */
        await user.type(screen.getByRole('textbox'), 'Short');
        await waitFor(() => expect(screen.getByRole('button', { name: /Nộp bài/ })).toBeEnabled());
        expect(screen.getByText('1 / 250 từ')).toBeInTheDocument();
        expect(screen.getByText('Chưa đủ số từ tối thiểu')).toBeInTheDocument();
    });

    it('submits the essay and navigates to the result', async () => {
        getTaskById.mockResolvedValue(envelope(TASK));
        submitTask.mockResolvedValue(envelope({ id: 'sub-1', status: 'SUBMITTED' }));

        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/writing/task/task-1']}>
                <Routes>
                    <Route path="/writing/task/:taskId" element={<WritingTakePage />} />
                    <Route path="/writing/submission/:submissionId" element={<div>result route</div>} />
                </Routes>
            </MemoryRouter>
        );

        await user.type(await screen.findByRole('textbox'), 'An essay about change.');
        await user.click(screen.getByRole('button', { name: /Nộp bài/ }));

        await waitFor(() => {
            expect(submitTask).toHaveBeenCalledWith(
                'task-1',
                expect.objectContaining({ essayContent: 'An essay about change.' })
            );
        });
        expect(await screen.findByText('result route')).toBeInTheDocument();
    });

    it('provides a 2-tab switch between prompt and editor', async () => {
        getTaskById.mockResolvedValue(envelope(TASK));
        const user = userEvent.setup();
        renderTake();

        const promptTab = await screen.findByRole('tab', { name: /^Đề bài$/ });
        const editorTab = screen.getByRole('tab', { name: /^Làm bài/ });
        expect(promptTab).toHaveAttribute('aria-selected', 'true');
        expect(editorTab).toHaveAttribute('aria-selected', 'false');

        await user.click(editorTab);
        expect(promptTab).toHaveAttribute('aria-selected', 'false');
        expect(editorTab).toHaveAttribute('aria-selected', 'true');
    });
});

describe('WritingResultPage — the asynchronous grading state', () => {
    function renderResult() {
        return render(
            <MemoryRouter initialEntries={['/writing/submission/sub-1']}>
                <Routes>
                    <Route path="/writing/submission/:submissionId" element={<WritingResultPage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('says the essay is being marked, and shows NO band while it waits', async () => {
        getSubmissionById.mockResolvedValue(
            envelope({ id: 'sub-1', taskId: 'task-1', taskTitle: 'T', status: 'GRADING', overallBandScore: null })
        );
        renderResult();

        expect(await screen.findByText('Đang chấm bài của bạn')).toBeInTheDocument();
        // the crucial part: a null band must never be rendered as a score
        expect(screen.queryByText('Điểm theo tiêu chí')).not.toBeInTheDocument();
    });

    it('renders band, criteria and feedback once GRADED', async () => {
        getSubmissionById.mockResolvedValue(
            envelope({
                id: 'sub-1',
                taskId: 'task-1',
                taskTitle: 'Some people dislike changes',
                taskType: 'TASK_2',
                status: 'GRADED',
                essayContent: 'My essay text.',
                wordCount: 181,
                timeSpentSeconds: 900,
                overallBandScore: 6,
                taskResponseScore: 3,
                coherenceScore: 7,
                lexicalResourceScore: 7,
                grammarScore: 7,
                aiFeedback: '## Overall Band: 6.0\n\n**Critical issue:** off topic.',
                submittedAt: '2026-10-11T14:00:00Z',
                gradedAt: '2026-10-11T14:00:06Z',
            })
        );
        renderResult();

        expect(await screen.findByText('6.0')).toBeInTheDocument();
        expect(screen.getByText('Điểm theo tiêu chí')).toBeInTheDocument();
        // four criteria, each with an accessible value rather than width alone
        const bars = screen.getAllByRole('progressbar');
        expect(bars).toHaveLength(4);
        expect(bars[0]).toHaveAttribute('aria-valuenow', '3');
        expect(bars[0]).toHaveAttribute('aria-valuemax', '9');
        // the feedback renders as markdown, so the heading is a heading
        expect(screen.getByText('Overall Band: 6.0')).toBeInTheDocument();
        expect(screen.getByText('My essay text.')).toBeInTheDocument();
    });

    it('offers a rewrite action, which is the point of the screen', async () => {
        getSubmissionById.mockResolvedValue(
            envelope({
                id: 'sub-1',
                taskId: 'task-1',
                status: 'GRADED',
                overallBandScore: 6,
                essayContent: 'x',
                aiFeedback: 'ok',
            })
        );
        renderResult();
        const link = await screen.findByRole('link', { name: /Viết lại bài này/ });
        expect(link).toHaveAttribute('href', '/writing/task/task-1');
    });

    it('reports a FAILED grading instead of showing an empty result', async () => {
        getSubmissionById.mockResolvedValue(
            envelope({ id: 'sub-1', taskId: 'task-1', status: 'FAILED', overallBandScore: null })
        );
        renderResult();
        expect(await screen.findByText('Không chấm được bài này')).toBeInTheDocument();
    });
});
