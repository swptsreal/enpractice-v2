import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Route-level tests.
 *
 * These exist because a lazy route that fails to resolve produces a blank screen
 * at runtime — the build stays green, lint stays green, and nothing catches it
 * until a human opens that page. v1 has ~40 orphaned page files behind 53 routes,
 * which is the drift this prevents.
 *
 * Both the api module (src/test/apiMock.js) and the auth context are stubbed, so
 * nothing here touches the network and the account surfaces are reachable without
 * a real session.
 */
let authState = { isAuthenticated: true, loading: false, user: { id: 'u1' } };

vi.mock('./contexts/AuthContext', () => ({
    useAuth: () => authState,
    AuthProvider: ({ children }) => children,
}));

/**
 * Stub the STOMP transport.
 *
 * The real provider opens a WebSocket on mount, which in jsdom logs "Authenticated
 * realtime token is unavailable" plus a Network Error per API call. That noise is
 * tolerable and the assertions above are unaffected, which is why this only
 * replaces the Core context (so `useRealtimeStomp` returns stubs) rather than the
 * provider module itself.
 *
 * Replacing the provider was tried and reverted: `CreditContext` also calls
 * `useRealtimeStomp`, so removing the provider broke nine unrelated route tests.
 * A stub that satisfies the hook is the version that keeps the chain mountable.
 */
vi.mock('./contexts/RealtimeStompContextCore', async () => {
    const { createContext } = await import('react');
    const Stub = createContext(null);
    return {
        default: Stub,
        RealtimeStompContext: Stub,
        useRealtimeStomp: () => ({
            isConnected: false,
            ensureConnected: async () => {},
            publish: () => true,
            subscribe: () => () => {},
            guestTrialStatus: null,
            handleGuestError: async () => {},
        }),
    };
});

/** A paper in the backend's nested shape, for the take screen. */
const TEST_DETAIL = {
    id: 't1',
    title: 'IELTS Academic 19 Reading Test 3',
    skill: 'READING',
    timeLimitMinutes: 60,
    sections: [
        {
            id: 's1',
            sectionOrder: 1,
            title: 'Passage 1',
            passages: [
                {
                    id: 'p1',
                    passageOrder: 1,
                    title: 'The Return of the Urban Bee',
                    content: 'For most of the twentieth century, the city was assumed to be hostile territory.',
                    questions: [
                        {
                            id: 'q1',
                            questionOrder: 1,
                            questionType: 'SINGLE_CHOICE',
                            questionText: 'What was assumed about cities?',
                            options: ['They were hostile', 'They were ideal'],
                            correctAnswers: ['They were hostile'],
                        },
                    ],
                },
            ],
        },
    ],
};

let sessionState;

vi.mock('./features/ielts/useIeltsSession', async () => {
    const actual = await vi.importActual('./features/ielts/useIeltsSession');
    return { ...actual, useIeltsSession: () => sessionState, assertNoAnswersLeaked: () => {} };
});

const { i18nReady } = await import('./i18n');
const { default: App } = await import('./App');

beforeAll(async () => {
    await i18nReady;
    // preload the lazy chunks so assertions are about the components, not about
    // how fast Vite transforms the graph
    await Promise.all([
        import('./pages/home/HomePage'),
        import('./pages/ielts/IeltsListPage'),
        import('./pages/ielts/IeltsTakePage'),
        import('./pages/ielts/IeltsResultPage'),
        import('./pages/login/LoginPage'),
        import('./pages/vocabulary/VocabularyListPage'),
        import('./pages/vocabulary/DictionaryPage'),
        import('./pages/vocabulary/VocabularyCheckPage'),
        import('./pages/writing/WritingListPage'),
        import('./pages/speaking/SpeakingListPage'),
        /* The shell is lazy and now MOUNTS the Credit + Realtime + Explain provider
           chain, so it must be preloaded too — otherwise these route assertions time
           out waiting for the first authenticated render. */
        import('./app/AppLayout'),
        import('./app/ProviderLayout'),
        import('./pages/landing/LandingPage'),
    ]);
}, 30000);

async function renderRoute(path) {
    let result;
    await act(async () => {
        result = render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
        await Promise.resolve();
    });
    return result;
}

