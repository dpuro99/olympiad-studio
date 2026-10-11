import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('circuit practice calculator solves series, parallel and Ohm\u2019s law', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'circuit-practice' });
  await expect(page.getByRole('heading', { name: 'Circuit Practice Calculator', level: 1 })).toBeVisible();

  await page.getByPlaceholder('e.g. 100, 200, 300').fill('100, 200, 300');
  await page.getByRole('button', { name: 'Calculate equivalent resistance' }).click();
  const resistanceStatus = page.locator('[role="status"]').first();
  await expect(resistanceStatus).toContainText('Series:');
  await expect(resistanceStatus).toContainText('600');
  await expect(resistanceStatus).toContainText('Parallel:');
  await expect(resistanceStatus).toContainText('54.5455');

  await page.getByLabel('Voltage (V)').fill('12');
  await page.getByLabel('Current (A)').fill('0.5');
  await page.getByRole('button', { name: 'Calculate unknown' }).click();
  await expect(page.getByText('24 Ω')).toBeVisible();

  await captureSnapshot(page, testInfo, 'circuitlab_practice');
  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'circuitlab', pdfText: 'Audit block title' });
});