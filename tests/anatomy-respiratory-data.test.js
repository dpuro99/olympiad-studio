import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PATTERN_IDS,
  SHIFT_IDS,
  checkGasExchange,
  checkSpirometry,
  createRng,
  expiratoryFlow,
  generateGasExchangeCase,
  generateSpirometryCase,
  inspiratoryFlow,
  oxygenSaturation,
  sampleLoop,
  sampleOxygenCurve
} from '../src/components/events/anatomy/respiratoryDataUtils.js';

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('the seeded generator is deterministic and stays in range', () => {
  const first = createRng(42);
  const second = createRng(42);
  const sequence = Array.from({ length: 20 }, () => first());
  assert.deepEqual(sequence, Array.from({ length: 20 }, () => second()));
  assert.ok(sequence.every((value) => value >= 0 && value < 1));
  assert.notDeepEqual(Array.from({ length: 5 }, createRng(43)), sequence.slice(0, 5));
});

test('the same seed reproduces a spirometry case exactly', () => {
  const first = generateSpirometryCase({ seed: 17 });
  const second = generateSpirometryCase({ seed: 17 });
  assert.deepEqual(first, second);
  assert.ok(PATTERN_IDS.includes(first.type));
});

test('lung volumes are internally consistent for every pattern', () => {
  for (const type of PATTERN_IDS) {
    for (const seed of [1, 7, 42, 99, 1234]) {
      const c = generateSpirometryCase({ type, seed });
      const { tv, irv, erv, rv, tlc, fvc, fev1 } = c.volumes;
      assert.equal(tlc, tv + irv + erv + rv, `${type} TLC must be the sum of the four volumes`);
      assert.equal(fvc, tv + irv + erv, `${type} FVC must equal TV + IRV + ERV`);
      assert.equal(fev1, Math.round(c.ratio * fvc), `${type} FEV1 must match the ratio and FVC`);
      assert.ok(tv > 0 && irv > 0 && erv > 0 && rv > 0);
      assert.ok(c.ratio > 0 && c.ratio < 1);
      assert.ok(c.pef > 0);
    }
  }
});

test('generated patterns differ in the expected teaching direction', () => {
  const seed = 5;
  const normal = generateSpirometryCase({ type: 'normal', seed });
  const obstructive = generateSpirometryCase({ type: 'obstructive', seed });
  const restrictive = generateSpirometryCase({ type: 'restrictive', seed });
  assert.ok(obstructive.ratio < normal.ratio, 'obstructive FEV1/FVC is lower');
  assert.ok(restrictive.volumes.tlc < normal.volumes.tlc, 'restrictive TLC is smaller');
  assert.ok(obstructive.volumes.rv > normal.volumes.rv, 'obstructive RV is larger (air trapping)');
  assert.equal(obstructive.loopShape, 'scooped');
  assert.equal(restrictive.loopShape, 'narrow');
});

test('the flow-volume loop is closed, signed and shaped per case', () => {
  const obstructive = generateSpirometryCase({ type: 'obstructive', seed: 3 });
  const normal = generateSpirometryCase({ type: 'normal', seed: 3 });
  const { expiratory, inspiratory, fvc } = sampleLoop(obstructive, 40);
  assert.equal(expiratory.length, 42, 'uniform grid plus the exact apex point');
  assert.equal(inspiratory.length, 42);
  assert.equal(expiratory[0].y, 0, 'flow is zero at RV');
  assert.equal(expiratory[expiratory.length - 1].y, 0, 'flow is zero at TLC');
  assert.ok(inspiratory.every((point) => point.y <= 0), 'inspiratory flow is negative');
  assert.ok(expiratory.some((point) => point.y === obstructive.pef), 'expiratory limb reaches PEF');

  // A scooped limb lies below the near-linear normal limb at the same relative volume.
  const mid = Math.round(fvc * 0.5);
  assert.ok(expiratoryFlow(obstructive, mid) < expiratoryFlow(normal, normal.volumes.fvc * 0.5) + 1000);
  assert.ok(inspiratoryFlow(obstructive, mid) < 0);
});

