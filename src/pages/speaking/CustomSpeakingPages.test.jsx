import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * Custom speaking conversation, and the four verified facts it depends on:
 *
 *  - **`turn` returns the NEXT AI message, not an echo**, so one request per turn.
 *  - **`maxUserTurns` comes back as 50**, even though the backend's own env var says 10.
 *    The UI must read it from the response rather than hard-code either number.
 *  - **After `/finish` the status is `GRADING`, not `COMPLETED`**, so the result must not
 *    render a null band as a score.
 *  - **`gradingEnabled` is a per-conversation choice**, and with it off the scores stay
 *    null by design. That is a practice conversation, not a failure.
 */
const startCustomConversation = vi.fn();
const submitCustomConversationTurn = vi.fn();
const finishCustomConversation = vi.fn();
const getCustomConversation = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    speakingApi: {
        startCustomConversation: (...a) => startCustomConversation(...a),
        submitCustomConversationTurn: (...a) => submitCustomConversationTurn(...a),
        finishCustomConversation: (...a) => finishCustomConversation(...a),
        getCustomConversation: (...a) => getCustomConversation(...a),
        getCustomConversations: vi.fn().mockResolvedValue({ data: { data: { items: [] } } }),
    },
}));

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => ({ cost: 1, mode: 'ENFORCE' }), availableBalance: 12 }),
    };
});

vi.mock('../../hooks/useSpeechRecording', () => ({
    useSpeechRecording: () => ({
        recording: false,
        transcript: '',
        setTranscript: vi.fn(),
        timer: 12,
        sttSupported: true,
        audioChunksRef: { current: [] },
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
    }),
}));

const { i18nReady } = await import('../../i18n');
const { default: CustomSpeakingPage } = await import('./CustomSpeakingPage');
const { default: CustomSpeakingResultPage } = await import('./CustomSpeakingResultPage');

beforeAll(async () => {
    await i18nReady;
});

/**
 * Mocks are cleared per test. Without this, mock.calls[0] in one test can be a call
 * recorded by an earlier one, which makes a passing assertion look like a failure —
 * exactly what happened here before this was added.
 */
beforeEach(() => {
    vi.clearAllMocks();
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** The real `/start` and `/turn` response shape. */
const step = (over = {}) => ({
    conversationId: 'c1',
    title: 'Trips That Stay With You',
    turnNumber: 1,
    aiMessage: 'What is the one trip you still think about?',
    conversationComplete: false,
    gradingEnabled: true,
    status: 'IN_PROGRESS',
    userTurnCount: 0,
    maxUserTurns: 50,
    voiceName: 'US_NEURAL_F',
    ...over,
});

function renderSetup() {
    return render(
        <MemoryRouter initialEntries={['/custom-speaking']}>
            <Routes>
                <Route path="/custom-speaking" element={<CustomSpeakingPage />} />
                <Route path="/custom-speaking/:conversationId" element={<div>result route</div>} />
            </Routes>
        </MemoryRouter>
    );
}

function renderResult() {
    return render(
        <MemoryRouter initialEntries={['/custom-speaking/c1']}>
            <Routes>
                <Route path="/custom-speaking/:conversationId" element={<CustomSpeakingResultPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('CustomSpeakingPage — set-up', () => {
    it('requires a topic, because the API marks it @NotBlank', async () => {
        renderSetup();
        const start = await screen.findByRole('button', { name: /Bắt đầu hội thoại/ });
        expect(start).toBeDisabled();
    });

    it('sends every field the API requires', async () => {
        startCustomConversation.mockResolvedValue(envelope(step()));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel stories');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));

        await waitFor(() => expect(startCustomConversation).toHaveBeenCalled());
        const payload = startCustomConversation.mock.calls[0][0];
        expect(payload).toMatchObject({
            topic: 'Travel stories',
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'GENERAL',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        });
    });

    it('exposes the enums as the backend defines them, including the edgier ones', async () => {
        /* Curating the list would hide options the API accepts. */
        renderSetup();
        /* Labels repeat ACROSS groups — 'Thẳng thắn' is both a style and a personality,
           and so is 'Tán tỉnh' — so counts, not singular queries. */
        expect((await screen.findAllByRole('button', { name: 'Thẳng thắn' })).length).toBe(2);
        expect(screen.getAllByRole('button', { name: 'Tán tỉnh' }).length).toBe(2);
        expect(screen.getByRole('button', { name: 'Nổi loạn' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gai góc' })).toBeInTheDocument();
    });

    it('shows the cost per turn and the balance before starting', async () => {
        renderSetup();
        expect(await screen.findByText(/Mỗi lượt · -1 credit/)).toBeInTheDocument();
        expect(screen.getByText('Còn 12 credit')).toBeInTheDocument();
    });

    it('lets grading be turned off, and says what that means', async () => {
        renderSetup();
        const toggle = await screen.findByRole('switch', { name: /Chấm điểm hội thoại này/ });
        expect(toggle).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByText(/không tốn thêm gì/)).toBeInTheDocument();
    });
});

describe('CustomSpeakingPage — the chat', () => {
    it('shows Lexi opening message after starting', async () => {
        startCustomConversation.mockResolvedValue(envelope(step()));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));

        expect(await screen.findByText(/one trip you still think about/)).toBeInTheDocument();
    });

    it('reads maxUserTurns from the RESPONSE, not a hard-coded number', async () => {
        startCustomConversation.mockResolvedValue(envelope(step({ maxUserTurns: 50 })));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));

        /* 50, not the 10 the backend env var suggests. */
        expect(await screen.findByText(/còn 50 lượt/)).toBeInTheDocument();
    });

    it('sends a turn and renders the NEXT AI message from the same response', async () => {
        /* One request per turn: `turn` returns the reply, so there is no separate poll. */
        startCustomConversation.mockResolvedValue(envelope(step()));
        submitCustomConversationTurn.mockResolvedValue(
            envelope(step({ turnNumber: 2, aiMessage: 'That sounds like my kind of trip.', userTurnCount: 1 }))
        );
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));

        await user.type(await screen.findByPlaceholderText(/Trả lời Lexi/), 'I love coastal towns.');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(submitCustomConversationTurn).toHaveBeenCalled());
        expect(submitCustomConversationTurn.mock.calls[0][0]).toBe('c1');
        expect(await screen.findByText(/my kind of trip/)).toBeInTheDocument();
        /* and the user's own line is still in the log */
        expect(screen.getByText('I love coastal towns.')).toBeInTheDocument();
    });

    it('sends only analytics the browser can measure', async () => {
        /* No invented pause durations or word confidence, same rule as the Speaking module. */
        startCustomConversation.mockResolvedValue(envelope(step()));
        submitCustomConversationTurn.mockResolvedValue(envelope(step({ turnNumber: 2 })));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));
        await user.type(await screen.findByPlaceholderText(/Trả lời Lexi/), 'one two three');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(submitCustomConversationTurn).toHaveBeenCalled());
        const payload = submitCustomConversationTurn.mock.calls[0][1];
        expect(payload.speechAnalytics.wordCount).toBe(3);
        expect(payload.speechAnalytics).not.toHaveProperty('avgPauseDurationMs');
        expect(payload.speechAnalytics).not.toHaveProperty('avgWordConfidence');
    });

    it('states the cost a second time under the composer', async () => {
        startCustomConversation.mockResolvedValue(envelope(step()));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));

        expect(await screen.findByText(/Mỗi lượt AI tốn -1 credit · còn 12 credit/)).toBeInTheDocument();
    });

    it('finishes the conversation and navigates to the result', async () => {
        startCustomConversation.mockResolvedValue(envelope(step()));
        finishCustomConversation.mockResolvedValue(envelope(step({ status: 'GRADING', conversationComplete: true })));
        const user = userEvent.setup();
        renderSetup();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel');
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại/ }));
        await user.click(await screen.findByRole('button', { name: /Kết thúc/ }));

        await waitFor(() => expect(finishCustomConversation).toHaveBeenCalledWith('c1'));
        expect(await screen.findByText('result route')).toBeInTheDocument();
    });
});

