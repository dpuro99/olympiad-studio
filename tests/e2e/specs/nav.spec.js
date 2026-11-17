import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  captureSnapshot,
  expectNoHorizontalOverflow,
  openModule,
  seedNavigation,
  SEASON_YEAR,
  SHELL_READY_TIMEOUT
} from '../helpers.js';

test.describe('persistent top navigation', () => {
  test('frames the landing page and owns the only theme and auth controls', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_PATH);

    const nav = page.locator('header.app-nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.logo-wordmark')).toContainText('Olympiad');

    // Exactly one of each: duplicated accessible names break strict locators.
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Continue as guest' })).toHaveCount(1);

    // The sidebar belongs to the workspace, not the landing page.
    await expect(page.locator('.dashboard-sidebar')).toHaveCount(0);

    await captureSnapshot(page, testInfo, 'nav_landing_desktop');
  });

  test('guest entry keeps the same bar and opens the workspace shell', async ({ page }, testInfo) => {
    await page.goto(BASE_PATH);
    await page.getByRole('button', { name: 'Continue as guest' }).click();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const nav = page.locator('header.app-nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.locator('.dashboard-sidebar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toHaveCount(1);

    await captureSnapshot(page, testInfo, 'nav_lobby_guest_desktop');
  });

  test('breadcrumbs track lobby -> event -> module and navigate back', async ({ page }, testInfo) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH);
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

    const nav = page.locator('header.app-nav');
    await expect(nav.locator('[aria-current="page"]')).toHaveText('All events');

    await page.locator('.dashboard-sidebar').getByRole('button', { name: 'Electric Vehicle' }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Electric Vehicle');
    await expect(nav.locator('[aria-current="page"]').and(nav.locator('span'))).toBeVisible();
    await expect(nav.getByText(`${SEASON_YEAR} · Div C`)).toBeVisible();
    await captureSnapshot(page, testInfo, 'nav_event_home_desktop');

    await page.locator('.module-card').filter({ hasText: 'Score Calculator' }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Score Calculator');
    await expect(page.getByRole('heading', { level: 1, name: 'Score Calculator' })).toBeVisible();
    await captureSnapshot(page, testInfo, 'nav_module_desktop');

    // The event crumb goes back to the event workspace home.
    await nav.getByRole('button', { name: 'Electric Vehicle' }).click();
    await expect(page.locator('.module-card').filter({ hasText: 'Score Calculator' })).toBeVisible();

    // And "All events" returns to the lobby.
    await nav.getByRole('button', { name: 'All events' }).click();
    await expect(nav.locator('[aria-current="page"]')).toHaveText('All events');
  });

  test('keyboard users reach the skip link before the navigation', async ({ page }) => {
    await seedNavigation(page, {});
    await page.goto(BASE_PATH);
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  });

  test('fits a 375px phone viewport on the landing and inside the workspace', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();

    await page.goto(BASE_PATH);
    await expect(page.locator('header.app-nav')).toBeVisible();
    await expectNoHorizontalOverflow(page, 375);

    await page.getByRole('button', { name: 'Continue as guest' }).click();
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    await expectNoHorizontalOverflow(page, 375);

    await page.locator('.dashboard-sidebar').getByRole('button', { name: 'Electric Vehicle' }).click();
    await page.locator('.module-card').filter({ hasText: 'Score Calculator' }).click();
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
