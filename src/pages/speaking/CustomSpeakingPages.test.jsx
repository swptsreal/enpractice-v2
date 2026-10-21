import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * Custom speaking, screens 27–27e, and the facts they depend on:
 *
 *  - a template is a whole configuration (six fields), so one press starts the conversation;
 *  - the charge is `SPEAKING_START`, taken once at start — not `AI_CHAT` per turn;
 *  - the conversation lives on the server: `turns[]` rebuild the log, and a reload resumes;
 *  - `turn` returns the NEXT AI message, and `maxUserTurns` comes from the response;
 *  - after `/finish` the status is `GRADING`, so a null band is a wait, not a score;
 *  - `gradingEnabled: false` is a choice, not a failure.
 */
const startCustomConversation = vi.fn();
const submitCustomConversationTurn = vi.fn();
const finishCustomConversation = vi.fn();
const getCustomConversation = vi.fn();
const getCustomConversations = vi.fn();
const getCustomSpeakingTemplates = vi.fn();
const getCustomSpeakingTemplate = vi.fn();
const createCustomSpeakingTemplate = vi.fn();
const deleteCustomSpeakingTemplate = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    speakingApi: {
        startCustomConversation: (...a) => startCustomConversation(...a),
        submitCustomConversationTurn: (...a) => submitCustomConversationTurn(...a),
        finishCustomConversation: (...a) => finishCustomConversation(...a),
        getCustomConversation: (...a) => getCustomConversation(...a),
        getCustomConversations: (...a) => getCustomConversations(...a),
        getCustomSpeakingTemplates: (...a) => getCustomSpeakingTemplates(...a),
        getCustomSpeakingTemplate: (...a) => getCustomSpeakingTemplate(...a),
        createCustomSpeakingTemplate: (...a) => createCustomSpeakingTemplate(...a),
        deleteCustomSpeakingTemplate: (...a) => deleteCustomSpeakingTemplate(...a),
    },
}));

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({
            getCost: () => ({ cost: 1, mode: 'ENFORCE' }),
            availableBalance: 12,
            refreshBalance: vi.fn(),
        }),
    };
});

/* The screens are about what they send and render, not about the credit precheck; the real hook
   is exercised by the Speaking module's own tests. */
vi.mock('../../hooks/useCreditAction', () => ({
    default: () => ({
        execute: async (operation) => ({ blocked: false, data: await operation() }),
        precheck: async () => true,
    }),
}));

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
const { default: CustomSpeakingConversationPage } = await import('./CustomSpeakingConversationPage');
const { default: CustomSpeakingHistoryPage } = await import('./CustomSpeakingHistoryPage');
const { default: CustomSpeakingResultPage } = await import('./CustomSpeakingResultPage');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    vi.clearAllMocks();
    getCustomConversations.mockResolvedValue(envelope(page([], 0)));
    getCustomSpeakingTemplates.mockResolvedValue(envelope([]));
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items, total = items.length) => ({
    items,
    page: 0,
    size: 10,
    totalElements: total,
    totalPages: Math.ceil(total / 10),
});

const template = (over = {}) => ({
    id: 't1',
    source: 'SYSTEM',
    group: 'IELTS',
    level: 'B1',
    title: 'Nơi bạn lớn lên',
    summary: 'Nơi lớn lên, điều bạn thích và cách nơi đó đã thay đổi.',
    topic: 'IELTS Speaking Part 1: your hometown.',
    style: 'CASUAL',
    personality: 'FRIENDLY',
    expertise: 'EDUCATION',
    voiceName: 'US_NEURAL_F',
    gradingEnabled: true,
    ...over,
});

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

/** The detail endpoint: turns carry the partner's line AND the learner's answer. */
const conversation = (over = {}) => ({
    id: 'c1',
    title: 'Trips That Stay With You',
    topic: 'Travel',
    status: 'IN_PROGRESS',
    gradingEnabled: true,
    maxUserTurns: 50,
    userTurnCount: 1,
    totalTurns: 3,
    turns: [
        { id: 'turn1', turnNumber: 1, aiMessage: 'What is the one trip you still think about?', userTranscript: 'A fishing village.' },
        { id: 'turn2', turnNumber: 2, aiMessage: 'What made it stay with you?', userTranscript: null },
    ],
    ...over,
});

