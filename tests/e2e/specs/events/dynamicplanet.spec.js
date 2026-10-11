import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('freshwater workbench computes discharge and water-budget balance', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'dynamicplanet', moduleId: 'freshwater-tools' });
  await expect(page.getByRole('heading', { name: 'Freshwater measurement workbench', level: 2 })).toBeVisible();

  await page.getByLabel('Cross-sectional area (m²)').fill('2');
  await page.getByLabel('Average velocity (m/s)').fill('1.5');
  await page.getByRole('button', { name: 'Calculate discharge' }).click();
  await expect(page.getByText('3 m³/s').first()).toBeVisible();

  await page.getByLabel('Inflow amounts (comma-separated)').fill('1200, 300');
  await page.getByLabel('Outflow amounts (comma-separated)').fill('1000');
  await page.getByRole('button', { name: 'Calculate budget balance' }).click();
  await expect(page.getByRole('status').last()).toContainText('Net budget change: 500 m³');

  await captureSnapshot(page, testInfo, 'dynamicplanet_freshwater');
  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'dynamicplanet' });
});