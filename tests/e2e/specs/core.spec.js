import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_PATH,
  captureSnapshot,
  expectModuleRendered,
  expectNoHorizontalOverflow,
  openModule,
  seedNavigation,
  trackConsoleIssues
} from '../helpers.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appMap = JSON.parse(readFileSync(path.join(here, '../app-map.json'), 'utf8'));

test('landing page loads and a guest can enter from the landing view', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await page.goto(BASE_PATH);
  await expect(page.getByText('Olympiad Studio').first()).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Continue as guest' }).click();
  await page.waitForSelector('.dashboard-shell', { timeout: 20_000 });
  await captureSnapshot(page, testInfo, 'landing_guest_entry');
  expect(errors).toEqual([]);
});

test('guest can click through lobby -> event workspace -> module', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, {});
  await page.goto(BASE_PATH);
  await page.waitForSelector('.dashboard-shell', { timeout: 20_000 });
  await page.locator('.dashboard-sidebar').getByRole('button', { name: 'Electric Vehicle' }).click();
  await page.waitForSelector('header');
  await page.locator('.module-card').filter({ hasText: 'Score Calculator' }).click();
  await expect(page.locator('h1')).toHaveText('Score Calculator', { timeout: 20_000 });
  await expect(page.getByText('Electric Vehicle score calculator')).toBeVisible();
  await captureSnapshot(page, testInfo, 'clickthrough_ev_score');
  expect(errors).toEqual([]);
});

test('theme toggle flips the data-theme attribute and persists', async ({ page }) => {
  await seedNavigation(page, { theme: 'dark' });
  await page.goto(BASE_PATH);
  await page.waitForSelector('header', { timeout: 20_000 });
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
      await page.goto(BASE_PATH);
      await page.waitForSelector('header', { timeout: 20_000 });
      await expectModuleRendered(page, { label: module.label, expectText: module.expectText });
      await expectNoHorizontalOverflow(page, 375);
      await page.screenshot({ path: `test-results/screenshots/mobile_${event.code}_${module.id}.png`, fullPage: true });
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}

test('dashboard shell switches to a stacked layout exactly at the 720px breakpoint', async ({ browser }) => {
  const directionAt = async (width) => {
    const context = await browser.newContext({ viewport: { width, height: 812 } });
    const page = await context.newPage();
    await seedNavigation(page, { eventId: 'ev', moduleId: 'score' });
    await page.goto(BASE_PATH);
    await page.waitForSelector('.dashboard-shell', { timeout: 20_000 });
    const direction = await page.locator('.dashboard-shell').evaluate((el) => getComputedStyle(el).flexDirection);
    await context.close();
    return direction;
  };
  expect(await directionAt(721)).toBe('row');
  expect(await directionAt(720)).toBe('column');
});

test('EV score calculator stays usable on a narrow phone viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId: 'ev', moduleId: 'score' });
  await page.goto(BASE_PATH);
  await page.waitForSelector('header', { timeout: 20_000 });
  await expect(page.getByText('Electric Vehicle score calculator')).toBeVisible();
  const { scrollWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(scrollWidth).toBeLessThanOrEqual(400);
  await page.screenshot({ path: 'test-results/screenshots/mobile_ev_score.png' });
  await context.close();
  expect(errors).toEqual([]);
});