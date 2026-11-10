import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CODON_TABLE,
  MUTATION_KINDS,
  RESTRICTION_ENZYMES,
  classifyMutation,
  complement,
  findRestrictionSites,
  gcContent,
  generateSequence,
  normalizeSequence,
  readingFrames,
  residueName,
  reverseComplement,
  transcribe,
  translate
} from '../src/components/events/designergenes/sequenceUtils.js';

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test('normalizeSequence strips whitespace, upper-cases, and reports invalid bases', () => {
  assert.deepEqual(normalizeSequence(' atg cgc\ntta '), { sequence: 'ATGCGCTTA', error: null });
  assert.match(normalizeSequence('').error, /Enter a sequence/);
  assert.match(normalizeSequence('ATGN').error, /Unexpected character: N/);
  assert.match(normalizeSequence('ATU').error, /DNA uses A\/C\/G\/T/);
  assert.deepEqual(normalizeSequence('aug uaa', { alphabet: 'RNA' }), { sequence: 'AUGUAA', error: null });
});

test('complement and reverse complement follow base pairing on the opposite strand', () => {
  assert.equal(complement('ACGT'), 'TGCA');
  assert.equal(complement('AAU'), 'TTA');
  assert.equal(reverseComplement('AAGC'), 'GCTT');
  assert.equal(reverseComplement(reverseComplement('ACGTACGT')), 'ACGTACGT');
  assert.equal(reverseComplement('GAATTC'), 'GAATTC', 'palindromic sites are their own reverse complement');
});

test('transcribe converts DNA to mRNA and leaves RNA unchanged', () => {
  assert.equal(transcribe('ATGGCCTAA'), 'AUGGCCUAA');
  assert.equal(transcribe('AUGGCC'), 'AUGGCC');
});

test('translate reads the standard genetic code and stops at the first stop codon', () => {
  assert.equal(Object.keys(CODON_TABLE).length, 64);
  assert.equal(Object.values(CODON_TABLE).filter((entry) => entry.code === '*').length, 3);
  assert.equal(residueName('M'), 'Methionine');
  assert.equal(residueName('*'), 'Stop');

  const result = translate('ATGGCGTTTTAA');
  assert.equal(result.protein, 'MAF');
  assert.equal(result.codons.length, 4);
  assert.equal(result.codons[0].isStart, true);
  assert.equal(result.codons[3].isStop, true);
  assert.equal(result.stoppedEarly, true);
  assert.equal(result.stopCodon, 'UAA');
  assert.equal(result.leftoverBases, 0);

  const noStopOption = translate('ATGGCGTTTTAA', { stopAtStop: false });
  assert.equal(noStopOption.protein, 'MAF');
  assert.equal(noStopOption.codons.length, 4);
  assert.equal(noStopOption.stoppedEarly, false);

  const partial = translate('ATGGCGT');
  assert.equal(partial.protein, 'MA');
  assert.equal(partial.leftoverBases, 1);
});

test('readingFrames yields three forward and three reverse frames', () => {
  const sequence = 'ATGAAACCCGGGTTT';
  const frames = readingFrames(sequence);
  assert.equal(frames.length, 6);
  assert.deepEqual(frames.map((frame) => frame.id), ['+1', '+2', '+3', '-1', '-2', '-3']);
  assert.equal(frames[0].protein.startsWith('MKPGF'), true);

  const forwardOnly = readingFrames(sequence, { includeReverse: false });
  assert.equal(forwardOnly.length, 3);
  forwardOnly.forEach((frame, offset) => {
    assert.equal(frame.offset, offset);
    assert.equal(frame.template.slice(frame.offset), sequence.slice(offset));
  });
});

test('gcContent counts bases and reports GC percentage', () => {
  const result = gcContent('AACCGGTTA');
  assert.deepEqual(result.counts, { A: 3, T: 2, C: 2, G: 2 });
  assert.equal(result.total, 9);
  assert.equal(result.gc, 4);
  assert.equal(result.percent, (4 / 9) * 100);
  assert.equal(gcContent('').percent, 0);
  assert.equal(gcContent('UUUU').counts.T, 4);
});

