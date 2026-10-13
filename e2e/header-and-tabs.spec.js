import { expect, test } from '@playwright/test';
import { collectPageProblems, expectNoProblems, gotoWithRetry } from './helpers/guards.js';

/**
 * The two pieces of chrome the review asked for: the account menu in the header, and Rewards
 * split into tabs.
 *
 * Both are asserted in a browser for the same reason: the account menu is a disclosure whose whole
 * contract is interaction, and "two tabs, one panel" is a structural claim about what is mounted —
 * a jsdom test can see the DOM but not that the second panel is genuinely absent from the page a
 * learner looks at.
 */
test.describe('account menu in the header', () => {
    test('opens from the avatar, shows the real account, and closes on Escape', async ({ page }) => {
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });

        const avatar = page.getByRole('button', { name: /Menu tài khoản|Account menu/ });
        await expect(avatar).toHaveAttribute('aria-expanded', 'false');

        const urlBefore = page.url();
        await avatar.click();
        await expect(avatar).toHaveAttribute('aria-expanded', 'true');

        /* The panel is the header's own disclosure, not a navigation: the URL must not move. */
        expect(page.url()).toBe(urlBefore);

        /* Membership is labelled from `/auth/me`, and it is INFORMATION — nothing is gated on it.
           The destinations are queried INSIDE the header: "Cài đặt" is also a rail destination, so
           an unscoped query matches two elements. */
        const panel = page.locator('header');
        await expect(page.getByText(/Hạng thành viên/)).toBeVisible();
        await expect(panel.getByRole('link', { name: 'Cài đặt' })).toBeVisible();
        await expect(panel.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(avatar).toHaveAttribute('aria-expanded', 'false');
        await expect(avatar).toBeFocused();
    });

    test('does not advertise a menu role it does not implement', async ({ page }) => {
        /* The APG menu pattern requires arrow-key navigation. This is a disclosure over a list of
           links, so `role="menu"` would promise keyboard behaviour that is not there. */
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });
        await page.getByRole('button', { name: /Menu tài khoản|Account menu/ }).click();

        await expect(page.getByRole('menu')).toHaveCount(0);
    });
});

test.describe('interactive elements are not nested', () => {
    /**
     * A `<button>` inside a `<button>` is invalid HTML, and React logs it as a console error — which
     * the smoke guard turns into a failed screen. That is how `/notifications` went red on both
     * viewports: a row with an `actionUrl` wrapped its own mark-read and delete buttons.
     *
     * Asserted STRUCTURALLY rather than by watching the console, because the console only complains
     * when such a notification happens to exist in the account's data. This fails the moment the
     * nesting is reintroduced, whatever the data says.
     */
    for (const path of ['/notifications', '/rewards', '/home', '/settings']) {
        test(`${path} has no button inside a button`, async ({ page }) => {
            await gotoWithRetry(page, path);
            await page.locator('#main').waitFor({ state: 'attached' });
            /* Let the list render: an empty page would pass trivially. */
            await page.waitForTimeout(1200);

            const nested = await page.evaluate(() =>
                Array.from(document.querySelectorAll('button button')).map((element) =>
                    String(element.getAttribute('aria-label') ?? element.textContent ?? '').slice(0, 40)
                )
            );
            expect(nested, `nested buttons found: ${nested.join(' | ')}`).toEqual([]);

            /* The same rule for links, which are the other element that must not nest. */
            const nestedLinks = await page.evaluate(
                () => document.querySelectorAll('a a').length
            );
            expect(nestedLinks, 'a link inside a link').toBe(0);
        });
    }
});

test.describe('the rail’s "Từ vựng" section tab', () => {
    /**
     * Two defects, one cause. Pressing the section tab opened `/vocabulary/check`, the dictionary
     * lookup, instead of the vocabulary practice screen the tab leads into; and the tab was called
     * "Học", which named neither the section nor a destination, so reading it could not have caught
     * the wrong landing. The mockup's rail carried the same artefact — `href="07-vocabulary-check.html"`
     * on "Học" while every vocabulary frame marked it `aria-current="page"` — so the design was
     * corrected first and the rail follows it.
     *
     * Asserted through the DOM/URL rather than against the nav array, because the array is already
     * covered by `src/app/navigation.test.js`; what needs a browser is that the LINK a learner
     * actually presses goes there, on both the rail and the tab bar.
     */
    test('lands on the vocabulary practice screen, not on the lookup screen', async ({ page }) => {
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });

        /* Exact, so it cannot match "Tra từ & hỏi AI"; only one of rail/tab bar is visible per
           viewport, and a hidden element is not matched by role. */
        const learn = page.getByRole('link', { name: 'Từ vựng', exact: true }).first();
        await learn.click();

        await expect(page).toHaveURL(/\/vocabulary$/);
        /* The practice screen's own header, from `pageTitles`: /vocabulary is "Test từ vựng". */
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Test từ vựng');

        /* The section tab stays CURRENT for the whole module — the landing changed, the section did
           not — and the lookup screen is a separate rail item, so it is not what we landed on. */
        await expect(page.getByRole('link', { name: 'Từ vựng', exact: true }).first()).toHaveAttribute(
            'aria-current',
            'page'
        );
        await expect(page).not.toHaveURL(/vocabulary\/check/);
    });

    test('gives the section its second destination, and that destination opens', async ({ page }) => {
        /* The tab can only open one screen, so the review needs its own rail entry — and it needs to
           still work from there, including the shell header, which had no title for `/review` and
           showed the product name instead. */
        await gotoWithRetry(page, '/home');
        await page.locator('#main').waitFor({ state: 'attached' });

        /* The entry lives in the RAIL, which is >=1024px only. The phone tab bar carries the five
           primary sections and nothing else, so on a phone there is no rail route into `/review` —
           asserted rather than skipped, because that absence is a real product decision a designer
           should see, not a hole in the test. */
        const railWidth = page.viewportSize()?.width ?? 1280;
        const reviewEntry = page.getByRole('link', { name: 'Ôn tập từ vựng', exact: true });

        if (railWidth < 1024) {
            await expect(reviewEntry).toHaveCount(0);

            await gotoWithRetry(page, '/review');
            await page.locator('#main').waitFor({ state: 'attached' });
        } else {
            await reviewEntry.first().click();
            await expect(page).toHaveURL(/\/review$/);
        }

        /* `pageTitles['/review']` → `nav.review`, the same string as the rail entry. */
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Ôn tập từ vựng');
        /* Step 1 of the 3-step review flow the section owns. The marker is the window card's heading
           rather than a "Bước 1 / 3" strip: the stepper was removed from step 1 on purpose (this screen
           is an entry point, reached from this very rail), so the step is identified by its first
           decision instead. */
        await expect(page.getByRole('heading', { name: 'Khoảng thời gian' })).toBeVisible();
        /* And the section tab is still the current one — including its `aria-current`, which the
           section-based active state has to set itself (see `primaryItemState` in Shell.jsx). */
        await expect(page.getByRole('link', { name: 'Từ vựng', exact: true }).first()).toHaveAttribute(
            'aria-current',
            'page'
        );
    });
});

