import { expect, test } from '@playwright/test';
import { captureSnapshot, flowReferenceCompiler, openModule } from '../../helpers.js';

test('reference compiler: full author/save/prune/export/clear flow', async ({ page }, testInfo) => {
  await flowReferenceCompiler(page, testInfo, { eventId: 'designergenes' });
});
test('genetics workbench derives crosses, equilibrium, gated mapping and heritability', async ({ page }, testInfo) => {
  await openModule(page, testInfo, { eventId: 'designergenes', moduleId: 'genetics-workbench' });

  // Live Punnett square: Aa × Aa gives 2 Aa of 4 cells and a 3:1 phenotype.
  await expect(page.getByRole('table', { name: 'Punnett square' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Genotype outcomes' })).toContainText('Aa');
  await expect(page.getByRole('table', { name: 'Phenotype outcomes' })).toContainText('3');
  // A homozygous parent contributes one gamete type, so Aa × aa is a 1:1 testcross.
  await page.getByLabel('Parent 2 genotype').fill('aa');
  await expect(page.getByRole('table', { name: 'Phenotype outcomes' })).toContainText('0.5000');

  // Hardy-Weinberg derives p, q and genotype frequencies without a button.
  await page.getByRole('tab', { name: 'Hardy-Weinberg' }).click();
  await expect(page.getByRole('status')).toContainText('0.7000');
  await page.getByRole('combobox', { name: 'Given', exact: true }).selectOption('recessive');
  await expect(page.getByRole('status')).toContainText('0.6000');
  await expect(page.getByRole('table', { name: 'Expected genotype frequencies' })).toContainText('0.4800');

  // Mapping is gated to tournament levels; two-point and three-point both derive live.
  await page.getByRole('tab', { name: 'Gene mapping' }).click();
  await expect(page.getByText(/Gene mapping is gated to tournament levels/)).toBeVisible();
  await page.getByRole('switch', { name: /Show tournament-level mapping/ }).check();
  await expect(page.getByRole('status')).toContainText('15.00 cM');
  await page.getByRole('tab', { name: 'Three-point (National)' }).click();
  await expect(page.getByRole('status')).toContainText('A – B – C');
  await expect(page.getByRole('table', { name: 'Interval distances' })).toContainText('40');

  // Heritability is also gated; all three ratios derive from the entered variances.
  await page.getByRole('tab', { name: 'Heritability' }).click();
  await expect(page.getByText(/Heritability is gated to State & National/)).toBeVisible();
  await page.getByRole('switch', { name: /Show tournament-level heritability/ }).check();
  await expect(page.getByRole('status')).toContainText('0.6000');
  await expect(page.getByRole('status')).toContainText('0.4000');
  await expect(page.getByRole('status')).toContainText('0.5000');

  await captureSnapshot(page, testInfo, 'designergenes_genetics_workbench');
});

test('karyotype & meiosis drill grades generated stages, nondisjunction and synthetic karyotypes', async ({ page }, testInfo) => {
  await openModule(page, testInfo, { eventId: 'designergenes', moduleId: 'karyotype-meiosis' });

  // Seed 1031 fixes every case. The stage cue set classifies uniquely.
  await expect(page.getByText('Which stage fits every cue?')).toBeVisible();
  await expect(page.getByText('Four nuclei form.')).toBeVisible();
  await page.getByRole('button', { name: 'Telophase II — meiosis' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/Correct — Telophase II/)).toBeVisible();
  await expect(page.getByText(/\(Meiosis II\)/)).toBeVisible();
  await expect(page.getByText(/Case seed 1031 · Score 1\/1/)).toBeVisible();

  // The gamete pattern distinguishes the failed division, and zygotes derive live.
  await page.getByRole('tab', { name: 'Nondisjunction' }).click();
  await expect(page.getByRole('list', { name: 'Gamete chromosome complements' })).toContainText('n+1');
  await page.getByRole('button', { name: 'Meiosis II' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/the failure was in Meiosis II/)).toBeVisible();
  await expect(page.getByText(/2n — euploid/)).toBeVisible();

  // The karyotype row is a direct-manipulation button; the grade comes from counts.
  await page.getByRole('tab', { name: 'Karyotypes' }).click();
  await page.getByRole('button', { name: 'Sex chromosomes, XYY' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/Sex-chromosome complement XYY/)).toBeVisible();
  await expect(page.getByText(/47,XYY/).first()).toBeVisible();

  // Somatic recombination is gated and deliberately has no fabricated cases.
  await expect(page.getByText(/Somatic recombination \(V\(D\)J recombination/)).toBeVisible();
  await page.getByRole('switch', { name: 'Show State/National topics' }).check();
  await expect(page.getByRole('heading', { name: 'State & National: somatic recombination' })).toBeVisible();
  await expect(page.getByText(/ships no graded cases for them/)).toBeVisible();

  // A new seed rebuilds the case without losing the running score.
  await page.getByRole('button', { name: 'New case' }).click();
  await expect(page.getByText(/Case seed 1032 · Score 3\/3/)).toBeVisible();
  await captureSnapshot(page, testInfo, 'designergenes_karyotype_meiosis');
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
