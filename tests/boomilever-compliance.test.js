import test from 'node:test';
import assert from 'node:assert/strict';
import { boomilever2027 } from '../src/seasons/2027/boomilever.js';
import {
  createEmptyWorksheet,
  evaluateWorksheet,
  setCheckValue,
  setField,
  VERDICTS
} from '../src/components/events/boomilever/complianceUtils.js';

const compliance = boomilever2027.compliance;
const findNumeric = (result, id) => result.numeric.find((row) => row.id === id);

test('an empty worksheet leaves every item unset and never reports a pass', () => {
  const result = evaluateWorksheet(createEmptyWorksheet(), compliance);
  assert.equal(findNumeric(result, 'chainDistance').status, 'unset');
  assert.equal(findNumeric(result, 'chainOffset').status, 'unset');
  assert.ok(result.checks.every((check) => check.status === 'unset'));
  assert.equal(result.tier.status, 'unset');
  assert.equal(result.bonus, null);
  assert.equal(result.summary.total, 12);
  assert.equal(result.summary.unset, 12);
  assert.equal(result.summary.pass, 0);
  assert.equal(result.summary.ready, false);
  assert.deepEqual(VERDICTS, ['pass', 'fail', 'unset']);
});

test('chain distance enforces the manual 40-45 cm band', () => {
  const at = (value) => findNumeric(evaluateWorksheet(setField(createEmptyWorksheet(), 'chainDistanceCm', value), compliance), 'chainDistance');
  assert.equal(at(39).status, 'fail');
  assert.equal(at(40).status, 'pass');
  assert.equal(at(42.5).status, 'pass');
  assert.equal(at(45).status, 'pass');
  assert.equal(at(46).status, 'fail');
  assert.equal(at('').status, 'unset');
  assert.equal(at('not a number').status, 'unset');
});

test('chain offset uses the absolute distance and enforces 2.5 cm', () => {
  const at = (value) => findNumeric(evaluateWorksheet(setField(createEmptyWorksheet(), 'chainOffsetCm', value), compliance), 'chainOffset');
  assert.equal(at(0).status, 'pass');
  assert.equal(at(2.5).status, 'pass');
  assert.equal(at(3).status, 'fail');
  assert.equal(at(-3).status, 'fail');
  assert.equal(at(-1).value, 1);
});

test('contact depth drives the Tier 2 consequence at the 15 cm line', () => {
  const at = (value) => evaluateWorksheet(setField(createEmptyWorksheet(), 'contactDepthCm', value), compliance).tier;
  assert.equal(at(14.9).status, 'pass');
  assert.equal(at(14.9).label, 'No contact-depth Tier 2 trigger');
  assert.equal(at(15).status, 'fail');
  assert.equal(at(15).label, 'Tier 2 trigger');
  assert.match(at(15).detail, /Tier 2/);
  assert.equal(at(22).status, 'fail');
});

test('the bonus panel is absent on the standard option and derived live on the bonus option', () => {
  const base = createEmptyWorksheet('bonus');
  const withDepth = setField(base, 'contactDepthCm', 9);
  assert.equal(evaluateWorksheet(base, compliance).bonus.status, 'unset');
  assert.equal(evaluateWorksheet(setField(withDepth, 'holds15kg', true), compliance).bonus.status, 'pass');

  const noHold = evaluateWorksheet(setField(withDepth, 'holds15kg', false), compliance).bonus;
  assert.equal(noHold.status, 'fail');
  assert.match(noHold.detail, /no construction violation/);

  const tooDeep = evaluateWorksheet(setField(setField(base, 'contactDepthCm', 12), 'holds15kg', true), compliance).bonus;
  assert.equal(tooDeep.status, 'fail');
  assert.match(tooDeep.detail, /scored under §3\.h/);

  assert.equal(evaluateWorksheet(setField(createEmptyWorksheet('standard'), 'contactDepthCm', 9), compliance).bonus, null);
});

test('boolean checks validate and updates are immutable', () => {
  const empty = createEmptyWorksheet();
  const set = setCheckValue(empty, 'singleStructure', true);
  assert.equal(empty.checks.singleStructure, undefined);
  assert.equal(set.checks.singleStructure, true);
  assert.throws(() => setCheckValue(empty, 'singleStructure', 'yes'), /Unknown check value/);

  const failed = setCheckValue(set, 'singleStructure', false);
  assert.equal(evaluateWorksheet(set, compliance).checks.find((c) => c.id === 'singleStructure').status, 'pass');
  assert.equal(evaluateWorksheet(failed, compliance).checks.find((c) => c.id === 'singleStructure').status, 'fail');
});

test('the summary counts only checkable items and names what still needs attention', () => {
  let sheet = createEmptyWorksheet();
  sheet = setField(sheet, 'chainDistanceCm', 42);
  sheet = setField(sheet, 'chainOffsetCm', 1);
  for (const check of compliance.checks) sheet = setCheckValue(sheet, check.id, true);

  const result = evaluateWorksheet(sheet, compliance);
  assert.equal(result.summary.pass, 12);
  assert.equal(result.summary.fail, 0);
  assert.equal(result.summary.unset, 0);
  assert.equal(result.summary.ready, true);
  assert.deepEqual(result.summary.attention, []);

  const withFail = setCheckValue(setField(sheet, 'chainDistanceCm', 50), 'noAdhesiveTape', false);
  const failedResult = evaluateWorksheet(withFail, compliance);
  assert.equal(failedResult.summary.fail, 2);
  assert.equal(failedResult.summary.ready, false);
  assert.ok(failedResult.summary.attention.includes('Chain centerline distance from wall'));
  assert.ok(failedResult.summary.attention.includes('No adhesive tape'));
});

test('a missing saved check is unreviewed, never compliant', () => {
  const partial = { ...createEmptyWorksheet(), checks: { singleStructure: true } };
  const result = evaluateWorksheet(partial, compliance);
  assert.equal(result.summary.pass, 1);
  assert.equal(result.summary.unset, 11);
  assert.equal(result.summary.ready, false);
});
