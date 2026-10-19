import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The topic conversation — screens 24 (the mode on the card), 24b (the dialogue), 24c (its
 * result) and 24d (the history with two tabs).
 *
 * Every rule here was verified against the running backend first, so the tests pin the things
 * the API actually does rather than what a screen could plausibly do:
 *
 *  1. A turn row holds BOTH sides of the exchange, so the log pairs them and a resumed
 *     conversation rebuilds identically from `turns[]`.
 *  2. The last answer returns `conversationComplete: true` with a null question.
 *  3. Grading runs COMPLETED → GRADED, which is why the wait state polls on COMPLETED too.
 *  4. The conversation charge happens at start and is idempotent per topic, which is why the
 *     resume path and the restart button claim no cost.
 *  5. `lastTurn` is NOT on the detail response, so the button's "final question" label has to be
 *     derived from the topic's own follow-up count — otherwise a reload would mislabel it.
 */
const getTopics = vi.fn();
const getTopicById = vi.fn();
const getAttempts = vi.fn();
const getHighestScores = vi.fn();
const startConversation = vi.fn();
const submitTurn = vi.fn();
const getConversation = vi.fn();
const getConversations = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    speakingApi: {
        getTopics: (...a) => getTopics(...a),
        getTopicById: (...a) => getTopicById(...a),
        getAttempts: (...a) => getAttempts(...a),
        getHighestScores: (...a) => getHighestScores(...a),
        startConversation: (...a) => startConversation(...a),
        submitTurn: (...a) => submitTurn(...a),
        getConversation: (...a) => getConversation(...a),
        getConversations: (...a) => getConversations(...a),
    },
}));

/** The cost table is stubbed so the DISABLED case can be exercised: the backend can answer
 *  `mode: DISABLED` for every action, and the screens must then claim nothing about money. */
let creditCost = { cost: 1, mode: 'ENFORCE' };

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => creditCost, availableBalance: 12 }),
    };
});

/** The credit gate is exercised by its own tests; here it must simply let the call through. */
vi.mock('../../hooks/useCreditAction', () => ({
    default: () => ({
        costEntry: { cost: 1, mode: 'ENFORCE' },
        execute: async (operation) => ({ blocked: false, data: await operation() }),
    }),
}));

/** jsdom has no microphone and no speech synthesis, so the hook is a controllable double:
 *  pressing record sets `recording` for real, and the transcript can be typed into. */
const startRecordingMock = vi.fn();
const stopRecordingMock = vi.fn();
const cancelRecordingMock = vi.fn();
let recordingState = { recording: false, transcript: '', timer: 0 };

vi.mock('../../hooks/useSpeechRecording', async () => {
    const { useState } = await import('react');
    return {
        useSpeechRecording: () => {
            const [transcript, setTranscriptState] = useState(recordingState.transcript);
            const [, force] = useState(0);
            const bump = () => force((n) => n + 1);
            return {
                recording: recordingState.recording,
                transcript,
                setTranscript: (value) => {
                    recordingState = { ...recordingState, transcript: value };
                    setTranscriptState(value);
                },
                timer: recordingState.timer,
                sttSupported: true,
                audioChunksRef: { current: [] },
                startRecording: () => {
                    startRecordingMock();
                    recordingState = { ...recordingState, recording: true, transcript: '' };
                    setTranscriptState('');
                    bump();
                },
                stopRecording: () => {
                    stopRecordingMock();
                    recordingState = { ...recordingState, recording: false };
                    bump();
                },
                cancelRecording: () => {
                    cancelRecordingMock();
                    recordingState = { recording: false, transcript: '', timer: 0 };
                    setTranscriptState('');
                    bump();
                },
            };
        },
    };
});

const speakWithVoice = vi.fn().mockResolvedValue(undefined);
const stopSpeaking = vi.fn();
vi.mock('../../utils/ttsHelper', () => ({
    speak: (...a) => speakWithVoice(...a),
    speakWithVoice: (...a) => speakWithVoice(...a),
    stopSpeaking: (...a) => stopSpeaking(...a),
    speakEnglish: vi.fn(),
}));

