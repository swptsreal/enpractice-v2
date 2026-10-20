import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The AI coach, and the one rule that matters most on it:
 *
 * LEXI'S OPENING LINE CARRIES REAL DATA — or it says she has none. The design asks the
 * coach to demonstrate it knows the user before asking anything. A brand-new account has
 * `weakSkills: []` (verified), and telling someone they are "weak at Matching Headings"
 * when they have never answered a question would be the most damaging lie this screen
 * could tell. All three cases are pinned below.
 *
 * Also pinned: the cost on the send button, the 1000-character cap, and the streaming
 * state rendering as a skeleton INSIDE the bubble.
 */
const getMessages = vi.fn();
const getProfile = vi.fn();
const publish = vi.fn(() => true);
const ensureConnected = vi.fn(async () => {});

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    aiChatApi: { getMessages: (...a) => getMessages(...a) },
    profileApi: { getProfile: (...a) => getProfile(...a), updateProfile: vi.fn() },
}));

vi.mock('../../contexts/RealtimeStompContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useRealtimeStomp: () => ({
            isConnected: true,
            connectionVersion: 1,
            ensureConnected,
            publish,
            subscribe: () => () => {},
            guestTrialStatus: null,
            handleGuestError: async () => {},
        }),
    };
});

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => ({ cost: 1, mode: 'ENFORCE' }), availableBalance: 20 }),
    };
});

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'u1' }, isAuthenticated: true, loading: false }),
    AuthProvider: ({ children }) => children,
}));

/** The TTS helper is recorded, not simulated: the assertion is WHAT was asked to be spoken. */
const speakStreaming = vi.fn().mockResolvedValue(undefined);
const stopSpeaking = vi.fn();
vi.mock('../../utils/ttsHelper', () => ({
    speakStreaming: (...a) => speakStreaming(...a),
    stopSpeaking: (...a) => stopSpeaking(...a),
    speak: vi.fn(),
    speakEnglish: vi.fn(),
}));

/** A controllable microphone: pressing the mic sets `recording`, and the transcript is whatever
 *  speech recognition returned — which is what must land in the input. `__voice` is the test's
 *  handle on it: the hook re-reads this state on every render, and `set` forces that render, the
 *  way a real recognition result would. */
let voiceState = { recording: false, transcript: '', timer: 0, sttSupported: true };
const voiceSubscribers = new Set();
const startRecording = vi.fn(() => {
    voiceState = { ...voiceState, recording: true, transcript: '', timer: 0 };
});
const stopRecording = vi.fn(async () => {
    const text = voiceState.transcript;
    voiceState = { ...voiceState, recording: false };
    return text;
});

vi.mock('../../hooks/useServerSpeechRecording', async () => {
    const { useEffect, useState } = await import('react');
    return {
        __voice: {
            set(next) {
                voiceState = { ...voiceState, ...next };
                for (const notify of voiceSubscribers) notify();
            },
            reset() {
                voiceState = { recording: false, transcript: '', timer: 0, sttSupported: true };
                for (const notify of voiceSubscribers) notify();
            },
        },
        useServerSpeechRecording: () => {
            const [, force] = useState(0);
            useEffect(() => {
                const notify = () => force((n) => n + 1);
                voiceSubscribers.add(notify);
                return () => voiceSubscribers.delete(notify);
            }, []);
            return {
                recording: voiceState.recording,
                transcribing: false,
                transcript: voiceState.transcript,
                setTranscript: (value) => {
                    voiceState = { ...voiceState, transcript: value };
                },
                timer: voiceState.timer,
                sttSupported: voiceState.sttSupported,
                startRecording: () => {
                    startRecording();
                    force((n) => n + 1);
                },
                stopRecording: async () => {
                    const text = await stopRecording();
                    force((n) => n + 1);
                    return text;
                },
                cancelRecording: () => {
                    voiceState = { ...voiceState, recording: false, transcript: '', timer: 0 };
                    force((n) => n + 1);
                },
            };
        },
    };
});

const { i18nReady } = await import('../../i18n');
const { default: AiChatPage } = await import('./AiChatPage');
const { __voice } = await import('../../hooks/useServerSpeechRecording');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

const profileWith = (weakSkills, overview = { totalLessonsCompleted: 5, totalStudyMinutes: 60 }) =>
    envelope({ weakSkills, overview });

