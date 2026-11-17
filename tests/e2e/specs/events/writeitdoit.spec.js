import { test, expect } from '@playwright/test';
import {
  BASE_PATH,
  captureSnapshot,
  seedNavigation,
  SHELL_READY_TIMEOUT,
  trackConsoleIssues
} from '../../helpers.js';

test('WIDI guide renders the official rule summary without a standalone overview tool', async ({ page }, testInfo) => {
  const errors = trackConsoleIssues(page);
  await seedNavigation(page, { eventId: 'writeitdoit' });
  await page.goto(BASE_PATH);
  await page.waitForSelector('.field-guide', { timeout: SHELL_READY_TIMEOUT });

  await expect(page.getByRole('heading', { name: 'Write It, Do It', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Event rules at a glance', level: 2 })).toBeVisible();
  await expect(page.getByText('Exactly two participants')).toBeVisible();
  // WIDI is overview-only: the summary is in the guide, and there is no tool to open.
  await expect(page.locator('.field-step')).toHaveCount(0);
  await captureSnapshot(page, testInfo, 'writeitdoit_guide');
  expect(errors).toEqual([]);
});
