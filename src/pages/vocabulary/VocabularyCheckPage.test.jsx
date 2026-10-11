import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * Screen 07 exists to enforce ONE product rule structurally rather than in copy:
 * the credit cost is visible ON the button BEFORE it is pressed.
 *
 * PRODUCT.md commits to being truthful on the free/paid boundary, and the only
 * moment that matters is the decision. A price revealed after the click is not a
 * price, it is a bill — so these tests assert the label is present while the button
 * is still unpressed, and that an unaffordable action is disabled with the shortfall
 * stated rather than left to fail.
 */
const start = vi.fn();
let explainState = { requestsById: {}, costEntry: null, isConnected: true };
let creditState = { availableBalance: 10 };

vi.mock('../../contexts/VocabularyExplainContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useVocabularyExplain: () => ({
            ...explainState,
            start,
            cancel: vi.fn(),
            isBlocked: false,
            guestTrialStatus: null,
        }),
    };
});

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return { default: Stub, useCredit: () => creditState };
});

vi.mock('../../features/vocabulary/useDictionary', async () => {
    const actual = await vi.importActual('../../features/vocabulary/useDictionary');
    return { ...actual, useWordMutations: () => ({ addWord: vi.fn() }) };
});

const { i18nReady } = await import('../../i18n');
const { default: VocabularyCheckPage } = await import('./VocabularyCheckPage');

beforeAll(async () => {
    await i18nReady;
});

function renderPage() {
    return render(
        <MemoryRouter>
            <VocabularyCheckPage />
        </MemoryRouter>
    );
}

describe('VocabularyCheckPage — the cost is on the button', () => {
    it('shows the cost while the button is still UNPRESSED', () => {
        explainState = {
            requestsById: {},
            isConnected: true,
            costEntry: { cost: 1, mode: 'ENFORCE' },
        };
        creditState = { availableBalance: 10 };
        renderPage();

        /* costEntry is what CreditContext.getCost(AI_EXPLAIN) returns, and
           getCreditCostDisplay formats it as `-1`. */
        const button = screen.getByRole('button', { name: /Giải thích · -1 credit/ });
        expect(button).toBeEnabled();
    });

    it('says core learning is free when nothing is charged', () => {
        explainState = { requestsById: {}, isConnected: true, costEntry: null };
        creditState = { availableBalance: 10 };
        renderPage();

        expect(screen.getByRole('button', { name: /^Giải thích$/ })).toBeEnabled();
    });

    it('DISABLES the action and states the shortfall when the wallet cannot cover it', () => {
        /* The user should not have to learn the price by being refused. The backend
           enforces it too, but a disabled button with a reason is the honest version. */
        explainState = { requestsById: {}, isConnected: true, costEntry: { cost: 5, mode: 'ENFORCE' } };
        creditState = { availableBalance: 2 };
        renderPage();

        expect(screen.getByRole('button', { name: /Giải thích · -5 credit/ })).toBeDisabled();
        expect(screen.getByText(/Cần 5 credit, bạn đang có 2/)).toBeInTheDocument();
    });

    it('does not invent a cost when the balance is unknown', () => {
        /* A null balance means "not fetched yet", not "zero". Disabling on an
           unknown balance would block a funded user during the first render. */
        explainState = { requestsById: {}, isConnected: true, costEntry: { cost: 1, mode: 'ENFORCE' } };
        creditState = { availableBalance: null };
        renderPage();

        expect(screen.getByRole('button', { name: /Giải thích · -1 credit/ })).toBeEnabled();
    });

    it('refuses an empty word before opening a stream', async () => {
        explainState = { requestsById: {}, isConnected: true, costEntry: null };
        creditState = { availableBalance: 10 };
        start.mockClear();
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole('button', { name: /^Giải thích$/ }));

        expect(screen.getByText('Nhập một từ trước đã.')).toBeInTheDocument();
        expect(start).not.toHaveBeenCalled();
    });

    it('passes the trimmed word to the explain stream', async () => {
        explainState = { requestsById: {}, isConnected: true, costEntry: null };
        creditState = { availableBalance: 10 };
        start.mockReset();
        start.mockResolvedValue('req-1');

        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByPlaceholderText(/Nhập một từ tiếng Anh/), '  mitigate  ');
        await user.click(screen.getByRole('button', { name: /^Giải thích$/ }));

        expect(start).toHaveBeenCalledWith('mitigate');
    });
});

