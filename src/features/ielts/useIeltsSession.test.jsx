import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * What the session hook SENDS, which is the half of the quick launch that was missing.
 *
 * Three ways to start a paper exist, and they carry different fields:
 *
 *   full test        testId + scopeType TEST
 *   scoped practice  testId + scopeType SECTION/PASSAGE + **scopeId**
 *   question drill   scopeType QUESTION_TYPE + **questionType**, and no testId at all
 *
 * The scope id and the question type were both dropped before this suite existed, so a passage
 * quick launch silently started the whole test and a learning-path drill could not start at
 * all. A payload test is the only place that shows it.
 */
const startSession = vi.fn();
const getSession = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    ieltsApi: {
        startSession: (...args) => startSession(...args),
        getSession: (...args) => getSession(...args),
        submitSession: vi.fn(),
    },
}));

const { i18nReady } = await import('../../i18n');
const { useIeltsSession } = await import('./useIeltsSession');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    startSession.mockReset();
    startSession.mockResolvedValue({ data: { success: true, message: 'OK', data: { attemptId: 'a1' } } });
    getSession.mockReset();
});

function Probe(props) {
    const { attemptId, loading } = useIeltsSession(props);
    return <span>{loading ? 'loading' : (attemptId ?? 'no-session')}</span>;
}

/* Also shows the paper the hook hands to the screen, and its serialised form so
   the answer-key strip can be asserted here as well as in the take screen. */
function PaperProbe(props) {
    const { questions } = useIeltsSession(props);
    const first = questions[0];
    return (
        <>
            <span data-testid="question">{first?.questionText ?? 'no-paper'}</span>
            <span data-testid="passage">{first?.passageContent ?? 'no-passage'}</span>
            <span data-testid="serialised">{JSON.stringify(first ?? {})}</span>
        </>
    );
}

async function start(props) {
    render(<Probe {...props} />);
    /* The start happens in an effect, so wait for it to settle on a session. */
    await screen.findByText('a1');
}

describe('useIeltsSession start payloads', () => {
    it('starts a full test with the test id and no scope id', async () => {
        await start({ testId: 't1', attemptMode: 'FULL', scopeType: 'TEST' });

        expect(startSession).toHaveBeenCalledWith({ attemptMode: 'FULL', scopeType: 'TEST', testId: 't1' });
    });

    it('keeps the scope id, so a passage practice is the passage and not the whole paper', async () => {
        await start({ testId: 't1', attemptMode: 'QUICK', scopeType: 'PASSAGE', scopeId: 'p1' });

        expect(startSession).toHaveBeenCalledWith({
            attemptMode: 'QUICK',
            scopeType: 'PASSAGE',
            testId: 't1',
            scopeId: 'p1',
        });
    });

    it('starts a question-type drill with NO test id at all', async () => {
        await start({
            attemptMode: 'QUICK',
            scopeType: 'QUESTION_TYPE',
            questionType: 'MATCHING_HEADINGS',
        });

        expect(startSession).toHaveBeenCalledWith({
            attemptMode: 'QUICK',
            scopeType: 'QUESTION_TYPE',
            questionType: 'MATCHING_HEADINGS',
        });
    });

    it('does not open a session when there is nothing to open', async () => {
        render(<Probe attemptMode="FULL" scopeType="TEST" />);

        expect(await screen.findByText('no-session')).toBeInTheDocument();
        expect(startSession).not.toHaveBeenCalled();
    });
});

/** A session payload in the backend's nested shape, carrying the markdown the real
    content carries. Measured over the seeded library — see utils/ielts.js. */
const SESSION_WITH_MARKDOWN = {
    data: {
        success: true,
        message: 'OK',
        data: {
            attemptId: 'a1',
            totalQuestions: 1,
            estimatedMinutes: 60,
            testDetail: {
                id: 't1',
                title: 'Paper',
                skill: 'READING',
                sections: [
                    {
                        id: 's1',
                        sectionOrder: 1,
                        title: 'Section 1',
                        passages: [
                            {
                                id: 'p1',
                                passageOrder: 1,
                                title: 'A passage',
                                content: 'Paragraph one.<br>\nParagraph two.',
                                questions: [
                                    {
                                        id: 'q1',
                                        questionOrder: 1,
                                        questionType: 'SENTENCE_COMPLETION',
                                        questionText: 'Complete this **bold** gap.<br>\nSecond line.',
                                        options: [],
                                        correctAnswers: ['the secret answer'],
                                        explanation: 'the secret explanation',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        },
    },
};

describe('useIeltsSession — the paper it hands to the screen', () => {
    it('normalises the literal <br> for the Markdown renderer', async () => {
        startSession.mockResolvedValue(SESSION_WITH_MARKDOWN);
        render(<PaperProbe testId="t1" attemptMode="FULL" scopeType="TEST" />);

        const question = await screen.findByTestId('question');

        // `<br>` is gone; the line break it stood for is a markdown hard break
        expect(question.textContent).toBe('Complete this **bold** gap.  \nSecond line.');
        expect(question.textContent).not.toContain('<br');
        expect(screen.getByTestId('passage').textContent).toBe('Paragraph one.  \nParagraph two.');

        // real markdown passes through, so the renderer can turn it into elements
        expect(question.textContent).toContain('**bold**');
    });

    it('still strips correctAnswers and explanation from the paper', async () => {
        startSession.mockResolvedValue(SESSION_WITH_MARKDOWN);
        render(<PaperProbe testId="t1" attemptMode="FULL" scopeType="TEST" />);

        const serialised = (await screen.findByTestId('serialised')).textContent;

        expect(serialised).not.toContain('correctAnswers');
        expect(serialised).not.toContain('explanation');
        expect(serialised).not.toContain('the secret answer');
    });
});
