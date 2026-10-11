import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('practice notes save locally and export as CSV', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'anatomy-notes' });
  await expect(page.getByRole('heading', { name: 'Practice Notes', level: 1 })).toBeVisible();

  await page.getByPlaceholder('e.g. respiratory disorders').fill('audit respiration note');
  await page.getByPlaceholder('e.g. asthma mechanism').fill('bronchioles');
  await page.getByPlaceholder('Record observations, questions, or verified facts from the 2027 manual.').fill('Verified fact recorded by the audit harness.');
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(page.getByRole('status')).toHaveText('Note saved in this browser.');
  await expect(page.getByText('audit respiration note')).toBeVisible();
  await expect(page.getByText('Saved notes (1)')).toBeVisible();

  await captureSnapshot(page, testInfo, 'anatomy_notes_saved');

  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('anatomy-c-2027-notes.csv');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear notes' }).click();
  await expect(page.getByRole('status')).toHaveText('Notes cleared.');
  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'anatomy', pdfText: 'Audit block title' });
});