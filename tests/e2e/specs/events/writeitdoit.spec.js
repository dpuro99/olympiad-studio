import { test, expect } from '@playwright/test';
import { captureSnapshot, openModule } from '../../helpers.js';

test('WIDI overview renders the official rule summary', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'writeitdoit', moduleId: 'main' });
  await expect(page.getByRole('heading', { name: '2027 Event Overview' })).toBeVisible();
  await expect(page.getByText('Exactly two participants')).toBeVisible();
  await captureSnapshot(page, testInfo, 'writeitdoit_overview');
  expect(errors).toEqual([]);
});