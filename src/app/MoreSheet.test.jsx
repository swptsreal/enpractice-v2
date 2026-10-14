import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TabBar } from './Shell';
import { MoreSheet } from './MoreSheet';
import * as authContext from '../contexts/AuthContext';

function renderWithProviders(ui, { route = '/', authValue = null } = {}) {
    const defaultAuth = {
        isAuthenticated: true,
        user: { displayName: 'Minh Anh', email: 'minh.anh@example.com', membershipTier: 'Premium' },
        logout: vi.fn(),
    };

    vi.spyOn(authContext, 'useAuth').mockReturnValue(authValue ?? defaultAuth);

    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
}

describe('Mobile navigation and MoreSheet', () => {
    it('renders 5 items in mobile TabBar with "Thêm" as the 5th item button', () => {
        const onToggleMore = vi.fn();
        renderWithProviders(<TabBar onToggleMore={onToggleMore} moreOpen={false} />);

        const moreBtn = screen.getByRole('button', { name: /Thêm/i });
        expect(moreBtn).toBeInTheDocument();
        expect(moreBtn).toHaveAttribute('aria-haspopup', 'dialog');
        expect(moreBtn).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(moreBtn);
        expect(onToggleMore).toHaveBeenCalledTimes(1);
    });

    it('renders MoreSheet dialog when open with user info and sidebar destinations', () => {
        const onClose = vi.fn();
        renderWithProviders(<MoreSheet open={true} onClose={onClose} />);

        const dialog = screen.getByRole('dialog', { name: /Thêm/i });
        expect(dialog).toBeInTheDocument();

        // User info
        expect(screen.getByText('Minh Anh')).toBeInTheDocument();
        expect(screen.getByText('minh.anh@example.com')).toBeInTheDocument();
        expect(screen.getByText('Premium')).toBeInTheDocument();

        // Remaining sidebar links exist
        expect(screen.getByRole('link', { name: /Cá nhân|Hồ sơ/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Lộ trình học/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Sổ tay từ vựng/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tra từ & hỏi AI/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ôn tập từ vựng/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Luyện Writing/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Luyện Speaking/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^Hội thoại tự chọn$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^Từ vựng$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^Bảng xếp hạng$/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Phần thưởng/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ví credit/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Thông báo/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Cài đặt/i })).toBeInTheDocument();
    });

    it('closes on Escape key press or close button click', () => {
        const onClose = vi.fn();
        renderWithProviders(<MoreSheet open={true} onClose={onClose} />);

        const closeBtn = screen.getByRole('button', { name: /Đóng|Close/i });
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('calls onClose when clicking a navigation link inside MoreSheet', () => {
        const onClose = vi.fn();
        renderWithProviders(<MoreSheet open={true} onClose={onClose} />);

        const link = screen.getByRole('link', { name: /Lộ trình học/i });
        fireEvent.click(link);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
