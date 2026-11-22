import test from 'node:test';
import assert from 'node:assert/strict';
import { circuitlab2027 } from '../src/seasons/2027/circuitlab.js';
import {
  evaluateSwitchRun,
  generateFaultCase,
  generateMysteryCase,
  generateSwitchCase,
  gradeFault,
  gradeMystery,
  lampIsLit,
  simulateFaultVoltages,
  SWITCH_TRAVELERS,
  toggleSwitch
} from '../src/components/events/circuitlab/handsOnUtils.js';

test('season data keeps only manual-listed tasks with printed citations', () => {
  assert.deepEqual(circuitlab2027.handsOn.tasks.map((task) => task.id), [
    'mystery-resistor', 'three-way-switch', 'troubleshooting'
  ]);
  for (const task of circuitlab2027.handsOn.tasks) {
    assert.match(task.citation, /§3\.c\.(i|vi|vii)/);
    assert.match(circuitlab2027.handsOn.context.safety.citation, /§3\.d/);
  }
  assert.equal(circuitlab2027.handsOn.notSimulated.length, 5);
});

test('seeded mystery cases reproduce and keep their divider self-consistent', () => {
  const first = generateMysteryCase(42);
  assert.deepEqual(first, generateMysteryCase(42));
  assert.notDeepEqual(first, generateMysteryCase(43));
  const current = first.supply / (first.known + first.unknown);
  assert.ok(Math.abs(first.readings.known - current * first.known) < 0.0001);
  assert.ok(Math.abs(first.readings.unknown - current * first.unknown) < 0.0001);
  assert.ok(first.known !== first.unknown);
});

test('mystery grading requires a useful voltage measurement before accepting an answer', () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const caseData = generateMysteryCase(seed);
    const exact = gradeMystery(caseData, ['known'], String(caseData.unknown));
    assert.equal(exact.correct, true, `seed ${seed} exact answer should pass`);
    assert.match(exact.derivation, /R\(mystery\) = V\(mystery\) ÷ I/);

    const otherRoute = gradeMystery(caseData, ['unknown'], String(caseData.unknown));
    assert.equal(otherRoute.correct, true, `seed ${seed} alternate measurement should pass`);
    assert.equal(gradeMystery(caseData, [], String(caseData.unknown)).correct, false);
    assert.equal(gradeMystery(caseData, ['known'], String(caseData.unknown * 2)).correct, false);
    assert.equal(gradeMystery(caseData, ['known'], '').correct, false);
  }
});

test('SPDT lamp state follows the stated same-traveler convention', () => {
  const caseData = generateSwitchCase(7);
  assert.ok(SWITCH_TRAVELERS.includes(caseData.positions.a));
  assert.ok(SWITCH_TRAVELERS.includes(caseData.positions.b));
  assert.equal(lampIsLit({ a: 'upper', b: 'upper' }), true);
  assert.equal(lampIsLit({ a: 'upper', b: 'lower' }), false);
  assert.deepEqual(toggleSwitch({ a: 'upper', b: 'lower' }, 'a'), { a: 'lower', b: 'lower' });
  assert.throws(() => toggleSwitch(caseData.positions, 'c'), /Unknown switch/);
});

test('three-way milestones require off with the other switch and back on with the first', () => {
  assert.deepEqual(evaluateSwitchRun([]), {
    lit: false, offWithOther: false, backOnWithFirst: false, complete: false
  });

  const switches = ['a', 'b'];
  const other = (which) => (which === 'a' ? 'b' : 'a');
  let positions = { a: 'upper', b: 'lower' };
  const log = [];
  let which = 'a';
  for (let step = 0; step < 4; step += 1) {
    positions = toggleSwitch(positions, which);
    log.push({ switch: which, lit: lampIsLit(positions) });
    which = other(which);
  }
  const progress = evaluateSwitchRun(log);
  assert.equal(progress.lit, true);
  assert.equal(progress.offWithOther, true);
  assert.equal(progress.backOnWithFirst, true);
  assert.equal(progress.complete, true);

  // Toggling one switch twice never demonstrates the other switch control.
  let single = { a: 'upper', b: 'lower' };
  const singleLog = [];
  for (let step = 0; step < 3; step += 1) {
    single = toggleSwitch(single, 'a');
    singleLog.push({ switch: 'a', lit: lampIsLit(single) });
  }
  assert.equal(evaluateSwitchRun(singleLog).complete, false);
  assert.equal(switches.length, 2);
});

test('fault voltages are physically consistent for open and short cases', () => {
  let sawOpen = false;
  let sawShort = false;
  for (let seed = 1; seed <= 60; seed += 1) {
    const caseData = generateFaultCase(seed);
    assert.deepEqual(caseData, generateFaultCase(seed));
    const readings = simulateFaultVoltages(caseData);
    if (caseData.fault.type === 'open') {
      sawOpen = true;
      assert.equal(readings[caseData.fault.at], caseData.supply);
      for (const id of ['r1', 'r2', 'r3']) {
        if (id !== caseData.fault.at) assert.equal(readings[id], 0);
      }
    } else {
      sawShort = true;
      assert.equal(readings[caseData.fault.at], 0);
      const ids = ['r1', 'r2', 'r3'].filter((id) => id !== caseData.fault.at);
      const total = ids.reduce((sum, id) => sum + caseData.resistors[id], 0);
      const current = caseData.supply / total;
      for (const id of ids) {
        assert.ok(Math.abs(readings[id] - current * caseData.resistors[id]) < 0.0001);
      }
    }
  }
  assert.equal(sawOpen && sawShort, true);
});

test('fault grading needs the faulty component probed and both answers right', () => {
  const caseData = generateFaultCase(11);
  const at = caseData.fault.at;
  assert.equal(gradeFault(caseData, [], { at, type: caseData.fault.type }).correct, false);
  assert.equal(gradeFault(caseData, [at], { at: 'r1', type: caseData.fault.type }).located, at === 'r1');
  const wrongType = caseData.fault.type === 'open' ? 'short' : 'open';
  const wrong = gradeFault(caseData, [at], { at, type: wrongType });
  assert.equal(wrong.correct, false);
  assert.equal(wrong.located, true);
  assert.equal(wrong.typed, false);
  assert.equal(gradeFault(caseData, [at], { at, type: caseData.fault.type }).correct, true);
});
