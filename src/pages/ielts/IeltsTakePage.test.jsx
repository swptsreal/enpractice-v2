import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The take screen is the single most important layout decision in v2, so it gets
 * real tests rather than comments: v1 stacked the passage above the questions with
 * `min-height: 40vh`, so in the one module where a reader must see a passage and
 * its question together, they never were.
 *
 * The session hook is mocked rather than the api, because the hook owns the paper's
 * shape (`flattenQuestions`) and that transformation has its own suite.
 */
const submit = vi.fn();
const setAnswer = vi.fn();
let sessionState;

vi.mock('../../features/ielts/useIeltsSession', async () => {
    const actual = await vi.importActual('../../features/ielts/useIeltsSession');
    return {
        ...actual,
        useIeltsSession: () => sessionState,
        assertNoAnswersLeaked: () => {},
    };
});

const { i18nReady } = await import('../../i18n');
const { default: IeltsTakePage } = await import('./IeltsTakePage');
const { flattenQuestions } = await import('../../features/ielts/useIeltsSession');

beforeAll(async () => {
    await i18nReady;
});

/** A two-section paper, in the backend's nested shape. */
const TEST_DETAIL = {
    id: 't1',
    title: 'IELTS Academic 19 Reading Test 3',
    skill: 'READING',
    timeLimitMinutes: 60,
    sections: [
        {
            id: 's1',
            sectionOrder: 1,
            title: 'Passage 1',
            passages: [
                {
                    id: 'p1',
                    passageOrder: 1,
                    title: 'The Return of the Urban Bee',
                    /* The REAL shape of this field, copied from the seeded library
                       (`GET /ielts/tests/{id}` on the running backend): markdown bold,
                       a real markdown image, a literal `<br>` at the end of a line, a
                       hard-wrapped source line, and a GFM table whose cell contains a
                       `<br>` — the case a markdown hard break would break. */
                    content:
                        '**A**  For most of the twentieth century, the city was assumed\n' +
                        'to be hostile territory.<br>\n' +
                        'The bee population, however, was never told.<br>\n' +
                        'Every year since, the count has risen.\n' +
                        '\n' +
                        '![Urban bee](https://cdn.example/ielts/bee.png)\n' +
                        '\n' +
                        '| Site | Note |\n' +
                        '|---|---|\n' +
                        '| Roof | first<br>second |\n',
                    questions: [
                        {
                            id: 'q1',
                            questionOrder: 1,
                            questionType: 'SINGLE_CHOICE',
                            questionText: 'What was **assumed** about cities?',
                            options: ['They were hostile', 'They were ideal', 'They were neutral'],
                            correctAnswers: ['They were hostile'],
                        },
                        {
                            id: 'q2',
                            questionOrder: 2,
                            questionType: 'SENTENCE_COMPLETION',
                            questionText: 'Bees thrive because of garden ______.',
                            options: [],
                            correctAnswers: ['planting'],
                        },
                    ],
                },
            ],
        },
    ],
};

const QUESTIONS = flattenQuestions(TEST_DETAIL);

function loadedState(overrides = {}) {
    return {
        session: { attemptId: 'a1', totalQuestions: 2, estimatedMinutes: 60 },
        testDetail: TEST_DETAIL,
        attemptId: 'a1',
        totalQuestions: 2,
        estimatedMinutes: 60,
        scopeTitle: null,
        questions: QUESTIONS,
        sections: [],
        answers: {},
        setAnswer,
        answeredCount: 0,
        loading: false,
        error: null,
        submit,
        submitting: false,
        result: null,
        ...overrides,
    };
}

function renderTake() {
    return render(
        <MemoryRouter initialEntries={['/ielts/take?testId=t1']}>
            <IeltsTakePage />
        </MemoryRouter>
    );
}

