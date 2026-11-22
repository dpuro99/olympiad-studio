import { test, expect } from '@playwright/test';
import { SEASON_YEAR, captureSnapshot, openModule } from '../../helpers.js';

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
  expect((await downloadPromise).suggestedFilename()).toBe(`boomilever-c-${SEASON_YEAR}-build-log.csv`);

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

test('structure compliance derives geometry checks and the contact-depth consequence live', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'boomilever', moduleId: 'structure-compliance' });
  await expect(page.getByText('Self-check only', { exact: false })).toBeVisible();
  await expect(page.getByText('0 of 12 checkable items pass.')).toBeVisible();

  const distance = page.getByLabel('Chain centerline distance from wall (cm)');
  const offset = page.getByLabel('Chain centerline offset from wall centerline (cm)');
  const depth = page.getByLabel('Deepest wall contact below the bolt centerline (cm)');

  // Exact text: the summary's "n out of range" is a substring match otherwise.
  await distance.fill('39');
  await expect(page.getByText('Out of range', { exact: true })).toHaveCount(1);
  await distance.fill('42');
  await expect(page.getByText('In range', { exact: true })).toHaveCount(1);
  await offset.fill('1');
  await expect(page.getByText('In range', { exact: true })).toHaveCount(2);

  await depth.fill('14');
  await expect(page.getByText('No contact-depth Tier 2 trigger')).toBeVisible();
  await depth.fill('16');
  await expect(page.getByText('Tier 2 trigger')).toBeVisible();
  await expect(page.getByText(/placed in Tier 2/)).toBeVisible();

  // The bonus option adds the 15 kg gate and the 10 cm contact line.
  await page.getByRole('combobox', { name: 'Base option' }).selectOption('bonus');
  const heldSwitch = page.getByRole('switch', { name: /15 kg was held/ });
  await expect(heldSwitch).toBeVisible();
  await depth.fill('9');
  await heldSwitch.check();
  await expect(page.getByText('Bonus requirements recorded')).toBeVisible();
  await depth.fill('12');
  await expect(page.getByText('Bonus not earned — scored under §3.h')).toBeVisible();

  await captureSnapshot(page, testInfo, 'boomilever_structure_compliance');
  expect(errors).toEqual([]);
});