import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The onboarding wizard (screen 03).
 *
 * What these tests defend, in order of how badly it would hurt:
 *
 *  1. **Skipping a question must not send null for it.** The backend applies only the fields
 *     it receives, so a `null` is a request to ERASE a goal. "Bỏ qua" has to mean
 *     "leave it alone", and only the payload shape proves that.
 *  2. **The version comes from the server.** A hardcoded client version breaks silently the
 *     day the backend bumps it.
 *  3. **Reopening does not erase.** The wizard starts from the values already on the
 *     account instead of from an empty form.
 *  4. **The flow can always be left.** Four questions before a user has seen the product is
 *     a lot to ask; "Bỏ qua" on a step and "Để sau" at the end are both real exits.
 */
const getProfile = vi.fn();
const submitOnboarding = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    profileApi: {
        getProfile: (...args) => getProfile(...args),
        submitOnboarding: (...args) => submitOnboarding(...args),
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: OnboardingPage } = await import('./OnboardingPage');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    getProfile.mockReset();
    submitOnboarding.mockReset();
    submitOnboarding.mockResolvedValue({ data: { success: true, message: 'OK', data: {} } });
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });

/** A brand-new account, exactly as the running backend reports it. */
const NEW_PROFILE = {
    id: 'u1',
    email: 'new@enpractice.test',
    displayName: 'New Learner',
    goals: {
        targetIeltsBand: null,
        targetExamDate: null,
        dailyGoalMinutes: 30,
        weeklyWordGoal: null,
        preferredSkill: null,
        preferredLanguage: null,
    },
    onboarding: { status: 'NOT_STARTED', version: null, requiredVersion: 1, required: true, completedAt: null },
};

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/onboarding']}>
            <Routes>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/home" element={<div>home screen</div>} />
                <Route path="/settings" element={<div>settings screen</div>} />
            </Routes>
        </MemoryRouter>
    );
}

const next = () => screen.getByRole('button', { name: 'Tiếp tục' });

describe('OnboardingPage — step 1, the band goal', () => {
    it('asks one question and pre-selects the account state rather than a suggestion', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderPage();

        expect(await screen.findByRole('heading', { level: 1, name: /nhắm band nào/ })).toBeInTheDocument();

        /* The account has no goal, so "Chưa xác định" is the pressed row — the screen states
           what is true instead of pre-picking a band the user never chose. */
        const unknown = screen.getByRole('button', { name: /Chưa xác định/ });
        expect(unknown).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /^6\.5/ })).toHaveAttribute('aria-pressed', 'false');
    });

    it('presents the band as a 76px row button with aria-pressed, not a hidden radio', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        renderPage();

        const pressed = await screen.findAllByRole('button', { pressed: true });
        expect(pressed).toHaveLength(1);
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
});

describe('OnboardingPage — the full flow', () => {
    it('walks the four steps and submits every answer with the SERVER version', async () => {
        getProfile.mockResolvedValue(
            envelope({ ...NEW_PROFILE, onboarding: { ...NEW_PROFILE.onboarding, requiredVersion: 3 } })
        );
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /^6\.5/ }));
        await user.click(next());

        expect(await screen.findByRole('heading', { level: 1, name: /khó nhất với bạn/ })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /^Listening/ }));
        await user.click(next());

        expect(await screen.findByRole('heading', { level: 1, name: /học được bao lâu/ })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /^45 phút/ }));
        await user.click(next());

        expect(await screen.findByRole('heading', { level: 1, name: /Xong rồi/ })).toBeInTheDocument();
        /* The summary shows what will be sent, before it is sent. */
        expect(screen.getByText('6.5')).toBeInTheDocument();
        expect(screen.getByText('Listening')).toBeInTheDocument();
        expect(screen.getByText('45 phút')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Bắt đầu học/ }));

        await waitFor(() => expect(submitOnboarding).toHaveBeenCalledTimes(1));
        expect(submitOnboarding).toHaveBeenCalledWith({
            status: 'COMPLETED',
            version: 3,
            targetIeltsBand: 6.5,
            preferredSkill: 'LISTENING',
            dailyGoalMinutes: 45,
        });
        expect(await screen.findByText('home screen')).toBeInTheDocument();
    });

    it('OMITS a skipped question instead of sending null for it', async () => {
        /* Null would erase, and re-sending the prefill would revert a change made on another
           device. A skipped question is simply absent from the request. */
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole('heading', { level: 1, name: /nhắm band nào/ });
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));

        expect(await screen.findByRole('heading', { level: 1, name: /Xong rồi/ })).toBeInTheDocument();
        /* The summary still states the account's current daily goal — that is what is true,
           not a choice the user made here. */
        expect(screen.getByText('30 phút')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Bắt đầu học/ }));

        await waitFor(() => expect(submitOnboarding).toHaveBeenCalledTimes(1));
        const payload = submitOnboarding.mock.calls[0][0];
        expect(payload).toEqual({ status: 'COMPLETED', version: 1 });
        expect('targetIeltsBand' in payload).toBe(false);
        expect('preferredSkill' in payload).toBe(false);
        expect('dailyGoalMinutes' in payload).toBe(false);
    });

    it('records a deliberate skip as SKIPPED, which stops the wizard asking again', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole('heading', { level: 1, name: /nhắm band nào/ });
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await screen.findByRole('heading', { level: 1, name: /Xong rồi/ });

        await user.click(screen.getByRole('button', { name: 'Để sau' }));

        await waitFor(() => expect(submitOnboarding).toHaveBeenCalledTimes(1));
        expect(submitOnboarding.mock.calls[0][0].status).toBe('SKIPPED');
    });
});

