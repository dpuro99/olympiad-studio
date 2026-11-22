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

test('system diagram drill labels targets and reveals the manual-cited key', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'system-diagram' });
  await expect(page.getByRole('heading', { name: 'System Diagram Drill', level: 1 })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Respiratory', exact: true })).toHaveAttribute('aria-selected', 'true');

  // Target 1 is the pharynx. The choice set always includes the correct name.
  const target1 = page.getByRole('button', { name: /^Target 1/ });
  await target1.click();
  await expect(page.getByRole('group', { name: 'Structure name choices' }).getByRole('button', { name: 'Pharynx' })).toBeVisible();
  await page.getByRole('group', { name: 'Structure name choices' }).getByRole('button', { name: 'Pharynx' }).click();
  await expect(page.getByRole('button', { name: 'Target 1, labelled Pharynx' })).toBeVisible();

  // Keyboard path: focus target 2 and select it with Enter.
  await page.getByRole('button', { name: 'Target 2, unlabelled' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Target 2 selected' })).toBeVisible();

  await page.getByRole('button', { name: 'Check labels' }).click();
  await expect(page.getByRole('status').filter({ hasText: '1 of 6 correct' })).toBeVisible();
  await expect(page.getByText('Pharynx', { exact: true }).first()).toBeVisible();
  await captureSnapshot(page, testInfo, 'anatomy_system_diagram_key');

  // Switching systems resets the round rather than carrying labels across.
  await page.getByRole('tab', { name: 'Digestive', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Target 1, unlabelled' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '1 of 6 correct' })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('process practice orders the alimentary canal and sorts immune terms', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'anatomy', moduleId: 'process-practice' });
  await expect(page.getByRole('heading', { name: 'Digestive/Immune Process Practice', level: 1 })).toBeVisible();
  const caseSelect = page.getByRole('combobox', { name: 'Case', exact: true });
  await expect(caseSelect.locator('option')).toHaveCount(4);

  // The default case is an ordering task; place the canal parts in manual order.
  for (const label of ['Esophagus', 'Stomach', 'Small intestine', 'Large intestine']) {
    await page.getByRole('button', { name: `Add ${label} to sequence` }).click();
  }
  await expect(page.getByRole('status').filter({ hasText: '4 of 4 steps placed.' })).toBeVisible();
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByRole('status').filter({ hasText: '4 of 4 correct' })).toBeVisible();
  await captureSnapshot(page, testInfo, 'anatomy_process_order_key');

  // Switching cases resets the round; classify the innate/adaptive terms.
  await caseSelect.selectOption('innate-vs-adaptive');
  await expect(page.getByRole('button', { name: 'Check answers' })).toBeDisabled();
  const sorted = {
    'Anatomical barriers': 'Innate',
    'Complement system': 'Innate',
    'Toll-like receptors': 'Innate',
    Inflammation: 'Innate',
    'B cells': 'Adaptive',
    'T cells': 'Adaptive',
    'Antigen presentation': 'Adaptive',
    Memory: 'Adaptive'
  };
  for (const [term, group] of Object.entries(sorted)) {
    await page.getByRole('button', { name: `${term}: ${group}`, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByRole('status').filter({ hasText: '8 of 8 correct' })).toBeVisible();

  // National level reveals the advanced cases in the case list.
  await page.getByRole('combobox', { name: 'Level', exact: true }).selectOption('national');
  await expect(caseSelect.locator('option')).toHaveCount(6);
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