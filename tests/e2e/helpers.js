import { expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const BASE_PATH = '/olympiad-studio/';
export const NAVIGATION_KEY = 'olympiad-studio-navigation';
export const SCREENSHOT_DIR = 'test-results/screenshots';

export const COMPILER_STORAGE_KEYS = {
  anatomy: 'olympiad-studio.anatomy-c.2027-reference-sheet',
  designergenes: 'olympiad-studio.designergenes-c.2027-reference-sheet',
  chemlab: 'olympiad-studio.chemlab-c.2027-reference-sheet',
  circuitlab: 'olympiad-studio.circuitlab-c.2027-reference-binder',
  dynamicplanet: 'olympiad-studio.dynamicplanet-c.2027-reference-binder',
  rocksandminerals: 'olympiad-studio.rocksandminerals-c.2027-reference-binder'
};

export const COMPILER_FILE_STEMS = {
  anatomy: 'anatomy-c-2027-reference-sheet',
  designergenes: 'designergenes-c-2027-reference-sheet',
  chemlab: 'chemlab-c-2027-reference-sheet',
  circuitlab: 'circuitlab-c-2027-reference-binder',
  dynamicplanet: 'dynamicplanet-c-2027-reference-binder',
  rocksandminerals: 'rocksandminerals-c-2027-reference-binder'
};

export function seedNavigation(page, { eventId = null, moduleId, theme = 'light' } = {}) {
  const nav = {
    currentView: 'dashboard',
    isGuest: true,
    selectedEventId: eventId,
    page: moduleId || 'home',
    theme
  };
  return page.addInitScript((payload) => {
    sessionStorage.setItem(payload.key, JSON.stringify(payload.nav));
  }, { key: NAVIGATION_KEY, nav });
}

export function trackConsoleIssues(page) {
  const issues = [];
  page.on('pageerror', (error) => {
    issues.push(`pageerror: ${error.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Benign noise expected in guest/mock analytics mode.
    if (/supabase|auth-js|AuthRetryableFetchError|SessionMissingError|analytics|react-ga|google|gapi|favicon/i.test(text)) return;
    issues.push(`console.error: ${text}`);
  });
  page.on('requestfailed', (request) => {
    if (/\.(png|jpg|jpeg|svg|webp|woff2?|gif|ico|css)/i.test(request.url())) return;
    issues.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  return issues;
}

export async function captureSnapshot(page, testInfo, name) {
  const safeName = name.replace(/[^a-z0-9_-]+/gi, '_');
  const shotPath = path.join(SCREENSHOT_DIR, `${safeName}.png`);
  const domPath = path.join(SCREENSHOT_DIR, `${safeName}.txt`);
  mkdirSync(path.dirname(shotPath), { recursive: true });
  await page.screenshot({ path: shotPath, fullPage: true });
  const text = await page.locator('body').innerText();
  writeFileSync(domPath, text);
  return { shotPath, domPath };
}

export async function openModule(page, testInfo, { eventId, moduleId, theme = 'light' }) {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId, moduleId, theme });
  await page.goto(BASE_PATH);
  await page.waitForSelector('header', { timeout: 20_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  return errors;
}

export async function expectModuleRendered(page, { label, expectText }) {
  const h1 = page.locator('h1').filter({ hasText: label });
  await expect(h1).toBeVisible({ timeout: 20_000 });
  if (expectText) {
    await expect(page.getByText(new RegExp(escapeRegExp(expectText))).first()).toBeVisible({ timeout: 20_000 });
  }
  await expectUniqueHeadingNames(page);
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function extractPdfText(buffer) {
  // Lazy import: pdf-parse pulls in pdfjs-dist (heavy); only PDF checks pay for it.
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
}

/**
 * Render the current page as a real PDF (print CSS media, like a human's
 * print preview) and assert the sheet's content actually made it onto paper.
 * This is the regression guard for the blank-printout bug.
 */
export async function captureSheetPdf(page, expectedText) {
  const buffer = await page.pdf({ format: 'A4', printBackground: true });
  expect(buffer.length, 'PDF must not be empty').toBeGreaterThan(1000);
  const text = await extractPdfText(buffer);
  expect(text.toLowerCase(), 'printed sheet must contain its content').toContain(expectedText.toLowerCase());
  return { bytes: buffer.length, textLength: text.length };
}

/**
 * Assert no horizontal page overflow at a given viewport width.
 */
export async function expectNoHorizontalOverflow(page, viewportWidth) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(scrollWidth, `no horizontal overflow at ${viewportWidth}px`).toBeLessThanOrEqual(Math.max(viewportWidth, clientWidth) + 1);
}

/**
 * A11y guard: every visible heading on a page must have a unique accessible
 * name (case/whitespace-insensitive) so heading navigation is unambiguous.
 * aria-hidden subtrees (e.g. the print area) are excluded by role queries.
 */
export async function expectUniqueHeadingNames(page) {
  const headings = await page.getByRole('heading').all();
  const seen = new Map();
  for (const heading of headings) {
    const name = (await heading.textContent() || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!name) continue;
    if (seen.has(name)) {
      const level = await heading.evaluate((node) => Number(node.tagName.replace('H', '')));
      throw new Error(`Duplicate visible heading name "${name}" (also a <h${seen.get(name)}>, this is <h${level}>)`);
    }
    seen.set(name, await heading.evaluate((node) => Number(node.tagName.replace('H', ''))));
  }
}

/**
 * Press Tab repeatedly and assert each expected control ends up focused.
 */
export async function expectTabReaches(page, labels, limit = 60) {
  const reached = new Set();
  await page.evaluate(() => window.scrollTo(0, 0));
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? (el.getAttribute('aria-label') || el.textContent || '').trim() : '';
    });
    if (info) reached.add(info);
    if (reached.size >= labels.length && [...labels].every((l) => [...reached].some((r) => r.toLowerCase().includes(l.toLowerCase())))) break;
  }
  for (const label of labels) {
    expect([...reached].some((r) => r.toLowerCase().includes(label.toLowerCase())),
      `Tab navigation should reach a control with "${label}"`).toBeTruthy();
  }
}

/**
 * Assert the print stylesheet actually reveals the reference sheet under
 * print media. Guards against the regression where ancestor `display:none`
 * blanked the printed page: `emulateMedia` applies `@media print` without
 * needing a real print dialog.
 */
export async function expectPrintSheetRenders(page, expectedText) {
  await page.emulateMedia({ media: 'print' });
  try {
    const area = page.locator('.reference-print-area');
    await expect(area).toBeVisible();
    const box = await area.boundingBox();
    expect(box && box.width > 0 && box.height > 0).toBeTruthy();
    if (expectedText) await expect(area).toContainText(expectedText);
  } finally {
    await page.emulateMedia({ media: 'screen' });
  }
}

/**
 * Full user flow for the shared Reference & Study Compiler:
 * mark an objective confident, author a block, watch the budget, prune,
 * save to localStorage, export JSON, and clear with confirmation.
 */
export async function flowReferenceCompiler(page, testInfo, { eventId, pdfText } = {}) {
  const errors = await openModule(page, testInfo, { eventId, moduleId: `${eventId}-reference-compiler` });
  const storageKey = COMPILER_STORAGE_KEYS[eventId];
  const fileStem = COMPILER_FILE_STEMS[eventId];

  await expect(page.getByRole('heading', { name: 'Reference & Study Compiler', level: 1 })).toBeVisible();
  await expect(page.getByText(/Allowed resource:/)).toBeVisible();

  // 1. Study progress: mark the first objective Confident.
  await expect(page.getByText(/confident/).first()).toBeVisible();
  const statusGroup = page.locator('[role="group"][aria-label^="Status for"]').first();
  await statusGroup.getByRole('button', { name: 'Confident' }).click();
  await expect(page.getByText(/1\/[\d]+ confident/)).toBeVisible();

  // 2. Author a reference block attached to the first objective.
  await page.getByPlaceholder('e.g. Respiratory volumes').fill('Audit block title');
  await page.getByPlaceholder('Write the facts, diagram notes, or values you want on the sheet.').fill('Facts verified by the audit harness.');
  await page.getByRole('button', { name: 'Add block' }).click();
  await expect(page.getByRole('status').last()).toContainText('Reference block added.');
  await expect(page.getByText('Audit block title').first()).toBeVisible();

  // 2b. The sheet must be printable: the print stylesheet has to reveal the
  //     print area (regression guard for a blank printed page).
  await expectPrintSheetRenders(page, 'Audit block title');

  // 2c. Click the real Print button (headless no-op, but must not error) and,
  //     where requested, capture an actual PDF and verify its text content.
  await page.getByRole('button', { name: 'Print sheet' }).click();
  expect(errors).toEqual([]);
  if (pdfText) await captureSheetPdf(page, pdfText);

  // 3. Prune confident objectives from the sheet preview.
  await page.getByText('Sheet preview hides Confident objectives').click();
  await expect(page.locator('.reference-print-area')).toContainText('confident objectives hidden');

  // 4. Change text density preset and watch the budget update.
  const densitySelect = page.locator('label').filter({ hasText: 'Text density' }).locator('select');
  await densitySelect.selectOption('compact');

  // 5. Save locally and verify persistence in localStorage.
  await page.getByRole('button', { name: 'Save in this browser' }).click();
  await expect(page.getByRole('status').last()).toContainText('Reference sheet saved in this browser.');
  const stored = await page.evaluate((key) => window.localStorage.getItem(key), storageKey);
  expect(stored).toBeTruthy();
  expect(stored).toContain('Audit block title');

  // 6. Export the JSON backup (download).
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export JSON backup' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(`${fileStem}.json`);

  // 7. Clear the sheet with confirmation and confirm localStorage is empty.
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear sheet' }).click();
  await expect(page.getByRole('status').last()).toContainText('Reference sheet cleared.');
  const afterClear = await page.evaluate((key) => window.localStorage.getItem(key), storageKey);
  expect(afterClear).toBeNull();
  await expect(page.getByText('Compiled blocks (0)')).toBeVisible();
  await captureSnapshot(page, testInfo, `compiler_${eventId}`);
  expect(errors).toEqual([]);
}