describe('CustomSpeakingResultPage', () => {
    const GRADED = {
        id: 'c1',
        title: 'Trips That Stay With You',
        topic: 'Travel',
        status: 'COMPLETED',
        gradingEnabled: true,
        maxUserTurns: 50,
        userTurnCount: 4,
        totalTurns: 9,
        timeSpentSeconds: 300,
        fluencyScore: 6,
        vocabularyScore: 6.5,
        coherenceScore: 5.5,
        pronunciationScore: 6,
        overallScore: 6,
        aiFeedback: '## Feedback\n\n**Good range.**',
        turns: [
            { id: 't1', turnNumber: 1, aiMessage: 'What is the one trip you still think about?', userTranscript: 'A fishing village.' },
        ],
    };

    it('says it is marking, and shows NO band while GRADING', async () => {
        /* /finish returns GRADING, not COMPLETED, so a null band must not look like a
           score. */
        getCustomConversation.mockResolvedValue(envelope({ ...GRADED, status: 'GRADING', overallScore: null, aiFeedback: null }));
        renderResult();

        expect(await screen.findByText('Đang chấm hội thoại')).toBeInTheDocument();
        expect(screen.queryByText('Điểm tổng')).not.toBeInTheDocument();
    });

    it('renders the scores once marked', async () => {
        getCustomConversation.mockResolvedValue(envelope(GRADED));
        renderResult();

        expect(await screen.findByText('Điểm tổng')).toBeInTheDocument();
        /* 6.0 is the overall AND two criteria, so the singular query is ambiguous. */
        expect(screen.getAllByText('6.0').length).toBeGreaterThan(0);
        expect(screen.getByText('6.5')).toBeInTheDocument();
        /* feedback renders as markdown */
        expect(await screen.findByText('Feedback')).toBeInTheDocument();
    });

    it('says plainly that an unmarked conversation has no score, rather than failing', async () => {
        /* gradingEnabled false is a CHOICE; the scores stay null by design. */
        getCustomConversation.mockResolvedValue(
            envelope({ ...GRADED, gradingEnabled: false, status: 'COMPLETED', overallScore: null, aiFeedback: null })
        );
        renderResult();

        const note = await screen.findByText(/Bạn đã tắt chấm điểm cho hội thoại này/);
        expect(note.textContent).toMatch(/không phải lỗi/);
        expect(screen.queryByText('Điểm tổng')).not.toBeInTheDocument();
    });

    it('shows the transcript with both speakers, in order', async () => {
        getCustomConversation.mockResolvedValue(envelope(GRADED));
        renderResult();

        expect(await screen.findByText('Nội dung hội thoại')).toBeInTheDocument();
        expect(screen.getByText(/one trip you still think about/)).toBeInTheDocument();
        expect(screen.getByText(/A fishing village/)).toBeInTheDocument();
    });
});
