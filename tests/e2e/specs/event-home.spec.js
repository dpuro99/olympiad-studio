import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_PATH,
  captureSnapshot,
  expectNoHorizontalOverflow,
  expectUniqueHeadingNames,
  seedNavigation,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../helpers.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appMap = JSON.parse(readFileSync(path.join(here, '../app-map.json'), 'utf8'));

async function openAllTools(page, eventId) {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });
  return errors;
}

const sectionFor = (page, eventId) => page.locator(`.event-section[aria-labelledby="event-${eventId}-heading"]`);

test('All Tools shows an event section with its rule summary and tools in journey order', async ({ page }, testInfo) => {
  const errors = await openAllTools(page, 'ev');

  await expect(page.getByRole('heading', { name: 'All Tools', level: 1 })).toBeVisible();
  const section = sectionFor(page, 'ev');
  await expect(section.getByRole('heading', { name: 'Electric Vehicle', level: 2 })).toBeVisible();
  await expectUniqueHeadingNames(page);

  // The event-level links must resolve to real URLs and carry a citation.
  const headerLinks = section.locator('.dashboard-event-links a');
  expect(await headerLinks.count()).toBeGreaterThanOrEqual(2);
  for (const link of await headerLinks.all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\//);
  }
  await expect(section.locator('.dashboard-event-cite')).not.toBeEmpty();

  // The verified rule summary stays with the event, in a compact disclosure.
  await section.locator('.event-rules summary').click();
  await expect(section.getByText(/pushes a water bottle past a line/i)).toBeVisible();

  // The tool grid follows the event's own journey, not the registry file order.
  const tools = section.locator('.dashboard-tool-card');
  await expect(tools).toHaveCount(4);
  await expect(tools.nth(0)).toContainText('Score Calculator');
  await expect(tools.nth(1)).toContainText('Course & Geometry');
  await expect(tools.nth(2)).toContainText('Practice Run Logger');
  await expect(tools.nth(3)).toContainText('Kit & Program Compliance');

  await captureSnapshot(page, testInfo, 'all_tools_ev');
  await page.getByRole('button', { name: 'Open Score Calculator' }).click();
  await expect(page.getByRole('heading', { name: 'Score Calculator', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test('All Tools lists every registered event and every one of its tools', async ({ page }) => {
  await seedNavigation(page, { page: 'all-tools' });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

  for (const event of appMap.events) {
    const section = sectionFor(page, event.code);
    await expect(section.getByRole('heading', { name: event.label, level: 2 })).toBeVisible();
    await expectUniqueHeadingNames(page);

    const toolButtons = section.locator('.dashboard-tool-card');
    await expect(toolButtons).toHaveCount(event.modules.length);
    for (const module of event.modules) {
      await expect(section.getByRole('button', { name: `Open ${module.label}` })).toBeVisible();
    }
  }
});

test('event sections fit a 375px phone and follow the theme tokens', async ({ browser }) => {
  const readColors = async (theme) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    const errors = await openAllTools(page, 'rocksandminerals');
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((nextTheme) => {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }, theme);
    await expectNoHorizontalOverflow(page, 375);
    const colors = await page.evaluate(() => ({
      page: getComputedStyle(document.body).backgroundColor,
      card: getComputedStyle(document.querySelector('.dashboard-tool-card')).backgroundColor,
      band: getComputedStyle(document.querySelector('.event-section')).backgroundColor
    }));
    await page.screenshot({ path: `test-results/screenshots/all_tools_${theme}_375.png`, fullPage: true });
    expect(errors).toEqual([]);
    await context.close();
    return colors;
  };

  const light = await readColors('light');
  const dark = await readColors('dark');
  expect(dark.page).not.toBe(light.page);
  expect(dark.card).not.toBe(light.card);
  expect(dark.band).not.toBe(light.band);
});
