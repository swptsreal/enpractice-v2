import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The Speaking module's distinctive rules, each verified against the running backend
 * first:
 *
 *  1. **The microphone notice is shown BEFORE recording**, not in a modal at the moment
 *     of the click — and it distinguishes an insecure context from an unsupported
 *     browser, because those need different actions from the user.
 *  2. **Grading is asynchronous** (SUBMITTED → GRADING → GRADED, ~9 s measured), so the
 *     result screen says it is waiting and never renders a null band as a score.
 *  3. **Voice analytics are measurements with context, and a missing metric is OMITTED,
 *     not zeroed.** `speechAnalytics` is partly client-supplied; showing "0 pauses" for
 *     a metric the browser could not measure would read as a flawless performance.
 *  4. **`cueCard` is null for PART_3**, so no empty card may be rendered.
 */
const getTopics = vi.fn();
const getTopicById = vi.fn();
const submitAttempt = vi.fn();
const getAttemptById = vi.fn();
const getAttempts = vi.fn();
const getHighestScores = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    speakingApi: {
        getTopics: (...a) => getTopics(...a),
        getTopicById: (...a) => getTopicById(...a),
        submitAttempt: (...a) => submitAttempt(...a),
        getAttemptById: (...a) => getAttemptById(...a),
        getAttempts: (...a) => getAttempts(...a),
        getHighestScores: (...a) => getHighestScores(...a),
    },
}));

vi.mock('../../contexts/CreditContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        useCredit: () => ({ getCost: () => ({ cost: 1, mode: 'ENFORCE' }), availableBalance: 10 }),
    };
});

const { i18nReady } = await import('../../i18n');
const { default: SpeakingListPage } = await import('./SpeakingListPage');
const { default: SpeakingResultPage } = await import('./SpeakingResultPage');
const { buildSpeechAnalytics, detectFillers, countWords } = await import('../../features/speaking/useSpeaking');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items) => envelope({ page: 0, size: 12, totalElements: items.length, totalPages: 1, items });

const PART_1_TOPIC = {
    id: 'topic-1',
    part: 'PART_1',
    question: 'What types of school prizes do children receive?',
    difficulty: null,
};

describe('buildSpeechAnalytics — only what the browser can honestly measure', () => {
    it('derives word count and rate from the transcript and duration', () => {
        const a = buildSpeechAnalytics({ transcript: 'one two three four', seconds: 2, fillers: [] });
        expect(a.wordCount).toBe(4);
        // 4 words in 2 seconds = 120 wpm
        expect(a.wordsPerMinute).toBe(120);
    });

    it('never invents pause data it cannot know', () => {
        const a = buildSpeechAnalytics({ transcript: 'hello there', seconds: 60 });
        expect(a).not.toHaveProperty('avgPauseDurationMs');
        expect(a).not.toHaveProperty('longPauseCount');
        expect(a).not.toHaveProperty('avgWordConfidence');
        expect(a).not.toHaveProperty('lowConfidenceWords');
    });

    it('reports a null rate rather than Infinity when the timer is 0', () => {
        /* A division by zero here would send a nonsense number to be graded on. */
        const a = buildSpeechAnalytics({ transcript: 'a b c', seconds: 0 });
        expect(a.wordsPerMinute).toBeNull();
    });

    it('reports filler count only when fillers were detected', () => {
        expect(buildSpeechAnalytics({ transcript: 'ok', seconds: 5, fillers: [] }).fillerWordCount).toBeNull();
        expect(buildSpeechAnalytics({ transcript: 'um ok', seconds: 5, fillers: ['um'] }).fillerWordCount).toBe(1);
    });
});

describe('detectFillers — an explicit list, not a heuristic', () => {
    it('finds a filler used as a word', () => {
        expect(detectFillers('I was, um, thinking about it')).toContain('um');
    });

    it('does NOT fire on a filler appearing inside another word', () => {
        /* "umbrella" contains "um". A substring match would tell a learner they used a
           filler they did not use, which is worse than missing one. */
        expect(detectFillers('I took my umbrella')).not.toContain('um');
        expect(detectFillers('That is likely true')).not.toContain('like');
    });

    it('finds a multi-word filler', () => {
        expect(detectFillers('It was, you know, difficult')).toContain('you know');
    });

    it('returns nothing for a clean transcript', () => {
        expect(detectFillers('The weather today is pleasant')).toEqual([]);
    });

    it('handles empty input without throwing', () => {
        expect(detectFillers('')).toEqual([]);
        expect(detectFillers(null)).toEqual([]);
    });
});

describe('countWords', () => {
    it('counts tokens and ignores empty input', () => {
        expect(countWords('one two three')).toBe(3);
        expect(countWords('  ')).toBe(0);
        expect(countWords(null)).toBe(0);
    });
});

