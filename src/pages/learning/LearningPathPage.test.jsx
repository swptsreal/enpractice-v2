import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The learning path (screen 06).
 *
 * The screen's job is to be believed, so these tests are about what it REFUSES to say:
 *
 *  - a band that was never measured must not render as "0.0";
 *  - a node that reports no progress must not get an invented "0/0";
 *  - a locked node must be disabled but still readable — the learner has to see that the next
 *    step exists, which is the whole reason to show a path rather than a list;
 *  - the cost of a node must be visible BEFORE the press, and must come from the live credit
 *    config rather than from the payload.
 */
const getPath = vi.fn();
const getCost = vi.fn(() => null);

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    learningPathApi: { getPath: (...args) => getPath(...args) },
}));

vi.mock('../../contexts/CreditContextCore', () => ({
    useCredit: () => ({ getCost, availableBalance: 100 }),
}));

const { i18nReady } = await import('../../i18n');
const { default: LearningPathPage } = await import('./LearningPathPage');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    getPath.mockReset();
    getCost.mockReset();
    getCost.mockReturnValue(null);
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

const node = (overrides) => ({
    key: 'node',
    kind: 'TYPE_DRILL',
    title: 'fallback title',
    state: 'LOCKED',
    stateReason: 'NEEDS_PREVIOUS_NODE',
    progress: null,
    estimatedMinutes: 8,
    costActionCode: null,
    action: { type: 'ROUTE', url: '/ielts?mode=quick&questionType=MATCHING_HEADINGS' },
    ...overrides,
});

/** A unit with one node in each state, which is also the shape the mockup draws. */
const PATH = {
    targetBand: 6.5,
    currentBand: null,
    xp: 2480,
    unitIndex: 2,
    unitCount: 6,
    unit: {
        key: 'reading.matching_headings',
        index: 2,
        focusType: 'QUESTION_TYPE',
        skill: 'READING',
        questionType: 'MATCHING_HEADINGS',
        title: 'server title (should not be needed)',
        progress: { done: 2, total: 4, percent: 50 },
        nodes: [
            node({
                key: 'a',
                state: 'DONE',
                stateReason: 'DRILL_TARGET_MET',
                questionType: 'MATCHING_HEADINGS',
                progress: { answered: 10, target: 10, correct: 8, accuracy: 0.8 },
            }),
            node({
                key: 'b',
                state: 'CURRENT',
                stateReason: 'WEAKEST_MEASURED_TYPE',
                questionType: 'TRUE_FALSE_NOT_GIVEN',
                progress: { answered: 3, target: 10, correct: 1, accuracy: 0.33 },
            }),
            node({ key: 'c', state: 'LOCKED', stateReason: 'NEEDS_PREVIOUS_NODE', questionType: 'SUMMARY_COMPLETION' }),
            node({
                key: 'd',
                kind: 'UNIT_CHECK',
                state: 'LOCKED',
                stateReason: 'NEEDS_ALL_UNIT_NODES',
                questionType: null,
                title: 'Kiểm tra cuối unit',
                costActionCode: 'IELTS_START',
            }),
        ],
    },
    nextUnit: {
        key: 'writing.task_1',
        index: 3,
        focusType: 'WRITING_TASK_TYPE',
        skill: 'WRITING',
        writingTaskType: 'TASK_1',
        title: 'server next-unit title',
        topics: ['Biểu đồ', 'Quy trình', 'Bản đồ'],
    },
};

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/path']}>
            <Routes>
                <Route path="/path" element={<LearningPathPage />} />
                <Route path="/ielts" element={<div>practice screen</div>} />
                <Route path="/onboarding" element={<div>onboarding screen</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('LearningPathPage — what it shows', () => {
    it('names the unit from machine values rather than the server sentence', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent('Reading — Nối tiêu đề');
        expect(screen.queryByText('server title (should not be needed)')).not.toBeInTheDocument();
    });

    it('shows the drill progress as answered over target', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        expect(await screen.findByText('Đang học · câu 3/10')).toBeInTheDocument();
        expect(screen.getByText('Xong · câu 10/10')).toBeInTheDocument();
    });

    it('says the band is unmeasured instead of printing 0.0', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        expect(await screen.findByText(/Chưa đo được band/)).toBeInTheDocument();
        expect(screen.queryByText(/Band hiện tại/)).not.toBeInTheDocument();
    });

    it('shows a measured band when there is one', async () => {
        getPath.mockResolvedValue(envelope({ ...PATH, currentBand: 6 }));
        renderPage();

        expect(await screen.findByText('Band hiện tại 6.0')).toBeInTheDocument();
        expect(screen.queryByText(/Chưa đo được band/)).not.toBeInTheDocument();
    });

    it('explains why the current node is the current one, and only that node', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        /* One reason, on the node the learner is on. Under all four it would be noise. */
        expect(await screen.findByText('Dạng bạn sai nhiều nhất')).toBeInTheDocument();
        expect(screen.queryByText('Bạn đã đạt mục tiêu ở dạng câu hỏi này')).not.toBeInTheDocument();
    });

    it('previews the next unit with its topic chips', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        expect(await screen.findByText('Unit tiếp theo: Writing — Writing Task 1')).toBeInTheDocument();
        expect(screen.getByText('Biểu đồ')).toBeInTheDocument();
    });
});

