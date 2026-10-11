import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * The landing page is the only persuasive surface in the product, which makes it the
 * only place where invention is tempting. These tests pin the rules that stop it:
 *
 *  - **No fabricated proof.** No counters, no testimonials, no logo wall, no
 *    band-improvement claims. `PRODUCT.md` forbids all of it, so the assertions below
 *    are as much about what must NOT be present as what must.
 *  - **The product mock is LABELLED.** A screenshot-shaped illustration without a
 *    caption is the most common way a landing page lies.
 *  - **The guest trial is a PEER action**, at the same weight as sign-up, and it points
 *    at a route a guest can actually reach.
 */
let authState = { isAuthenticated: false, loading: false };

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => authState,
    AuthProvider: ({ children }) => children,
}));

const { i18nReady } = await import('../../i18n');
const { default: LandingPage } = await import('./LandingPage');

beforeAll(async () => {
    await i18nReady;
});

function renderLanding() {
    return render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );
}

describe('LandingPage — no fabricated proof', () => {
    it('shows no counters, user totals or testimonials', () => {
        authState = { isAuthenticated: false, loading: false };
        const { container } = renderLanding();
        const text = container.textContent;

        /* Any of these patterns appearing would mean invented social proof. */
        expect(text).not.toMatch(/\d[\d.,]*\s*(học viên|người dùng|users|students)/i);
        expect(text).not.toMatch(/(đánh giá|testimonial|review)\s*\d/i);
        expect(text).not.toMatch(/\d(\.\d)?\s*(sao|stars?)/i);
        expect(text).not.toMatch(/(tăng|nâng|cải thiện)\s+\d(\.\d)?\s*band/i);
    });

    it('makes no band-improvement promise anywhere', () => {
        authState = { isAuthenticated: false, loading: false };
        const { container } = renderLanding();
        const text = container.textContent;
        /* "band" may appear only in the honest, estimate-labelled sense. */
        expect(text).not.toMatch(/(cam kết|đảm bảo|chắc chắn)\s*(đạt|tăng)/i);
        expect(text).not.toMatch(/\+\s*\d(\.\d)?\s*band/i);
    });

    it('labels the product illustration as an illustration', () => {
        authState = { isAuthenticated: false, loading: false };
        const { container } = renderLanding();

        // the caption appears as figcaption AND inside the mock
        expect(screen.getAllByText(/Minh hoạ sản phẩm, không phải bài làm của người dùng thật/).length).toBeGreaterThan(0);
        expect(container.querySelector('figcaption')).not.toBeNull();
    });

    it('does not quote a price, pointing at the real cost table instead', () => {
        /* One source of truth for costs. A number on the landing page would drift. */
        authState = { isAuthenticated: false, loading: false };
        const { container } = renderLanding();
        expect(container.textContent).not.toMatch(/\d+\s*(đ|VND|vnđ|\$|USD)/);
        expect(screen.getByRole('link', { name: /Xem bảng chi phí/ })).toHaveAttribute('href', '/credits');
    });
});

describe('LandingPage — the guest trial is a peer action', () => {
    it('offers the guest trial at the same level as signing up', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();

        const links = screen.getAllByRole('link', { name: /Học thử không cần tài khoản/ });
        /* Hero and closing CTA both carry it. */
        expect(links.length).toBeGreaterThanOrEqual(2);
        for (const link of links) {
            expect(link).toHaveAttribute('href', '/vocabulary/check');
        }
    });

    it('states the daily limit rather than implying unlimited free use', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();
        expect(screen.getByText(/có giới hạn lượt mỗi ngày/)).toBeInTheDocument();
    });

    it('says no card is needed', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();
        expect(screen.getAllByText(/Không cần thẻ/).length).toBeGreaterThan(0);
    });
});

describe('LandingPage — the free boundary, stated not hidden', () => {
    it('lists the free surface positively as well as the paid one', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();

        /* 'Mien phi' is both the nav link and the free column heading. */
        expect(screen.getAllByText('Miễn phí').length).toBeGreaterThan(0);
        expect(screen.getByText('Tốn credit')).toBeInTheDocument();
        expect(screen.getByText(/Làm đề IELTS và xem lại từng câu/)).toBeInTheDocument();
        expect(screen.getByText(/AI giải thích từ vựng theo ngữ cảnh/)).toBeInTheDocument();
    });

    it('answers the "is it really free" question at the same honesty level', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();
        expect(screen.getByText('Phần học cốt lõi có thật sự miễn phí không?')).toBeInTheDocument();
        expect(screen.getByText(/bạn thấy số credit ngay trên nút trước khi bấm/)).toBeInTheDocument();
    });

    it('states that the streak is not a debt', () => {
        authState = { isAuthenticated: false, loading: false };
        renderLanding();
        expect(screen.getByText(/không phải một khoản nợ/)).toBeInTheDocument();
        expect(screen.getByText(/không thể mua thêm/)).toBeInTheDocument();
    });

    it('opens the first FAQ item with native details and no JavaScript widget', () => {
        authState = { isAuthenticated: false, loading: false };
        const { container } = renderLanding();
        const items = container.querySelectorAll('details');
        expect(items).toHaveLength(4);
        expect(items[0]).toHaveAttribute('open');
        // every one uses a native <summary>, so it is keyboard-accessible for free
        for (const item of items) {
            expect(item.querySelector('summary')).not.toBeNull();
        }
    });
});

describe('LandingPage — signed-in visitors', () => {
    it('shows a route into the app instead of the sign-in call to action', () => {
        authState = { isAuthenticated: true, loading: false };
        renderLanding();

        expect(screen.getAllByRole('link', { name: /Vào học/ }).length).toBeGreaterThan(0);
        for (const link of screen.getAllByRole('link', { name: /Vào học/ })) {
            expect(link).toHaveAttribute('href', '/home');
        }
        /* The marketing CTAs stay — a signed-in visitor may still want to see the page —
           but the NAV switches to a single direct route into the app, which is what
           stops a returning user having to hunt for it. */
        expect(screen.queryByRole('link', { name: /^Đăng nhập$/ })).not.toBeInTheDocument();
    });

});
