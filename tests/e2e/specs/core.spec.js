import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_PATH,
  captureSnapshot,
  confirmStar,
  expectModuleRendered,
  expectNoHorizontalOverflow,
  openModule,
  SEASON_YEAR,
  seedNavigation,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../helpers.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const rawAppMap = JSON.parse(readFileSync(path.join(here, '../app-map.json'), 'utf8'));
const withSeason = (text) => text.replaceAll('{year}', String(SEASON_YEAR));
const appMap = {
  ...rawAppMap,
  events: rawAppMap.events.map((event) => ({
    ...event,
    modules: event.modules.map((module) => ({
      ...module,
      label: withSeason(module.label),
      expectText: withSeason(module.expectText)
    }))
  }))
};

test('landing page loads and a guest can enter from the landing view', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Olympiad Studio').first()).toBeVisible({ timeout: SHELL_READY_TIMEOUT });
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
  await captureSnapshot(page, testInfo, 'landing_guest_entry');
  expect(errors).toEqual([]);
});

test('guest can star an event on the dashboard and open one of its tools', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, {});
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
  // The empty profile offers the Choose events dropdown on the Dashboard.
  await page.getByRole('button', { name: /^Choose events/ }).click();
  const picker = page.getByRole('dialog', { name: 'Choose events' });
  await picker.getByRole('button', { name: 'Star Electric Vehicle' }).click();
  await confirmStar(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open Score Calculator' })).toBeVisible();
  await page.getByRole('button', { name: 'Open Score Calculator' }).click();
  // The exiting dashboard overlaps the lazy module shell for one transition
  // frame, so locate the heading by name rather than assuming a single <h1>.
  await expect(page.getByRole('heading', { name: 'Score Calculator', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Electric Vehicle score calculator')).toBeVisible();
  await captureSnapshot(page, testInfo, 'clickthrough_ev_score');
  expect(errors).toEqual([]);
});

test('theme toggle flips the data-theme attribute and persists', async ({ page }) => {
  await seedNavigation(page, { theme: 'dark' });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header', { timeout: SHELL_READY_TIMEOUT });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

for (const event of appMap.events) {
  for (const module of event.modules) {
    test(`${event.code}/${module.id} renders ("${module.label}")`, async ({ page }, testInfo) => {
      const errors = await openModule(page, testInfo, { eventId: event.code, moduleId: module.id });
      await expectModuleRendered(page, {
        label: module.label,
        expectText: module.expectText
      });
      await captureSnapshot(page, testInfo, `module_${event.code}_${module.id}`);
      expect(errors).toEqual([]);
    });
  }
}

for (const event of appMap.events) {
  for (const module of event.modules) {
    test(`${event.code}/${module.id} fits a 375px phone viewport`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const page = await context.newPage();
      const errors = trackConsoleIssues(page);
      await seedNavigation(page, { eventId: event.code, moduleId: module.id });
      await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('header', { timeout: SHELL_READY_TIMEOUT });
      await expectModuleRendered(page, { label: module.label, expectText: module.expectText });
      await expectNoHorizontalOverflow(page, 375);
      await page.screenshot({ path: `test-results/screenshots/mobile_${event.code}_${module.id}.png`, fullPage: true });
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}

test('dashboard shell spans the full viewport at desktop and phone widths', async ({ browser }) => {
  for (const width of [721, 720, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 812 } });
    const page = await context.newPage();
    await seedNavigation(page, {});
    await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
    const shellWidth = await page.locator('.dashboard-shell').evaluate((el) => el.getBoundingClientRect().width);
    expect(shellWidth, `dashboard shell is full width at ${width}px`).toBeGreaterThanOrEqual(width - 1);
    await expectNoHorizontalOverflow(page, width);
    await context.close();
  }
});

test('EV score calculator stays usable on a narrow phone viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId: 'ev', moduleId: 'score' });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header', { timeout: SHELL_READY_TIMEOUT });
  await expect(page.getByText('Electric Vehicle score calculator')).toBeVisible();
  const { scrollWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(scrollWidth).toBeLessThanOrEqual(400);
  await page.screenshot({ path: 'test-results/screenshots/mobile_ev_score.png' });
  await context.close();
  expect(errors).toEqual([]);
});