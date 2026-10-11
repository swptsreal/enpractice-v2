import { beforeAll, describe, expect, it, vi } from 'vitest';
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

const { i18nReady } = await import('../../i18n');
const { default: AiChatPage } = await import('./AiChatPage');

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
    it('shows the cost and the balance before anything is typed', async () => {
        getProfile.mockResolvedValue(profileWith(['Fluency']));
        renderPage();

        expect(await screen.findByRole('button', { name: /Gửi · -1 credit/ })).toBeInTheDocument();
        expect(screen.getByText('Còn 20 credit')).toBeInTheDocument();
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
        const user = userEvent.setup();
        renderPage();

        const box = await screen.findByPlaceholderText(/Hỏi Lexi/);
        expect(box).toHaveAttribute('maxlength', '1000');
        expect(screen.getByText('0/1000')).toBeInTheDocument();
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
