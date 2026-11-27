import { test, expect } from '@playwright/test';
import { captureSnapshot, openGeneralTool } from '../helpers.js';

test('timer opens on the manual-timed WIDI writing phase with its citation', async ({ page }, testInfo) => {
  const errors = await openGeneralTool(page, { toolId: 'generic-timer' });

  await expect(page.getByRole('heading', { name: 'Generic Event Timer', level: 1 })).toBeVisible();
  await expect(page.getByRole('timer', { name: 'Time remaining' })).toHaveText('45:00');
  await expect(page.getByText('Phase 1 of 2: Writing')).toBeVisible();
  await expect(page.getByText('25:00 left in this phase')).toBeVisible();
  await expect(page.getByText(/Source: §3\.b \(p\. B62\)/)).toBeVisible();

  await captureSnapshot(page, testInfo, 'general_timer_widi');
  expect(errors).toEqual([]);
});

test('timer switches presets and shows each event’s cited window', async ({ page }) => {
  await openGeneralTool(page, { toolId: 'generic-timer' });
  const preset = page.getByRole('combobox', { name: /^Preset/ });
  const clock = page.getByRole('timer', { name: 'Time remaining' });

  await preset.selectOption('ev-run-window');
  await expect(clock).toHaveText('08:00');
  await expect(page.getByText(/Source: §2\.c \(Event Time\)/)).toBeVisible();

  await preset.selectOption('boomilever-testing');
  await expect(clock).toHaveText('06:00');
  await expect(page.getByText(/Source: §4\.c\.i \(printed p\. C8\)/)).toBeVisible();
});

test('timer rejects an invalid custom duration and keeps custom intervals labelled practice-only', async ({ page }) => {
  await openGeneralTool(page, { toolId: 'generic-timer' });
  await page.getByRole('combobox', { name: /^Preset/ }).selectOption('custom');
  const custom = page.getByRole('textbox', { name: /^Custom duration/ });

  await custom.fill('2:60');
  await expect(page.getByRole('alert')).toContainText('Enter a duration as mm:ss');
  await expect(page.getByRole('button', { name: 'Start timer' })).toBeDisabled();

  await custom.fill('0:30');
  await expect(page.getByRole('timer', { name: 'Time remaining' })).toHaveText('00:30');
  await expect(page.getByRole('button', { name: 'Start timer' })).toBeEnabled();
  await expect(page.getByText(/Custom intervals are practice only/)).toBeVisible();
});

test('timer counts down, pauses without drifting, resets, and reports completion', async ({ page }) => {
  await openGeneralTool(page, { toolId: 'generic-timer' });
  await page.getByRole('combobox', { name: /^Preset/ }).selectOption('custom');
  const custom = page.getByRole('textbox', { name: /^Custom duration/ });
  const clock = page.getByRole('timer', { name: 'Time remaining' });

  await custom.fill('10:00');
  await page.getByRole('button', { name: 'Start timer' }).click();
  await expect(page.getByRole('button', { name: 'Pause timer' })).toBeVisible();
  await expect.poll(async () => Number((await clock.textContent()).split(':')[1])).toBeLessThan(60);

  await page.getByRole('button', { name: 'Pause timer' }).click();
  const paused = await clock.textContent();
  await page.waitForTimeout(400);
  await expect(clock).toHaveText(paused);
  await expect(page.getByRole('button', { name: 'Start timer' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset timer' }).click();
  await expect(clock).toHaveText('10:00');

  await custom.fill('0:02');
  await page.getByRole('button', { name: 'Start timer' }).click();
  await expect(page.getByText('Custom duration finished.')).toBeVisible({ timeout: 8_000 });
  await expect(clock).toHaveText('00:00');
});