beforeEach(() => {
    authState = { isAuthenticated: true, loading: false, user: { id: 'u1' } };
    sessionState = {
        session: { attemptId: 'a1', totalQuestions: 1, estimatedMinutes: 60 },
        testDetail: TEST_DETAIL,
        attemptId: 'a1',
        totalQuestions: 1,
        estimatedMinutes: 60,
        scopeTitle: null,
        questions: [
            {
                id: 'q1',
                questionOrder: 1,
                questionType: 'SINGLE_CHOICE',
                questionText: 'What was assumed about cities?',
                options: ['They were hostile', 'They were ideal'],
                passageTitle: 'The Return of the Urban Bee',
                passageContent: 'For most of the twentieth century, the city was assumed to be hostile territory.',
                audioUrl: null,
            },
        ],
        sections: [],
        answers: {},
        setAnswer: vi.fn(),
        answeredCount: 0,
        loading: false,
        error: null,
        submit: vi.fn(),
        submitting: false,
        result: null,
    };
});

describe('signed-in routing', () => {
    const ROUTES = [
        { path: '/home', label: 'home', heading: /Trang chủ/i },
        { path: '/ielts', label: 'ielts list', heading: /Kho đề IELTS/i },
        { path: '/ielts/take', label: 'ielts take', text: /The Return of the Urban Bee/i },
        { path: '/vocabulary', label: 'vocabulary list', text: /Tạo bài test mới/i },
        { path: '/dictionary', label: 'dictionary', text: /Sổ tay từ vựng/i },
        { path: '/vocabulary/check', label: 'vocabulary check', text: /Từ cần tra/i },
        { path: '/writing', label: 'writing list', text: /Luyện Writing/i },
        { path: '/speaking', label: 'speaking list', text: /Luyện Speaking/i },
    ];

    for (const { path, label, heading, text } of ROUTES) {
        it(`renders the ${label} route (${path})`, async () => {
            await renderRoute(path);
            /* Assert the heading ROLE where the string also appears in the nav —
               "Trang chủ" is legitimately both the page title and a destination, so
               a bare text query is ambiguous by design. */
            await waitFor(() => {
                if (heading) {
                    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
                } else {
                    expect(screen.getAllByText(text).length).toBeGreaterThan(0);
                }
            });
        });
    }

    it('renders /vocabulary/check INSIDE the shell for a signed-in learner', async () => {
        /* REGRESSION: the guest-trial route was made chrome-free for visitors and stayed that way
           for everyone, so a signed-in learner saw the visitor's header — including a "Đăng nhập"
           button — with no sidebar and no way back into the product. The mockup draws screen 07
           inside the shell (`_design/mockup/07-vocabulary-check.html`), and the rail links here as
           "Học", so the signed-in view is the shell. */
        const { container } = await renderRoute('/vocabulary/check');
        await waitFor(() => expect(container.textContent).toMatch(/Từ cần tra/));

        expect(container.querySelector('aside')).not.toBeNull();
        expect(container.querySelector('#main')).not.toBeNull();
        expect(screen.getByText(/bỏ qua tới nội dung/i)).toHaveAttribute('href', '#main');
    });

    it('renders the login route outside the app shell', async () => {        const { container } = await renderRoute('/login');
        // the shell's rail must not wrap a full-bleed auth screen
        expect(container.querySelector('aside')).not.toBeNull(); // the marketing column
        expect(container.querySelectorAll('img.lexi').length).toBeGreaterThan(0);
    });

    it('always provides a skip-to-content link on a shell route', async () => {
        await renderRoute('/home');
        expect(screen.getByText(/bỏ qua tới nội dung/i)).toHaveAttribute('href', '#main');
    });

    it('renders exactly one h1 on a shell route', async () => {
        const { container } = await renderRoute('/home');
        expect(container.querySelectorAll('h1')).toHaveLength(1);
    });

    it('hides the floating Lexi helper on /ai-chat', async () => {
        const home = await renderRoute('/home');
        expect(home.container.querySelector('button[aria-label="Hỏi Lexi"]')).not.toBeNull();

        const chat = await renderRoute('/ai-chat');
        expect(chat.container.querySelector('button[aria-label="Hỏi Lexi"]')).toBeNull();
    });

    it('renders the credit badge in the shell header next to the notification bell (mobile only)', async () => {
        const { container } = await renderRoute('/home');
        const header = container.querySelector('header');
        expect(header).not.toBeNull();
        const creditLink = header.querySelector('a[href="/credits"]');
        expect(creditLink).not.toBeNull();
        expect(creditLink.className).toContain('lg:hidden');
        const notifBtn = header.querySelector('a[href="/notifications"], button[aria-label*="Thông báo"]');
        expect(notifBtn).not.toBeNull();
    });
});