describe('flattenQuestions — the paper transformation', () => {
    it('flattens sections -> passages -> questions and carries passage context', () => {
        expect(QUESTIONS).toHaveLength(2);
        expect(QUESTIONS[0].id).toBe('q1');
        expect(QUESTIONS[0].passageTitle).toBe('The Return of the Urban Bee');
        expect(QUESTIONS[0].sectionTitle).toBe('Passage 1');
    });

    it('STRIPS correctAnswers and explanation before the paper reaches the DOM', () => {
        /* The backend sends the answer key inside the question payload, so the only
           thing between a candidate and the answers is this strip.
           Assert on the KEYS, not on the answer text: the answer shares words with
           the passage ("hostile" appears in both), so a substring check would fail
           for a reason unrelated to the leak. */
        const serialised = JSON.stringify(QUESTIONS);
        expect(serialised).not.toContain('"correctAnswers"');
        expect(serialised).not.toContain('"explanation"');

        for (const q of QUESTIONS) {
            expect(q.correctAnswers).toBeUndefined();
            expect(q.explanation).toBeUndefined();
        }
    });

    it('does not mutate the source payload', () => {
        // the submit response needs the key, so the original must survive
        expect(TEST_DETAIL.sections[0].passages[0].questions[0].correctAnswers).toEqual(['They were hostile']);
    });

    it('translates literal <br> into markdown and leaves everything else alone', () => {
        const passage = QUESTIONS[0].passageContent;

        /* `<br>` at the end of a line becomes a hard break (two trailing spaces), so
           the line's own newline draws a real <br> instead of the tag reaching the DOM. */
        expect(passage).not.toContain('<br');
        expect(passage).toContain('to be hostile territory.  \nThe bee population');

        /* Inside a table ROW a hard break would split the row in two (verified in a
           render), so it becomes `&#10;` — a newline that stays inside the cell. */
        expect(passage).toContain('| Roof | first&#10;second |');

        // real markdown is carried through untouched
        expect(passage).toContain('**A**');
        expect(passage).toContain('![Urban bee](https://cdn.example/ielts/bee.png)');
        expect(QUESTIONS[0].questionText).toBe('What was **assumed** about cities?');
    });
});