describe('SpeakingListPage — the microphone notice comes first', () => {
    function renderList() {
        return render(
            <MemoryRouter>
                <SpeakingListPage />
            </MemoryRouter>
        );
    }

    it('states the microphone is ready before any recording is attempted', async () => {
        /* jsdom is a secure context with getUserMedia stubbed absent by default, so
           pin the message that matters here: it must appear without a click. */
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();

        expect(await screen.findByRole('note')).toBeInTheDocument();
        // and it explains what still works, rather than implying the screen is broken
        expect(screen.getByText(/vẫn có thể luyện đọc đề/i)).toBeInTheDocument();
    });

    it('filters by part with pressed-state toggles', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(envelope([]));
        renderList();
        await screen.findByText(/school prizes/);

        const group = screen.getByRole('group', { name: /lọc theo phần thi/i });
        const buttons = group.querySelectorAll('button');
        expect(buttons).toHaveLength(4); // All + 3 parts
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows the previous band to one decimal when it exists', async () => {
        getTopics.mockResolvedValue(page([PART_1_TOPIC]));
        getHighestScores.mockResolvedValue(
            envelope([
                {
                    topicId: 'topic-1',
                    attempted: true,
                    attemptId: 'att-1',
                    highestBandScore: 6,
                    status: 'GRADED',
                    sourceType: 'PRACTICE',
                },
            ])
        );
        renderList();

        expect(await screen.findByText('6.0')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Luyện lại/ })).toBeInTheDocument();
    });
});

describe('SpeakingResultPage — measurements, not grades', () => {
    function renderResult() {
        return render(
            <MemoryRouter initialEntries={['/speaking/result/att-1']}>
                <Routes>
                    <Route path="/speaking/result/:attemptId" element={<SpeakingResultPage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it('says it is marking, and shows no band while it waits', async () => {
        getAttemptById.mockResolvedValue(
            envelope({ id: 'att-1', topicId: 'topic-1', status: 'GRADING', overallBandScore: null })
        );
        renderResult();

        expect(await screen.findByText('Đang chấm bài nói của bạn')).toBeInTheDocument();
        expect(screen.queryByText('Điểm theo tiêu chí')).not.toBeInTheDocument();
    });

    it('places the speech rate INSIDE its natural range, as context not a grade', async () => {
        getAttemptById.mockResolvedValue(
            envelope({
                id: 'att-1',
                topicId: 'topic-1',
                topicQuestion: 'Q',
                topicPart: 'PART_1',
                status: 'GRADED',
                transcript: 'a b c',
                fluencyScore: 5.5,
                lexicalScore: 6,
                grammarScore: 6,
                pronunciationScore: 6,
                overallBandScore: 6,
                aiFeedback: '## ok',
                speechAnalytics: { wordCount: 109, wordsPerMinute: 142, fillerWordCount: 2, fillerWords: ['um', 'like'] },
            })
        );
        renderResult();

        /* 6.0 is both the overall band and three of the criterion scores, so the
           singular query is ambiguous by design. */
        expect((await screen.findAllByText('6.0')).length).toBeGreaterThan(0);
        expect(screen.getByText('Số đo khi nói')).toBeInTheDocument();
        // the range is stated, which is the whole point of the section
        expect(screen.getByText(/nằm trong khoảng tự nhiên 120–160/)).toBeInTheDocument();
        expect(screen.getByRole('progressbar', { name: /Độ trôi chảy \(Fluency\): 5\.5 trên 9/ })).toBeInTheDocument();
    });

    it('OMITS a metric it has no value for instead of showing 0', async () => {
        /* The browser cannot measure pause durations, so they come back null. Rendering
           "0 lần ngắt" would tell the learner they never paused — a fabricated fact. */
        getAttemptById.mockResolvedValue(
            envelope({
                id: 'att-1',
                topicId: 'topic-1',
                status: 'GRADED',
                overallBandScore: 6,
                transcript: 'x',
                aiFeedback: 'ok',
                speechAnalytics: { wordCount: 20, wordsPerMinute: 130 },
            })
        );
        renderResult();

        await screen.findByText('Số đo khi nói');
        expect(screen.queryByText('Số lần ngắt')).not.toBeInTheDocument();
        expect(screen.queryByText('Từ đệm')).not.toBeInTheDocument();
        // but the metrics it DOES have are shown
        expect(screen.getByText('Tốc độ nói (từ/phút)')).toBeInTheDocument();
    });

    it('reports a rate below the natural range as slower, not as wrong', async () => {
        getAttemptById.mockResolvedValue(
            envelope({
                id: 'att-1',
                topicId: 'topic-1',
                status: 'GRADED',
                overallBandScore: 5,
                transcript: 'x',
                aiFeedback: 'ok',
                speechAnalytics: { wordCount: 40, wordsPerMinute: 80 },
            })
        );
        renderResult();

        const note = await screen.findByText(/chậm hơn khoảng thông thường/);
        // the copy must not present slowness as an error
        expect(note.textContent).toMatch(/không sai/);
    });

    it('carries the recognition caveat next to the transcript', async () => {
        getAttemptById.mockResolvedValue(
            envelope({
                id: 'att-1',
                topicId: 'topic-1',
                status: 'GRADED',
                overallBandScore: 6,
                transcript: 'what I actually said',
                aiFeedback: 'ok',
            })
        );
        renderResult();

        expect(await screen.findByText(/nhận dạng giọng nói có thể nghe sai/i)).toBeInTheDocument();
        expect(screen.getByText('what I actually said')).toBeInTheDocument();
    });

    it('reports a FAILED grading rather than an empty result', async () => {
        getAttemptById.mockResolvedValue(
            envelope({ id: 'att-1', topicId: 'topic-1', status: 'FAILED', overallBandScore: null })
        );
        renderResult();
        expect(await screen.findByText('Không chấm được bài này')).toBeInTheDocument();
    });
});
