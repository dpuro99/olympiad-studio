import { test, expect } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';
import { fileStem, storageKey } from '../../../../src/seasons/storageKeys.js';

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'rocksandminerals' });
});

async function recordMineral(page, name, { luster, hardnessLow, hardnessHigh, cleavage, streak, acid, magnetic, notes }) {
  await page.getByRole('combobox', { name: 'Mineral', exact: true }).selectOption({ label: name });
  const suffix = ` — ${name}`;
  if (luster?.length) {
    const group = page.getByRole('group', { name: `Luster${suffix}`, exact: true });
    for (const tag of luster) await group.getByLabel(tag, { exact: true }).check();
  }
  if (hardnessLow) await page.getByLabel('Hardness low (Mohs)').fill(hardnessLow);
  if (hardnessHigh) await page.getByLabel('Hardness high (Mohs)').fill(hardnessHigh);
  if (cleavage?.length) {
    const group = page.getByRole('group', { name: `Cleavage or fracture${suffix}`, exact: true });
    for (const tag of cleavage) await group.getByLabel(tag, { exact: true }).check();
  }
  if (streak?.length) {
    const group = page.getByRole('group', { name: `Streak${suffix}`, exact: true });
    for (const tag of streak) await group.getByLabel(tag, { exact: true }).check();
  }
  if (acid) await page.getByLabel('Recorded acid reaction').selectOption({ label: acid });
  if (magnetic) await page.getByLabel('Recorded magnetism').selectOption({ label: magnetic });
  if (notes) await page.getByLabel('Distinguishing notes').fill(notes);
  await page.getByRole('button', { name: 'Save properties' }).click();
  await expect(page.getByText(`Properties saved for ${name}.`)).toBeVisible();
}