function renderPage() {
    return render(
        <MemoryRouter>
            <AiChatPage />
        </MemoryRouter>
    );
}

beforeAll(() => {
    getMessages.mockResolvedValue(envelope([]));
});

describe('AiChatPage — Lexi opens with real data, or admits she has none', () => {
    it('names the actual weak skills when there are some', async () => {
        getProfile.mockResolvedValue(profileWith(['Matching Headings', 'True/False/Not Given']));
        renderPage();

        const opening = await screen.findByText(/bạn đang yếu ở/);
        expect(opening.textContent).toMatch(/Matching Headings/);
        expect(opening.textContent).toMatch(/True\/False\/Not Given/);
    });

    it('says it does NOT know yet for a brand-new account, and refuses to guess', async () => {
        /* weakSkills is [] for a new account. Inventing a weakness here would be the
           worst possible failure on this screen. */
        getProfile.mockResolvedValue(
            envelope({ weakSkills: [], overview: { totalLessonsCompleted: 0, totalStudyMinutes: 0 } })
        );
        renderPage();

        const opening = await screen.findByText(/chưa có dữ liệu luyện tập nào của bạn/);
        expect(opening.textContent).toMatch(/sẽ không đoán bừa/);
    });

    it('distinguishes "practised but nothing ranked" from "no data at all"', async () => {
        getProfile.mockResolvedValue(profileWith([], { totalLessonsCompleted: 3, totalStudyMinutes: 30 }));
        renderPage();

        expect(await screen.findByText(/chưa đủ để mình chỉ ra chỗ yếu cụ thể/)).toBeInTheDocument();
        expect(screen.queryByText(/chưa có dữ liệu luyện tập nào/)).not.toBeInTheDocument();
    });
});

describe('AiChatPage — the cost is on the send button', () => {
    it('shows the cost on the send button before anything is typed', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        renderPage();

        expect(await screen.findByRole('button', { name: /Gửi · -1 credit/ })).toBeInTheDocument();
    });

    it('keeps send disabled until there is text', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        renderPage();

        const button = await screen.findByRole('button', { name: /Gửi/ });
        expect(button).toBeDisabled();
    });
});

describe('AiChatPage — sending', () => {
    it('publishes to the realtime destination with a client message id', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        publish.mockClear();
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByPlaceholderText(/Hỏi Lexi/), 'How do I improve reading?');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(publish).toHaveBeenCalled());
        const [destination, payload] = publish.mock.calls[0];
        expect(destination).toBe('/app/realtime-chat');
        expect(payload.content).toBe('How do I improve reading?');
        /* A UUID so the server can deduplicate a retry. */
        expect(payload.clientMessageId).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('shows the user bubble optimistically', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByPlaceholderText(/Hỏi Lexi/), 'Hello there');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        expect(await screen.findByText('Hello there')).toBeInTheDocument();
    });

    it('caps the draft at 1000 characters, so the server backstop is never hit', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        renderPage();

        const box = await screen.findByPlaceholderText(/Hỏi Lexi/);
        expect(box).toHaveAttribute('maxlength', '1000');
    });

    it('keeps the text and reports a failure when the socket refuses the publish', async () => {
        /* The text is the user's work. Losing it silently is the worst outcome here. */
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        publish.mockReturnValueOnce(false);
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByPlaceholderText(/Hỏi Lexi/), 'Keep me');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
        /* restored into the composer */
        expect(screen.getByPlaceholderText(/Hỏi Lexi/)).toHaveValue('Keep me');
    });
});

describe('AiChatPage — suggestions', () => {
    it('offers real suggestions that fill the composer', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        const user = userEvent.setup();
        renderPage();

        const chip = await screen.findByRole('button', { name: /Matching Headings/ });
        await user.click(chip);

        expect(screen.getByPlaceholderText(/Hỏi Lexi/)).toHaveValue('Làm sao để cải thiện Matching Headings?');
    });
});