function renderPage(path = '/custom-speaking') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/custom-speaking" element={<CustomSpeakingPage />} />
                <Route path="/custom-speaking/history" element={<div>history route</div>} />
                <Route path="/custom-speaking/conversation/:conversationId" element={<div>chat route</div>} />
                <Route path="/custom-speaking/:conversationId" element={<div>result route</div>} />
            </Routes>
        </MemoryRouter>
    );
}

function renderChat() {
    return render(
        <MemoryRouter initialEntries={['/custom-speaking/conversation/c1']}>
            <Routes>
                <Route path="/custom-speaking/conversation/:conversationId" element={<CustomSpeakingConversationPage />} />
                <Route path="/custom-speaking/:conversationId" element={<div>result route</div>} />
                <Route path="/custom-speaking" element={<div>gallery route</div>} />
            </Routes>
        </MemoryRouter>
    );
}

function renderHistory() {
    return render(
        <MemoryRouter initialEntries={['/custom-speaking/history']}>
            <Routes>
                <Route path="/custom-speaking/history" element={<CustomSpeakingHistoryPage />} />
                <Route path="/custom-speaking/conversation/:conversationId" element={<div>chat route</div>} />
                <Route path="/custom-speaking/:conversationId" element={<div>result route</div>} />
                <Route path="/custom-speaking" element={<div>gallery route</div>} />
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

const OWN_TEMPLATE = template({
    id: 'mine-1',
    source: 'USER',
    group: 'DAILY',
    level: 'B2',
    title: 'Phỏng vấn ở công ty công nghệ',
    summary: null,
    topic: 'A job interview at a software company: your projects, teamwork, and why you want this role.',
    style: 'PROFESSIONAL',
    personality: 'CONFIDENT',
    expertise: 'BUSINESS',
    voiceName: 'US_NEURAL_J',
});

describe('CustomSpeakingPage — form beside the template list', () => {
    it('draws the templates and states the price on the start action', async () => {
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE, template()]));
        renderPage();

        expect(await screen.findByText('Nơi bạn lớn lên')).toBeInTheDocument();
        expect(screen.getByText('Mỗi hội thoại trừ 1 credit khi bắt đầu.')).toBeInTheDocument();
        expect(screen.getByText('Còn 12 credit')).toBeInTheDocument();
        expect(screen.queryByText(/Mỗi lượt/)).not.toBeInTheDocument();
    });

    it('"Dùng" fills all six fields and does NOT start or charge anything', async () => {
        const ielts = template();
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE, ielts]));
        const user = userEvent.setup();
        renderPage();

        /* The list opens on IELTS, so its row is the one on screen. */
        const useButtons = await screen.findAllByRole('button', { name: 'Dùng' });
        await user.click(useButtons[0]);

        expect(screen.getByPlaceholderText(/du lịch bụi/)).toHaveValue(ielts.topic);
        expect(screen.getByRole('button', { name: 'Thân mật' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Thân thiện' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Giáo dục' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Nữ trẻ' })).toHaveAttribute('aria-pressed', 'true');
        /* The row now says which configuration is in the form, and still one control. */
        expect(screen.getByRole('button', { name: 'Đang dùng' })).toBeDisabled();
        expect(startCustomConversation).not.toHaveBeenCalled();
    });

    it('starts with the applied configuration when the start button is pressed', async () => {
        const ielts = template();
        getCustomSpeakingTemplates.mockResolvedValue(envelope([ielts]));
        startCustomConversation.mockResolvedValue(envelope(step()));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: 'Dùng' }));
        await user.click(screen.getByRole('button', { name: /Bắt đầu hội thoại · 1 credit/ }));

        await waitFor(() => expect(startCustomConversation).toHaveBeenCalled());
        expect(startCustomConversation.mock.calls[0][0]).toMatchObject({
            topic: ielts.topic,
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'EDUCATION',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        });
        expect(await screen.findByText('chat route')).toBeInTheDocument();
    });

    it('requires a topic, because the API marks it @NotBlank', async () => {
        renderPage();
        expect(await screen.findByRole('button', { name: /Bắt đầu hội thoại · 1 credit/ })).toBeDisabled();
    });

    it('exposes the enums as the backend defines them, including the edgier ones', async () => {
        renderPage();
        expect((await screen.findAllByRole('button', { name: 'Thẳng thắn' })).length).toBe(2);
        expect(screen.getAllByRole('button', { name: 'Tán tỉnh' }).length).toBe(2);
        expect(screen.getByRole('button', { name: 'Nổi loạn' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Gai góc' })).toBeInTheDocument();
    });

    it('lets grading be turned off, and says what that means', async () => {
        renderPage();
        const toggle = await screen.findByRole('switch', { name: /Chấm điểm hội thoại này/ });
        expect(toggle).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByText(/không tốn thêm gì/)).toBeInTheDocument();
    });

    it('prefills from ?templateId= and marks that row as in use', async () => {
        const ielts = template();
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE, ielts]));
        getCustomSpeakingTemplate.mockResolvedValue(envelope(ielts));
        renderPage('/custom-speaking?templateId=t1');

        const input = await screen.findByPlaceholderText(/du lịch bụi/);
        await waitFor(() => expect(input).toHaveValue(ielts.topic));
        expect(await screen.findByRole('button', { name: 'Đang dùng' })).toBeDisabled();
        expect(getCustomSpeakingTemplate).toHaveBeenCalledWith('t1');
    });

    it('saves the configuration under a name, once the name is there', async () => {
        const user = userEvent.setup();
        createCustomSpeakingTemplate.mockResolvedValue(envelope(template({ source: 'USER' })));
        renderPage();

        await user.type(await screen.findByPlaceholderText(/du lịch bụi/), 'Travel stories');
        await user.click(screen.getByRole('button', { name: 'Lưu' }));
        expect(createCustomSpeakingTemplate).not.toHaveBeenCalled();
        expect(screen.getByText('Đặt tên cho template trước khi lưu.')).toBeInTheDocument();

        await user.type(screen.getByLabelText('Tên template'), 'Chuyến đi của tôi');
        await user.click(screen.getByRole('button', { name: 'Lưu' }));

        await waitFor(() => expect(createCustomSpeakingTemplate).toHaveBeenCalled());
        expect(createCustomSpeakingTemplate.mock.calls[0][0]).toMatchObject({
            title: 'Chuyến đi của tôi',
            topic: 'Travel stories',
            style: 'CASUAL',
            personality: 'FRIENDLY',
            expertise: 'GENERAL',
            voiceName: 'US_NEURAL_F',
            gradingEnabled: true,
        });
        expect(await screen.findByRole('button', { name: /Đã lưu/ })).toBeDisabled();
    });

    it('keeps the applied template shelf when the configuration is saved as a copy', async () => {
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE]));
        createCustomSpeakingTemplate.mockResolvedValue(envelope(template({ source: 'USER' })));
        const user = userEvent.setup();
        renderPage();

        /* The list opens on IELTS, so the own (DAILY) template is reached through its filter. */
        await user.click(await screen.findByRole('button', { name: 'Của tôi' }));
        await user.click(await screen.findByRole('button', { name: 'Dùng' }));
        await user.type(screen.getByLabelText('Tên template'), 'Bản sao phỏng vấn');
        await user.click(screen.getByRole('button', { name: 'Lưu' }));

        await waitFor(() => expect(createCustomSpeakingTemplate).toHaveBeenCalled());
        expect(createCustomSpeakingTemplate.mock.calls[0][0]).toMatchObject({
            title: 'Bản sao phỏng vấn',
            topic: OWN_TEMPLATE.topic,
            group: 'DAILY',
            level: 'B2',
        });
    });

    it('opens on IELTS, has no "Tất cả" tab, and filters to the learner\'s own templates', async () => {
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE, template()]));
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText('Nơi bạn lớn lên')).toBeInTheDocument();
        expect(screen.queryByText('Phỏng vấn ở công ty công nghệ')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Tất cả' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'IELTS' })).toHaveAttribute('aria-pressed', 'true');

        await user.click(screen.getByRole('button', { name: 'Của tôi' }));

        expect(screen.getByText('Phỏng vấn ở công ty công nghệ')).toBeInTheDocument();
        expect(screen.queryByText('Nơi bạn lớn lên')).not.toBeInTheDocument();
        expect(getCustomSpeakingTemplates).toHaveBeenCalledTimes(1);
    });

    it('deletes a saved template only after the confirmation', async () => {
        getCustomSpeakingTemplates.mockResolvedValue(envelope([OWN_TEMPLATE]));
        deleteCustomSpeakingTemplate.mockResolvedValue(envelope(null));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: 'Của tôi' }));
        await user.click(await screen.findByRole('button', { name: 'Xoá template' }));
        expect(screen.getByText('Xoá template này?')).toBeInTheDocument();
        expect(deleteCustomSpeakingTemplate).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Xoá' }));
        await waitFor(() => expect(deleteCustomSpeakingTemplate).toHaveBeenCalledWith('mine-1'));
    });
});

