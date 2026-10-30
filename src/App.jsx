import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './app/RequireAuth';
import RootRedirect from './app/RootRedirect';

/**
 * Route owner.
 *
 * Every page is lazy so the first download carries only its own graph — v1
 * learned this the hard way (one 3.58MB chunk on the home page). Any static
 * import added here pulls that module into the first download, so this file stays
 * nearly import-free.
 *
 * Route grouping follows who may see what:
 *
 *   public      reachable without a session ("/" lands on the guest surface)
 *   guarded     needs a session; wrapped in RequireAuth
 *   timed       outside the app shell entirely — no nav, no mascot
 *
 * v1 sent a logged-out visitor on "/" to /vocabulary, which is the guest
 * surface, and this keeps that. Sending them to /home would fire four
 * authenticated requests and render four 401 panels.
 */
/**
 * The shell is LAZY, and that is load-bearing rather than stylistic.
 *
 * `AppLayout` mounts CreditProvider + RealtimeStompProvider +
 * VocabularyExplainProvider, and the STOMP client behind them is ~13 kB gzip. A
 * static import here would put all of it in the FIRST download for every
 * signed-out visitor, who uses none of it. (That is exactly what happened: with a
 * static import the entry chunk went 177.91 -> 190.63 kB gzip. Lazy, the entry
 * stays lean and the shell arrives with the first authenticated screen.)
 */
const AppLayout = lazy(() => import('./app/AppLayout'));
const ProviderLayout = lazy(() => import('./app/ProviderLayout'));
const VocabularyCheckLayout = lazy(() => import('./app/VocabularyCheckLayout'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const IeltsListPage = lazy(() => import('./pages/ielts/IeltsListPage'));
const IeltsTakePage = lazy(() => import('./pages/ielts/IeltsTakePage'));
const IeltsResultPage = lazy(() => import('./pages/ielts/IeltsResultPage'));
const IeltsTestDetailPage = lazy(() => import('./pages/ielts/IeltsTestDetailPage'));
const IeltsHistoryPage = lazy(() => import('./pages/ielts/IeltsHistoryPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/login/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/login/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/login/VerifyEmailPage'));
const VocabularyListPage = lazy(() => import('./pages/vocabulary/VocabularyListPage'));
const VocabularyTakePage = lazy(() => import('./pages/vocabulary/VocabularyTakePage'));
const VocabularyResultPage = lazy(() => import('./pages/vocabulary/VocabularyResultPage'));
const VocabularyHistoryPage = lazy(() => import('./pages/vocabulary/VocabularyHistoryPage'));
const DictionaryPage = lazy(() => import('./pages/vocabulary/DictionaryPage'));
const DictionaryReviewPage = lazy(() => import('./pages/vocabulary/DictionaryReviewPage'));
const VocabularyCheckPage = lazy(() => import('./pages/vocabulary/VocabularyCheckPage'));
const CreditsPage = lazy(() => import('./pages/credits/CreditsPage'));
const WeeklyReportPage = lazy(() => import('./pages/progress/WeeklyReportPage'));
const WritingListPage = lazy(() => import('./pages/writing/WritingListPage'));
const WritingTakePage = lazy(() => import('./pages/writing/WritingTakePage'));
const WritingResultPage = lazy(() => import('./pages/writing/WritingResultPage'));
const WritingHistoryPage = lazy(() => import('./pages/writing/WritingHistoryPage'));
const SpeakingListPage = lazy(() => import('./pages/speaking/SpeakingListPage'));
const SpeakingPracticePage = lazy(() => import('./pages/speaking/SpeakingPracticePage'));
const SpeakingResultPage = lazy(() => import('./pages/speaking/SpeakingResultPage'));
const SpeakingHistoryPage = lazy(() => import('./pages/speaking/SpeakingHistoryPage'));
const SpeakingConversationPage = lazy(() => import('./pages/speaking/SpeakingConversationPage'));
const SpeakingConversationResultPage = lazy(() => import('./pages/speaking/SpeakingConversationResultPage'));
const CustomSpeakingPage = lazy(() => import('./pages/speaking/CustomSpeakingPage'));
const CustomSpeakingConversationPage = lazy(() => import('./pages/speaking/CustomSpeakingConversationPage'));
const CustomSpeakingHistoryPage = lazy(() => import('./pages/speaking/CustomSpeakingHistoryPage'));
const CustomSpeakingResultPage = lazy(() => import('./pages/speaking/CustomSpeakingResultPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/account/SettingsPage'));
const NotificationCenterPage = lazy(() => import('./pages/notifications/NotificationCenterPage'));
const AiChatPage = lazy(() => import('./pages/chat/AiChatPage'));
const LeaderboardPage = lazy(() => import('./pages/gamification/LeaderboardPage'));
const RewardsPage = lazy(() => import('./pages/gamification/RewardsPage'));
const ChallengesPage = lazy(() => import('./pages/gamification/ChallengesPage'));
const EvaluationPage = lazy(() => import('./pages/evaluation/EvaluationPage'));
const ReviewConfigPage = lazy(() => import('./pages/evaluation/ReviewConfigPage'));
const ReviewSessionPage = lazy(() => import('./pages/evaluation/ReviewSessionPage'));
const ReviewResultPage = lazy(() => import('./pages/evaluation/ReviewResultPage'));
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));
const LearningPathPage = lazy(() => import('./pages/learning/LearningPathPage'));

