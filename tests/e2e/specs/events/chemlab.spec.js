import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('gas-law unknown solver computes live, notebook saves and exports CSV', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'chemlab', moduleId: 'gas-laws' });
  await expect(page.getByRole('heading', { name: 'Gas-law unknown solver', level: 2 })).toBeVisible();
  await expect(page.getByText('Dalton\u2019s law of partial pressures')).toBeVisible();
  await expect(page.getByText('Graham\u2019s law of diffusion and effusion')).toBeVisible();

  const solver = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Gas-law unknown solver' }) });
  const knownInputs = solver.locator('input[type="number"]');
  await expect(knownInputs).toHaveCount(3);
  await expect(solver.getByRole('img')).toBeVisible();
  const values = [2, 1, 4];
  for (let i = 0; i < values.length; i += 1) {
    await knownInputs.nth(i).fill(String(values[i]));
  }
  await expect(solver.getByRole('status')).toContainText('Initial pressure');
  const resultText = await solver.getByRole('status').innerText();
  expect(resultText.trim().length).toBeGreaterThan(0);
  await captureSnapshot(page, testInfo, 'chemlab_gaslaw_result');

  await expect(page.getByRole('button', { name: 'Save in this browser' })).toBeEnabled();
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(page.getByRole('status').last()).toHaveText('Gas-law notebook saved in this browser.');

  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('chemistry-lab-gas-law-notebook.csv');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear notebook' }).click();
  await expect(page.getByRole('status').last()).toHaveText('Gas-law notebook cleared.');
  expect(errors).toEqual([]);
});

test('kinetics practice computes rates live and plots them', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'chemlab', moduleId: 'kinetics' });
  await expect(page.getByRole('heading', { name: 'Experiment setup', level: 2 })).toBeVisible();
  await page.getByLabel('Initial remaining amount (unit)').first().fill('10');
  await page.getByLabel('Final remaining amount (unit)').first().fill('4');
  await page.getByLabel('Elapsed time (s)').first().fill('20');
  await expect(page.getByText('Average rate:').first()).toBeVisible();
  await expect(page.getByRole('img', { name: /Measured remaining amount over elapsed time/ })).toBeVisible();
  await captureSnapshot(page, testInfo, 'chemlab_kinetics');
  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'chemlab' });
});