const { i18nReady } = await import('../../i18n');
const { default: SpeakingListPage } = await import('./SpeakingListPage');
const { default: SpeakingConversationPage } = await import('./SpeakingConversationPage');
const { default: SpeakingConversationResultPage } = await import('./SpeakingConversationResultPage');
const { default: SpeakingHistoryPage } = await import('./SpeakingHistoryPage');
const {
    conversationLog,
    findRepeatedWords,
    answeredTurnCount,
    questionCount,
    totalExpectedQuestions,
    isConversationGrading,
    isConversationInProgress,
} = await import('../../features/speaking/useSpeakingConversation');

beforeAll(async () => {
    await i18nReady;
});

/* The api doubles are module-level, so a call made by one test would otherwise be visible to
   the next one — and `expect(startConversation).not.toHaveBeenCalled()` is exactly the kind of
   assertion that would then pass or fail for the wrong reason. */
beforeEach(() => {
    vi.clearAllMocks();
    recordingState = { recording: false, transcript: '', timer: 0 };
    creditCost = { cost: 1, mode: 'ENFORCE' };
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items) => envelope({ page: 0, size: 12, totalElements: items.length, totalPages: 1, items });

const PART_1_TOPIC = {
    id: 'topic-1',
    part: 'PART_1',
    question: 'Do you enjoy meeting new people?',
    difficulty: 'EASY',
    followUpQuestions: ['How often?', 'Who was the last person?'],
};

const PART_2_TOPIC = {
    id: 'topic-2',
    part: 'PART_2',
    question: 'Describe a book you enjoyed.',
    difficulty: 'HARD',
    followUpQuestions: [],
};

describe('the conversation log — one row per side of each exchange', () => {
    it('pairs the question with the answer that lives on the same turn row', () => {
        const rows = conversationLog([
            { id: 't1', turnNumber: 1, aiQuestion: 'Q1', userTranscript: 'A1', speechAnalytics: { wordCount: 3 } },
            { id: 't2', turnNumber: 2, aiQuestion: 'Q2', userTranscript: null },
        ]);

        expect(rows.map((row) => row.role)).toEqual(['ai', 'me', 'ai']);
        expect(rows[1]).toMatchObject({ text: 'A1', analytics: { wordCount: 3 } });
        // the pending question has no answer row yet
        expect(rows).toHaveLength(3);
    });

    it('marks a hint turn so the screen can draw it differently from a question', () => {
        const rows = conversationLog([{ id: 'h1', turnNumber: 2, aiQuestion: 'Try talking about frequency', turnType: 'HINT' }]);
        expect(rows[0].hint).toBe(true);
    });

    it('counts only questions, so a hint does not advance the counter', () => {
        const turns = [
            { aiQuestion: 'Q1', turnType: 'QUESTION' },
            { aiQuestion: 'Hint', turnType: 'HINT' },
            { aiQuestion: 'Q2', turnType: 'QUESTION' },
        ];
        expect(questionCount(turns)).toBe(2);
    });

    it('counts answered turns for the result and the history', () => {
        expect(
            answeredTurnCount([
                { userTranscript: 'a' },
                { userTranscript: '   ' },
                { userTranscript: null },
                { userTranscript: 'b' },
            ])
        ).toBe(2);
    });

    it('derives the total from the topic, the same formula the backend uses', () => {
        expect(totalExpectedQuestions({ followUpQuestions: ['a', 'b'] })).toBe(3);
        expect(totalExpectedQuestions({ followUpQuestions: [] })).toBe(1);
        expect(totalExpectedQuestions(null)).toBe(1);
    });
});

describe('findRepeatedWords — the highlight must not fire on a word used once', () => {
    it('finds a word used twice across the answers, ignoring case and punctuation', () => {
        const repeated = findRepeatedWords(['I love the harbour, honestly.', 'The HARBOUR at night is calm.']);
        expect(repeated.has('harbour')).toBe(true);
    });

    it('ignores a word that appears once, and words too short to be feedback', () => {
        const repeated = findRepeatedWords(['a very kind woman', 'and the very same day']);
        expect(repeated.has('kind')).toBe(false);
        expect(repeated.has('and')).toBe(false);
        expect(repeated.has('very')).toBe(true);
    });

    it('does not match a word inside another word', () => {
        const repeated = findRepeatedWords(['harbour', 'harbours']);
        expect(repeated.has('harbour')).toBe(false);
    });

    it('handles empty input', () => {
        expect(findRepeatedWords([]).size).toBe(0);
        expect(findRepeatedWords([null, '']).size).toBe(0);
    });
});

describe('conversation statuses', () => {
    it('treats COMPLETED as still-grading, because the grader has not finished', () => {
        expect(isConversationGrading('COMPLETED')).toBe(true);
        expect(isConversationGrading('GRADING')).toBe(true);
        expect(isConversationGrading('GRADED')).toBe(false);
    });

    it('knows an unfinished conversation from a finished one', () => {
        expect(isConversationInProgress('IN_PROGRESS')).toBe(true);
        expect(isConversationInProgress('COMPLETED')).toBe(false);
    });
});

describe('SpeakingListPage — two modes per topic', () => {
    function renderList() {
        return render(
            <MemoryRouter>
                <SpeakingListPage />
            </MemoryRouter>
        );
    }

    it('offers the conversation with its cost when the topic has never been talked through', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();

        /* The app renders cost amounts as a negative delta (`getCreditCostDisplay` returns
           `-1`), which is the existing convention on every cost button — the frame draws
           "1 credit" and the mismatch is recorded as an open question rather than fixed
           here, because it is app-wide rather than this screen's. */
        const link = await screen.findByRole('link', { name: /Hội thoại · -1 credit/ });
        expect(link).toHaveAttribute('href', '/speaking/conversation/topic-1');
    });

    it('DROPS the cost on a topic that already paid for a conversation', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(
            envelope([
                {
                    topicId: 'topic-1',
                    attempted: true,
                    conversationId: 'conv-1',
                    highestBandScore: 6,
                    status: 'GRADED',
                    sourceType: 'CONVERSATION',
                },
            ])
        );
        renderList();

        const link = await screen.findByRole('link', { name: /^Hội thoại$/ });
        expect(link).toHaveAttribute('href', '/speaking/conversation/topic-1');
        /* "Hội thoại" appears twice on purpose: once as the source chip beside the band, and
           once as the button that starts the next one. */
        expect(screen.getAllByText('Hội thoại')).toHaveLength(2);
        expect(screen.getByRole('link', { name: /Xem kết quả/ })).toHaveAttribute(
            'href',
            '/speaking/conversation/result/conv-1'
        );
    });

    it('continues an unfinished conversation instead of starting a second one', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(
            envelope([{ topicId: 'topic-1', attempted: true, conversationId: 'conv-9', status: 'IN_PROGRESS' }])
        );
        renderList();

        const link = await screen.findByRole('link', { name: /Tiếp tục hội thoại/ });
        expect(link).toHaveAttribute('href', '/speaking/conversation/resume/conv-9');
    });

    it('offers no conversation for a cue-card topic, because it has no follow-ups', async () => {
        getTopics.mockResolvedValue(page([PART_2_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();

        await screen.findByText(/Describe a book/);
        expect(screen.queryByRole('link', { name: /Hội thoại/ })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Luyện nói/ })).toBeInTheDocument();
    });

    it('states the credit rule for both modes above the list, when a cost is configured', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();

        expect(
            await screen.findByText(/Mỗi chủ đề chỉ trừ một lần cho mỗi chế độ/)
        ).toBeInTheDocument();
    });

    it('claims nothing about credit when the backend has the action DISABLED', async () => {
        /* Verified against the running backend: every action in the cost table can answer
           `mode: DISABLED` with a cost of 0, and nothing is charged. A rule line or a
           "· 1 credit" button would then be a claim about money that never moves. */
        creditCost = { cost: 0, mode: 'DISABLED' };
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();

        await screen.findByRole('link', { name: /^Hội thoại$/ });
        expect(screen.queryByText(/Mỗi chủ đề chỉ trừ một lần/)).not.toBeInTheDocument();
        expect(screen.queryByText(/credit$/)).not.toBeInTheDocument();
    });
});

