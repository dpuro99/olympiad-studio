import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('freshwater workbench computes discharge and water-budget balance live', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'dynamicplanet', moduleId: 'freshwater-tools' });
  await expect(page.getByRole('heading', { name: 'Stream discharge', level: 2 })).toBeVisible();

  await page.getByLabel('Cross-sectional area (m²)').fill('2');
  await page.getByLabel('Average velocity (m/s)').fill('1.5');
  await expect(page.getByText('3 m³/s').first()).toBeVisible();

  await page.getByLabel('Inflow amounts 1').fill('1200');
  await page.getByRole('button', { name: 'Add inflow' }).click();
  await page.getByLabel('Inflow amounts 2').fill('300');
  await page.getByLabel('Outflow amounts 1').fill('1000');
  await expect(page.getByRole('status').last()).toContainText('Net budget change: 500 m³');

  await captureSnapshot(page, testInfo, 'dynamicplanet_freshwater');
  expect(errors).toEqual([]);
});

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'dynamicplanet' });
});
test('freshwater calculator toolbox derives each relationship live and keeps inputs across tabs', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'dynamicplanet', moduleId: 'freshwater-toolbox' });
  await expect(page.getByRole('heading', { name: 'Channel sinuosity', level: 2 })).toBeVisible();

  // Sinuosity fills from the fields as typed.
  await page.getByLabel('Channel (thalweg) length (km)').fill('1.5');
  await page.getByLabel('Valley-axis length (km)').fill('1');
  await expect(page.getByText('1.5', { exact: true })).toBeVisible();
  await expect(page.getByText('Meandering', { exact: true })).toBeVisible();
  await expect(page.getByText('50%', { exact: true })).toBeVisible();

  // Switching tabs and coming back keeps the measurements.
  await page.getByRole('tab', { name: 'Hydraulic gradient' }).click();
  await expect(page.getByRole('heading', { name: 'Hydraulic gradient', level: 2 })).toBeVisible();
  await page.getByLabel('Head change Δh (m)').fill('10');
  await page.getByLabel('Flow-path length L (m)').fill('100');
  await expect(page.getByText('0.1 m/m')).toBeVisible();
  await expect(page.getByText('10%', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Sinuosity' }).click();
  await expect(page.getByLabel('Channel (thalweg) length (km)')).toHaveValue('1.5');

  // Darcy: K = 1e-5 m/s over a 0.01 gradient gives q = 1e-7 m/s through 1000 m².
  await page.getByRole('tab', { name: 'Darcy flow' }).click();
  await page.getByLabel('Hydraulic conductivity K unit').selectOption('m/s');
  await page.getByLabel('Hydraulic conductivity K (m/s)').fill('0.00001');
  await page.getByLabel('Flow cross-sectional area A (m²)').fill('1000');
  await page.getByLabel('Head change Δh (m)').fill('2');
  await page.getByLabel('Flow-path length L (m)').fill('200');
  await expect(page.getByText('1.00e-7 m/s')).toBeVisible();
  await expect(page.getByText('8.64 m³/day')).toBeVisible();
  await page.getByLabel('Effective porosity n (optional)').fill('0.25');
  await expect(page.getByText('4.00e-7 m/s')).toBeVisible();

  // Residence time: 10⁶ m³ at 1 m³/s is about 11.57 days.
  await page.getByRole('tab', { name: 'Residence time' }).click();
  await page.getByLabel('Stored volume (m³)').fill('1000000');
  await page.getByLabel('Throughput (m³)').fill('1');
  await expect(page.getByText('11.57 day')).toBeVisible();

  // Recurrence: 2% annual chance is a 50-year return period.
  await page.getByRole('tab', { name: 'Recurrence interval' }).click();
  await page.getByLabel('Annual exceedance probability (%)').fill('2');
  await expect(page.getByText('50 yr')).toBeVisible();
  await expect(page.getByText('18.29%')).toBeVisible();

  // Manning: R = 2/3 m, v ≈ 0.8044 m/s at n = 0.03 and S = 0.001.
  await page.getByRole('tab', { name: 'Manning flow' }).click();
  await page.getByLabel('Flow cross-sectional area A (m²)').fill('2');
  await page.getByLabel('Wetted perimeter P (m)').fill('3');
  await page.getByLabel('Channel slope S (m/m)').fill('0.001');
  await page.getByLabel('Manning roughness n').fill('0.03');
  await expect(page.getByText('0.8044 m/s')).toBeVisible();
  await expect(page.getByText('1.609 m³/s')).toBeVisible();

  await captureSnapshot(page, testInfo, 'dynamicplanet_freshwater_toolbox');
  expect(errors).toEqual([]);
});

