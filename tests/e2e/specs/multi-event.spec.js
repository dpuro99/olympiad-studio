import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  captureSnapshot,
  confirmStar,
  expectNoHorizontalOverflow,
  seedNavigation,
  SEASON_YEAR,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../helpers.js';
import { storageKey } from '../../../src/seasons/storageKeys.js';
import anatomyConfig from '../../../src/components/events/anatomy/referenceCompilerConfig.js';

const STUDY_IDS = ['anatomy', 'chemlab', 'circuitlab', 'designergenes', 'dynamicplanet', 'rocksandminerals'];
const anatomyObjective = anatomyConfig.objectiveGroups[0].objectives[0];

async function openTracker(page, init) {
  if (init) await init(page);
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: STUDY_IDS } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Study progress', level: 2 })
    .waitFor({ timeout: SHELL_READY_TIMEOUT });
  // The full objective table lives in a modal so the rail stays compact.
  await page.getByRole('button', { name: /^Review all objectives/ }).click();
  await expect(page.getByRole('dialog', { name: 'Review all objectives' })).toBeVisible();
  return errors;
}

test('the tracker sits in a right rail beside the tools on desktop', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: ['anatomy'] } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Study progress', level: 2 }))
    .toBeVisible({ timeout: SHELL_READY_TIMEOUT });
  await expect(page.getByRole('button', { name: 'Open compiler', exact: true })).toHaveCount(0);
  await expect(page.locator('.dashboard-rail table')).toHaveCount(0);

  const toolsBox = await page.locator('.dashboard-main .event-section').first().boundingBox();
  const railBox = await page.locator('.dashboard-rail').boundingBox();
  const heroBox = await page.locator('.dashboard-hero').boundingBox();
  expect(toolsBox).toBeTruthy();
  expect(railBox).toBeTruthy();
  expect(heroBox).toBeTruthy();
  expect(railBox.x).toBeGreaterThan(toolsBox.x + toolsBox.width - 8);
  expect(Math.abs(railBox.y - heroBox.y)).toBeLessThan(8);
  // The workbench split is roughly 68 / 32, not a token right-hand column.
  expect(toolsBox.width).toBeGreaterThan(railBox.width * 1.8);
  expect(toolsBox.width).toBeLessThan(railBox.width * 2.6);
  await expect(page.getByRole('group', { name: 'Saved sheets' }).getByRole('button')).toBeVisible();

  await captureSnapshot(page, testInfo, 'dashboard_two_column');
  expect(errors).toEqual([]);
});

test('the objective table opens as a focus-managed modal and closes without changing filters', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: STUDY_IDS } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });

  const trigger = page.getByRole('button', { name: /^Review all objectives/ });
  await expect(trigger).toBeVisible();
  await expect(page.locator('.dashboard-rail table')).toHaveCount(0);
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Review all objectives' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByRole('button', { name: 'Close objective review' })).toBeFocused();
  await expect(dialog.locator('table tbody tr').first()).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('.dashboard-rail table')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('dashboard cards use compact star controls, pastel stage pills and a one-pixel hover lift', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: STUDY_IDS } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Study progress', level: 2 }))
    .toBeVisible({ timeout: SHELL_READY_TIMEOUT });

  const main = page.locator('.dashboard-main');
  await expect(main).not.toContainText('● Live');
  // Starring lives in Choose events; dashboard cards must not repeat a circular toggle.
  await expect(main.locator('.event-star-button')).toHaveCount(0);

  const firstHeader = main.locator('.event-section-head').first();
  const description = firstHeader.locator('.event-section-desc');
  const links = firstHeader.locator('.event-section-links');
  const descBox = await description.boundingBox();
  const linksBox = await links.boundingBox();
  expect(descBox).toBeTruthy();
  expect(linksBox).toBeTruthy();
  // The links row follows the description instead of leaving a reserved star column.
  expect(linksBox.y - (descBox.y + descBox.height)).toBeLessThan(12);
  expect(linksBox.x).toBeCloseTo(descBox.x, 0);

  const heroHeight = (await page.locator('.dashboard-hero').boundingBox()).height;
  expect(heroHeight).toBeLessThan(120);

  const backgrounds = [];
  for (const stage of ['Prepare', 'Practice', 'Record', 'Reference']) {
    const chip = main.locator('.dashboard-stage-chip').filter({ hasText: stage }).first();
    await expect(chip).toBeVisible();
    backgrounds.push(await chip.evaluate((node) => getComputedStyle(node).backgroundColor));
  }
  expect(new Set(backgrounds).size).toBe(4);

  const card = main.locator('.dashboard-tool-card').first();
  const liftOf = (node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42;
  expect(await card.evaluate(liftOf)).toBeCloseTo(0, 2);
  expect(await card.evaluate((node) => getComputedStyle(node, '::after').opacity)).toBe('0');
  await card.hover();
  await expect.poll(() => card.evaluate((node) => getComputedStyle(node, '::after').opacity)).toBe('1');
  expect(await card.evaluate(liftOf)).toBeCloseTo(-1, 2);
  expect(errors).toEqual([]);
});

