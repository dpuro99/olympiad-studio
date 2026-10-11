import { test } from '@playwright/test';
import { flowReferenceCompiler } from '../../helpers.js';

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'designergenes' });
});