test('spirometry grading accepts correct answers and rejects near-misses', () => {
  const c = generateSpirometryCase({ type: 'obstructive', seed: 21 });
  const good = checkSpirometry(c, {
    fvc: String(c.volumes.fvc),
    ratio: c.ratio.toFixed(2),
    pattern: 'obstructive'
  });
  assert.equal(good.correct, true);
  assert.deepEqual(good.checks, { fvc: true, ratio: true, pattern: true });

  const wrongPattern = checkSpirometry(c, { fvc: c.volumes.fvc, ratio: c.ratio, pattern: 'restrictive' });
  assert.equal(wrongPattern.correct, false);
  assert.equal(wrongPattern.checks.pattern, false);

  const farOff = checkSpirometry(c, { fvc: c.volumes.fvc + 1000, ratio: 0.99, pattern: '' });
  assert.deepEqual(farOff.checks, { fvc: false, ratio: false, pattern: false });

  const blank = checkSpirometry(c, { fvc: '', ratio: 'abc', pattern: c.type });
  assert.equal(blank.correct, false, 'blank or non-numeric input is never accepted');
  assert.equal(blank.checks.fvc, false);
  assert.equal(blank.checks.ratio, false);
});

test('the tolerance boundaries are inclusive', () => {
  const c = generateSpirometryCase({ type: 'normal', seed: 8 });
  const exactEdge = checkSpirometry(c, { fvc: c.volumes.fvc + 150, ratio: c.ratio + 0.03, pattern: c.type });
  assert.equal(exactEdge.correct, true);
  const outside = checkSpirometry(c, { fvc: c.volumes.fvc + 151, ratio: c.ratio + 0.031, pattern: c.type });
  assert.equal(outside.correct, false);
});

test('oxygen saturation is monotonic and shifts change affinity correctly', () => {
  assert.ok(oxygenSaturation(40, 26.6) < oxygenSaturation(80, 26.6));
  assert.ok(oxygenSaturation(80, 26.6) < oxygenSaturation(100, 26.6));
  assert.equal(oxygenSaturation(0, 26.6), 0);
  // At the same PO2, a right shift (higher P50) has lower saturation.
  assert.ok(oxygenSaturation(70, 32) < oxygenSaturation(70, 26.6));
  assert.ok(oxygenSaturation(70, 21) > oxygenSaturation(70, 26.6));
  const reference = sampleOxygenCurve(26.6, 20);
  assert.equal(reference.length, 21);
  assert.equal(reference[0].y, 0);
  assert.ok(reference[reference.length - 1].y > 95);
});

test('gas cases are reproducible and grade saturation and shift', () => {
  const c = generateGasExchangeCase({ seed: 33 });
  assert.deepEqual(c, generateGasExchangeCase({ seed: 33 }));
  assert.ok(SHIFT_IDS.includes(c.shift));
  close(c.saturation, oxygenSaturation(c.po2, c.p50));

  const good = checkGasExchange(c, { saturation: String(c.saturation), shift: c.shift });
  assert.equal(good.correct, true);
  assert.deepEqual(good.checks, { saturation: true, shift: true });

  const wrong = checkGasExchange(c, { saturation: c.saturation + 10, shift: SHIFT_IDS.find((s) => s !== c.shift) });
  assert.equal(wrong.correct, false);
  assert.deepEqual(wrong.checks, { saturation: false, shift: false });

  const blank = checkGasExchange(c, { saturation: '', shift: c.shift });
  assert.equal(blank.checks.saturation, false);
});

test('a forced gas shift keeps its P50 and stays in its teaching range', () => {
  for (const shift of SHIFT_IDS) {
    const c = generateGasExchangeCase({ shift, seed: 11 });
    assert.equal(c.shift, shift);
    if (shift === 'right') assert.ok(c.p50 > 26.6 && c.saturation < c.referenceSaturation);
    if (shift === 'left') assert.ok(c.p50 < 26.6 && c.saturation > c.referenceSaturation);
    if (shift === 'none') assert.equal(c.saturation, c.referenceSaturation);
  }
});
