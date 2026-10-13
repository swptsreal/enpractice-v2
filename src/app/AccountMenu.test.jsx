import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/**
 * The account block in the shell header — screen `33b` of the design package.
 *
 * What it must do, and why each assertion is here:
 *
 *  - the panel is CLOSED until the avatar is pressed, and `aria-expanded` says which it is. Without
 *    a tested closed state the panel ships open, over the page, on every screen;
 *  - it shows the REAL avatar when the account has one and the display-name initial when it does
 *    not — `avatarUrl` is null for a new account, verified against the running backend;
 *  - it shows the membership tier and its expiry, and says "no expiry" rather than leaving a gap;
 *  - Escape closes it and returns focus to the button, because otherwise a keyboard user is dropped
 *    at the top of the document;
 *  - navigating CLOSES it. `AppLayout` survives a route change, so a panel that is not keyed to the
 *    route hangs over the screen the learner just moved to.
 */
const logout = vi.fn();
let authUser = {};

vi.mock('../contexts/AuthContext', async () => {
    const { createContext } = await import('react');
    return {
        default: createContext(null),
        useAuth: () => ({ user: authUser, isAuthenticated: true, loading: false, logout }),
    };
});

const { i18nReady } = await import('../i18n');
const { default: AccountMenu } = await import('./AccountMenu');

beforeAll(async () => {
    await i18nReady;
});

beforeEach(() => {
    logout.mockReset();
    authUser = {
        displayName: 'Minh Anh',
        email: 'minh.anh@example.com',
        avatarUrl: null,
        membershipTier: 'PREMIUM',
        membershipActive: true,
        membershipExpiresAt: '2026-11-12T00:00:00Z',
    };
});

function renderMenu(initialPath = '/home') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="*" element={<AccountMenu />} />
            </Routes>
        </MemoryRouter>
    );
}

const avatarButton = () => screen.getByRole('button', { name: /Menu tài khoản/i });

describe('AccountMenu — the disclosure', () => {
    it('is closed until the avatar is pressed, and says so with aria-expanded', async () => {
        const user = userEvent.setup();
        renderMenu();

        expect(avatarButton()).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('minh.anh@example.com')).not.toBeInTheDocument();

        await user.click(avatarButton());

        expect(avatarButton()).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('minh.anh@example.com')).toBeInTheDocument();
    });

    it('shows the initial when there is no avatar, and the image when there is one', async () => {
        const user = userEvent.setup();
        const { unmount } = renderMenu();
        await user.click(avatarButton());
        /* Two nodes carry the initial: the 44px button and the 48px identity row in the panel. */
        expect(screen.getAllByText('M').length).toBeGreaterThan(0);
        unmount();

        /* A SECOND render, not a click on the unmounted tree: the point is the other branch of the
           same decision, and clicking a detached DOM does nothing. */
        authUser = { ...authUser, avatarUrl: 'https://cdn.example.com/me.png' };
        const { container } = renderMenu();
        await user.click(avatarButton());

        /* Queried as an ELEMENT, not by role: the avatar carries `alt=""` on purpose (the button
           already has an accessible name, so a described image would be read twice), and an
           empty-alt image is presentational — `getByRole('img')` will never find it. */
        const images = container.querySelectorAll('img');
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', 'https://cdn.example.com/me.png');
    });

    it('states the membership tier and its expiry date', async () => {
        const user = userEvent.setup();
        renderMenu();
        await user.click(avatarButton());

        /* The tier appears twice on purpose: as the header chip (hidden below lg by CSS, still in
           the DOM) and as the line inside the panel. */
        expect(screen.getAllByText('Premium').length).toBeGreaterThan(1);
        expect(screen.getByText(/Hạng thành viên/)).toBeInTheDocument();
        expect(screen.getByText(/Hết hạn/)).toBeInTheDocument();
    });

    it('says "no expiry" instead of leaving the line empty', async () => {
        authUser = { ...authUser, membershipExpiresAt: null };
        const user = userEvent.setup();
        renderMenu();
        await user.click(avatarButton());

        expect(screen.getByText('Không có ngày hết hạn')).toBeInTheDocument();
    });

    it('reports an inactive membership as expired, whatever the date says', async () => {
        /* The backend computes `membershipActive` from the tier AND the date, so the client must
           not re-derive it: a future expiry with active=false is still expired. */
        authUser = { ...authUser, membershipActive: false, membershipExpiresAt: '2099-01-01T00:00:00Z' };
        const user = userEvent.setup();
        renderMenu();
        await user.click(avatarButton());

        expect(screen.getByText('Membership đã hết hạn')).toBeInTheDocument();
    });

    it('closes on Escape and hands focus back to the button', async () => {
        const user = userEvent.setup();
        renderMenu();
        await user.click(avatarButton());
        await user.keyboard('{Escape}');

        expect(avatarButton()).toHaveAttribute('aria-expanded', 'false');
        expect(avatarButton()).toHaveFocus();
    });

    it('closes when the route changes, so it cannot hang over the next screen', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/home']}>
                <AccountMenu />
                <Routes>
                    <Route path="/home" element={<a href="/settings">to settings</a>} />
                    <Route path="/settings" element={<p>settings screen</p>} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(avatarButton());
        expect(screen.getByText('minh.anh@example.com')).toBeInTheDocument();

        /* The panel's own link: it closes on click AND the route change keys it shut. */
        await user.click(screen.getByRole('link', { name: 'Cài đặt' }));

        expect(await screen.findByText('settings screen')).toBeInTheDocument();
        expect(screen.queryByText('minh.anh@example.com')).not.toBeInTheDocument();
    });

    it('offers the three account destinations and signs out', async () => {
        const user = userEvent.setup();
        renderMenu();
        await user.click(avatarButton());

        expect(screen.getByRole('link', { name: 'Cá nhân' })).toHaveAttribute('href', '/profile');
        expect(screen.getByRole('link', { name: 'Cài đặt' })).toHaveAttribute('href', '/settings');
        expect(screen.getByRole('link', { name: 'Thông báo' })).toHaveAttribute('href', '/notifications');

        await user.click(screen.getByRole('button', { name: 'Đăng xuất' }));
        expect(logout).toHaveBeenCalledTimes(1);
        /* Signing out must not leave the panel open over the login screen. */
        expect(avatarButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not claim a menu role it does not implement', async () => {
        /* The APG menu pattern requires arrow-key navigation. This panel is a list of links, so it
           must NOT advertise `role="menu"` — a promise the keyboard cannot keep. */
        const user = userEvent.setup();
        const { container } = renderMenu();
        await user.click(avatarButton());

        expect(container.querySelector('[role="menu"]')).toBeNull();
        expect(avatarButton()).toHaveAttribute('aria-haspopup', 'true');
    });
});