describe('SpeakingConversationPage — 24b', () => {
    function renderConversation(path = '/speaking/conversation/topic-1') {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/speaking/conversation/:topicId" element={<SpeakingConversationPage />} />
                    <Route
                        path="/speaking/conversation/resume/:conversationId"
                        element={<SpeakingConversationPage />}
                    />
                    <Route
                        path="/speaking/conversation/result/:conversationId"
                        element={<SpeakingConversationResultPage />}
                    />
                    <Route path="/speaking" element={<p>topics</p>} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('starts the conversation once and shows the first question', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Do you enjoy meeting new people?',
                turnType: 'QUESTION',
                lastTurn: false,
                conversationComplete: false,
            })
        );
        recordingState = { recording: false, transcript: '', timer: 0 };

        renderConversation();

        expect((await screen.findAllByText(/Câu 1 \/ 3/)).length).toBeGreaterThan(0);
        expect(startConversation).toHaveBeenCalledWith('topic-1');
        expect(startConversation).toHaveBeenCalledTimes(1);
    });

    it('labels the final question from the topic, because the detail endpoint omits lastTurn', async () => {
        /* A resumed conversation: `ConversationResponse` has no `lastTurn`, so the button label
           is derived from the question count and the topic's follow-up count. */
        getConversation.mockResolvedValue(
            envelope({
                id: 'conv-3',
                topicId: 'topic-1',
                topicPart: 'PART_1',
                status: 'IN_PROGRESS',
                turns: [
                    { id: 't1', turnNumber: 1, aiQuestion: 'Q1', userTranscript: 'A1', turnType: 'QUESTION' },
                    { id: 't2', turnNumber: 2, aiQuestion: 'Q2', userTranscript: 'A2', turnType: 'QUESTION' },
                    { id: 't3', turnNumber: 3, aiQuestion: 'Q3', userTranscript: null, turnType: 'QUESTION' },
                ],
            })
        );
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        recordingState = { recording: false, transcript: '', timer: 0 };

        renderConversation('/speaking/conversation/resume/conv-3');

        expect((await screen.findAllByText(/Câu 3 \/ 3/)).length).toBeGreaterThan(0);
        expect(screen.getByRole('button', { name: /Trả lời câu cuối/ })).toBeInTheDocument();
        // continuing costs nothing, and the screen says so
        expect(screen.getByText(/không trừ thêm credit/)).toBeInTheDocument();
        // the seeded turns are rendered, not re-fetched
        expect(screen.getByText('A1')).toBeInTheDocument();
        expect(startConversation).not.toHaveBeenCalled();
    });

    it('sends the transcript with the duration and only the analytics the browser can measure', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Q1',
                turnType: 'QUESTION',
                lastTurn: false,
            })
        );
        submitTurn.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 2,
                aiQuestion: 'Q2',
                turnType: 'QUESTION',
                lastTurn: false,
                conversationComplete: false,
            })
        );
        recordingState = { recording: false, transcript: '', timer: 30 };

        renderConversation();
        await screen.findAllByText(/Câu 1 \/ 3/);

        /* Speak, stop, correct, send — the four presses a turn actually takes. */
        await userEvent.click(screen.getByRole('button', { name: /Ghi âm câu trả lời/ }));
        expect(startRecordingMock).toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button', { name: /Dừng và gửi/ }));
        expect(stopRecordingMock).toHaveBeenCalled();

        await userEvent.type(
            screen.getByRole('textbox'),
            'Yes, I enjoy meeting new people.'
        );
        await userEvent.click(screen.getByRole('button', { name: /Gửi câu trả lời/ }));

        await waitFor(() => expect(submitTurn).toHaveBeenCalledTimes(1));
        const [conversationId, body] = submitTurn.mock.calls[0];
        expect(conversationId).toBe('conv-1');
        expect(body.transcript).toBe('Yes, I enjoy meeting new people.');
        expect(body.timeSpentSeconds).toBe(30);
        expect(body.speechAnalytics.wordCount).toBe(6);
        /* The browser cannot measure pauses or word confidence, so they must not be sent —
           the result screen would otherwise print a fabricated metric. */
        expect(body.speechAnalytics).not.toHaveProperty('avgPauseDurationMs');
        expect(body.speechAnalytics).not.toHaveProperty('avgWordConfidence');
        expect(body.speechAnalytics).not.toHaveProperty('lowConfidenceWords');
    });

    it('refuses an empty transcript instead of spending a turn on nothing', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({ conversationId: 'conv-1', turnNumber: 1, aiQuestion: 'Q1', turnType: 'QUESTION' })
        );

        renderConversation();
        await screen.findAllByText(/Câu 1 \/ 3/);

        await userEvent.click(screen.getByRole('button', { name: /Ghi âm câu trả lời/ }));
        await userEvent.click(screen.getByRole('button', { name: /Dừng và gửi/ }));

        /* Nothing was recognised, so the submit control is disabled and no request goes out. */
        expect(screen.getByRole('button', { name: /Gửi câu trả lời/ })).toBeDisabled();
        expect(submitTurn).not.toHaveBeenCalled();
    });

    it('READS THE QUESTION ALOUD as soon as it appears, once per question', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Do you enjoy meeting new people?',
                turnType: 'QUESTION',
                lastTurn: false,
            })
        );

        renderConversation();
        await screen.findAllByText(/Câu 1 \/ 3/);

        /* The partner asks out loud: this screen is a listening task as much as a speaking one. */
        await waitFor(() =>
            expect(speakWithVoice).toHaveBeenCalledWith('Do you enjoy meeting new people?')
        );

        /* A RE-RENDER IS SILENT. Typing in the panel must not make her repeat the question. */
        await userEvent.click(screen.getByRole('button', { name: /Ghi âm câu trả lời/ }));
        await userEvent.click(screen.getByRole('button', { name: /Dừng và gửi/ }));
        await userEvent.type(screen.getByRole('textbox'), 'Yes, I do.');
        expect(speakWithVoice).toHaveBeenCalledTimes(1);
    });

    it('reads the NEXT question when a turn comes back', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Q1',
                turnType: 'QUESTION',
                lastTurn: false,
            })
        );
        submitTurn.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 2,
                aiQuestion: 'How often do you meet someone new?',
                turnType: 'QUESTION',
                lastTurn: true,
            })
        );

        renderConversation();
        await screen.findAllByText(/Câu 1 \/ 3/);

        await userEvent.click(screen.getByRole('button', { name: /Ghi âm câu trả lời/ }));
        await userEvent.click(screen.getByRole('button', { name: /Dừng và gửi/ }));
        await userEvent.type(screen.getByRole('textbox'), 'Yes, I do.');
        await userEvent.click(screen.getByRole('button', { name: /Gửi câu trả lời/ }));

        await waitFor(() =>
            expect(speakWithVoice).toHaveBeenCalledWith('How often do you meet someone new?')
        );
        expect(speakWithVoice).toHaveBeenCalledTimes(2);
    });

    it('reads the PENDING question when a conversation is resumed', async () => {
        getConversation.mockResolvedValue(
            envelope({
                id: 'conv-3',
                topicId: 'topic-1',
                topicPart: 'PART_1',
                status: 'IN_PROGRESS',
                turns: [
                    { id: 't1', turnNumber: 1, aiQuestion: 'Q1', userTranscript: 'A1', turnType: 'QUESTION' },
                    { id: 't2', turnNumber: 2, aiQuestion: 'Who did you meet last?', userTranscript: null, turnType: 'QUESTION' },
                ],
            })
        );
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));

        renderConversation('/speaking/conversation/resume/conv-3');

        await waitFor(() => expect(speakWithVoice).toHaveBeenCalledWith('Who did you meet last?'));
        /* The answered questions are not re-read: only the one awaiting an answer. */
        expect(speakWithVoice).toHaveBeenCalledTimes(1);
    });

    it('silences the partner before the microphone opens', async () => {
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        startConversation.mockResolvedValue(
            envelope({
                conversationId: 'conv-1',
                turnNumber: 1,
                aiQuestion: 'Q1',
                turnType: 'QUESTION',
                lastTurn: false,
            })
        );

        renderConversation();
        await screen.findAllByText(/Câu 1 \/ 3/);
        await userEvent.click(screen.getByRole('button', { name: /Ghi âm câu trả lời/ }));

        /* A voice from the speakers is a voice the microphone hears. */
        expect(stopSpeaking).toHaveBeenCalled();
        expect(startRecordingMock).toHaveBeenCalled();
    });

    it('routes to the result as soon as the last answer completes the conversation', async () => {
        getConversation.mockResolvedValue(
            envelope({
                id: 'conv-7',
                topicId: 'topic-1',
                topicPart: 'PART_1',
                status: 'COMPLETED',
                turns: [{ id: 't1', turnNumber: 1, aiQuestion: 'Q1', userTranscript: 'A1' }],
            })
        );
        getTopicById.mockResolvedValue(envelope(PART_1_TOPIC));
        renderConversation('/speaking/conversation/resume/conv-7');

        /* COMPLETED means the grader has the work, and the dialogue is not the place to wait. */
        expect(await screen.findByRole('heading', { name: /Band hội thoại|Lexi đang chấm/ })).toBeInTheDocument();
    });
});