test('map and hydrograph practice generates reproducible cases that grade against the drawing', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'dynamicplanet', moduleId: 'map-practice' });
  await expect(page.getByRole('heading', { name: 'Topographic contour gradient', level: 2 })).toBeVisible();

  // The contour labels on the map are the only source of the elevations, so the
  // answer has to be read off the drawing exactly as a student would.
  const mapCaption = page.getByText(/contour interval \d+ m · A \d+ m · B \d+ m/);
  const caption = await mapCaption.textContent();
  const [, , levelA, levelB] = caption.match(/contour interval (\d+) m · A (\d+) m · B (\d+) m/);
  const relief = Math.abs(Number(levelA) - Number(levelB));
  expect(relief).toBeGreaterThan(0);

  await page.getByLabel('Elevation difference between A and B (m)').fill(String(relief));
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText('1 of 2 correct.')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Elevation difference' })).toContainText('correct');

  // The revealed value for the gradient is then accepted, so grading round-trips.
  const gradientLine = await page.getByRole('listitem').filter({ hasText: 'Average gradient' }).textContent();
  const expectedGradient = gradientLine.match(/expected ([\d.]+) m\/km/)[1];
  await page.getByLabel('Average gradient from A to B (m/km)').fill(expectedGradient);
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText('2 of 2 correct.')).toBeVisible();
  await expect(page.getByText(/Worked reasoning/)).toBeVisible();

  // A seed change clears the answers; returning to the same seed rebuilds the
  // same case, which is the whole point of exposing the seed.
  await page.getByLabel('Case seed').fill('2');
  await expect(page.getByLabel('Elevation difference between A and B (m)')).toHaveValue('');
  await page.getByLabel('Case seed').fill('1');
  await expect(page.getByText(/contour interval \d+ m · A \d+ m · B \d+ m/)).toHaveText(caption);

  // New case advances the seed and starts from a blank answer sheet.
  await page.getByRole('button', { name: 'New case' }).click();
  await expect(page.getByLabel('Case seed')).toHaveValue('2');

  // Stream order: order 1 everywhere is impossible, so both answers are marked wrong.
  await page.getByRole('tab', { name: 'Stream order' }).click();
  await expect(page.getByRole('heading', { name: 'Stream network order', level: 2 })).toBeVisible();
  await page.getByLabel('Stream order at the outlet (order)').fill('1');
  await page.getByLabel('Number of first-order segments (segments)').fill('1');
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText('0 of 2 correct.')).toBeVisible();
  await expect(page.getByText(/Shreve ordering instead adds the headwater tips/)).toBeVisible();

  // Water table: the contours and the flow arrow are revealed only on check.
  await page.getByRole('tab', { name: 'Water table' }).click();
  await expect(page.getByRole('heading', { name: 'Water table from well data', level: 2 })).toBeVisible();
  await expect(page.getByRole('img', { name: /Well map: three labelled wells/ })).toBeVisible();
  await expect(page.getByText(/contours hidden until you check/)).toBeVisible();
  await expect(page.getByText('§3.k.ii (p. C25)')).toBeVisible();
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText(/contours · arrow shows flow direction/)).toBeVisible();
  await expect(page.getByText('0 of 2 correct.')).toBeVisible();

  // Hydrograph: a lag of 1 h is outside the generated range for both fields.
  await page.getByRole('tab', { name: 'Hydrograph' }).click();
  await expect(page.getByRole('heading', { name: 'Storm hydrograph', level: 2 })).toBeVisible();
  await page.getByLabel('Lag time (rainfall centroid to peak discharge) (h)').fill('1');
  await page.getByLabel('Peak discharge (m³/s)').fill('1');
  await page.getByRole('button', { name: 'Check answers' }).click();
  await expect(page.getByText('0 of 2 correct.')).toBeVisible();

  await captureSnapshot(page, testInfo, 'dynamicplanet_map_practice');
  expect(errors).toEqual([]);
});
