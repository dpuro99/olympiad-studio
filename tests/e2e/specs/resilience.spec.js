import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  COMPILER_FILE_STEMS,
  COMPILER_STORAGE_KEYS,
  SEASON_YEAR,
  seedNavigation,
  trackConsoleIssues
} from '../helpers.js';
import { LEGACY_STORAGE_KEYS, storageKey } from '../../../src/seasons/storageKeys.js';

const OTHER_STORAGE_KEYS = [
  // Legacy anatomy key still has to be readable after the key migration.
  { eventId: 'anatomy', moduleId: 'anatomy-notes', key: LEGACY_STORAGE_KEYS.anatomyNotebook },
  { eventId: 'boomilever', moduleId: 'boomilever-build-log', key: storageKey('boomilever', 'build-log') },
  { eventId: 'chemlab', moduleId: 'gas-laws', key: storageKey('chemlab', 'gases') },
  { eventId: 'chemlab', moduleId: 'kinetics', key: storageKey('chemlab', 'kinetics') },
  { eventId: 'ev', moduleId: 'log', key: storageKey('electricvehicle', 'practice-runs') },
  { eventId: 'rocksandminerals', moduleId: 'mineral-id-key', key: storageKey('rocksandminerals', 'specimen-cards') }
];

async function gotoModule(page, { eventId, moduleId }) {
  await seedNavigation(page, { eventId, moduleId });
  await page.goto(BASE_PATH);
  await page.waitForSelector('header', { timeout: 20_000 });
}

test('theme changes rendered colors, not just the data-theme attribute', async ({ page }) => {
  await seedNavigation(page, { theme: 'light' });
  await page.goto(BASE_PATH);
  await page.waitForSelector('header', { timeout: 20_000 });
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(dark).not.toBe(light);
  await page.screenshot({ path: 'test-results/screenshots/theme_dark.png', fullPage: true });
});

test('reference compiler survives disabled localStorage and still exports', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.addInitScript((key) => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (k) {
      if (k === key) throw new Error('storage denied');
      return original.call(this, k);
    };
  }, COMPILER_STORAGE_KEYS.anatomy);
  await gotoModule(page, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
  await expect(page.getByText('Local storage unavailable; you can still print or export a JSON backup.')).toBeVisible();
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(`${COMPILER_FILE_STEMS.anatomy}.json`);
  expect(errors).toEqual([]);
});

test('reference compiler shows a recoverable error for corrupt saved data', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.addInitScript((key) => localStorage.setItem(key, '{ not valid json'), COMPILER_STORAGE_KEYS.anatomy);
  await gotoModule(page, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
  await expect(page.getByText('Saved reference sheet could not be read.')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const { eventId, moduleId, key } of OTHER_STORAGE_KEYS) {
  test(`${eventId}/${moduleId} recovers from corrupt saved data without crashing`, async ({ page }) => {
    const errors = trackConsoleIssues(page);
    await page.addInitScript((k) => localStorage.setItem(k, 'not json at all'), key);
    await gotoModule(page, { eventId, moduleId });
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('reference compiler announces a sheet saved under another manual', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.addInitScript(({ key, priorYear }) => localStorage.setItem(key, JSON.stringify({
    objectiveStatus: {},
    blocks: [{ id: 'blk-old', objectiveId: 'retired-objective', title: 'Retired', body: 'block' }],
    density: 'standard',
    season: priorYear
  })), { key: COMPILER_STORAGE_KEYS.anatomy, priorYear: SEASON_YEAR - 1 });
  await gotoModule(page, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
  await expect(page.getByText(new RegExp(`saved under the ${SEASON_YEAR - 1} manual`))).toBeVisible();
  await expect(page.getByText(/target objectives that are not in this manual/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('a corrupt navigation payload falls back to the landing view', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.addInitScript(() => sessionStorage.setItem('olympiad-studio-navigation', '{ broken'));
  await page.goto(BASE_PATH);
  await expect(page.getByRole('button', { name: 'Continue as guest' })).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test('cancelling the clear dialog keeps authored reference blocks', async ({ page }) => {
  const key = COMPILER_STORAGE_KEYS.anatomy;
  await page.addInitScript((k) => localStorage.setItem(k, JSON.stringify({
    objectiveStatus: {},
    blocks: [{ id: 'blk-seed', objectiveId: 'seed-objective', title: 'Keep this block', body: 'do not delete' }],
    density: 'standard'
  })), key);
  await gotoModule(page, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
  await expect(page.getByText('Compiled blocks (1)')).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Clear sheet' }).click();
  await expect(page.getByText('Compiled blocks (1)')).toBeVisible();
  const stored = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(stored).toContain('Keep this block');
});

test('cancelling the delete dialog keeps the saved run', async ({ page }) => {
  const key = storageKey('electricvehicle', 'practice-runs');
  await page.addInitScript((k) => localStorage.setItem(k, JSON.stringify([
    { label: 'Seeded run', failedRun: false, runTimeSec: 5, vehicleDistanceCm: 10, bottleDistanceCm: 10, notes: '', score: { totalScore: 100 } }
  ])), key);
  await gotoModule(page, { eventId: 'ev', moduleId: 'log' });
  await expect(page.getByText('Saved runs (1)')).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Saved runs (1)')).toBeVisible();
});

test('cancelling the build-log clear dialog keeps saved builds', async ({ page }) => {
  const key = storageKey('boomilever', 'build-log');
  await page.addInitScript((k) => localStorage.setItem(k, JSON.stringify([
    { label: 'Seeded build', structureMassGrams: '100', baseOption: 'standard', loadSupportedGrams: '9000', holds15Kg: false, tier: 'Tier 1', failureMode: '', changes: '', memberDescription: '' }
  ])), key);
  await gotoModule(page, { eventId: 'boomilever', moduleId: 'boomilever-build-log' });
  await expect(page.getByRole('heading', { name: 'Saved builds (1)' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Clear log' }).click();
  await expect(page.getByRole('heading', { name: 'Saved builds (1)' })).toBeVisible();
  const stored = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(stored).toContain('Seeded build');
});

test('reference compiler imports a JSON backup and rehydrates the editor', async ({ page }) => {
  await gotoModule(page, { eventId: 'anatomy', moduleId: 'anatomy-reference-compiler' });
  const objectiveId = await page.locator('label').filter({ hasText: 'Objective' }).locator('option').first().getAttribute('value');
  const payload = {
    objectiveStatus: {},
    blocks: [{ id: 'blk-import-1', objectiveId, title: 'Imported block title', body: 'Imported body text' }],
    density: 'compact'
  };
  await page.locator('input[type="file"]').setInputFiles({
    name: 'anatomy-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload))
  });
  await expect(page.getByText('Backup loaded into the editor. Save it to keep it in this browser.')).toBeVisible();
  await expect(page.getByText('Imported block title').first()).toBeVisible();
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  const stored = await page.evaluate((k) => localStorage.getItem(k), COMPILER_STORAGE_KEYS.anatomy);
  expect(stored).toContain('Imported block title');
});
