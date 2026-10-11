import { test, expect } from '@playwright/test';
import { captureSnapshot, openModule } from '../../helpers.js';

test('efficiency estimator scores a sample load and mass', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'boomilever', moduleId: 'boomilever-estimator' });
  await expect(page.getByRole('heading', { name: 'Structure efficiency estimator', level: 2 })).toBeVisible();

  await page.getByLabel('Load supported (g)').fill('10000');
  await page.getByLabel('Structure mass (g)').fill('250');
  await page.getByRole('button', { name: 'Calculate efficiency' }).click();

  await expect(page.getByText('Load Scored: 10000 g')).toBeVisible();
  await expect(page.getByText(/Score: 40/)).toBeVisible();
  await expect(page.getByText('Bonus applied: No')).toBeVisible();

  await captureSnapshot(page, testInfo, 'boomilever_estimator');
  expect(errors).toEqual([]);
});

test('estimator surfaces an error for a missing structure mass', async ({ page }) => {
  await openModule(page, null, { eventId: 'boomilever', moduleId: 'boomilever-estimator' });
  await page.getByLabel('Load supported (g)').fill('10000');
  await page.getByRole('button', { name: 'Calculate efficiency' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});