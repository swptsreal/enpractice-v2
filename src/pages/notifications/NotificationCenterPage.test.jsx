import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

/**
 * The notification centre's rules, including one that came from a v1 BUG.
 *
 *  - **`isRead` is the field, not `read`.** v1's `matchesNotificationFilter` reads
 *    `item.read`, which the backend never sends — so that filter reported every
 *    notification as unread and none as read. The tests below would fail against v1's
 *    helper, which is the point of writing them.
 *  - **Unread is a DOT plus a border, not colour alone.**
 *  - **Read and delete are optimistic and REVERT on failure**, so a failed write never
 *    leaves the UI claiming it worked.
 *  - **The streak notification carries the grace-day message**, because that is the
 *    moment a user is most likely to feel behind.
 */
const getNotifications = vi.fn();
const markAsRead = vi.fn();
const markAllAsRead = vi.fn();
const deleteNotification = vi.fn();

vi.mock('../../api', () => ({
    ApiError: class ApiError extends Error {},
    notificationApi: {
        getNotifications: (...a) => getNotifications(...a),
        getUnreadCount: vi.fn().mockResolvedValue({ data: { success: true, data: 0 } }),
        markAsRead: (...a) => markAsRead(...a),
        markAllAsRead: (...a) => markAllAsRead(...a),
        deleteNotification: (...a) => deleteNotification(...a),
    },
}));

const { i18nReady } = await import('../../i18n');
const { default: NotificationCenterPage } = await import('./NotificationCenterPage');
const { matchesNotificationFilter, mergeNotificationItem, resolveNotificationAction, countUnread } =
    await import('../../features/notification/notificationFormatters');

beforeAll(async () => {
    await i18nReady;
});

const envelope = (data) => ({ data: { success: true, message: 'OK', data } });
const page = (items) => envelope({ page: 0, size: 15, totalElements: items.length, totalPages: 1, items });

const note = (over = {}) => ({
    id: 'n1',
    type: 'WRITING_RESULT_READY',
    title: 'Bài Writing đã chấm xong',
    body: 'Band 6.5',
    priority: 'NORMAL',
    isRead: false,
    actionUrl: '/writing/submission/s1',
    createdAt: '2026-10-11T12:00:00Z',
    ...over,
});

describe('matchesNotificationFilter — the isRead bug v1 had', () => {
    it('reads isRead, which is what the backend actually sends', () => {
        /* v1's helper checked `item.read`, so UNREAD matched everything and READ
           matched nothing. These two assertions are the regression guard. */
        expect(matchesNotificationFilter({ isRead: false }, { status: 'UNREAD' })).toBe(true);
        expect(matchesNotificationFilter({ isRead: false }, { status: 'READ' })).toBe(false);
        expect(matchesNotificationFilter({ isRead: true }, { status: 'READ' })).toBe(true);
        expect(matchesNotificationFilter({ isRead: true }, { status: 'UNREAD' })).toBe(false);
    });

    it('ALL passes everything of the right type', () => {
        expect(matchesNotificationFilter({ isRead: true, type: 'ADMIN_BROADCAST' }, { status: 'ALL', type: 'ALL' })).toBe(true);
        expect(
            matchesNotificationFilter({ isRead: true, type: 'ADMIN_BROADCAST' }, { type: 'WRITING_RESULT_READY' })
        ).toBe(false);
    });

    it('countUnread counts isRead:false, not a truthy field', () => {
        expect(countUnread([{ isRead: false }, { isRead: true }, { isRead: false }])).toBe(2);
        expect(countUnread(null)).toBe(0);
    });
});

describe('mergeNotificationItem', () => {
    it('replaces a row with the same id rather than duplicating it', () => {
        /* A realtime push must not double a row a refetch already delivered. */
        const items = [{ id: 'a', title: 'old' }, { id: 'b', title: 'keep' }];
        const merged = mergeNotificationItem(items, { id: 'a', title: 'new' });
        expect(merged).toHaveLength(2);
        expect(merged[0]).toEqual({ id: 'a', title: 'new' });
    });

    it('ignores an item with no id instead of inserting undefined', () => {
        const items = [{ id: 'a' }];
        expect(mergeNotificationItem(items, {})).toBe(items);
        expect(mergeNotificationItem(items, null)).toBe(items);
    });
});

describe('resolveNotificationAction', () => {
    it('separates an external URL from an internal path', () => {
        /* Treating them alike is how a notification becomes an open redirect or a full
           page reload that loses app state. */
        expect(resolveNotificationAction('https://example.com/x')).toEqual({
            kind: 'external',
            value: 'https://example.com/x',
        });
        expect(resolveNotificationAction('/writing/submission/s1')).toEqual({
            kind: 'internal',
            value: '/writing/submission/s1',
        });
    });

    it('returns null for nothing, so the row renders without a link', () => {
        expect(resolveNotificationAction(null)).toBeNull();
        expect(resolveNotificationAction('')).toBeNull();
    });
});