test('My Events starts empty and starring an event builds the workspace', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, {});
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.dashboard-shell', { timeout: SHELL_READY_TIMEOUT });

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  await expect(page.getByText(/Star an event to build your dashboard/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Build your dashboard' })).toBeVisible();

  await page.getByRole('button', { name: /^Choose events/ }).click();
  const picker = page.getByRole('dialog', { name: 'Choose events' });
  const pickers = picker.getByRole('button', { name: /^Star / });
  expect(await pickers.count()).toBeGreaterThan(1);
  await captureSnapshot(page, testInfo, 'dashboard_my_events_empty');

  await picker.getByRole('button', { name: 'Star Anatomy and Physiology' }).click();
  await confirmStar(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Anatomy and Physiology', level: 2 })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Choose events \(1\)$/ })).toBeVisible();

  // The embedded tracker immediately narrows to the starred event's compiler.
  // EV has no research study compiler, so it would contribute zero sources.
  await expect(page.getByRole('group', { name: 'Saved sheets' })).toContainText('0/1');

  await page.getByRole('button', { name: 'Open Practice Notes' }).click();
  await expect(page.getByRole('heading', { name: 'Practice Notes', level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('the Saved sheets stat opens the Chemistry Lab compiler as a zero-state call to action', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: ['anatomy'] } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });

  const savedSheets = page.getByRole('group', { name: 'Saved sheets' });
  await expect(savedSheets).toContainText('0/1');
  await savedSheets.getByRole('button', {
    name: 'Open Chemistry Lab Reference and Study Compiler'
  }).click();

  await expect(page.getByRole('heading', { name: 'Reference & Study Compiler', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('combobox', { name: 'Compiler event' })).toHaveValue('chemlab');
  expect(errors).toEqual([]);
});

test('with no saved sheets the tracker reports not-started and filters live', async ({ page }, testInfo) => {
  const errors = await openTracker(page);

  await expect(page.getByRole('group', { name: 'Saved sheets' })).toContainText('0/6');
  await expect(page.getByRole('group', { name: 'Studying' })).toContainText('0');
  await expect(page.getByRole('group', { name: 'Confident' })).toContainText('0');
  await expect(page.getByRole('list', { name: 'Suggested next objectives' }).locator('li')).toHaveCount(4);

  const rows = page.locator('table tbody tr');
  const totalRows = await rows.count();
  expect(totalRows).toBeGreaterThan(20);

  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('confident');
  await expect(rows).toHaveCount(0);
  await expect(page.getByText('No objectives match these filters.')).toBeVisible();

  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('all');
  await page.getByRole('textbox', { name: 'Find an objective', exact: true })
    .fill(anatomyObjective.label.toUpperCase());
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(anatomyObjective.label);
  await captureSnapshot(page, testInfo, 'dashboard_tracker_filtered');
  expect(errors).toEqual([]);
});

test('a saved compiler sheet rolls up status, notes and opens back into the compiler', async ({ page }, testInfo) => {
  const key = storageKey('anatomy', 'reference-sheet');
  const errors = await openTracker(page, async (p) => {
    await p.addInitScript(({ key: sheetKey, objectiveId, year }) => {
      window.localStorage.setItem(sheetKey, JSON.stringify({
        objectiveStatus: { [objectiveId]: 'confident' },
        blocks: [{ id: 'blk-audit', objectiveId, title: 'Audit note', body: 'Saved by the harness' }],
        density: 'standard',
        season: year
      }));
    }, { key, objectiveId: anatomyObjective.id, year: SEASON_YEAR });
  });

  await expect(page.getByRole('group', { name: 'Saved sheets' })).toContainText('1/6');
  await expect(page.getByRole('group', { name: 'Confident' })).toContainText('1');
  await expect(page.getByRole('group', { name: 'Need evidence' })).toContainText('0');

  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('confident');
  const rows = page.locator('table tbody tr');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText(anatomyObjective.label);
  await captureSnapshot(page, testInfo, 'dashboard_tracker_saved');

  await page.getByRole('button', { name: `Open ${anatomyObjective.label} in Anatomy and Physiology compiler` }).click();
  await expect(page.getByRole('heading', { name: 'Reference & Study Compiler', level: 1 }))
    .toBeVisible({ timeout: 20_000 });
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('Reference & Study Compiler');
  expect(errors).toEqual([]);
});

test('corrupt and stale sheets are announced instead of shown as empty', async ({ page }) => {
  const chemKey = storageKey('chemlab', 'reference-sheet');
  const anatomyKey = storageKey('anatomy', 'reference-sheet');
  const errors = await openTracker(page, async (p) => {
    await p.addInitScript(({ chemKey: corruptKey, anatomyKey: staleKey, objectiveId, year }) => {
      window.localStorage.setItem(corruptKey, '{not json');
      window.localStorage.setItem(staleKey, JSON.stringify({
        objectiveStatus: { [objectiveId]: 'studying' },
        blocks: [],
        density: 'standard',
        season: year
      }));
    }, { chemKey, anatomyKey, objectiveId: anatomyObjective.id, year: SEASON_YEAR + 1 });
  });

  await expect(page.getByRole('alert').filter({ hasText: /saved sheet could not be read here/ })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'saved under another manual' })).toBeVisible();

  // The stale sheet is still counted; hiding its content would lose real work.
  await expect(page.getByRole('group', { name: 'Studying' })).toContainText('1');
  await expect(page.getByRole('group', { name: 'Saved sheets' })).toContainText('1/6');
  expect(errors).toEqual([]);
});

test('a browser that denies storage is not shown as an empty tracker', async ({ page }) => {
  const errors = trackConsoleIssues(page);
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('olympiad-studio.') && key.includes('reference-')) throw new Error('storage denied');
      return original.call(this, key);
    };
  });
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: STUDY_IDS } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Study progress', level: 2 }))
    .toBeVisible({ timeout: SHELL_READY_TIMEOUT });
  await expect(page.getByRole('alert').filter({ hasText: 'blocked reading saved sheets' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('the embedded tracker fits a 375px phone viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await seedNavigation(page, { page: 'dashboard', profile: { starredEventIds: STUDY_IDS } });
  await page.goto(BASE_PATH, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Study progress', level: 2 }))
    .toBeVisible({ timeout: SHELL_READY_TIMEOUT });
  await expectNoHorizontalOverflow(page, 375);
  await page.screenshot({ path: 'test-results/screenshots/dashboard_tracker_mobile.png', fullPage: true });
  await context.close();
});