test('findRestrictionSites reports every occurrence with 1-based positions', () => {
  const sequence = 'TTTGAATTCTTTGAATTCTTTGGATCCTTT';
  const hits = findRestrictionSites(sequence);
  const ecoRI = hits.find((hit) => hit.name === 'EcoRI');
  assert.equal(ecoRI.count, 2);
  assert.deepEqual(ecoRI.positions, [{ start: 4, end: 9 }, { start: 13, end: 18 }]);
  assert.equal(hits.find((hit) => hit.name === 'BamHI').count, 1);
  assert.equal(hits.find((hit) => hit.name === 'NotI'), undefined);
  assert.ok(RESTRICTION_ENZYMES.every((enzyme) => reverseComplement(enzyme.site) === enzyme.site));
});

test('classifyMutation names silent, missense, nonsense, stop-loss, and indel consequences', () => {
  const silent = classifyMutation('ATGGCATAA', 'ATGGCGTAA');
  assert.equal(silent.kind, MUTATION_KINDS.SILENT);
  assert.equal(silent.changes.length, 1);
  assert.equal(silent.changes[0].referenceCode, 'A');
  assert.equal(silent.changes[0].variantCode, 'A');

  // Sickle-cell HbS: GAG (Glu) → GUG (Val).
  const missense = classifyMutation('ATGGAGAAA', 'ATGGTGAAA');
  assert.equal(missense.kind, MUTATION_KINDS.MISSENSE);
  assert.equal(missense.changes[0].referenceCode, 'E');
  assert.equal(missense.changes[0].variantCode, 'V');
  assert.equal(missense.changes[0].codonIndex, 1);

  const nonsense = classifyMutation('ATGTGGAAA', 'ATGTGAAAA');
  assert.equal(nonsense.kind, MUTATION_KINDS.NONSENSE);
  assert.equal(nonsense.changes[0].variantCode, '*');

  const stopLoss = classifyMutation('ATGTGAAAA', 'ATGTGGAAA');
  assert.equal(stopLoss.kind, MUTATION_KINDS.STOP_LOSS);

  const frameshift = classifyMutation('ATGAAACCC', 'ATGAAAACCC');
  assert.equal(frameshift.kind, MUTATION_KINDS.FRAMESHIFT);
  assert.equal(frameshift.delta, 1);

  const inFrame = classifyMutation('ATGAAACCC', 'ATGAAATTTCCC');
  assert.equal(inFrame.kind, MUTATION_KINDS.IN_FRAME_INDEL);
  assert.equal(inFrame.delta, 3);

  const identical = classifyMutation('ATGAAA', 'ATGAAA');
  assert.equal(identical.identical, true);
  assert.equal(identical.kind, MUTATION_KINDS.SILENT);
  assert.deepEqual(identical.changes, []);

  assert.match(classifyMutation('ATGN', 'ATGAAA').error, /Reference sequence/);
  assert.match(classifyMutation('ATGAAA', 'ATGNAA').error, /Variant sequence/);
});

test('generateSequence produces deterministic, stop-free coding sequences', () => {
  const first = generateSequence({ codons: 6, random: lcg(7) });
  const second = generateSequence({ codons: 6, random: lcg(7) });
  assert.equal(first, second);
  assert.equal(first.length, 3 * 7);
  assert.equal(first.slice(0, 3), 'ATG');
  assert.match(first, /^[ACGT]+$/);
  assert.equal(translate(first).stoppedEarly, false);
  assert.equal(translate(first).codons.length, 7);

  const withStop = generateSequence({ codons: 2, random: lcg(3), stop: true });
  assert.equal(withStop.slice(-3), 'TAA');
  assert.equal(withStop.length, 12);

  const rna = generateSequence({ codons: 3, random: lcg(11), alphabet: 'RNA' });
  assert.match(rna, /^[ACGU]+$/);
  assert.equal(rna.slice(0, 3), 'AUG');

  const noStart = generateSequence({ codons: 2, random: lcg(5), start: false });
  assert.equal(noStart.length, 6);
});
