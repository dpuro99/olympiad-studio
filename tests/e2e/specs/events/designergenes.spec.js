import { expect, test } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'designergenes' });
});
test('molecular sequence workbench derives translation, frames, mutations, and gated sites', async ({ page }, testInfo) => {
  await openModule(page, testInfo, { eventId: 'designergenes', moduleId: 'molecular-sequences' });

  // Live translation of the default coding sequence (ATG GCG TTT AAA CCC GGG TAA).
  await expect(page.getByText('MAFKPG (6 residues)')).toBeVisible();
  await expect(page.getByText('AUGGCGUUUAAACCCGGGUAA', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('list', { name: 'Codons and their translated residues' }).getByRole('listitem')).toHaveCount(7);

  // Editing the sequence re-derives the peptide without pressing a button.
  await page.getByLabel('DNA sequence (5′ → 3′)').fill('ATGGCCGGG');
  await expect(page.getByText('MAG (3 residues)')).toBeVisible();

  await page.getByRole('tab', { name: 'Reading frames' }).click();
  await expect(page.getByRole('list', { name: 'Reading frames' }).getByRole('listitem')).toHaveCount(6);
  await page.getByRole('switch', { name: 'Include the reverse strand' }).uncheck();
  await expect(page.getByRole('list', { name: 'Reading frames' }).getByRole('listitem')).toHaveCount(3);

  await page.getByRole('tab', { name: 'Mutation effects' }).click();
  // The reference field is the shared sequence input; set both sides explicitly.
  await page.getByLabel('Reference coding sequence (5′ → 3′)').fill('ATGGAGAAA');
  await page.getByLabel('Variant sequence (5′ → 3′)').fill('ATGGTGAAA');
  await expect(page.getByRole('status').getByText('Missense', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Glutamic acid/ })).toContainText('Valine');

  await page.getByLabel('Reference coding sequence (5′ → 3′)').fill('ATGTGGAAA');
  await page.getByLabel('Variant sequence (5′ → 3′)').fill('ATGTGAAAA');
  await expect(page.getByRole('status').getByText('Nonsense', { exact: true })).toBeVisible();

  await page.getByLabel('Reference coding sequence (5′ → 3′)').fill('ATGAAACCC');
  await page.getByLabel('Variant sequence (5′ → 3′)').fill('ATGAAAACCC');
  await expect(page.getByRole('status').getByText('Frameshift', { exact: true })).toBeVisible();
  await expect(page.getByText(/not a multiple of three/)).toBeVisible();

  await page.getByRole('tab', { name: 'Restriction map' }).click();
  await expect(page.getByText('Restriction-site mapping stays off at Regional scope.')).toBeVisible();
  await page.getByLabel('DNA sequence (5′ → 3′)').fill('TTTGAATTCTTTGAATTC');
  await page.getByRole('switch', { name: 'Show State/National restriction mapping' }).check();
  await expect(page.getByRole('list', { name: 'Restriction sites found' })).toContainText('EcoRI');
  await expect(page.getByText('positions 4–9, 13–18')).toBeVisible();

  await captureSnapshot(page, testInfo, 'designergenes_molecular_sequences');
});
