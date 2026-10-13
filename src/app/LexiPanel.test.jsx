import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Lexi's floating panel (`_design/mockup/36b-lexi-panel.html`).
 *
 * The defect it replaces: the 56px helper was a `<Link to="/ai-chat">`, so asking a question about
 * the screen you were on navigated you off that screen. These assertions pin the three things that
 * make it a panel instead — it renders in place, it is NON-modal (so the page behind stays
 * readable), and the cost is on the send control before it is pressed.
 */
const send = vi.fn();
const onClose = vi.fn();
let chatState = {};
let creditState = { availableBalance: 12, getCost: () => ({ cost: 1, mode: 'CHARGE' }) };

vi.mock('../features/chat/useAiChat', () => ({
    useAiChat: () => chatState,
}));

vi.mock('../contexts/CreditContextCore', () => ({
    useCredit: () => creditState,
}));

/* The log is the shared component, so it is stubbed here: its own behaviour is covered by
   AiChatPage.test.jsx, and this file is about the panel's chrome and its composer. */
vi.mock('../features/chat/ChatLog', () => ({
    ChatLog: ({ chat, opening }) => (
        <div data-testid="log">
            <span>{opening?.key}</span>
            {(chat.messages ?? []).map((message) => (
                <span key={message.id}>{message.content}</span>
            ))}
        </div>
    ),
}));

const { i18nReady } = await import('../i18n');
const { default: LexiPanel } = await import('./LexiPanel');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    send.mockReset();
    onClose.mockReset();
    send.mockResolvedValue(true);
    creditState = { availableBalance: 12, getCost: () => ({ cost: 1, mode: 'CHARGE' }) };
    chatState = {
        messages: [],
        historyLoading: false,
        historyError: null,
        sending: false,
        sendError: null,
        streaming: false,
        isConnected: true,
        maxCharacters: 1000,
        send,
        retry: vi.fn(),
        reload: vi.fn(),
    };
});

function renderPanel() {
    return render(<LexiPanel contextLabel="Trang chủ" onClose={onClose} />);
}

describe('LexiPanel', () => {
    it('is a NON-modal dialog, so the page behind it stays readable', () => {
        const { container } = renderPanel();
        const dialog = screen.getByRole('dialog');

        expect(dialog).toHaveAttribute('aria-modal', 'false');
        /* No backdrop element: a scrim would dim the very content the question is about. */
        expect(container.querySelector('[data-backdrop]')).toBeNull();
    });

    it('names the screen the learner is on, so she does not have to guess what Lexi can see', () => {
        renderPanel();

        expect(screen.getByText('Đang xem: Trang chủ')).toBeInTheDocument();
        expect(screen.getByTestId('log')).toHaveTextContent('aiChat.panelOpening');
    });

    it('puts the cost on the send control before it is pressed', async () => {
        const user = userEvent.setup();
        renderPanel();

        /* Matched on the PRICE rather than the whole sentence: `amountLabel` is `-1` for a
           1-credit action and the key wraps it as "Gửi · {{amount}} credit". The draft is typed
           first because an empty composer disables the control on purpose — the price has to be
           readable while the button is still unpressed, which is the product rule. */
        const submit = screen.getByRole('button', { name: /-1 credit/ });
        expect(submit).toBeDisabled();

        await user.type(screen.getByLabelText('Câu hỏi của bạn'), 'Một câu hỏi');
        expect(screen.getByRole('button', { name: /-1 credit/ })).toBeEnabled();
        expect(screen.getByText(/Mỗi lượt hỏi tốn credit/)).toBeInTheDocument();
    });

    it('cannot send an empty draft', async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.click(screen.getByRole('button', { name: /Gửi/ }));
        expect(send).not.toHaveBeenCalled();
    });

    it('sends the typed question and clears the composer', async () => {
        const user = userEvent.setup();
        renderPanel();

        const input = screen.getByLabelText('Câu hỏi của bạn');
        await user.type(input, 'Vì sao câu 3 sai?');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        expect(send).toHaveBeenCalledWith('Vì sao câu 3 sai?');
        expect(input).toHaveValue('');
    });

    it('keeps the text when the send fails, because it is the learner’s own sentence', async () => {
        send.mockResolvedValue(false);
        const user = userEvent.setup();
        renderPanel();

        const input = screen.getByLabelText('Câu hỏi của bạn');
        await user.type(input, 'Giải thích giúp mình');
        await user.click(screen.getByRole('button', { name: /Gửi/ }));

        expect(input).toHaveValue('Giải thích giúp mình');
    });

    it('fills the composer from a suggestion instead of sending it blind', async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.click(screen.getByRole('button', { name: /Làm sao để cải thiện Matching Headings/ }));

        expect(screen.getByLabelText('Câu hỏi của bạn')).toHaveValue(
            'Làm sao để cải thiện Matching Headings?'
        );
        expect(send).not.toHaveBeenCalled();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('says it is still connecting, because a panel that silently receives nothing is invisible', () => {
        chatState = { ...chatState, isConnected: false };
        renderPanel();

        expect(screen.getByText(/Đang kết nối/)).toBeInTheDocument();
    });

    it('shows the balance, and disables the send when it cannot cover the answer', async () => {
        const user = userEvent.setup();
        const { unmount } = renderPanel();
        expect(screen.getByText(/Còn 12 credit/)).toBeInTheDocument();
        unmount();

        /* An empty wallet: the control is disabled and the reason is stated, rather than letting
           the press fail with a 402-style error. */
        creditState = { availableBalance: 0, getCost: () => ({ cost: 1, mode: 'CHARGE' }) };
        renderPanel();

        await user.type(screen.getByLabelText('Câu hỏi của bạn'), 'Hỏi khi hết credit');
        const submit = screen.getByRole('button', { name: /Gửi · -1 credit/ });
        expect(submit).toBeDisabled();
        expect(screen.getByText(/Bạn không đủ credit cho lượt hỏi này/)).toBeInTheDocument();

        await user.click(submit);
        expect(send).not.toHaveBeenCalled();
    });
});
