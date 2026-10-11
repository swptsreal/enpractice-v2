import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * `/credits` exists to make the free/paid boundary legible, so these tests pin the
 * two rules that make it honest:
 *
 *  1. FREE actions are listed, not omitted. Showing only what costs money implies
 *     everything else might cost money too.
 *  2. A DISABLED action is shown as UNAVAILABLE, not as free. The backend returns
 *     `mode: DISABLED` with `cost: 0` (verified: AI_CHAT currently does), and
 *     rendering that as "0 credits" would advertise a feature that cannot be used.
 */
const getBalance = vi.fn();
const getCosts = vi.fn();
const getTransactions = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    creditApi: {
        getBalance: (...a) => getBalance(...a),
        getCosts: (...a) => getCosts(...a),
        getTransactions: (...a) => getTransactions(...a),
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: CreditsPage } = await import('./CreditsPage');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** The real shapes, captured from the running backend. */
const BALANCE = envelope({ availableBalance: 40, reservedBalance: 0, status: 'ACTIVE' });

const COSTS = envelope([
    { actionCode: 'AI_CHAT', cost: 0, mode: 'DISABLED' },
    { actionCode: 'AI_EXPLAIN', cost: 1, mode: 'ENFORCE' },
    { actionCode: 'IELTS_START', cost: 2, mode: 'ENFORCE' },
    { actionCode: 'VOCABULARY_TEST_GENERATE', cost: 5, mode: 'ENFORCE' },
]);

const page = (items) =>
    envelope({ page: 0, size: 20, totalElements: items.length, totalPages: 1, items });

function renderPage() {
    return render(
        <MemoryRouter>
            <CreditsPage />
        </MemoryRouter>
    );
}

beforeAll(() => {
    getTransactions.mockResolvedValue(page([]));
});

describe('CreditsPage — the free/paid boundary', () => {
    it('shows the available balance', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        renderPage();
        expect(await screen.findByText('40')).toBeInTheDocument();
    });

    it('shows a DISABLED action as unavailable rather than free', async () => {
        /* The important one: cost 0 with mode DISABLED is NOT a free feature. */
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        renderPage();

        expect(await screen.findByText('Trò chuyện với AI')).toBeInTheDocument();
        expect(screen.getByText('Đang tắt')).toBeInTheDocument();
        // and it must NOT be labelled free
        expect(screen.queryByText('Đang tắt')).not.toHaveTextContent('Miễn phí');
    });

    it('labels a real zero-cost action as free', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(
            envelope([
                { actionCode: 'AI_EXPLAIN', cost: 0, mode: 'ENFORCE' },
                { actionCode: 'IELTS_START', cost: 2, mode: 'ENFORCE' },
            ])
        );
        renderPage();

        expect(await screen.findByText('Miễn phí')).toBeInTheDocument();
        expect(screen.getByText('−2')).toBeInTheDocument();
    });

    it('states the free surface in words, not only by omission', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        renderPage();
        expect(await screen.findByText(/không tốn credit/i)).toBeInTheDocument();
    });

    it('marks an OBSERVE action as not-yet-charged rather than pricing it', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(envelope([{ actionCode: 'WRITING_START', cost: 3, mode: 'OBSERVE' }]));
        renderPage();
        expect(await screen.findByText(/chỉ ghi nhận/i)).toBeInTheDocument();
    });
});

describe('CreditsPage — transactions', () => {
    it('shows an empty state before the first transaction', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        getTransactions.mockResolvedValue(page([]));
        renderPage();
        expect(await screen.findByText('Chưa có giao dịch nào')).toBeInTheDocument();
    });

    it('renders a spend with its sign and the resulting balance', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        getTransactions.mockResolvedValue(
            page([
                {
                    id: 't1',
                    transactionType: 'SPEND',
                    actionCode: 'AI_EXPLAIN',
                    sourceType: 'AI_EXPLAIN',
                    amount: -1,
                    availableBalanceAfter: 39,
                    createdAt: '2026-10-11T07:00:00Z',
                },
            ])
        );
        renderPage();

        expect(await screen.findByText('AI_EXPLAIN')).toBeInTheDocument();
        expect(screen.getByText('-1')).toBeInTheDocument();
        expect(screen.getByText('Còn lại 39')).toBeInTheDocument();
    });

    it('marks a grant with a plus sign', async () => {
        getBalance.mockResolvedValue(BALANCE);
        getCosts.mockResolvedValue(COSTS);
        getTransactions.mockResolvedValue(
            page([
                {
                    id: 't2',
                    transactionType: 'GRANT',
                    actionCode: null,
                    sourceType: 'ADMIN_GRANT',
                    amount: 40,
                    availableBalanceAfter: 40,
                    createdAt: '2026-10-11T06:00:00Z',
                },
            ])
        );
        renderPage();

        expect(await screen.findByText('+40')).toBeInTheDocument();
        // falls back to sourceType when there is no actionCode
        expect(screen.getByText('ADMIN_GRANT')).toBeInTheDocument();
    });
});
