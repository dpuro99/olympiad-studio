import { test, expect } from '@playwright/test';
import { captureSnapshot, openModule } from '../../helpers.js';

const RUNS_KEY = 'olympiad-studio.ev-c.2027-practice-runs';

test('score calculator reproduces the manual example run (118.17)', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'ev', moduleId: 'score' });
  const run1 = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Run 1', level: 3 }) });

  await run1.getByLabel('Target time (s)').fill('14');
  await run1.getByLabel('Actual run time (s)').fill('12.27');
  await run1.getByLabel('Vehicle distance from target (cm)').fill('17.6');
  await run1.getByLabel('Bottle distance from bottle line (cm)').fill('10.6');
  await run1.getByLabel('Pusher foremost opening width measured by ES (cm)').fill('16');
  await run1.getByText('Bottle reached/passed the Target Point').click();

  await expect(run1.getByText('118.17')).toBeVisible({ timeout: 10_000 });

  // The manual scores both runs; final score needs two completed runs.
  const run2 = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Run 2', level: 3 }) });
  await run2.getByLabel('Target time (s)').fill('14');
  await run2.getByLabel('Actual run time (s)').fill('16.37');
  await run2.getByLabel('Vehicle distance from target (cm)').fill('22.5');
  await run2.getByLabel('Bottle distance from bottle line (cm)').fill('12.1');
  await run2.getByLabel('Pusher foremost opening width measured by ES (cm)').fill('16');
  await run2.getByText('Bottle reached/passed the Target Point').click();
  await run2.getByText('Bottle fully beyond the Bottle Line').click();
  await expect(run2.getByText('109.79')).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText('Better entered run score')).toBeVisible();
  await expect(page.getByText('109.79').last()).toBeVisible();
  await captureSnapshot(page, testInfo, 'ev_score_example');
  expect(errors).toEqual([]);
});

test('run logger saves a run locally, persists, and deletes with confirmation', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'ev', moduleId: 'log' });

  await page.getByLabel('Session label').fill('audit gearing run');
  await page.getByLabel('Target time (s)').fill('14');
  await page.getByLabel('Actual run time (s)').fill('12.27');
  await page.getByLabel('Vehicle distance from target (cm)').fill('17.6');
  await page.getByLabel('Bottle distance from line (cm)').fill('10.6');
  await page.getByLabel('Pusher opening width measured by ES (cm)').fill('16');
  await page.getByText('Bottle reached/passed Target Point').click();
  await page.getByLabel('Notes').fill('E2E audit note');
  await page.getByRole('button', { name: 'Save run' }).click();

  await expect(page.getByText('Run saved in this browser.')).toBeVisible();
  await expect(page.getByText('audit gearing run')).toBeVisible();
  await expect(page.getByText('Saved runs (1)')).toBeVisible();
  const stored = await page.evaluate((key) => window.localStorage.getItem(key), RUNS_KEY);
  expect(stored).toContain('audit gearing run');

  await captureSnapshot(page, testInfo, 'ev_log_saved');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Saved runs (0)')).toBeVisible();
  await expect(page.getByText('No runs saved in this browser yet.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('run logger blocks an incomplete run (native required validation)', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'ev', moduleId: 'log' });
  await page.getByLabel('Session label').fill('missing values');
  await page.getByRole('button', { name: 'Save run' }).click();
  // The form uses native `required` attributes, so a run can never reach the
  // app's own error message for a normal (non-failed) run. Assert save is blocked.
  await expect(page.getByText('Saved runs (0)')).toBeVisible();
  await expect(page.getByText('Run saved in this browser.')).toHaveCount(0);
  expect(errors).toEqual([]);
});