test('mineral ID key narrows the official list from recorded properties', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'rocksandminerals', moduleId: 'mineral-id-key' });

  await expect(page.getByRole('heading', { name: 'Mineral ID Key', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Observed properties', level: 2 })).toBeVisible();

  // The list ships as a skeleton: every mineral is present, nothing is pre-judged.
  await expect(page.getByText(/Properties recorded for 0 of 81 minerals/)).toBeVisible();
  await expect(page.getByText(/Nothing recorded yet/)).toBeVisible();

  // Regional scope is the default; starred State/National minerals stay hidden.
  const mineralPicker = page.getByRole('combobox', { name: 'Mineral', exact: true });
  await expect(mineralPicker.locator('option[value="zircon"]')).toHaveCount(0);
  await page.getByLabel('Include State/National minerals').check();
  await expect(mineralPicker.locator('option[value="zircon"]')).toHaveCount(1);
  await page.getByLabel('Include State/National minerals').uncheck();

  // Record two metallic sulfides by hand — the properties are the test's data,
  // never shipped values.
  await recordMineral(page, 'Galena', {
    luster: ['Metallic'],
    hardnessLow: '2.5',
    hardnessHigh: '2.75',
    cleavage: ['Perfect'],
    streak: ['Gray'],
    acid: 'No reaction',
    magnetic: 'Not magnetic',
    notes: 'Three perfect cleavage directions at 90°.'
  });
  await recordMineral(page, 'Pyrite', {
    luster: ['Metallic'],
    hardnessLow: '6',
    hardnessHigh: '6.5',
    cleavage: ['None (fracture)'],
    streak: ['Black'],
    notes: 'Brassy, striated cubes.'
  });
  await expect(page.getByText(/Properties recorded for 2 of 81 minerals/)).toBeVisible();
  await expect(page.getByText(/showing the 2 minerals with properties recorded, out of 54 in scope/)).toBeVisible();

  // Luster alone keeps both; adding hardness rules Pyrite out, not "unknown".
  const lusterFilter = page.getByRole('group', { name: 'Luster', exact: true });
  await lusterFilter.getByLabel('Metallic', { exact: true }).check();
  await expect(page.getByText(/Matching 2 of 54 in-scope minerals · 52 need properties recorded · 0 ruled out/)).toBeVisible();
  await page.getByRole('combobox', { name: /^Hardness \(Mohs/ }).selectOption('2.5');
  await expect(page.getByText(/Matching 1 of 54 in-scope minerals · 52 need properties recorded · 1 ruled out/)).toBeVisible();
  const matching = page.getByRole('list', { name: 'Matching minerals' });
  await expect(matching.getByText('Galena')).toBeVisible();
  await expect(matching.getByText('Pyrite')).toHaveCount(0);

  await page.locator('summary', { hasText: '1 mineral ruled out' }).click();
  await expect(page.getByText('Ruled out on Hardness')).toBeVisible();
  await expect(page.getByText(/you observed 2.5 ± 0.5, recorded 6–6.5/)).toBeVisible();

  // Widening the scope widens the candidate pool and the unjudged bucket.
  await page.getByLabel('Include State/National minerals').check();
  await expect(page.getByText(/Matching 1 of 81 in-scope minerals · 79 need properties recorded/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear observations' }).click();
  await expect(page.getByText('No observations selected.', { exact: true })).toBeVisible();

  // Recorded properties survive a reload.
  await page.reload();
  await page.waitForSelector('header', { timeout: 20_000 });
  await expect(page.getByText(/Properties recorded for 2 of 81 minerals/)).toBeVisible();
  await expect(page.getByText(/showing the 2 minerals with properties recorded/)).toBeVisible();

  // The export names the season it belongs to.
  const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(`${fileStem('rocksandminerals', 'specimen-cards')}.csv`);

  // Clearing is confirmed and cancellable.
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Clear recorded properties' }).click();
  await expect(page.getByText(/Properties recorded for 2 of 81 minerals/)).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear recorded properties' }).click();
  await expect(page.getByText(/Properties recorded for 0 of 81 minerals/)).toBeVisible();
  await expect(page.getByText(/Nothing recorded yet/)).toBeVisible();

  // A filled-in CSV imports back and drives the key immediately.
  const csv = [
    'mineral,class,level,luster,hardness_min,hardness_max,cleavage,streak,acid,magnetic,notes',
    'Calcite,Carbonates,Regional,Vitreous (glassy),3,3,Perfect,White / colorless,Strong (cold dilute HCl),Not magnetic,"Fizzes in cold dilute HCl"'
  ].join('\r\n');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'calcite.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv)
  });
  await expect(page.getByText(/Imported properties for 1 mineral\./)).toBeVisible();
  await expect(page.getByText(/Properties recorded for 1 of 81 minerals/)).toBeVisible();

  await page.getByRole('combobox', { name: /^Acid reaction/ }).selectOption({ label: 'Strong (cold dilute HCl)' });
  await expect(page.getByText(/Matching 1 of 54 in-scope minerals/)).toBeVisible();
  await expect(page.getByRole('list', { name: 'Matching minerals' }).getByText('Calcite')).toBeVisible();
  await expect(page.getByText('Fizzes in cold dilute HCl')).toBeVisible();

  await captureSnapshot(page, testInfo, 'rocksandminerals_mineral_id_key');
  expect(errors).toEqual([]);
});

test('specimen practice drills the recorded cards and shares the mineral store', async ({ page }, testInfo) => {
  const errors = await openModule(page, testInfo, { eventId: 'rocksandminerals', moduleId: 'specimen-practice' });

  await expect(page.getByRole('heading', { name: 'Specimen Practice', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Deck', level: 2 })).toBeVisible();

  // The list ships as a skeleton, so an untouched store leaves an empty deck.
  await expect(page.getByText(/The deck is empty\./)).toBeVisible();
  await expect(page.getByRole('tablist', { name: 'Drill mode' })).toHaveCount(0);
  await expect(page.getByText(/54 in scope · 54 after the class filter · 0 with recorded properties · 0 in the deck/)).toBeVisible();

  // Scope controls report every filter stage instead of one number.
  await page.getByLabel('Include State/National minerals').check();
  await expect(page.getByText(/81 in scope · 81 after the class filter/)).toBeVisible();
  await page.getByLabel('Include State/National minerals').uncheck();

  // Recorded properties are the test's own data; nothing is pre-filled.
  await recordMineral(page, 'Galena', {
    luster: ['Metallic'],
    hardnessLow: '2.5',
    hardnessHigh: '2.75',
    cleavage: ['Perfect'],
    streak: ['Gray'],
    acid: 'No reaction',
    magnetic: 'Not magnetic',
    notes: 'Three perfect cleavage directions at 90°.'
  });
  await recordMineral(page, 'Pyrite', {
    luster: ['Metallic'],
    hardnessLow: '6',
    hardnessHigh: '6.5',
    cleavage: ['None (fracture)'],
    streak: ['Black'],
    notes: 'Brassy, striated cubes.'
  });
  await expect(page.getByText(/2 with recorded properties · 2 in the deck/)).toBeVisible();

  // A class that holds no recorded card empties the deck instead of guessing.
  const classPicker = page.getByRole('combobox', { name: 'Chemical class', exact: true });
  await classPicker.selectOption({ label: 'Carbonates' });
  await expect(page.getByText(/0 in the deck/)).toBeVisible();
  await expect(page.getByText(/The deck is empty\./)).toBeVisible();
  await classPicker.selectOption({ label: 'Any class' });
  await expect(page.getByText(/2 with recorded properties · 2 in the deck/)).toBeVisible();

  // The drill hides the name and asks from the recorded properties alone.
  await expect(page.getByRole('heading', { name: 'Which mineral is this?', level: 2 })).toBeVisible();
  const choices = page.getByRole('group', { name: 'Answer choices' });
  await expect(choices.getByRole('button')).toHaveCount(2);
  const hardnessChip = await page.getByText(/^Hardness: /).first().innerText();
  const answer = hardnessChip.includes('6') ? 'Pyrite' : 'Galena';
  await choices.getByRole('button', { name: answer, exact: true }).click();
  await expect(page.getByText(`Correct — ${answer}.`)).toBeVisible();
  await expect(page.getByText('Asked 1')).toBeVisible();
  await expect(page.getByText('Correct 1')).toBeVisible();
  await expect(page.getByText('Accuracy 100%')).toBeVisible();

  // Giving up scores the card as missed rather than silently counting it.
  await page.getByRole('button', { name: 'Next card' }).click();
  await expect(page.getByText('Card 2 of 2')).toBeVisible();
  await page.getByRole('button', { name: 'Give up and reveal' }).click();
  await expect(page.getByText(/Revealed without answering — the answer is /)).toBeVisible();
  await expect(page.getByText('Asked 2')).toBeVisible();
  await expect(page.getByText('Missed 1')).toBeVisible();
  await expect(page.getByText('Accuracy 50%')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Missed this session (1)', level: 2 })).toBeVisible();

  // The missed list narrows the next round to the card that was missed.
  await page.getByRole('button', { name: 'Practice missed again' }).click();
  await expect(page.getByText('Drilling 1 missed mineral.')).toBeVisible();
  await expect(page.getByText('Card 1 of 1')).toBeVisible();
  await expect(page.getByText(/Only one mineral in the deck has recorded properties/)).toBeVisible();
  await expect(page.getByRole('group', { name: 'Answer choices' })).toHaveCount(0);

  // Revealing then marking it missed keeps the scoreboard honest.
  await page.getByRole('button', { name: 'Give up and reveal' }).click();
  await expect(page.getByText('Asked 3')).toBeVisible();
  await expect(page.getByText('Missed 2')).toBeVisible();

  // Flashcard mode reveals the answer and self-grades it.
  await page.getByRole('tab', { name: 'Flashcard' }).click();
  await page.getByRole('button', { name: 'Reveal answer' }).click();
  await expect(page.getByRole('button', { name: 'Got it' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Missed it' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.getByText('Asked 4')).toBeVisible();
  await expect(page.getByText('Correct 2')).toBeVisible();
  await expect(page.getByText('Accuracy 50%')).toBeVisible();

  // The shared editor opens on the drawn card and closes without writing.
  await page.getByRole('button', { name: /^Edit properties for / }).first().click();
  const form = page.getByRole('form', { name: /^Properties for / });
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Hardness low (Mohs)')).not.toHaveValue('');
  await form.getByRole('button', { name: 'Close without saving' }).click();
  await expect(page.getByRole('form', { name: /^Properties for / })).toHaveCount(0);

  // Restarting clears the session score but keeps the recorded cards.
  await page.getByRole('button', { name: 'Restart session' }).click();
  await expect(page.getByText('Asked 0')).toBeVisible();
  await expect(page.getByText('Accuracy —')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Missed this session/ })).toHaveCount(0);
  await expect(page.getByText(/2 with recorded properties · 2 in the deck/)).toBeVisible();

  // The drill session is session-only; the authored cards survive a reload.
  await page.reload();
  await page.waitForSelector('header', { timeout: 20_000 });
  await expect(page.getByText(/2 with recorded properties · 2 in the deck/)).toBeVisible();
  await expect(page.getByText('Asked 0')).toBeVisible();

  await captureSnapshot(page, testInfo, 'rocksandminerals_specimen_practice');

  // Both R&M tools read and write the same `specimen-cards` store.
  await openModule(page, testInfo, { eventId: 'rocksandminerals', moduleId: 'mineral-id-key' });
  await expect(page.getByText(/Properties recorded for 2 of 81 minerals/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('specimen practice recovers from corrupt saved cards', async ({ page }, testInfo) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, 'not json at all'),
    storageKey('rocksandminerals', 'specimen-cards')
  );
  const errors = await openModule(page, testInfo, { eventId: 'rocksandminerals', moduleId: 'specimen-practice' });

  await expect(page.getByText('Saved specimen properties could not be read.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Specimen Practice', level: 1 })).toBeVisible();
  await expect(page.getByText(/The deck is empty\./)).toBeVisible();
  await expect(page.getByRole('group', { name: 'Answer choices' })).toHaveCount(0);
  expect(errors).toEqual([]);
});
