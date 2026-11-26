import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  captureSnapshot,
  confirmStar,
  expectNoHorizontalOverflow,
  expectStarConfirmation,
  openModule,
  seedNavigation,
  SHELL_READY_TIMEOUT
} from '../helpers.js';

async function chooseEvents(page) {
  await page.getByRole('button', { name: /^Choose events/ }).click();
  return page.getByRole('dialog', { name: 'Choose events' });
}

test.describe('persistent top navigation', () => {
  test('the same bar frames the landing page with one sign-in button', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });

    const nav = page.locator('header.app-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.logo-wordmark')).toContainText('Olympiad');
    const brand = nav.getByRole('link', { name: 'Olympiad Studio home' });
    await expect(brand).toHaveAttribute('href', BASE_PATH);
    await expect(nav.getByRole('navigation', { name: 'Workspace pages' })).toBeVisible();
    await expect(nav.locator('.app-nav-season')).toHaveText('2027');
    await expect(nav.locator('.app-nav-season i')).toHaveCount(0);

    // Exactly one of each: duplicated accessible names break strict locators.
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);
    const signIn = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(signIn).toHaveCount(1);
    await expect(signIn).toHaveClass(/app-nav-btn-primary/);
    await expect(signIn).toContainText('Sign in');
    await expect(page.getByRole('button', { name: /^Profile: / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Continue as guest' })).toHaveCount(1);

    // Hovering the brand must not highlight or underline it; click is its only job.
    const brandStyle = () => brand.evaluate((node) => {
      const style = getComputedStyle(node);
      return { background: style.backgroundColor, decoration: style.textDecorationLine };
    });
    const before = await brandStyle();
    await brand.hover();
    const after = await brandStyle();
    expect(after.background).toBe(before.background);
    expect(after.background).toBe('rgba(0, 0, 0, 0)');
    expect(after.decoration).toBe('none');

    await expect(page.locator('.dashboard-sidebar')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Choose events/ })).toHaveCount(0);

    await captureSnapshot(page, testInfo, 'nav_landing_desktop');
  });

  test('guest entry keeps the same bar and opens the full-screen dashboard', async ({ page }, testInfo) => {
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Continue as guest' }).click();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const nav = page.locator('header.app-nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('navigation', { name: 'Workspace pages' })).toBeVisible();
    await expect(nav.locator('.app-nav-page[aria-current="page"]')).toHaveText('Dashboard');
    await expect(nav.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Choose events/ })).toBeVisible();
    // Guests keep the same sign-in button; the profile menu is signed-in only.
    await expect(page.getByRole('button', { name: /^Profile: / })).toHaveCount(0);
    const signIn = page.getByRole('button', { name: 'Sign in', exact: true });
    await expect(signIn).toHaveCount(1);
    await expect(signIn).toHaveClass(/app-nav-btn-primary/);
    await expect(nav.locator('.app-nav-guest-hint')).toHaveCount(0);
    await expect(nav.locator('.app-nav-season i')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);

    for (const selector of ['.app-nav-pages', '.app-nav-season', '.app-nav-icon', '.app-nav-btn-primary']) {
      const height = await nav.locator(selector).first().evaluate((node) => node.getBoundingClientRect().height);
      expect(height).toBeCloseTo(36, 0);
    }

    await captureSnapshot(page, testInfo, 'nav_dashboard_guest_desktop');
  });

  test('the brand link returns to the landing page from the workspace', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const nav = page.locator('header.app-nav');
    await nav.getByRole('link', { name: 'Olympiad Studio home' }).click();
    await expect(page.getByRole('button', { name: 'Continue as guest' })).toBeVisible();
    await expect(nav.getByRole('navigation', { name: 'Workspace pages' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Profile: / })).toHaveCount(0);
  });

  test('page buttons switch Dashboard and All Tools, and the breadcrumb returns from a tool', async ({ page }, testInfo) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const nav = page.locator('header.app-nav');
    const pages = nav.getByRole('navigation', { name: 'Workspace pages' });
    await expect(pages.locator('[aria-current="page"]')).toHaveText('Dashboard');

    await pages.getByRole('button', { name: 'All Tools' }).click();
    await expect(page.getByRole('heading', { name: 'All Tools', level: 1 })).toBeVisible();
    await expect(pages.locator('[aria-current="page"]')).toHaveText('All Tools');

    // The catalog is a two-column workbench: a fixed filter rail beside a
    // warm feed, with both columns sharing the available screen width.
    const sidebar = page.locator('.catalog-sidebar');
    const main = page.locator('.catalog-main');
    const sidebarBox = await sidebar.boundingBox();
    const mainBox = await main.boundingBox();
    const pageBox = await page.locator('.dashboard-page').boundingBox();
    expect(sidebarBox).toBeTruthy();
    expect(mainBox).toBeTruthy();
    expect(sidebarBox.width).toBeGreaterThanOrEqual(280);
    expect(sidebarBox.width).toBeLessThanOrEqual(320);
    expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(mainBox.x + 1);
    expect(Math.abs((mainBox.x + mainBox.width) - (pageBox.x + pageBox.width))).toBeLessThan(2);
    await expect(sidebar).toHaveCSS('position', 'sticky');
    await expect(sidebar).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.dashboard-page')).toHaveCSS('background-color', 'rgb(250, 248, 245)');

    const headerBox = await page.locator('.catalog-main-header').boundingBox();
    const sectionsBox = await page.locator('.dashboard-event-sections').boundingBox();
    expect(sectionsBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    expect(sectionsBox.y - mainBox.y).toBeLessThan(220);
    for (const box of [headerBox, sectionsBox]) {
      const leftInset = box.x - mainBox.x;
      const rightInset = (mainBox.x + mainBox.width) - (box.x + box.width);
      expect(leftInset).toBeGreaterThanOrEqual(16);
      expect(leftInset).toBeLessThanOrEqual(32);
      expect(rightInset).toBeGreaterThanOrEqual(16);
      expect(rightInset).toBeLessThanOrEqual(32);
    }
    await captureSnapshot(page, testInfo, 'nav_all_tools_desktop');

    await pages.getByRole('button', { name: 'Dashboard' }).click();
    const picker = await chooseEvents(page);
    await picker.getByRole('button', { name: 'Star Electric Vehicle' }).click();
    await confirmStar(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toBeVisible();

    await page.getByRole('button', { name: 'Open Score Calculator' }).click();
    const crumb = nav.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumb.locator('[aria-current="page"]')).toHaveText('Score Calculator');
    await expect(page.getByRole('heading', { level: 1, name: 'Score Calculator' })).toBeVisible();
    await captureSnapshot(page, testInfo, 'nav_module_desktop');

    await crumb.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toBeVisible();
    await expect(pages.locator('[aria-current="page"]')).toHaveText('Dashboard');
  });

  test('the catalog filter rail stays flush with the nav through a full-page scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await seedNavigation(page, { page: 'all-tools' });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const sidebar = page.locator('.catalog-sidebar');
    const navBottom = await page.locator('header.app-nav')
      .evaluate((node) => node.getBoundingClientRect().bottom);
    const geometry = () => sidebar.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, height: box.height };
    });

    const atTop = await geometry();
    expect(atTop.top).toBeCloseTo(navBottom, 0);
    expect(atTop.height).toBeCloseTo(800 - navBottom, 0);
    await expect(sidebar).toHaveCSS('overflow-y', 'auto');
    await expect(page.locator('.dashboard-page')).toHaveCSS('align-items', 'start');
    await expect(page.locator('.dashboard-page')).not.toHaveCSS('overflow', 'hidden');

    await page.evaluate(() => window.scrollTo(0, 250));
    await expect.poll(async () => (await geometry()).top).toBeCloseTo(navBottom, 0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(async () => (await geometry()).top).toBeCloseTo(navBottom, 0);
    const atBottom = await geometry();
    expect(atBottom.bottom).toBeCloseTo(800, 0);
  });

  test('catalog search and filters narrow the same registry data', async ({ page }, testInfo) => {
    await seedNavigation(page, {
      page: 'all-tools',
      profile: { starredEventIds: ['ev'] }
    });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const sections = page.locator('.event-section-catalog');
    const tools = page.locator('.catalog-tool-card');
    const allToolCount = await tools.count();
    expect(allToolCount).toBeGreaterThan(5);

    const search = page.getByRole('searchbox', { name: 'Search events and tools' });
    await search.fill('Diagram');
    await expect(sections).toHaveCount(1);
    await expect(sections.getByRole('heading', { name: 'Anatomy and Physiology', level: 2 })).toBeVisible();
    await expect(tools).toHaveCount(1);
    await expect(tools.first()).toContainText('System Diagram Drill');
    await expect(page.locator('.catalog-result-count')).toContainText('1 event · 1 tool');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(tools).toHaveCount(allToolCount);

    const scopes = page.getByRole('group', { name: 'Event scope' });
    await scopes.getByRole('button', { name: 'Division B' }).click();
    await expect(sections).toHaveCount(1);
    await expect(sections.getByRole('heading', { name: 'Write It, Do It', level: 2 })).toBeVisible();

    await scopes.getByRole('button', { name: 'All Divisions' }).click();
    const types = page.getByRole('group', { name: 'Tool type' });
    await types.getByRole('button', { name: 'Prepare' }).click();
    const preparedCount = await tools.count();
    expect(preparedCount).toBeGreaterThan(0);
    expect(preparedCount).toBeLessThan(allToolCount);
    const badgeBackgrounds = [];
    for (const chip of await page.locator('.catalog-tool-card .dashboard-stage-chip').all()) {
      await expect(chip).toHaveText('Prepare');
      badgeBackgrounds.push(await chip.evaluate((node) => getComputedStyle(node).backgroundColor));
    }
    expect(new Set(badgeBackgrounds).size).toBe(1);

    for (const type of ['Practice', 'Record']) {
      await types.getByRole('button', { name: type }).click();
      const chip = page.locator('.catalog-tool-card .dashboard-stage-chip').first();
      await expect(chip).toHaveText(type);
      const background = await chip.evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(background).not.toBe(badgeBackgrounds[0]);
      badgeBackgrounds.push(background);
    }
    expect(new Set(badgeBackgrounds).size).toBe(3);

    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(tools).toHaveCount(allToolCount);

    await scopes.getByRole('button', { name: 'My Events' }).click();
    await expect(sections).toHaveCount(1);
    await expect(sections.getByRole('heading', { name: 'Electric Vehicle', level: 2 })).toBeVisible();

    await captureSnapshot(page, testInfo, 'nav_all_tools_filtered');
    await expectNoHorizontalOverflow(page, 1440);
  });

  test('mobile filters open as a focus-managed drawer and filter the same feed', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await seedNavigation(page, { page: 'all-tools' });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const filtersButton = page.getByRole('button', { name: 'Filters', exact: true });
    const sidebar = page.locator('.catalog-sidebar');
    const tools = page.locator('.catalog-tool-card');
    const allToolCount = await tools.count();
    expect(allToolCount).toBeGreaterThan(5);

    await expect(filtersButton).toBeVisible();
    await expect(sidebar).toBeHidden();
    await expectNoHorizontalOverflow(page, 375);

    await filtersButton.click();
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveAttribute('role', 'dialog');
    await expect(sidebar).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('button', { name: 'Close filters' })).toBeFocused();
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
    await expectNoHorizontalOverflow(page, 375);
    // The modal covers the sticky nav, so a click in the old nav strip hits the backdrop.
    const navStripHit = await page.evaluate(() => document.elementFromPoint(350, 20)?.className ?? '');
    expect(navStripHit).toContain('catalog-drawer-backdrop');

    const search = page.getByRole('searchbox', { name: 'Search events and tools' });
    await search.fill('   ');
    await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
    await expect(page.locator('.catalog-result-count')).toContainText('9 events · 33 tools');

    await search.fill('Diagram');
    await expect(page.locator('.event-section-catalog')).toHaveCount(1);
    await expect(page.locator('.catalog-result-count')).toContainText('1 event · 1 tool');
    await captureSnapshot(page, testInfo, 'nav_all_tools_mobile_drawer');

    await page.keyboard.press('Escape');
    await expect(sidebar).toBeHidden();
    await expect(filtersButton).toBeFocused();
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
    await expect(tools).toHaveCount(1);

    await filtersButton.click();
    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(tools).toHaveCount(allToolCount);
    await page.getByRole('button', { name: 'Close filters' }).click();
    await expect(sidebar).toBeHidden();
    await expectNoHorizontalOverflow(page, 375);
  });

  test('the Choose events dropdown uses whole-row buttons and in-app confirmations', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    await expect(page.getByRole('button', { name: /^Dashboard scope:/ })).toHaveCount(0);
    const picker = await chooseEvents(page);
    await expect(picker.getByText(/Star an event to put its tools on your dashboard/)).toHaveCount(0);
    const star = picker.getByRole('button', { name: 'Star Electric Vehicle' });
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await expect(star.locator('.scope-star i')).toHaveClass(/^ti ti-star$/);

    const restingBackground = await star.evaluate((node) => getComputedStyle(node).backgroundColor);
    await star.hover();
    await expect.poll(() => star.evaluate((node) => getComputedStyle(node).backgroundColor))
      .not.toBe(restingBackground);

    // Cancelling the in-app dialog leaves the profile untouched.
    await star.click();
    const addDialog = await expectStarConfirmation(page, 'Electric Vehicle');
    await addDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'Choose events (0)' })).toBeVisible();

    await star.click();
    await expectStarConfirmation(page, 'Electric Vehicle');
    await confirmStar(page);
    const unstar = picker.getByRole('button', { name: 'Unstar Electric Vehicle' });
    await expect(unstar).toHaveAttribute('aria-pressed', 'true');
    await expect(unstar.locator('.scope-star i')).toHaveClass(/ti-star-filled/);
    await expect(page.getByRole('button', { name: /^Choose events \(1\)$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toBeVisible();

    // My Events uses solid stars; All events keeps the outlined glyph in the
    // same 18px slot so the two sections form one aligned column.
    const filledStar = picker.locator('.scope-row[aria-pressed="true"] .scope-star i').first();
    const outlinedStar = picker.locator('.scope-row[aria-pressed="false"] .scope-star i').first();
    await expect(outlinedStar).toHaveClass(/^ti ti-star$/);
    // The outline webfont has no .ti-star-filled rule; assert the filled glyph
    // and font actually render, not just the class name and an empty icon slot.
    const filledGlyph = await filledStar.evaluate((node) => {
      const style = getComputedStyle(node, '::before');
      return { content: style.content, fontFamily: style.fontFamily };
    });
    expect(filledGlyph.content).not.toBe('none');
    expect(filledGlyph.fontFamily).toContain('tabler-icons-filled');
    const filledBox = await filledStar.boundingBox();
    const outlinedBox = await outlinedStar.boundingBox();
    expect(filledBox).toBeTruthy();
    expect(outlinedBox).toBeTruthy();
    expect(filledBox.x).toBeCloseTo(outlinedBox.x, 0);
    expect(filledBox.width).toBeCloseTo(outlinedBox.width, 0);
    const filledColor = await filledStar.evaluate((node) => getComputedStyle(node).color);
    const outlinedColor = await outlinedStar.evaluate((node) => getComputedStyle(node).color);
    expect(filledColor).not.toBe(outlinedColor);

    // Unstarring is confirmed in-app before the tools leave the Dashboard.
    await unstar.click();
    const removeDialog = await expectStarConfirmation(page, 'Electric Vehicle', 'remove');
    await removeDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(unstar).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toBeVisible();

    await unstar.click();
    await expectStarConfirmation(page, 'Electric Vehicle', 'remove');
    await confirmStar(page, 'remove');
    await page.keyboard.press('Escape');
    await expect(picker).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toHaveCount(0);
  });

  test('the Choose events panel is not clipped by the dashboard hero', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    await page.getByRole('button', { name: /^Choose events/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Choose events' });
    await expect(dialog).toBeVisible();

    const dialogBox = await dialog.boundingBox();
    const heroBox = await page.locator('.dashboard-hero').boundingBox();
    expect(dialogBox).toBeTruthy();
    expect(heroBox).toBeTruthy();

    // A point below the hero must hit the dialog itself. An ancestor with
    // overflow:hidden would still report a bounding box but fail this probe.
    const probeY = Math.min(dialogBox.y + dialogBox.height - 12, heroBox.y + heroBox.height + 24);
    const hitDialog = await page.evaluate(({ x, y }) => {
      const hit = document.elementFromPoint(x, y);
      return Boolean(hit && hit.closest('[role="dialog"][aria-label="Choose events"]'));
    }, { x: dialogBox.x + 24, y: probeY });
    expect(hitDialog).toBe(true);
  });

  test('guests get no profile popover, and their browser-local profile survives a reload', async ({ page }) => {
    // The profile popover is signed-in only, so editing it cannot be driven
    // headlessly without OAuth. Verify the storage contract it depends on.
    await seedNavigation(page, { profile: { displayName: 'Ada', level: 'state' } });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    await expect(page.getByRole('button', { name: /^Profile: / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();

    await page.reload();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    const storedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem('olympiad-studio.profile')));
    expect(storedProfile.displayName).toBe('Ada');
    expect(storedProfile.level).toBe('state');
  });

  test('keyboard users reach the skip link before the navigation', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });

  test('fits a 375px phone viewport on the landing and inside the workspace', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();

    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header.app-nav')).toBeVisible();
    await expectNoHorizontalOverflow(page, 375);

    await page.getByRole('button', { name: 'Continue as guest' }).click();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    await expectNoHorizontalOverflow(page, 375);

    const picker = await chooseEvents(page);
    await picker.getByRole('button', { name: 'Star Electric Vehicle' }).click();
    await confirmStar(page);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open Score Calculator' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Score Calculator' })).toBeVisible();
    await expectNoHorizontalOverflow(page, 375);
    await page.screenshot({ path: 'test-results/screenshots/nav_mobile_module.png', fullPage: true });

    await context.close();
  });

  test('print media hides the chrome without clipping the print sheet', async ({ page }, testInfo) => {
    await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
    await page.emulateMedia({ media: 'print' });
    try {
      await expect(page.locator('header.app-nav')).toBeHidden();
      await expect(page.locator('.skip-link')).toBeHidden();
      const box = await page.locator('.reference-print-area').boundingBox();
      expect(box && box.width > 0 && box.height > 0).toBeTruthy();
    } finally {
      await page.emulateMedia({ media: 'screen' });
    }
  });
});