describe('timed surface isolation', () => {
    it('renders the take screen OUTSIDE the app shell', async () => {
        const { container } = await renderRoute('/ielts/take');
        expect(container.querySelector('aside')).toBeNull();
        expect(container.querySelectorAll('img.lexi')).toHaveLength(0);
    });
});

describe('guest routing', () => {
    beforeEach(() => {
        authState = { isAuthenticated: false, loading: false, user: null };
    });

    it('gives a guest the LANDING PAGE at the root, not the login form', async () => {
        /* The root is the one URL a visitor reaches without choosing anything, so it
           must explain the product rather than demand a session. */
        const { container } = await renderRoute('/');

        await waitFor(() => {
            expect(container.textContent).toMatch(/Luyện IELTS/);
        });
        expect(container.textContent).not.toMatch(/Phiên đăng nhập đã hết hạn/);
    });

    it('lets a guest reach the guest trial instead of bouncing them to /login', async () => {
        /* REGRESSION: /vocabulary/check used to sit inside AppLayout behind
           RequireAuth, so the "Học thử không cần tài khoản" action promised on the
           landing page and the login card redirected to /login. The product advertised
           a no-account trial that the routing made impossible. */
        const { container } = await renderRoute('/vocabulary/check');

        await waitFor(() => {
            expect(container.textContent).toMatch(/Từ cần tra/);
        });
        expect(container.textContent).not.toMatch(/Đăng nhập để tiếp tục/);
    });

    it('renders the guest trial WITHOUT the app shell', async () => {
        /* It needs the provider chain but must not show the sidebar, tab bar or the
           floating Lexi helper: the guest surface is outside the app chrome.

           Lexi HERSELF is allowed inside the page — an illustration in an intro card is
           different from the persistent floating helper, and the design uses her in both.
           So this asserts the chrome is gone, not that her art is. */
        const { container } = await renderRoute('/vocabulary/check');
        await waitFor(() => expect(container.textContent).toMatch(/Từ cần tra/));

        expect(container.querySelector('aside')).toBeNull();
        expect(screen.queryByRole('link', { name: /Hỏi Lexi|ask lexi/i })).not.toBeInTheDocument();
        expect(container.querySelector('nav[aria-label]')).toBeNull();
    });

    it('gives the timed surfaces their providers, so useCredit does not throw', async () => {
        /* REGRESSION: /writing/task/:taskId and /speaking/practice/:topicId sat outside the
           app shell — which is the intent, a timed surface has no chrome — but they were also
           outside the PROVIDER chain, and both read the credit price before the press. Each
           one threw "useCredit must be used inside CreditProvider" and rendered nothing at
           all. A blank screen is what the user reported.

           Rendering is the whole assertion: React rethrows a render error, so a missing
           provider fails this test. */
        const writing = await renderRoute('/writing/task/t1');
        expect(writing.container.textContent).not.toMatch(/useCredit/);

        const speaking = await renderRoute('/speaking/practice/t1');
        expect(speaking.container.textContent).not.toMatch(/useCredit/);
    });

    it('sends a guest away from a guarded route instead of firing 401s', async () => {
        const { container } = await renderRoute('/home');

        await waitFor(() => {
            expect(screen.queryByText(/Luyện 10 phút nhé/i)).not.toBeInTheDocument();
            expect(container.textContent).toMatch(/Học thử không cần tài khoản/);
        });

        expect(screen.queryByText(/Phiên đăng nhập đã hết hạn/i)).not.toBeInTheDocument();
    });

    it('does not flash the login card while the session is being restored', async () => {
        authState = { isAuthenticated: false, loading: true, user: null };
        const { container } = await renderRoute('/home');
        expect(container.querySelector('[role="status"]')).not.toBeNull();
        expect(container.querySelector('[role="alert"]')).toBeNull();
    });
});