function RouteFallback() {
    return (
        <div role="status" aria-busy="true" aria-live="polite" className="grid min-h-dvh place-items-center">
            <span className="sr-only">Đang tải…</span>
            <span className="size-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--teal)]" />
        </div>
    );
}

export default function App() {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route
                        path="/home"
                        element={
                            <RequireAuth>
                                <HomePage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/ielts"
                        element={
                            <RequireAuth>
                                <IeltsListPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/ielts/result"
                        element={
                            <RequireAuth>
                                <IeltsResultPage />
                            </RequireAuth>
                        }
                    />

                    
                    <Route
                        path="/ielts/test/:testId"
                        element={
                            <RequireAuth>
                                <IeltsTestDetailPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/ielts/history"
                        element={
                            <RequireAuth>
                                <IeltsHistoryPage />
                            </RequireAuth>
                        }
                    />
<Route
                        path="/vocabulary"
                        element={
                            <RequireAuth>
                                <VocabularyListPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/vocabulary/history"
                        element={
                            <RequireAuth>
                                <VocabularyHistoryPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/vocabulary/result"
                        element={
                            <RequireAuth>
                                <VocabularyResultPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/dictionary"
                        element={
                            <RequireAuth>
                                <DictionaryPage />
                            </RequireAuth>
                        }
                    />

                    

                    <Route
                        path="/credits"
                        element={
                            <RequireAuth>
                                <CreditsPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/weekly-report"
                        element={
                            <RequireAuth>
                                <WeeklyReportPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/writing"
                        element={
                            <RequireAuth>
                                <WritingListPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/writing/submissions"
                        element={
                            <RequireAuth>
                                <WritingHistoryPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/writing/submission/:submissionId"
                        element={
                            <RequireAuth>
                                <WritingResultPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/speaking"
                        element={
                            <RequireAuth>
                                <SpeakingListPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/speaking/attempts"
                        element={
                            <RequireAuth>
                                <SpeakingHistoryPage />
                            </RequireAuth>
                        }
                    />
                    {/* v1's address for the conversation tab, still linked from old pages and
                        bookmarks. SCREENS-V2.md 24d already describes it as a pure redirect; the
                        app had no such route, so it fell through to /home. */}
                    <Route
                        path="/speaking/conversation/history"
                        element={<Navigate to="/speaking/attempts?tab=conversation" replace />}
                    />
                    <Route
                        path="/speaking/result/:attemptId"
                        element={
                            <RequireAuth>
                                <SpeakingResultPage />
                            </RequireAuth>
                        }
                    />

                    {/* The conversation's RESULT is a shell screen: once the conversation is over, its
                        exits are navigation rather than a decision to make under time. The dialogue
                        itself lives outside the shell, in the ProviderLayout branch below — a chat
                        that has to share the viewport with a rail and a tab bar cannot stretch. */}
                    <Route
                        path="/speaking/conversation/result/:conversationId"
                        element={
                            <RequireAuth>
                                <SpeakingConversationResultPage />
                            </RequireAuth>
                        }
                    />

                    
                    <Route
                        path="/custom-speaking"
                        element={
                            <RequireAuth>
                                <CustomSpeakingPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/custom-speaking/custom"
                        element={<Navigate to="/custom-speaking" replace />}
                    />
                    <Route
                        path="/custom-speaking/history"
                        element={
                            <RequireAuth>
                                <CustomSpeakingHistoryPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/custom-speaking/:conversationId"
                        element={
                            <RequireAuth>
                                <CustomSpeakingResultPage />
                            </RequireAuth>
                        }
                    />
<Route
                        path="/profile"
                        element={
                            <RequireAuth>
                                <ProfilePage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <RequireAuth>
                                <SettingsPage />
                            </RequireAuth>
                        }
                    />

                    {/* The rail has linked here since the first v2 build — `navigation.js`
                        lists it and `pageTitles.js` names it — but no route existed, so the
                        catch-all silently sent the learner to /home instead. */}
                    <Route
                        path="/path"
                        element={
                            <RequireAuth>
                                <LearningPathPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <RequireAuth>
                                <NotificationCenterPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/ai-chat"
                        element={
                            <RequireAuth>
                                <AiChatPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/leaderboard"
                        element={
                            <RequireAuth>
                                <LeaderboardPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/rewards"
                        element={
                            <RequireAuth>
                                <RewardsPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/challenges"
                        element={
                            <RequireAuth>
                                <ChallengesPage />
                            </RequireAuth>
                        }
                    />

                    <Route
                        path="/evaluation"
                        element={
                            <RequireAuth>
                                <EvaluationPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/review"
                        element={
                            <RequireAuth>
                                <ReviewConfigPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/review/result"
                        element={
                            <RequireAuth>
                                <ReviewResultPage />
                            </RequireAuth>
                        }
                    />
<Route path="*" element={<Navigate to="/home" replace />} />
                </Route>

                {/* The root is OUTSIDE the shell, and that is a fix rather than a
                    preference. `RootRedirect` renders the landing page for a visitor with
                    no session, and the landing page is a full-bleed surface with its own
                    sticky header and hero. Inside `AppLayout` it was rendering with the
                    sidebar AND a second header above it, plus an avatar and a notification
                    badge that belong to an account the visitor does not have. A signed-in
                    user never sees this branch — it redirects to /home, which does mount
                    the shell. */}
                <Route path="/" element={<RootRedirect />} />

                {/* Outside the shell on purpose: /login is a full-bleed split
                    panel, not a page inside the app chrome. It also MUST be a real
                    route — RequireAuth redirects here, and a redirect target that
                    does not exist falls through to the catch-all, which sends the
                    visitor back to the guarded route. That is an infinite loop and
                    it hangs the browser. */}
                <Route path="/login" element={<LoginPage />} />

                {/* Ba màn khôi phục tài khoản, cùng lý do nằm ngoài shell như /login: người dùng
                    tới đây chưa có phiên (hoặc vừa mất phiên), nên rail/tab bar/bell là chrome của
                    một tài khoản họ chưa vào được. Link trong mail trỏ thẳng vào các route này. */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Timed surfaces sit outside the shell: no sidebar, no tab bar, no
                    floating Lexi. A test screen must not offer a way to wander off,
                    and the mascot must not talk mid-paper.

                    Note the ORDER matters here: "/vocabulary/test" must be declared
                    before any "/vocabulary" shell route could swallow it. React
                    Router v6 ranks static segments above dynamic ones, so an exact
                    "/vocabulary/test" wins over the shell's catch-all either way —
                    but keeping them in separate branches makes the intent explicit. */}
                <Route path="/ielts/take" element={<IeltsTakePage />} />
                <Route path="/vocabulary/test" element={<VocabularyTakePage />} />
                {/* The review PRACTICE step sits here too, for the same reason as the test screens:
                    a session is a focused surface, so it carries no rail to wander into and keeps its
                    action in a sticky footer. The RESULT step is deliberately inside the shell above,
                    because once the session is over its exits are navigation rather than a decision
                    to make under time. */}
                <Route
                    path="/review/session"
                    element={
                        <RequireAuth>
                            <ReviewSessionPage />
                        </RequireAuth>
                    }
                />
                <Route path="/dictionary/review" element={<DictionaryReviewPage />} />

                {/* Public surfaces. The landing page is the root for a visitor; the
                    guest trial is a real no-account surface, matching the promise made
                    on the landing page and the login card.

                    /vocabulary/check wears TWO chromes, decided by `VocabularyCheckLayout`:
                    a visitor gets the full-bleed trial (provider chain, no sidebar / tab bar /
                    floating Lexi — chrome that belongs to an account they do not have), and a
                    signed-in learner gets it INSIDE the shell, which is how the mockup draws
                    screen 07 and what the rail's "Học" destination implies. Showing the guest
                    chrome to a signed-in learner was the reported defect: the page read as guest
                    mode with a "Đăng nhập" button in its header and no way back into the app.

                    THE OTHER TWO ROUTES HERE ARE ALWAYS CHROME-FREE, and they need the same
                    chain: /writing/task/:taskId and /speaking/practice/:topicId both read the
                    credit price before the press, so without it they threw
                    "useCredit must be used inside CreditProvider" and rendered nothing.
                    A timed surface without chrome is the intent; a timed surface
                    without its providers is a blank screen. */}
                <Route element={<ProviderLayout />}>
                    <Route path="/writing/task/:taskId" element={<WritingTakePage />} />
                    <Route path="/speaking/practice/:topicId" element={<SpeakingPracticePage />} />
                    {/* THE CONVERSATION IS ONE OF THESE. Its mockup is full-bleed and exactly one
                        viewport tall — the log stretches and the answer panel is docked to the
                        bottom, which inside the shell is impossible: the rail, the shell header
                        and the phone tab bar all eat the height the chat needs. It also reads the
                        credit price before the first press, so it needs ProviderLayout for the
                        same reason the line above does. The RESULT step (24c) stays inside the
                        shell above: once the conversation is over, its exits are navigation. */}
                    <Route
                        path="/speaking/conversation/resume/:conversationId"
                        element={<SpeakingConversationPage />}
                    />
                    <Route path="/speaking/conversation/:topicId" element={<SpeakingConversationPage />} />
                    {/* Custom speaking's chat, outside the shell for the same reason: it is one
                        viewport tall, with its own scrollport and a docked composer. Its result
                        (27e) stays inside the shell. */}
                    <Route
                        path="/custom-speaking/conversation/:conversationId"
                        element={<CustomSpeakingConversationPage />}
                    />
                </Route>
                <Route element={<VocabularyCheckLayout />}>
                    <Route path="/vocabulary/check" element={<VocabularyCheckPage />} />
                </Route>

                {/* Onboarding is a focused flow, so it is outside the shell: no sidebar, no
                    tab bar, no floating Lexi offering a way out of a four-question setup.
                    It IS behind RequireAuth — the flow writes to the visitor's own profile,
                    and a guest has no profile to write to.

                    It is reachable by URL at any time, which is what makes "làm lại
                    onboarding" from Settings a plain link rather than a special mode. */}
                <Route
                    path="/onboarding"
                    element={
                        <RequireAuth>
                            <OnboardingPage />
                        </RequireAuth>
                    }
                />
            </Routes>
        </Suspense>
    );
}