describe('OnboardingPage — reopening it later', () => {
    const TARGETED_PROFILE = {
        ...NEW_PROFILE,
        goals: { ...NEW_PROFILE.goals, targetIeltsBand: 7.0, preferredSkill: 'WRITING', dailyGoalMinutes: 45 },
        onboarding: { status: 'COMPLETED', version: 1, requiredVersion: 1, required: false, completedAt: null },
    };

    it('starts from the values already on the account', async () => {
        getProfile.mockResolvedValue(envelope(TARGETED_PROFILE));
        renderPage();

        expect(await screen.findByRole('button', { name: /^7\.0/ })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Chưa xác định/ })).toHaveAttribute('aria-pressed', 'false');
    });

    it('sends only the field the user actually changed', async () => {
        getProfile.mockResolvedValue(envelope(TARGETED_PROFILE));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /^6\.0/ }));
        await user.click(next());
        await user.click(next());
        await user.click(next());
        await user.click(await screen.findByRole('button', { name: /Bắt đầu học/ }));

        await waitFor(() => expect(submitOnboarding).toHaveBeenCalledTimes(1));
        /* 6.0 replaces 7.0. The skill and the daily goal are NOT re-sent — they appeared in
           the summary only because that is what the account currently holds. */
        expect(submitOnboarding).toHaveBeenCalledWith({
            status: 'COMPLETED',
            version: 1,
            targetIeltsBand: 6.0,
        });
    });

    it('shows an error and stays on the screen when the save fails', async () => {
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        submitOnboarding.mockRejectedValue(new Error('boom'));
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole('heading', { level: 1, name: /nhắm band nào/ });
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(await screen.findByRole('button', { name: /Bắt đầu học/ }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/Chưa lưu được lựa chọn/);
        expect(screen.queryByText('home screen')).not.toBeInTheDocument();
    });

    it('cannot submit a version it has not been told, and says why', async () => {
        /* No profile means no `requiredVersion`; a guessed version would be rejected by the
           backend at best and accepted wrongly at worst. The button is disabled AND the
           footer names the reason — a dead control with no explanation is the thing this
           product does not ship. */
        getProfile.mockResolvedValue(
            envelope({ ...NEW_PROFILE, onboarding: { status: 'NOT_STARTED', requiredVersion: null } })
        );
        renderPage();

        const start = await screen.findByRole('button', { name: /Bắt đầu học|Tiếp tục/ });
        expect(start).toBeDisabled();
        expect(screen.getByText(/Máy chủ chưa hỗ trợ lưu phần thiết lập này/)).toBeInTheDocument();
    });

    it('stays quiet about support when the save itself failed', async () => {
        /* A real rejection is not a version problem, and saying both would be wrong. */
        getProfile.mockResolvedValue(envelope(NEW_PROFILE));
        submitOnboarding.mockRejectedValue(new Error('boom'));
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole('heading', { level: 1, name: /nhắm band nào/ });
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(screen.getByRole('button', { name: 'Bỏ qua' }));
        await user.click(await screen.findByRole('button', { name: /Bắt đầu học/ }));

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(/Máy chủ chưa hỗ trợ/)).not.toBeInTheDocument();
    });
});