describe('VocabularyCheckPage — streamed states', () => {
    it('renders streamed markdown progressively with a skeleton, not a bare spinner', () => {
        explainState = {
            isConnected: true,
            costEntry: null,
            requestsById: {
                'req-1': { requestId: 'req-1', word: 'mitigate', status: 'streaming', markdown: '**Giảm bớt** nghĩa là…' },
            },
        };
        creditState = { availableBalance: 10 };
        renderPage();

        // the partial answer is readable...
        expect(screen.getByText(/nghĩa là/)).toBeInTheDocument();
        // ...and bold was rendered as markdown rather than shown raw
        expect(screen.queryByText(/\*\*Giảm bớt\*\*/)).not.toBeInTheDocument();
        // the answer region announces that it is still working
        expect(screen.getByText('Đang viết')).toBeInTheDocument();
    });

    it('shows an error state with the backend message rather than a silent failure', () => {
        explainState = {
            isConnected: true,
            costEntry: null,
            requestsById: {
                'req-1': {
                    requestId: 'req-1',
                    word: 'mitigate',
                    status: 'error',
                    markdown: '',
                    errorCode: 'AI_TIMEOUT',
                    errorMessage: 'Hết thời gian chờ',
                },
            },
        };
        creditState = { availableBalance: 10 };
        renderPage();

        expect(screen.getByText('Không lấy được phần giải thích')).toBeInTheDocument();
        expect(screen.getByText('Hết thời gian chờ')).toBeInTheDocument();
    });

    it('offers to save a completed explanation into the notebook', () => {
        explainState = {
            isConnected: true,
            costEntry: null,
            requestsById: {
                'req-1': { requestId: 'req-1', word: 'mitigate', status: 'complete', markdown: 'Nghĩa là giảm bớt.' },
            },
        };
        creditState = { availableBalance: 10 };
        renderPage();

        expect(screen.getByRole('button', { name: /Lưu vào sổ tay/ })).toBeInTheDocument();
    });

    it('warns that the stream is unavailable before the first attempt', () => {
        explainState = { requestsById: {}, isConnected: false, costEntry: null };
        creditState = { availableBalance: 10 };
        renderPage();

        expect(screen.getByText(/Đang kết nối tới máy chủ AI/)).toBeInTheDocument();
    });
});

/**
 * The screen is deliberately OUTSIDE the app shell — it is the no-account trial the
 * landing page and the login card both promise — but it used to render with no
 * anchor at all: an input card floating on the canvas, with no brand and no way
 * into the rest of the product. That reads as a broken app rather than as a
 * deliberate no-chrome surface ("Mất UI hệ thống, chỉ còn lại card nhập từng").
 *
 * The fix adds the minimum anchor and NOT the shell back, which is the distinction
 * these assertions keep: a brand link, a sign-in affordance, and still no
 * navigation landmark, no sidebar and no floating helper.
 */
describe('VocabularyCheckPage — anchored, but still not the app shell', () => {
    it('carries the brand back to the front door and a way to sign in', () => {
        explainState = { requestsById: {}, isConnected: true, costEntry: null };
        creditState = { availableBalance: 10 };
        const { container } = renderPage();

        expect(screen.getByRole('link', { name: /EN Practice/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /Đăng nhập/i })).toHaveAttribute('href', '/login');
        // the guest-trial caveat has to reach the same name that advertises it
        expect(container.textContent).toMatch(/Học thử không cần tài khoản/);
    });

    it('still renders no shell chrome around the trial', () => {
        explainState = { requestsById: {}, isConnected: true, costEntry: null };
        creditState = { availableBalance: 10 };
        const { container } = renderPage();

        expect(container.querySelector('nav[aria-label]')).toBeNull();
        expect(container.querySelector('aside')).toBeNull();
    });
});