describe('CustomSpeakingConversationPage — the chat', () => {
    it('rebuilds the log from turns, so a reload resumes where it stopped', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation()));
        renderChat();

        expect(await screen.findByText(/one trip you still think about/)).toBeInTheDocument();
        expect(screen.getByText('A fishing village.')).toBeInTheDocument();
        expect(screen.getByText('What made it stay with you?')).toBeInTheDocument();
    });

    it('reads maxUserTurns from the response, not a hard-coded number', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation({ userTurnCount: 0, maxUserTurns: 50 })));
        renderChat();

        expect(await screen.findByText(/còn 50 lượt/)).toBeInTheDocument();
    });

    it('sends a turn and renders the NEXT AI message from the same response', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation()));
        submitCustomConversationTurn.mockResolvedValue(
            envelope(step({ turnNumber: 2, aiMessage: 'That sounds like my kind of trip.', userTurnCount: 2 }))
        );
        const user = userEvent.setup();
        renderChat();

        await user.type(await screen.findByPlaceholderText(/Trả lời Lexi/), 'I love coastal towns.');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(submitCustomConversationTurn).toHaveBeenCalled());
        expect(submitCustomConversationTurn.mock.calls[0][0]).toBe('c1');
        expect(await screen.findByText(/my kind of trip/)).toBeInTheDocument();
        expect(screen.getByText('I love coastal towns.')).toBeInTheDocument();
    });

    it('sends only analytics the browser can measure', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation()));
        submitCustomConversationTurn.mockResolvedValue(envelope(step({ turnNumber: 2 })));
        const user = userEvent.setup();
        renderChat();

        await user.type(await screen.findByPlaceholderText(/Trả lời Lexi/), 'one two three');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(submitCustomConversationTurn).toHaveBeenCalled());
        const payload = submitCustomConversationTurn.mock.calls[0][1];
        expect(payload.speechAnalytics.wordCount).toBe(3);
        expect(payload.speechAnalytics).not.toHaveProperty('avgPauseDurationMs');
        expect(payload.speechAnalytics).not.toHaveProperty('avgWordConfidence');
    });

    it('says the conversation was charged at the start, and prices no turn', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation()));
        renderChat();

        expect(await screen.findByText(/đã trừ 1 credit khi bắt đầu · còn 12 credit/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gửi/ }).textContent).not.toMatch(/credit/);
    });

    it('finishes the conversation and navigates to the result', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation()));
        finishCustomConversation.mockResolvedValue(envelope(step({ status: 'GRADING', conversationComplete: true })));
        const user = userEvent.setup();
        renderChat();

        await user.click(await screen.findByRole('button', { name: 'Kết thúc' }));

        await waitFor(() => expect(finishCustomConversation).toHaveBeenCalledWith('c1'));
        expect(await screen.findByText('result route')).toBeInTheDocument();
    });

    it('a conversation that is already finished opens its result, not an empty chat', async () => {
        getCustomConversation.mockResolvedValue(envelope(conversation({ status: 'GRADED' })));
        renderChat();

        expect(await screen.findByText('result route')).toBeInTheDocument();
    });
});