/**
 * EVERY shell route has exactly ONE `h1`, and it is the route's own title.
 *
 * The shell header renders `pageTitles[pathname]` as the page's `h1`, so a page that also renders an
 * `h1` for its hero line leaves the document with two competing titles — a screen reader announces
 * both, and "what is this page?" stops having one answer. Five screens were doing it
 * (`/review`, `/challenges`, `/ai-chat`, `/custom-speaking`, `/profile`), which is how the review
 * screen's duplicate was found: a heading query in this very spec resolved to two elements.
 *
 * Take screens are excluded on purpose: they are full-bleed with no shell header, so their `h1` IS
 * the page title and is correct.
 */
test.describe('one title per page', () => {
    const SHELL_ROUTES = [
        '/home',
        '/path',
        '/vocabulary',
        '/vocabulary/check',
        '/vocabulary/history',
        '/dictionary',
        '/review',
        /* The review flow's step 3 is a shell route with its own `pageTitles` entry, so it gets the
           same one-title guard as every other shell screen. Reached without navigation state it
           redirects to step 1, which is itself a shell screen — so the assertion holds either way. */
        '/review/result',
        '/evaluation',
        '/ielts',
        '/ielts/history',
        '/writing',
        '/speaking',
        '/custom-speaking',
        '/ai-chat',
        '/leaderboard',
        '/rewards',
        '/credits',
        '/notifications',
        '/settings',
        '/profile',
        '/weekly-report',
        '/challenges',
    ];

    for (const route of SHELL_ROUTES) {
        test(`${route} has exactly one h1`, async ({ page }) => {
            await gotoWithRetry(page, route);
            await page.locator('#main').waitFor({ state: 'attached' });

            const headings = page.locator('h1');
            const texts = await headings.allInnerTexts();
            expect(
                texts,
                `${route} should have one h1 — the shell header's route title — but has ${texts.length}`
            ).toHaveLength(1);
        });
    }
});

test.describe('rewards, split into tabs', () => {    test('mounts ONE concern at a time, and the inventory only when its tab opens', async ({ page }) => {
        const problems = collectPageProblems(page);

        /* Count the inventory request, which is what "one concern at a time" means in practice:
           the screen used to fetch the inventory on mount as its seventh block. */
        let inventoryRequests = 0;
        page.on('request', (request) => {
            if (request.url().includes('/api/user/inventory')) inventoryRequests += 1;
        });

        await gotoWithRetry(page, '/rewards');
        await page.locator('#main').waitFor({ state: 'attached' });

        const missionsTab = page.getByRole('tab', { name: /Nhiệm vụ|Missions/ });
        const inventoryTab = page.getByRole('tab', { name: /Vật phẩm|Items/ });
        await expect(missionsTab).toHaveAttribute('aria-selected', 'true');
        await expect(inventoryTab).toHaveAttribute('aria-selected', 'false');

        /* The missions panel is up; the inventory panel is not in the DOM at all. */
        await expect(page.locator('#rw-missions')).toHaveCount(1);
        await expect(page.locator('#rw-inventory')).toHaveCount(0);
        expect(inventoryRequests, 'the inventory was fetched before its tab was opened').toBe(0);

        await inventoryTab.click();

        await expect(page.locator('#rw-inventory')).toHaveCount(1);
        await expect(page.locator('#rw-missions')).toHaveCount(0);
        await expect(inventoryTab).toHaveAttribute('aria-selected', 'true');
        await expect
            .poll(() => inventoryRequests, { message: 'opening the tab did not fetch the inventory' })
            .toBeGreaterThan(0);

        expectNoProblems(problems);
    });
});