describe('SpeakingConversationResultPage — 24c', () => {
    function renderResult() {
        return render(
            <MemoryRouter initialEntries={['/speaking/conversation/result/conv-1']}>
                <Routes>
                    <Route
                        path="/speaking/conversation/result/:conversationId"
                        element={<SpeakingConversationResultPage />}
                    />
                    <Route
                        path="/speaking/conversation/resume/:conversationId"
                        element={<p>resuming</p>}
                    />
                </Routes>
            </MemoryRouter>
        );
    }

    const GRADED = {
        id: 'conv-1',
        topicId: 'topic-1',
        topicQuestion: 'Do you enjoy meeting new people?',
        topicPart: 'PART_1',
        status: 'GRADED',
        totalTurns: 3,
        timeSpentSeconds: 192,
        fluencyScore: 6.5,
        lexicalScore: 6,
        grammarScore: 5.5,
        pronunciationScore: 6,
        overallBandScore: 6,
        aiFeedback: '## Điểm mạnh\n\n- Trả lời đúng trọng tâm.',
        turns: [
            {
                id: 't1',
                turnNumber: 1,
                aiQuestion: 'Do you enjoy meeting new people?',
                userTranscript: 'Yes, I do. I like meeting new people.',
                turnType: 'QUESTION',
                speechAnalytics: { wordCount: 9, wordsPerMinute: 142 },
            },
            {
                id: 't2',
                turnNumber: 2,
                aiQuestion: 'How often?',
                userTranscript: 'Maybe once a week, at work.',
                turnType: 'QUESTION',
                speechAnalytics: { wordCount: 6, wordsPerMinute: 120 },
            },
            {
                id: 't3',
                turnNumber: 3,
                aiQuestion: 'Who was the last person?',
                userTranscript: 'A very kind woman I met at a workshop.',
                turnType: 'QUESTION',
                speechAnalytics: { wordCount: 8, wordsPerMinute: 96 },
            },
        ],
    };

    it('draws the wait instead of a band while the grader works', async () => {
        getConversation.mockResolvedValue(
            envelope({ ...GRADED, status: 'COMPLETED', overallBandScore: null, turns: [] })
        );
        renderResult();

        expect(await screen.findByText('Lexi đang chấm hội thoại')).toBeInTheDocument();
        expect(screen.queryByText('Điểm theo tiêu chí')).not.toBeInTheDocument();
        expect(screen.queryByText('Nội dung đã chấm')).not.toBeInTheDocument();
    });

    it('shows the band, the four criteria and the dialogue with per-answer measurements', async () => {
        getConversation.mockResolvedValue(envelope(GRADED));
        renderResult();

        expect(await screen.findByText('Band hội thoại')).toBeInTheDocument();
        expect(screen.getByText(/3 lượt · 3 phút 12 giây/)).toBeInTheDocument();
        expect(
            screen.getByRole('progressbar', { name: /Độ trôi chảy \(Fluency\)/ })
        ).toBeInTheDocument();
        // the dialogue, not a monologue: each question is paired with its own answer
        expect(screen.getAllByText('Bạn trả lời')).toHaveLength(3);
        expect(screen.getByText('9 từ')).toBeInTheDocument();
        expect(screen.getByText('142 từ/phút')).toBeInTheDocument();
        expect(screen.getByText(/nhận dạng giọng nói có thể nghe sai/i)).toBeInTheDocument();
    });

    it('reports a failed grading with the one action that helps', async () => {
        getConversation.mockResolvedValue(envelope({ ...GRADED, status: 'FAILED', overallBandScore: null }));
        renderResult();

        expect(await screen.findByText('Không chấm được hội thoại này')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Hội thoại lại chủ đề này/ })
        ).toHaveAttribute('href', '/speaking/conversation/topic-1');
    });

    it('sends an unfinished conversation back to the dialogue rather than showing a result', async () => {
        getConversation.mockResolvedValue(
            envelope({ ...GRADED, status: 'IN_PROGRESS', overallBandScore: null })
        );
        renderResult();

        expect(await screen.findByText('resuming')).toBeInTheDocument();
    });
});