describe('AiChatPage — the voice pair (listen + speak)', () => {
    beforeEach(() => {
        __voice.reset();
        speakStreaming.mockClear();
        startRecording.mockClear();
        stopRecording.mockClear();
        stopSpeaking.mockClear();
    });

    it('asks the TTS endpoint for the ANSWER IT DRAWS, with the markdown stripped', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        const user = userEvent.setup();
        speakStreaming.mockClear();
        renderPage();

        /* The opening line is a Lexi answer too, so it is speakable. There is exactly one
           requested text and it is the sentence on screen. */
        const openingButton = await screen.findByRole('button', { name: /^Nghe$/ });
        await user.click(openingButton);

        await waitFor(() => expect(speakStreaming).toHaveBeenCalledTimes(1));
        const spoken = speakStreaming.mock.calls[0][0];
        expect(spoken).toMatch(/Matching Headings|yếu ở/);
        /* No markdown punctuation survives into the spoken string. */
        expect(spoken).not.toMatch(/[*#`_]/);
    });

    it('offers a listen control on every finished Lexi answer, and none on the learner’s', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        getMessages.mockResolvedValueOnce(
            envelope({
                messages: [
                    { id: 'm1', sequence: 1, role: 'USER', status: 'COMPLETE', content: 'Xin chào Lexi' },
                    {
                        id: 'm2',
                        sequence: 2,
                        role: 'ASSISTANT',
                        status: 'COMPLETE',
                        content: '## Điểm mạnh\n\nBạn nói khá trôi chảy.',
                    },
                ],
                nextBeforeSequence: null,
                hasMore: false,
            })
        );
        renderPage();

        /* The opening bubble + the history answer = two listen controls, and the learner's message
           is not one of them. */
        const listenButtons = await screen.findAllByRole('button', { name: /^Nghe$/ });
        expect(listenButtons).toHaveLength(2);
    });

    it('puts the MIC TRANSCRIPT INTO THE INPUT instead of sending it', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        const user = userEvent.setup();
        publish.mockClear();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /Ghi âm câu hỏi/ }));
        expect(startRecording).toHaveBeenCalled();
        /* Lexi is silenced before the microphone opens, or her voice lands in the question. */
        expect(stopSpeaking).toHaveBeenCalled();

        /* Speech recognition returns something while the learner talks. */
        __voice.set({ recording: true, transcript: 'How do I improve my reading score?', timer: 7 });
        const stop = await screen.findByRole('button', { name: /Dừng ghi âm/ });
        await user.click(stop);

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/Hỏi Lexi/)).toHaveValue(
                'How do I improve my reading score?'
            )
        );
        /* NOTHING WAS SENT: the transcript is a draft to check, not a message. */
        expect(publish).not.toHaveBeenCalled();
    });

    it('appends a transcript to what was already typed rather than replacing it', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        const user = userEvent.setup();
        renderPage();

        await user.type(await screen.findByPlaceholderText(/Hỏi Lexi/), 'Giải thích giúp mình');
        await user.click(screen.getByRole('button', { name: /Ghi âm câu hỏi/ }));
        __voice.set({ recording: true, transcript: 'cách làm dạng này', timer: 3 });
        await user.click(await screen.findByRole('button', { name: /Dừng ghi âm/ }));

        await waitFor(() =>
            expect(screen.getByPlaceholderText(/Hỏi Lexi/)).toHaveValue(
                'Giải thích giúp mình cách làm dạng này'
            )
        );
    });

    it('shows no mic at all when the browser cannot transcribe', async () => {
        /* A control that cannot work and cannot be fixed from this screen is worse than none. */
        __voice.set({ sttSupported: false });
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        renderPage();

        await screen.findByPlaceholderText(/Hỏi Lexi/);
        expect(screen.queryByRole('button', { name: /Ghi âm câu hỏi/ })).not.toBeInTheDocument();
    });
});

describe('AiChatPage — history from API', () => {
    it('renders chat message history fetched from the API', async () => {
        getProfile.mockResolvedValue(profileWith([]));
        getMessages.mockResolvedValueOnce(
            envelope({
                messages: [
                    {
                        id: 'msg-1',
                        sequence: 1,
                        role: 'USER',
                        status: 'COMPLETE',
                        content: 'Xin chào Lexi',
                    },
                    {
                        id: 'msg-2',
                        sequence: 2,
                        role: 'ASSISTANT',
                        status: 'COMPLETE',
                        content: 'Chào bạn! Mình có thể giúp gì cho bạn hôm nay?',
                    },
                ],
                nextBeforeSequence: null,
                hasMore: false,
            })
        );
        renderPage();

        expect(await screen.findByText('Xin chào Lexi')).toBeInTheDocument();
        expect(await screen.findByText(/Chào bạn! Mình có thể giúp gì/)).toBeInTheDocument();
    });
});
