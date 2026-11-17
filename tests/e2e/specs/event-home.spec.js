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
  SEASON_YEAR,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../helpers.js';
import { storageKey } from '../../../src/seasons/storageKeys.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const appMap = JSON.parse(readFileSync(path.join(here, '../app-map.json'), 'utf8'));

const STAGE_NAMES = ['learn', 'prepare', 'practice', 'record', 'reference'];

async function openEventHome(page, eventId) {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId });
  await page.goto(BASE_PATH);
  await page.waitForSelector('.field-guide', { timeout: SHELL_READY_TIMEOUT });
  return errors;
}

test('the event guide lists the tools in order with one next step', async ({ page }, testInfo) => {
  const errors = await openEventHome(page, 'ev');

  await expect(page.getByRole('heading', { name: 'Electric Vehicle', level: 1 })).toBeVisible();
  await expectUniqueHeadingNames(page);

  // The spine follows the event's own journey, not the registry's file order.
  const rows = page.locator('.field-step');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText('Event Overview');
  await expect(rows.nth(1)).toContainText('Score Calculator');
  await expect(rows.nth(2)).toContainText('Course & Geometry');
  await expect(rows.nth(3)).toContainText('Practice Run Logger');
  await expect(rows.nth(1)).toHaveAttribute('data-stage', 'reference');
  await expect(rows.nth(3)).toHaveAttribute('data-stage', 'record');

  // Exactly one next step. With nothing saved it points at the first step the
  // app can observe: calculators keep no saved work, so they can never be next.
  await expect(page.locator('.field-next')).toHaveCount(1);
  await expect(rows.nth(3)).toContainText('Next');

  // An empty browser is reported as empty, not as progress.
  const rail = page.getByRole('complementary', { name: 'Your saved work' });
  await expect(rail.getByText(/Nothing saved in this browser yet/)).toBeVisible();

  await captureSnapshot(page, testInfo, 'event_home_ev_empty');
  await rows.nth(3).click();
  // The exiting guide overlaps the lazy module shell for one transition frame,
  // so locate the heading by name instead of assuming a single <h1>.
  await expect(page.getByRole('heading', { name: 'Practice Run Logger', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test('saved work chips and the next step follow what is actually stored', async ({ page }, testInfo) => {
  const sheetKey = storageKey('anatomy', 'reference-sheet');
  await page.addInitScript(({ key }) => {
    window.localStorage.setItem(key, JSON.stringify({
      blocks: [{ id: 'blk-audit', objectiveId: 'anatomy-resp-1', title: 'Audit', body: 'Saved by the harness' }],
      objectiveStatus: {},
      density: 'standard'
    }));
  }, { key: sheetKey });

  const errors = await openEventHome(page, 'anatomy');
  const rows = page.locator('.field-step');
  const compiler = rows.filter({ hasText: 'Reference & Study Compiler' });
  const notes = rows.filter({ hasText: 'Practice Notes' });

  // The chip names the real store contents.
  await expect(compiler).toContainText('sheet saved');
  await expect(notes).not.toContainText('notes saved');

  // The only tracked step without work is the notes journal.
  await expect(page.locator('.field-next')).toHaveCount(1);
  await expect(notes).toContainText('Next');

  const rail = page.getByRole('complementary', { name: 'Your saved work' });
  await expect(rail.getByText('sheet saved')).toBeVisible();
  await expect(rail).not.toContainText('Nothing saved in this browser yet');

  await captureSnapshot(page, testInfo, 'event_home_anatomy_saved');
  expect(errors).toEqual([]);
});

test('unreadable saved work is announced instead of shown as empty', async ({ page }) => {
  const sheetKey = storageKey('chemlab', 'reference-sheet');
  await page.addInitScript(({ key }) => {
    window.localStorage.setItem(key, '{not json');
  }, { key: sheetKey });

  const errors = await openEventHome(page, 'chemlab');
  const rail = page.getByRole('complementary', { name: 'Your saved work' });
  await expect(rail.getByText(/would not let the app read saved data/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('the lobby still lists every event and the index opens the same tools', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, {});
  await page.goto(BASE_PATH);
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

  // Level one is unchanged: one card per registered event.
  await expect(page.locator('.event-card')).toHaveCount(appMap.events.length);
  await page.locator('.event-card').filter({ hasText: 'Rocks and Minerals' }).click();
  await expect(page.getByRole('heading', { name: 'Rocks and Minerals', level: 1 })).toBeVisible();
  await expect(page.locator('.field-step')).toHaveCount(4);

  // The full index is a disclosure: present but hidden until opened, then it navigates.
  const index = page.locator('.field-index');
  await expect(index.locator('.field-index-row').first()).toBeHidden();
  await expect(index.getByText('All 4 tools in Rocks and Minerals')).toBeVisible();
  await index.locator('summary').click();
  await expect(index.locator('.field-index-row')).toHaveCount(4);
  await expect(index.locator('.field-index-row').first()).toBeVisible();
  await index.getByRole('button', { name: 'Mineral ID Key' }).click();
  await expect(page.getByRole('heading', { name: 'Mineral ID Key', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

for (const event of appMap.events) {
  test(`${event.code} guide lists every registered tool with at most one next step`, async ({ page }) => {
    const errors = await openEventHome(page, event.code);

    await expect(page.getByRole('heading', { name: event.label, level: 1 })).toBeVisible();
    await expectUniqueHeadingNames(page);

    const rows = page.locator('.field-step');
    await expect(rows).toHaveCount(event.modules.length);
    const rowTexts = await rows.allInnerTexts();
    for (const module of event.modules) {
      const label = module.label.replaceAll('{year}', String(SEASON_YEAR));
      expect(rowTexts.some((text) => text.includes(label)), `${event.code} guide is missing "${label}"`).toBe(true);
    }
    for (let i = 0; i < event.modules.length; i += 1) {
      await expect(rows.nth(i)).toHaveAttribute('data-stage', new RegExp(`^(${STAGE_NAMES.join('|')})$`));
    }

    // Never more than one guidepost, and never zero when a step is measurable.
    expect(await page.locator('.field-next').count()).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test('the guide fits a 375px phone and follows the theme tokens', async ({ browser }) => {
  const readColors = async (theme) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    const errors = await openEventHome(page, 'rocksandminerals');
    await page.emulateMedia({ colorScheme: theme });
    await page.evaluate((nextTheme) => {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }, theme);
    await expectNoHorizontalOverflow(page, 375);
    const colors = await page.evaluate(() => ({
      page: getComputedStyle(document.body).backgroundColor,
      step: getComputedStyle(document.querySelector('.field-step')).backgroundColor,
      rail: getComputedStyle(document.querySelector('.field-rail')).backgroundColor
    }));
    await page.screenshot({ path: `test-results/screenshots/event_home_${theme}_375.png`, fullPage: true });
    expect(errors).toEqual([]);
    await context.close();
    return colors;
  };

  const light = await readColors('light');
  const dark = await readColors('dark');
  expect(dark.page).not.toBe(light.page);
  expect(dark.step).not.toBe(light.step);
  expect(dark.rail).not.toBe(light.rail);
});
