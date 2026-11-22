import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LED_VF_PRESETS,
  calculateLedSeries,
  checkForwardDrop,
  checkOrientation,
  nearestE12AtLeast,
  recommendPowerRating
} from '../src/components/events/circuitlab/ledUtils.js';

test('E12 selection rounds up to a real value across decades', () => {
  assert.deepEqual(nearestE12AtLeast(350), { value: 390, series: 'E12' });
  assert.deepEqual(nearestE12AtLeast(1000), { value: 1000, series: 'E12' });
  assert.deepEqual(nearestE12AtLeast(8.2), { value: 8.2, series: 'E12' });
  assert.deepEqual(nearestE12AtLeast(6), { value: 6.8, series: 'E12' });
  assert.deepEqual(nearestE12AtLeast(900), { value: 1000, series: 'E12' });
  assert.deepEqual(nearestE12AtLeast(82000), { value: 82000, series: 'E12' });
  assert.equal(nearestE12AtLeast(0), null);
  assert.equal(nearestE12AtLeast(-5), null);
  assert.equal(nearestE12AtLeast('abc'), null);
});

test('a worked LED circuit reproduces the resistor and power by hand', () => {
  const result = calculateLedSeries({ supplyVoltage: '9', forwardVoltage: '2', targetCurrentMa: '20' });
  assert.equal(result.error, undefined);
  assert.equal(result.resistorVoltage, 7);
  assert.equal(result.resistance, 350); // 7 V / 0.020 A
  assert.equal(result.resistorPower, 0.14); // 7 V × 0.020 A
  assert.equal(result.ledPower, 0.04);
  assert.equal(result.supplyPower, 0.18);
  assert.equal(result.standard.value, 390);
  assert.equal(result.actualCurrentMa, 17.95);
  assert.equal(result.equations.resistance, 'R = (Vsupply − Vf) ÷ I');
  assert.match(result.equations.power, /P = I² × R/);
});

test('power balance holds: supply power equals LED plus resistor power', () => {
  for (const [supply, vf, current] of [[5, 3.2, 15], [12, 2, 30], [3.3, 1.8, 10]]) {
    const result = calculateLedSeries({ supplyVoltage: supply, forwardVoltage: vf, targetCurrentMa: current });
    assert.ok(Math.abs(result.supplyPower - (result.resistorPower + result.ledPower)) < 1e-6);
  }
});

test('invalid or impossible inputs return clear errors rather than numbers', () => {
  assert.match(calculateLedSeries({ supplyVoltage: '', forwardVoltage: 2, targetCurrentMa: 20 }).error, /Supply voltage/);
  assert.match(calculateLedSeries({ supplyVoltage: -9, forwardVoltage: 2, targetCurrentMa: 20 }).error, /Supply voltage/);
  assert.match(calculateLedSeries({ supplyVoltage: 9, forwardVoltage: '', targetCurrentMa: 20 }).error, /Forward voltage/);
  assert.match(calculateLedSeries({ supplyVoltage: 9, forwardVoltage: -1, targetCurrentMa: 20 }).error, /Forward voltage/);
  assert.match(calculateLedSeries({ supplyVoltage: 9, forwardVoltage: 2, targetCurrentMa: 0 }).error, /Target current/);
  assert.match(calculateLedSeries({ supplyVoltage: 9, forwardVoltage: 2, targetCurrentMa: 'abc' }).error, /Target current/);
  assert.match(calculateLedSeries({ supplyVoltage: 2, forwardVoltage: 2, targetCurrentMa: 20 }).error, /must exceed/);
  assert.match(calculateLedSeries({ supplyVoltage: 1.8, forwardVoltage: 2, targetCurrentMa: 20 }).error, /must exceed/);
});

test('a zero forward drop is allowed for a plain silicon-diode approximation', () => {
  const result = calculateLedSeries({ supplyVoltage: 5, forwardVoltage: 0, targetCurrentMa: 10 });
  assert.equal(result.error, undefined);
  assert.equal(result.resistance, 500);
  assert.equal(result.ledPower, 0);
  assert.equal(result.resistorPower, 0.05);
});

test('a power rating is recommended with a common two-times margin', () => {
  assert.equal(recommendPowerRating(0.14), 0.5, '0.14 W × 2 margin = 0.28 W, so 0.25 W is too small');
  assert.equal(recommendPowerRating(0.2), 0.5);
  assert.equal(recommendPowerRating(0.6), 2);
  assert.equal(recommendPowerRating(3), null, 'no stock rating in the listed set is large enough');
  assert.equal(recommendPowerRating(0), null);
  assert.equal(recommendPowerRating('abc'), null);
});

test('orientation distinguishes conduct, block and unknown', () => {
  const good = calculateLedSeries({ supplyVoltage: 9, forwardVoltage: 2, targetCurrentMa: 20 });
  assert.equal(checkOrientation('forward', good).state, 'conducts');
  assert.equal(checkOrientation('reverse', good).state, 'blocked');
  assert.equal(checkOrientation('forward', { error: 'bad' }).state, 'unknown');
  assert.equal(checkOrientation('', good).state, 'unknown');
});

test('forward-drop assumptions are checked against the selected teaching preset', () => {
  assert.ok(LED_VF_PRESETS.some((preset) => preset.id === 'red'));
  assert.equal(checkForwardDrop('red', 1.8).tone, 'ok');
  assert.equal(checkForwardDrop('red', 3.3).tone, 'warn');
  assert.match(checkForwardDrop('red', 3.3).message, /1\.6–2\.0 V/);
  assert.equal(checkForwardDrop('white', 3.2).tone, 'ok');
  assert.equal(checkForwardDrop('unknown', 1.8), null);
  assert.equal(checkForwardDrop('red', ''), null);
});