describe('IeltsTakePage — loaded', () => {
    it('renders a labelled tablist with exactly two tabs and two panels', () => {
        sessionState = loadedState();
        const { container } = renderTake();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getAllByRole('tab')).toHaveLength(2);
        expect(container.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    });

    it('starts on the passage and hides the questions pane', () => {
        sessionState = loadedState();
        renderTake();
        const [passageTab, questionsTab] = screen.getAllByRole('tab');
        expect(passageTab).toHaveAttribute('aria-selected', 'true');
        expect(questionsTab).toHaveAttribute('aria-selected', 'false');

        const panels = screen.getAllByRole('tabpanel');
        expect(panels.filter((p) => !p.className.includes('hidden'))).toHaveLength(1);
    });

    it('wires aria-controls on every tab to a real panel id', () => {
        sessionState = loadedState();
        renderTake();
        for (const tab of screen.getAllByRole('tab')) {
            const id = tab.getAttribute('aria-controls');
            expect(id).toBeTruthy();
            expect(document.getElementById(id)).not.toBeNull();
        }
    });

    it('renders the passage and the question through the Markdown renderer', () => {
        sessionState = loadedState();
        renderTake();

        expect(screen.getByText('The Return of the Urban Bee')).toBeInTheDocument();

        /* The question text is markdown: `**assumed**` must arrive as a real <strong>,
           and the markers must not reach the candidate. */
        const bold = screen.getByText('assumed');
        expect(bold.tagName).toBe('STRONG');
        expect(document.body.textContent).not.toContain('**');

        // the passage's `<br>` are real line breaks, not literal tags
        const passage = document.getElementById('pane-passage');
        expect(passage.querySelectorAll('br')).toHaveLength(2);
        expect(passage.textContent).not.toContain('<br');
    });

    it('renders a markdown image with a bounded width, not a raw ![alt](url)', () => {
        sessionState = loadedState();
        renderTake();

        const image = screen.getByRole('img', { name: 'Urban bee' });
        expect(image).toHaveAttribute('src', 'https://cdn.example/ielts/bee.png');
        expect(image.className).toContain('max-w-full');
        expect(document.body.textContent).not.toContain('![');
    });

    it('renders the GFM table and keeps a <br> INSIDE a cell as an in-cell line break', () => {
        sessionState = loadedState();
        renderTake();

        const table = document.getElementById('pane-passage').querySelector('table');
        expect(table).not.toBeNull();

        /* The row must survive as one row — a markdown hard break here would have
           split it into two — with the line break living inside the cell. */
        expect(table.querySelectorAll('tbody tr')).toHaveLength(1);
        const cell = [...table.querySelectorAll('td')].find((td) => td.textContent.includes('first'));
        expect(cell.textContent).toBe('first\nsecond');
        expect(cell.className).toContain('whitespace-pre-line');
    });

    it('renders one option tile per option, keyed A/B/C', () => {
        sessionState = loadedState();
        renderTake();
        expect(screen.getByText('They were hostile')).toBeInTheDocument();
        expect(screen.getByText('They were ideal')).toBeInTheDocument();
        expect(screen.getByText('They were neutral')).toBeInTheDocument();
    });

    it('renders a text input instead of tiles when a question has no options', async () => {
        sessionState = loadedState();
        const user = userEvent.setup();
        renderTake();

        // move to question 2, a sentence-completion with no options
        await user.click(screen.getByRole('button', { name: /câu sau/i }));
        expect(screen.getByText('Bees thrive because of garden ______.')).toBeInTheDocument();
        expect(screen.getByLabelText(/câu trả lời của bạn/i)).toBeInTheDocument();
    });

    it('gives every navigator button a 40px target and an aria-label', () => {
        sessionState = loadedState();
        const { container } = renderTake();
        const nav = container.querySelector('[role="group"]');
        const buttons = nav.querySelectorAll('button');
        expect(buttons).toHaveLength(2);
        for (const b of buttons) {
            expect(b.getAttribute('aria-label')).toBeTruthy();
            expect(b.className).toContain('size-10'); // 40px
        }
    });

    it('records the chosen option through setAnswer', async () => {
        sessionState = loadedState();
        const user = userEvent.setup();
        renderTake();

        await user.click(screen.getByText('They were ideal').closest('button'));
        expect(setAnswer).toHaveBeenCalledWith('q1', ['They were ideal']);
    });

    it('marks answered questions in the navigator with a shape, not only colour', () => {
        sessionState = loadedState({ answers: { q1: ['They were hostile'] }, answeredCount: 1 });
        renderTake();
        expect(screen.getByRole('button', { name: /câu 1 .* đã trả lời/i })).toBeInTheDocument();
    });
});

describe('IeltsTakePage — states', () => {
    it('shows a skeleton while the session opens', () => {
        sessionState = loadedState({ loading: true, questions: [], totalQuestions: 0 });
        const { container } = renderTake();
        expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    });

    it('offers the wallet, not a retry, when credits are insufficient', () => {
        sessionState = loadedState({
            questions: [],
            error: Object.assign(new Error('Payment Required'), { status: 402 }),
        });
        renderTake();

        expect(screen.getByText('Bạn không đủ credit cho hành động này')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ví credit/i })).toHaveAttribute('href', '/credits');
        // a retry cannot succeed against an empty wallet
        expect(screen.queryByRole('button', { name: /thử lại/i })).not.toBeInTheDocument();
    });

    it('shows a distinct empty state when the paper has no questions', () => {
        sessionState = loadedState({ questions: [], totalQuestions: 0 });
        renderTake();
        expect(screen.getByText('Đề này chưa có câu hỏi')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('names a network failure and offers retry', () => {
        sessionState = loadedState({ questions: [], error: new Error('Network Error') });
        renderTake();
        expect(screen.getByText('Không kết nối được tới máy chủ')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
    });
});