describe('SpeakingHistoryPage — 24d, two tabs over two endpoints', () => {
    function renderHistory(path = '/speaking/attempts') {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/speaking/attempts" element={<SpeakingHistoryPage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    const ATTEMPT = {
        id: 'att-1',
        topicQuestion: 'Talk about a prize',
        topicPart: 'PART_2',
        status: 'GRADED',
        overallBandScore: 5.5,
        timeSpentSeconds: 120,
        submittedAt: '2026-10-12 09:30:00',
    };

    const CONVERSATION = {
        id: 'conv-1',
        topicQuestion: 'Do you enjoy meeting new people?',
        topicPart: 'PART_1',
        status: 'GRADED',
        overallBandScore: 6,
        totalTurns: 3,
        startedAt: '2026-10-12 09:30:00',
    };

    it('lists the practice attempts on the default tab', async () => {
        getAttempts.mockResolvedValue(page([ATTEMPT]));
        getConversations.mockResolvedValue(page([CONVERSATION]));
        renderHistory();

        expect(await screen.findByText('Talk about a prize')).toBeInTheDocument();
        // the conversation lives on the other tab, not in this list
        expect(screen.queryByText('Do you enjoy meeting new people?')).not.toBeInTheDocument();
    });

    it('separates the conversations into their own tab, addressable by ?tab=', async () => {
        getAttempts.mockResolvedValue(page([ATTEMPT]));
        getConversations.mockResolvedValue(page([CONVERSATION]));
        renderHistory('/speaking/attempts?tab=conversation');

        expect(await screen.findByText('Do you enjoy meeting new people?')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Hội thoại' })).toHaveAttribute('aria-selected', 'true');
        // the row names the turn count, which an attempt does not have
        expect(screen.getByText('3 lượt')).toBeInTheDocument();
    });

    it('sends an unanswered conversation to the dialogue, labelled as a continuation', async () => {
        getAttempts.mockResolvedValue(page([]));
        getConversations.mockResolvedValue(
            page([{ ...CONVERSATION, status: 'IN_PROGRESS', overallBandScore: null }])
        );
        renderHistory('/speaking/attempts?tab=conversation');

        expect(await screen.findByText('Đang hội thoại')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tiếp tục/ })).toHaveAttribute(
            'href',
            '/speaking/conversation/resume/conv-1'
        );
    });

    it('has its own empty state per tab rather than one shared blank list', async () => {
        getAttempts.mockResolvedValue(page([ATTEMPT]));
        getConversations.mockResolvedValue(page([]));
        renderHistory('/speaking/attempts?tab=conversation');

        expect(await screen.findByText('Chưa có cuộc hội thoại nào')).toBeInTheDocument();
    });

    it('reloads only the tab that failed', async () => {
        getAttempts.mockResolvedValue(page([ATTEMPT]));
        getConversations.mockRejectedValue(new Error('boom'));
        renderHistory('/speaking/attempts?tab=conversation');

        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
        expect(screen.queryByText('Talk about a prize')).not.toBeInTheDocument();
    });
});