describe('CustomSpeakingHistoryPage', () => {
    it('opens an unfinished conversation where it stopped', async () => {
        getCustomConversations.mockResolvedValue(
            envelope(
                page([
                    {
                        id: 'c1',
                        title: 'Weekend plans',
                        topic: 'weekend plans',
                        status: 'IN_PROGRESS',
                        userTurnCount: 2,
                        startedAt: '2026-10-12T10:00:00Z',
                        style: 'PLAYFUL',
                        personality: 'HUMOROUS',
                        expertise: 'GENERAL',
                    },
                ])
            )
        );
        const user = userEvent.setup();
        renderHistory();

        expect(await screen.findByText('Weekend plans')).toBeInTheDocument();
        expect(screen.getByText('Đang hội thoại')).toBeInTheDocument();
        await user.click(screen.getByText('Weekend plans'));

        expect(await screen.findByText('chat route')).toBeInTheDocument();
    });

    it('opens the result for a graded conversation and shows its band', async () => {
        getCustomConversations.mockResolvedValue(
            envelope(
                page([
                    {
                        id: 'c2',
                        title: 'Talking about sustainable travel',
                        topic: 'sustainable travel',
                        status: 'GRADED',
                        userTurnCount: 4,
                        overallScore: 6,
                        startedAt: '2026-10-12T10:00:00Z',
                        style: 'CASUAL',
                        personality: 'PATIENT',
                        expertise: 'TRAVEL',
                    },
                ])
            )
        );
        const user = userEvent.setup();
        renderHistory();

        expect(await screen.findByText('6.0')).toBeInTheDocument();
        await user.click(screen.getByText('Talking about sustainable travel'));

        expect(await screen.findByText('result route')).toBeInTheDocument();
    });

    it('names the empty list instead of drawing a blank page', async () => {
        renderHistory();
        expect(await screen.findByText('Chưa có hội thoại nào')).toBeInTheDocument();
    });
});

