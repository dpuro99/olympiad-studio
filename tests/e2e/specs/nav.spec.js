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
  test('frames the landing page and owns the only theme and auth controls', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });

    const nav = page.locator('header.app-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.logo-wordmark')).toContainText('Olympiad');

    // Exactly one of each: duplicated accessible names break strict locators.
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Continue as guest' })).toHaveCount(1);

    // Workspace navigation and event selection belong to the workspace, not landing.
    await expect(page.locator('.dashboard-sidebar')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Workspace pages' })).toHaveCount(0);
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
    await expect(page.getByRole('button', { name: /^Profile: / })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);
    await expect(nav.locator('.app-nav-guest-hint'))
      .toHaveAccessibleName(/Guest mode: saved build logs and study sheets/);
    await expect(nav.locator('.app-nav-guest-hint')).toBeVisible();

    await page.getByRole('button', { name: /^Profile: / }).click();
    await expect(page.getByText('Sign in to sync saved build logs and study sheets across devices.'))
      .toBeVisible();
    await page.keyboard.press('Escape');

    await captureSnapshot(page, testInfo, 'nav_dashboard_guest_desktop');
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

  test('profile popover edits name and level and the values persist', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    await page.getByRole('button', { name: 'Profile: Guest' }).click();
    const panel = page.getByRole('dialog', { name: 'Profile settings' });
    await expect(panel).toContainText('Saved in this browser');
    await panel.getByPlaceholder('Guest').fill('Ada');
    await panel.getByLabel('Competition level').selectOption('state');
    await expect(page.getByRole('button', { name: 'Profile: Ada' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.reload();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    await expect(page.getByRole('button', { name: 'Profile: Ada' })).toBeVisible();
    await page.getByRole('button', { name: 'Profile: Ada' }).click();
    await expect(page.getByRole('dialog', { name: 'Profile settings' }).getByLabel('Competition level')).toHaveValue('state');
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
