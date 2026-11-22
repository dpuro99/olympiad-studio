import { test, expect } from '@playwright/test';
import { SEASON_YEAR, captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('practice notes save locally and export as CSV', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'anatomy-notes' });
  await expect(page.getByRole('heading', { name: 'Practice Notes', level: 1 })).toBeVisible();

  await page.getByPlaceholder('e.g. respiratory disorders').fill('audit respiration note');
  await page.getByPlaceholder('e.g. asthma mechanism').fill('bronchioles');
  await page.getByPlaceholder(`Record observations, questions, or verified facts from the ${SEASON_YEAR} manual.`).fill('Verified fact recorded by the audit harness.');
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(page.getByRole('status')).toHaveText('Note saved in this browser.');
  await expect(page.getByText('audit respiration note')).toBeVisible();
  await expect(page.getByText('Saved notes (1)')).toBeVisible();

  await captureSnapshot(page, testInfo, 'anatomy_notes_saved');

  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`anatomy-c-${SEASON_YEAR}-notes.csv`);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear notes' }).click();
  await expect(page.getByRole('status')).toHaveText('Notes cleared.');
  expect(errors).toEqual([]);
});

test('respiratory data practice grades a generated loop and a shifted gas curve', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'respiratory-data' });
  await expect(page.getByRole('heading', { name: 'Respiratory Data Practice', level: 1 })).toBeVisible();
  await expect(page.getByText('Generated teaching data', { exact: false })).toBeVisible();

  // Spirometry: force a normal case, read its own table, then answer from it.
  await page.getByRole('combobox', { name: 'Case type', exact: true }).selectOption('normal');
  const rowValue = async (label) => {
    const row = page.locator('table tbody tr').filter({
      has: page.getByRole('cell', { name: label, exact: true })
    });
    return Number((await row.locator('td').last().innerText()).trim());
  };
  const fvc = await rowValue('FVC');
  const fev1 = await rowValue('FEV₁');
  await page.getByRole('spinbutton', { name: /FVC from the volumes/ }).fill(String(fvc));
  await page.getByRole('spinbutton', { name: 'FEV1 / FVC' }).fill((fev1 / fvc).toFixed(2));
  await page.getByRole('radio', { name: 'Normal' }).check();
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Correct.' })).toBeVisible();
  await captureSnapshot(page, testInfo, 'anatomy_respiratory_spirometry');

  // Gas exchange: force a right shift, read its PaO2 and the case curve at that
  // PO2 from the live plot, then grade the classification and saturation.
  await page.getByRole('tab', { name: 'Gas exchange & O₂–Hb' }).click();
  await page.getByRole('combobox', { name: 'Case shift', exact: true }).selectOption('right');
  const caseText = await page.getByRole('status').filter({ hasText: 'In this generated case' }).innerText();
  const po2 = Number(caseText.match(/PaO₂ is (\d+) mmHg/)[1]);
  await page.getByRole('slider', { name: 'Read saturation at PO2' }).fill(String(po2));
  const readText = await page.getByRole('status').filter({ hasText: /case curve [\d.]+%/ }).innerText();
  const saturation = Number(readText.match(/case curve ([\d.]+)%/)[1]);
  await page.getByRole('spinbutton', { name: /Saturation at the case PaO2/ }).fill(String(saturation));
  await page.getByRole('radio', { name: 'Right shift' }).check();
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Correct.' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'anatomy', pdfText: 'Audit block title' });
});