import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

const CANVAS_KEY = 'olympiad-studio.circuitlab-c.2027-logic-canvas';

test('circuit practice calculator solves series, parallel and Ohm\u2019s law', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'circuit-practice' });
  await expect(page.getByRole('heading', { name: 'Circuit Practice Calculator', level: 1 })).toBeVisible();

  await page.getByLabel('Resistance values (Ω) 1').fill('100');
  await page.getByRole('button', { name: 'Add resistor' }).click();
  await page.getByLabel('Resistance values (Ω) 2').fill('200');
  await page.getByRole('button', { name: 'Add resistor' }).click();
  await page.getByLabel('Resistance values (Ω) 3').fill('300');
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

test('digital logic workbench builds truth tables and checks De Morgan equivalence', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'digital-logic' });
  await expect(page.getByRole('heading', { name: 'Digital Logic Workbench', level: 1 })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Gate truth tables' })).toBeVisible();
  await expect(page.locator('caption').filter({ hasText: 'AND output' })).toBeVisible();

  await page.getByRole('tab', { name: 'Expression → truth table' }).click();
  await page.getByLabel('Boolean expression').fill('(A AND B) OR NOT C');
  await page.getByRole('button', { name: 'Generate truth table' }).click();
  await expect(page.getByText('Canonical sum-of-products:')).toBeVisible();
  await expect(page.locator('caption').filter({ hasText: 'Truth table for' })).toBeVisible();

  await page.getByRole('tab', { name: 'Equivalence' }).click();
  await page.getByLabel('First expression').fill('NOT (A AND B)');
  await page.getByLabel('Second expression').fill('(NOT A) OR (NOT B)');
  await page.getByRole('button', { name: 'Compare expressions' }).click();
  await expect(page.getByText(/Equivalent: the two expressions match/)).toBeVisible();

  await page.getByRole('tab', { name: 'Combinational circuits' }).click();
  await expect(page.locator('caption').filter({ hasText: 'Half adder truth table' })).toBeVisible();

  await captureSnapshot(page, testInfo, 'circuitlab_digital_logic');
  expect(errors).toEqual([]);
});

test('digital logic workbench minimizes, builds circuits, and drills', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'digital-logic' });

  await page.getByRole('tab', { name: 'Karnaugh map' }).click();
  await page.getByLabel('Boolean expression').fill('(A AND B) OR (A AND C) OR (B AND C)');
  await expect(page.getByText(/Minimized sum-of-products:/)).toBeVisible();
  await expect(page.locator('caption').filter({ hasText: 'Karnaugh map' })).toBeVisible();

  await page.getByRole('tab', { name: 'Multi-output table' }).click();
  await page.getByRole('button', { name: 'Generate truth table' }).click();
  await expect(page.locator('caption').filter({ hasText: 'Every output column' })).toBeVisible();

  await page.getByRole('tab', { name: 'Circuit canvas' }).click();
  await expect(page.locator('caption').filter({ hasText: 'Circuit output for each input' })).toBeVisible();

  await page.getByRole('button', { name: '+ NOT' }).click();
  await expect(page.locator('[data-node="G2"]')).toBeVisible();

  await page.getByRole('button', { name: 'Output of G1' }).click();
  await page.getByRole('button', { name: 'Input a of G2' }).click();
  await page.getByRole('button', { name: 'Output of G2' }).click();
  await page.getByRole('button', { name: 'Input a of OUT' }).click();
  await expect(page.locator('table').last().locator('tbody tr').last().locator('td').last()).toHaveText('0');

  const before = await page.locator('[data-node="G1"]').boundingBox();
  const header = await page.locator('[data-node="G1"] [data-node-header]').boundingBox();
  await page.mouse.move(header.x + header.width / 2, header.y + header.height / 2);
  await page.mouse.down();
  await page.mouse.move(header.x + header.width / 2 + 40, header.y + header.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  const after = await page.locator('[data-node="G1"]').boundingBox();
  expect(after.x).toBeGreaterThan(before.x + 10);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.locator('[data-node="G1"]')).toBeVisible();

  await page.getByRole('tab', { name: 'Practice drill' }).click();
  await expect(page.getByText(/Score:/)).toBeVisible();
  await page.getByRole('button', { name: 'New problem' }).click();
  await expect(page.getByText(/Score:/)).toBeVisible();

  await captureSnapshot(page, testInfo, 'circuitlab_digital_logic_advanced');
  expect(errors).toEqual([]);
});

test('circuit canvas removes wires, tidies up, and persists across a reload', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'digital-logic' });
  await page.getByRole('tab', { name: 'Circuit canvas' }).click();
  await expect(page.locator('caption').filter({ hasText: 'Circuit output for each input' })).toBeVisible();

  await page.getByRole('button', { name: '+ NOT' }).click();
  await page.getByRole('button', { name: 'Output of G1' }).click();
  await page.getByRole('button', { name: 'Input a of G2' }).click();
  await page.getByRole('button', { name: 'Output of G2' }).click();
  await page.getByRole('button', { name: 'Input a of OUT' }).click();

  await page.getByRole('button', { name: 'Delete wire from G1 to G2' }).click();
  await expect(page.getByRole('button', { name: 'Delete wire from G1 to G2' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Output of G1' }).click();
  await page.getByRole('button', { name: 'Input a of G2' }).click();

  const outHeader = await page.locator('[data-node="OUT"] [data-node-header]').boundingBox();
  await page.mouse.move(outHeader.x + outHeader.width / 2, outHeader.y + outHeader.height / 2);
  await page.mouse.down();
  await page.mouse.move(30, outHeader.y + outHeader.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Tidy up' }).click();
  const outBox = await page.locator('[data-node="OUT"]').boundingBox();
  const g2Box = await page.locator('[data-node="G2"]').boundingBox();
  expect(outBox.x).toBeGreaterThan(g2Box.x);

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), CANVAS_KEY);
  expect(stored).toContain('G2');

  await page.reload();
  await page.waitForSelector('header', { timeout: 20_000 });
  await page.getByRole('tab', { name: 'Circuit canvas' }).click();
  await expect(page.locator('[data-node="G2"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete wire from G2 to OUT' })).toHaveCount(1);

  await captureSnapshot(page, testInfo, 'circuitlab_canvas_edit');
  expect(errors).toEqual([]);
});

test('circuit canvas recovers from corrupt saved data', async ({ page }, testInfo) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'not json at all'), CANVAS_KEY);
  const errors = await openModule(page, testInfo, { eventId: 'circuitlab', moduleId: 'digital-logic' });
  await page.getByRole('tab', { name: 'Circuit canvas' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('[data-node="A"]')).toBeVisible();
  expect(errors).toEqual([]);
});