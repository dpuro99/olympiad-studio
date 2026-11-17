import { expect, test } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'designergenes' });
});
test('molecular sequence workbench derives translation, frames, mutations, and gated sites', async ({ page }, testInfo) => {
  await openModule(page, testInfo, { eventId: 'designergenes', moduleId: 'molecular-sequences' });

  // Live translation of the default coding sequence (ATG GCG TTT AAA CCC GGG TAA).
  await expect(page.getByText('MAFKPG (6 residues)')).toBeVisible();
  // The mRNA string also appears inside the collapsed Composition disclosure, so
  // assert on the visible translate panel rather than the first DOM match.
  const translate = page.getByRole('status').filter({ hasText: 'Peptide (N→C)' });
  await expect(translate.getByText('AUGGCGUUUAAACCCGGGUAA', { exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Codons and translated residues' }).getByRole('listitem')).toHaveCount(7);

  // Editing the sequence re-derives the peptide without pressing a button.
  await page.getByLabel('DNA').fill('ATGGCCGGG');
  await expect(page.getByText('MAG (3 residues)')).toBeVisible();

  await page.getByRole('tab', { name: 'Reading frames' }).click();
  await expect(page.getByRole('list', { name: 'Reading frames' }).getByRole('listitem')).toHaveCount(6);
  await page.getByRole('switch', { name: 'Include reverse strand' }).uncheck();
  await expect(page.getByRole('list', { name: 'Reading frames' }).getByRole('listitem')).toHaveCount(3);

  await page.getByRole('tab', { name: 'Mutation' }).click();
  // The reference field is the shared sequence input; set both sides explicitly.
  await page.getByLabel('Reference (5′→3′)').fill('ATGGAGAAA');
  await page.getByLabel('Variant (5′→3′)').fill('ATGGTGAAA');
  await expect(page.getByRole('status').getByText('Missense', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Glutamic acid/ })).toContainText('Valine');

  await page.getByLabel('Reference (5′→3′)').fill('ATGTGGAAA');
  await page.getByLabel('Variant (5′→3′)').fill('ATGTGAAAA');
  await expect(page.getByRole('status').getByText('Nonsense', { exact: true })).toBeVisible();

  await page.getByLabel('Reference (5′→3′)').fill('ATGAAACCC');
  await page.getByLabel('Variant (5′→3′)').fill('ATGAAAACCC');
  await expect(page.getByRole('status').getByText('Frameshift', { exact: true })).toBeVisible();
  await expect(page.getByText(/not a multiple of 3/)).toBeVisible();

  await page.getByRole('tab', { name: 'Restriction map' }).click();
  await expect(page.getByText(/Restriction-site mapping off at Regional scope/)).toBeVisible();
  await page.getByLabel('DNA').fill('TTTGAATTCTTTGAATTC');
  await page.getByRole('switch', { name: 'Show State/National restriction mapping' }).check();
  await expect(page.getByRole('list', { name: 'Restriction sites' })).toContainText('EcoRI');
  await expect(page.getByText('positions 4–9, 13–18')).toBeVisible();

  await captureSnapshot(page, testInfo, 'designergenes_molecular_sequences');
});
