import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  captureSnapshot,
  openModule,
  seedNavigation,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../../helpers.js';
import { generateStructure } from '../../../../src/components/events/writeitdoit/relayUtils.js';
import { writeitdoit2027 } from '../../../../src/seasons/2027/writeitdoit.js';

const targetFor = (seed) => generateStructure(seed, writeitdoit2027.vocabulary);

test('WIDI guide renders the official rule summary and its one registered tool', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId: 'writeitdoit' });
  await page.goto(BASE_PATH);
  await page.waitForSelector('.field-guide', { timeout: SHELL_READY_TIMEOUT });

  await expect(page.getByRole('heading', { name: 'Write It, Do It', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Event rules at a glance', level: 2 })).toBeVisible();
  await expect(page.getByText('Exactly two participants')).toBeVisible();
  // The verified summary is the guide; the relay is the only tool.
  const rows = page.locator('.field-step');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Timed Relay');
  await captureSnapshot(page, testInfo, 'writeitdoit_guide');

  await rows.first().click();
  await expect(page.getByRole('heading', { name: 'Timed Relay', level: 1 })).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test('WIDI relay gates the target, times both phases and reviews each recorded piece', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'writeitdoit', moduleId: 'timed-relay' });
  const target = targetFor(1031);
  const possible = target.pieces.length * writeitdoit2027.rubric.dimensions.length;

  await expect(page.getByRole('heading', { name: 'Synthetic target' })).toBeVisible();
  await expect(page.getByRole('timer', { name: 'Writing time remaining' })).toHaveText('25:00');
  await expect(page.getByText(`Structure seed 1031`)).toBeVisible();

  // Drawing references are a live reminder during authoring, not an official ruling.
  const description = page.getByRole('textbox', { name: 'Description for your builder' });
  await description.fill('Use a vertical red stick on the left, free-standing, then a small blue cup above it connected to the stick.');
  await expect(page.getByText(/Possible drawing reference found/)).toHaveCount(0);
  await description.fill('See diagram below for the layout.');
  await expect(page.getByText(/Possible drawing reference found/)).toBeVisible();
  await description.fill('Use a vertical red stick on the left, free-standing, then a small blue cup above it connected to the stick.');

  for (const label of [
    'No drawings or diagrams in my description',
    'I described size, color, location, orientation and connections',
    'I used only a writing utensil'
  ]) {
    await page.getByRole('checkbox', { name: label }).check();
  }
  await expect(page.getByText('3 of 3 checked.')).toBeVisible();

  await page.getByRole('button', { name: 'Hide target and start build phase' }).click();
  await expect(page.getByRole('heading', { name: 'Synthetic target' })).toHaveCount(0);
  await expect(page.getByRole('timer', { name: 'Building time remaining' })).toHaveText('20:00');
  await expect(page.getByText('Description passed to the builder')).toBeVisible();

  for (const piece of target.pieces) {
    const values = {
      Size: piece.size,
      Color: piece.color,
      Location: piece.location,
      Orientation: piece.orientation,
      Connection: piece.connectedTo || 'none'
    };
    for (const [dimension, value] of Object.entries(values)) {
      await page.getByRole('combobox', { name: `${dimension} for ${piece.id}` }).selectOption(value);
    }
  }
  await expect(page.getByText(`${target.pieces.length} of ${target.pieces.length} pieces have every dimension recorded.`)).toBeVisible();

  await page.getByRole('button', { name: 'Reveal target and review' }).click();
  await expect(page.getByRole('heading', { name: 'Piece-by-piece comparison' })).toBeVisible();
  await expect(page.getByText(new RegExp(`Practice comparison: ${possible} of ${possible} piece details agreed`))).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Synthetic target' })).toHaveCount(1);
  await expect(page.getByText(/not an official score/i).first()).toBeVisible();
  await captureSnapshot(page, testInfo, 'writeitdoit_relay_review');

  await page.getByRole('button', { name: 'Generate a new structure' }).click();
  await expect(page.getByText('Structure seed 1032')).toBeVisible();
  await expect(page.getByRole('timer', { name: 'Writing time remaining' })).toHaveText('25:00');
  expect(errors).toEqual([]);
});
