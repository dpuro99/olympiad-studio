import { test, expect } from '@playwright/test';
import { captureSnapshot, openModule } from '../../helpers.js';

test('efficiency estimator scores a sample load and mass', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'boomilever', moduleId: 'boomilever-estimator' });
  await expect(page.getByRole('heading', { name: 'Structure efficiency estimator', level: 2 })).toBeVisible();

  await page.getByLabel('Load supported (g)').fill('10000');
  await page.getByLabel('Structure mass (g)').fill('250');
  await expect(page.getByText('Load Scored: 10000 g')).toBeVisible();
  await expect(page.getByText(/Score: 40/)).toBeVisible();
  await expect(page.getByText('Bonus applied: No')).toBeVisible();

  await captureSnapshot(page, testInfo, 'boomilever_estimator');
  expect(errors).toEqual([]);
});

test('estimator surfaces an error for a missing structure mass', async ({ page }) => {
  await openModule(page, null, { eventId: 'boomilever', moduleId: 'boomilever-estimator' });
  await page.getByLabel('Load supported (g)').fill('10000');
  await expect(page.getByRole('alert')).toBeVisible();
});

test('build/test log records a tested prototype and exports CSV', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'boomilever', moduleId: 'boomilever-build-log' });
  await expect(page.getByRole('heading', { name: 'Build/Test Log', level: 1 })).toBeVisible();

  await page.getByLabel('Prototype label').fill('balsa box beam v2');
  await page.getByLabel('Structure mass (g)').fill('100');
  await page.getByLabel('Wall-contact base option').selectOption('bonus');
  await page.getByLabel('Load supported (g)').fill('15000');
  await page.getByLabel('Structure held 15 kg (required for the 7,500 g bonus)').check();
  await expect(page.getByText(/Efficiency:/)).toContainText('225');

  await page.getByRole('button', { name: 'Save build' }).click();
  await expect(page.getByRole('status').last()).toContainText('Build saved in this browser.');
  await expect(page.getByRole('heading', { name: 'Saved builds (1)' })).toBeVisible();
  await expect(page.getByText('Best efficiency')).toBeVisible();

  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('boomilever-c-2027-build-log.csv');

  await captureSnapshot(page, testInfo, 'boomilever_build_log');
  expect(errors).toEqual([]);
});

test('build/test log requires a positive structure mass before saving', async ({ page }) => {
  await openModule(page, null, { eventId: 'boomilever', moduleId: 'boomilever-build-log' });
  await page.getByLabel('Prototype label').fill('no mass yet');
  await page.getByRole('button', { name: 'Save build' }).click();
  await expect(page.getByRole('alert')).toContainText('positive structure mass');
  await expect(page.getByRole('heading', { name: 'Saved builds (0)' })).toBeVisible();
});