describe('LearningPathPage — states and presses', () => {
    it('renders a locked node as disabled but still labelled', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        const locked = await screen.findByRole('button', { name: /Hoàn thành tóm tắt — Khoá/ });
        expect(locked).toBeDisabled();
        /* Readable, not hidden: seeing the next step is the point of a path. */
        expect(screen.getByText('Hoàn thành tóm tắt')).toBeInTheDocument();
    });

    it('carries the state into the accessible name, so colour is not the only signal', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        renderPage();

        expect(await screen.findByRole('button', { name: /Nối tiêu đề — Xong — câu 10\/10/ })).toBeEnabled();
        expect(screen.getByRole('button', { name: /True \/ False \/ Not Given — Đang học/ })).toBeEnabled();
        expect(screen.getByRole('button', { name: /Kiểm tra cuối unit — Khoá/ })).toBeDisabled();
    });

    it('opens the node’s own action url', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /True \/ False \/ Not Given — Đang học/ }));

        expect(await screen.findByText('practice screen')).toBeInTheDocument();
    });

    it('does nothing when a node carries no action', async () => {
        getPath.mockResolvedValue(
            envelope({
                ...PATH,
                unit: { ...PATH.unit, nodes: [node({ key: 'x', state: 'CURRENT', action: null })] },
            })
        );
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /Đang học/ }));
        expect(screen.queryByText('practice screen')).not.toBeInTheDocument();
    });
});

describe('LearningPathPage — cost before the press', () => {
    it('shows the price from the live credit config, not from the payload', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        getCost.mockImplementation((code) => (code === 'IELTS_START' ? { cost: 5, mode: 'CHARGE' } : null));
        renderPage();

        /* The amount label carries the sign, as it does on every other cost control. */
        expect(await screen.findByText('Tốn -5 credit')).toBeInTheDocument();
        expect(getCost).toHaveBeenCalledWith('IELTS_START');
    });

    it('shows no price when the action is free or disabled', async () => {
        getPath.mockResolvedValue(envelope(PATH));
        getCost.mockReturnValue({ cost: 5, mode: 'DISABLED' });
        renderPage();

        await screen.findByRole('heading', { level: 2 });
        expect(screen.queryByText(/credit\)/)).not.toBeInTheDocument();
    });
});

describe('LearningPathPage — the empty path', () => {
    const DIAGNOSTIC = {
        targetBand: null,
        currentBand: null,
        xp: 0,
        unitIndex: 1,
        unitCount: 1,
        unit: {
            key: 'diagnostic',
            index: 1,
            focusType: 'DIAGNOSTIC',
            skill: null,
            title: 'server diagnostic title',
            progress: { done: 0, total: 2 },
            nodes: [
                node({ key: 'd1', state: 'CURRENT', stateReason: 'DIAGNOSTIC_BASELINE', kind: 'SCOPED_PRACTICE' }),
                node({ key: 'd2', state: 'LOCKED', stateReason: 'NEEDS_PREVIOUS_NODE', kind: 'SCOPED_PRACTICE' }),
            ],
        },
        nextUnit: null,
    };

    it('explains why the path is short instead of drawing progress towards nothing', async () => {
        getPath.mockResolvedValue(envelope(DIAGNOSTIC));
        renderPage();

        expect(await screen.findByText(/Chưa đủ dữ liệu để xếp lộ trình/)).toBeInTheDocument();
        /* No unit progress bar: there is no measurement behind it yet. */
        expect(screen.queryByRole('progressbar', { name: /Tiến độ unit/ })).not.toBeInTheDocument();
    });

    it('offers the goal-setting step when no target band is set', async () => {
        getPath.mockResolvedValue(envelope(DIAGNOSTIC));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: 'Đặt mục tiêu band' }));
        expect(await screen.findByText('onboarding screen')).toBeInTheDocument();
    });
});