describe('CustomSpeakingResultPage', () => {
    const GRADED = conversation({
        status: 'GRADED',
        userTurnCount: 4,
        totalTurns: 9,
        timeSpentSeconds: 300,
        fluencyScore: 6,
        vocabularyScore: 6.5,
        coherenceScore: 5.5,
        pronunciationScore: 6,
        overallScore: 6,
        aiFeedback: '## Feedback\n\n**Good range.**',
        completedAt: '2026-10-12T10:00:00Z',
    });

    it('says it is marking, and shows NO band while GRADING', async () => {
        getCustomConversation.mockResolvedValue(envelope({ ...GRADED, status: 'GRADING', overallScore: null, aiFeedback: null }));
        renderResult();

        expect(await screen.findByText('Đang chấm hội thoại')).toBeInTheDocument();
        expect(screen.queryByText('Điểm tổng')).not.toBeInTheDocument();
    });

    it('renders the scores once marked', async () => {
        getCustomConversation.mockResolvedValue(envelope(GRADED));
        renderResult();

        expect(await screen.findByText('Điểm tổng')).toBeInTheDocument();
        expect(screen.getAllByText('6.0').length).toBeGreaterThan(0);
        expect(screen.getByText('6.5')).toBeInTheDocument();
        expect(await screen.findByText('Feedback')).toBeInTheDocument();
        /* The finish stat is a date, not a raw timestamp. */
        expect(screen.queryByText(/2026-10-12T/)).not.toBeInTheDocument();
    });

    it('says plainly that an unmarked conversation has no score, rather than failing', async () => {
        getCustomConversation.mockResolvedValue(
            envelope({ ...GRADED, gradingEnabled: false, status: 'COMPLETED', overallScore: null, aiFeedback: null })
        );
        renderResult();

        const note = await screen.findByText(/Bạn đã tắt chấm điểm cho hội thoại này/);
        expect(note.textContent).toMatch(/không phải lỗi/);
        expect(screen.queryByText('Điểm tổng')).not.toBeInTheDocument();
    });

    it('says grading failed instead of leaving the screen blank', async () => {
        getCustomConversation.mockResolvedValue(
            envelope({ ...GRADED, status: 'FAILED', overallScore: null, aiFeedback: null })
        );
        renderResult();

        expect(await screen.findByText('Chấm điểm thất bại')).toBeInTheDocument();
        expect(screen.queryByText('Điểm tổng')).not.toBeInTheDocument();
        /* The transcript is still the substance. */
        expect(screen.getByText(/one trip you still think about/)).toBeInTheDocument();
    });

    it('shows the transcript with both speakers, in order', async () => {
        getCustomConversation.mockResolvedValue(envelope(GRADED));
        renderResult();

        expect(await screen.findByText('Nội dung hội thoại')).toBeInTheDocument();
        expect(screen.getByText(/one trip you still think about/)).toBeInTheDocument();
        expect(screen.getByText(/A fishing village/)).toBeInTheDocument();
    });
});
