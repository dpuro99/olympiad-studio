import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTOSOMES,
  STAGES,
  buildKaryotype,
  checkKaryotypeCase,
  checkNondisjunctionCase,
  checkStageCase,
  classifyStage,
  describeKaryotype,
  gameteOutcomes,
  makeKaryotypeCase,
  makeNondisjunctionCase,
  makeStageCase,
  zygoteOutcomes
} from '../src/components/events/designergenes/cellGeneticsUtils.js';

test('every stage has a cue set that classifies back to itself', () => {
  for (const stage of STAGES) {
    assert.deepEqual(classifyStage(stage.cues).map((entry) => entry.id), [stage.id], stage.id);
  }
  assert.deepEqual(classifyStage([]), []);
  assert.deepEqual(classifyStage(['not-a-cue']), []);
});

test('generated stage cases are reproducible and solvable from their cues alone', () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    const first = makeStageCase(seed);
    assert.deepEqual(makeStageCase(seed), first, `seed ${seed}`);
    assert.equal(first.cues.length > 0, true);
    assert.equal(first.options.length, 4);
    assert.equal(new Set(first.options.map((option) => option.id)).size, 4);
    assert.ok(first.options.some((option) => option.id === first.stageId));
    const matches = classifyStage(first.cues.map((cue) => cue.id));
    assert.deepEqual(matches.map((stage) => stage.id), [first.stageId]);
    const graded = checkStageCase(first, first.stageId);
    assert.equal(graded.correct, true);
    assert.equal(graded.answerId, first.stageId);
    assert.ok(graded.explanation.length > 0);
    assert.equal(checkStageCase(first, first.options.find((option) => option.id !== first.stageId).id).correct, false);
  }
});

test('nondisjunction derives different gamete and zygote sets for each division', () => {
  assert.deepEqual(gameteOutcomes('meiosis-i'), ['n+1', 'n+1', 'n−1', 'n−1']);
  assert.deepEqual(gameteOutcomes('meiosis-ii'), ['n+1', 'n−1', 'n', 'n']);
  assert.deepEqual(zygoteOutcomes('meiosis-i'), ['2n+1 — trisomic', '2n+1 — trisomic', '2n−1 — monosomic', '2n−1 — monosomic']);
  assert.deepEqual(zygoteOutcomes('meiosis-ii'), ['2n+1 — trisomic', '2n−1 — monosomic', '2n — euploid', '2n — euploid']);
  assert.ok(gameteOutcomes('mitosis').error);
  assert.ok(zygoteOutcomes('mitosis').error);
});

test('generated nondisjunction cases are reproducible and grade from the derived model', () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const first = makeNondisjunctionCase(seed);
    assert.deepEqual(makeNondisjunctionCase(seed), first);
    assert.deepEqual([...first.gametes].sort(), [...gameteOutcomes(first.division)].sort());
    const graded = checkNondisjunctionCase(first, first.division);
    assert.equal(graded.correct, true);
    assert.equal(graded.answerId, first.division);
    assert.deepEqual(graded.zygotes, zygoteOutcomes(first.division));
    assert.equal(checkNondisjunctionCase(first, 'mitosis').correct, false);
  }
});

test('karyotype notation and abnormality are derived from the counts, not stored as a key', () => {
  const counts = {};
  for (const chromosome of AUTOSOMES) counts[chromosome] = 2;
  counts['21'] = 3;
  const trisomy = describeKaryotype(buildKaryotype(counts, 'XX'));
  assert.equal(trisomy.total, 47);
  assert.equal(trisomy.notation, '47,XX,+21');
  assert.equal(trisomy.abnormalRow, '21');
  assert.equal(trisomy.label, 'Extra copy of chromosome 21');

  const plain = describeKaryotype(buildKaryotype({}, 'XY'));
  assert.equal(plain.total, 46);
  assert.equal(plain.notation, '46,XY');
  assert.equal(plain.abnormalRow, 'none');

  const turner = describeKaryotype(buildKaryotype({}, 'X'));
  assert.equal(turner.total, 45);
  assert.equal(turner.notation, '45,X');
  assert.equal(turner.abnormalRow, 'sex');

  const xxY = describeKaryotype(buildKaryotype({}, 'XXY'));
  assert.equal(xxY.total, 47);
  assert.equal(xxY.notation, '47,XXY');
  assert.equal(xxY.abnormalRow, 'sex');
});

test('generated karyotype cases are reproducible and grade against the derived row', () => {
  const seen = new Set();
  for (let seed = 1; seed <= 90; seed += 1) {
    const first = makeKaryotypeCase(seed);
    assert.deepEqual(makeKaryotypeCase(seed), first);
    assert.equal(AUTOSOMES.every((chromosome) => [2, 3].includes(first.karyotype.autosomes[chromosome])), true);
    const graded = checkKaryotypeCase(first, first.answerRow);
    assert.equal(graded.correct, true);
    assert.equal(graded.answerRow, first.answerRow);
    assert.ok(graded.notation.startsWith(String(graded.total)));
    assert.equal(checkKaryotypeCase(first, first.answerRow === 'none' ? '21' : 'none').correct, false);
    seen.add(graded.notation);
  }
  // The pattern set covers normal complements, trisomies and sex-chromosome cases.
  assert.ok(seen.has('46,XX'));
  assert.ok(seen.has('47,XX,+21'));
  assert.ok(seen.has('45,X'));
  assert.ok(seen.has('47,XXY'));
});