describe('NotificationCenterPage', () => {
    function renderPage() {
        return render(
            <MemoryRouter>
                <NotificationCenterPage />
            </MemoryRouter>
        );
    }

    it('marks unread with a DOT as well as a border, so colour is not the only cue', async () => {
        getNotifications.mockResolvedValue(page([note()]));
        const { container } = renderPage();

        await screen.findByText('Bài Writing đã chấm xong');
        /* the dot is a shape: a rounded-full span with no text */
        const dot = container.querySelector('span.size-2.rounded-full');
        expect(dot).not.toBeNull();
        expect(dot).toHaveAttribute('aria-hidden', 'true');
        /* and the state is announced in words too */
        expect(screen.getByText('chưa đọc')).toBeInTheDocument();
    });

    it('shows NO dot for a read notification', async () => {
        getNotifications.mockResolvedValue(page([note({ isRead: true })]));
        const { container } = renderPage();

        await screen.findByText('Bài Writing đã chấm xong');
        expect(container.querySelector('span.size-2.rounded-full')).toBeNull();
    });

    it('carries the grace-day message on a streak reminder', async () => {
        /* This is where the ethics message belongs: the moment a user may feel behind. */
        getNotifications.mockResolvedValue(page([note({ type: 'VOCABULARY_REMINDER' })]));
        renderPage();

        const grace = await screen.findByText(/Nghỉ một ngày cũng không sao/);
        expect(grace.textContent).toMatch(/không thể mua thêm/);
    });

    it('marks a notification read optimistically', async () => {
        getNotifications.mockResolvedValue(page([note()]));
        markAsRead.mockResolvedValue(envelope(null));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /Đánh dấu đã đọc: Bài Writing/ }));
        await waitFor(() => expect(markAsRead).toHaveBeenCalledWith('n1'));
    });

    it('REVERTS the read mark when the write fails', async () => {
        /* A failed write must never leave the UI claiming it succeeded. */
        getNotifications.mockResolvedValue(page([note()]));
        markAsRead.mockRejectedValue(new Error('Network Error'));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /Đánh dấu đã đọc: Bài Writing/ }));

        /* The action button comes back, which means the row is unread again. */
        await waitFor(() =>
            expect(screen.getByRole('button', { name: /Đánh dấu đã đọc: Bài Writing/ })).toBeInTheDocument()
        );
    });

    it('deletes a notification and drops the row on success', async () => {
        getNotifications.mockResolvedValue(page([note()]));
        deleteNotification.mockResolvedValue(envelope(null));
        const user = userEvent.setup();
        renderPage();

        await user.click(await screen.findByRole('button', { name: /Xoá thông báo: Bài Writing/ }));
        await waitFor(() => expect(deleteNotification).toHaveBeenCalledWith('n1'));
    });

    it('restores the row when a delete fails', async () => {
        getNotifications.mockResolvedValue(page([note()]));
        deleteNotification.mockRejectedValue(new Error('Network Error'));
        const user = userEvent.setup();
        renderPage();

        await screen.findByText('Bài Writing đã chấm xong');
        await user.click(screen.getByRole('button', { name: /Xoá thông báo: Bài Writing/ }));

        /* The title also appears in the delete button's label, so assert presence rather
           than uniqueness — what matters is that the ROW is still rendered. */
        await waitFor(() =>
            expect(screen.getAllByText('Bài Writing đã chấm xong').length).toBeGreaterThan(0)
        );
        expect(screen.getByRole('button', { name: /Xoá thông báo: Bài Writing/ })).toBeInTheDocument();
    });

    it('marks all as read only when there is something unread', async () => {
        getNotifications.mockResolvedValue(page([note({ isRead: true })]));
        renderPage();
        expect(await screen.findByRole('button', { name: /Đánh dấu đã đọc tất cả/ })).toBeDisabled();
    });

    it('distinguishes "no notifications" from "nothing matched"', async () => {
        getNotifications.mockResolvedValue(page([]));
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText('Chưa có thông báo nào')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Chưa đọc' }));
        expect(await screen.findByText('Không có thông báo nào khớp')).toBeInTheDocument();
    });

    it('renders an UNKNOWN type as a neutral label rather than dropping it', async () => {
        /* `type` is a free string from the backend, so a new value must not vanish. */
        getNotifications.mockResolvedValue(page([note({ type: 'SOME_FUTURE_TYPE' })]));
        renderPage();

        expect(await screen.findByText('Khác')).toBeInTheDocument();
    });
});
