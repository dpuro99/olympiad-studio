import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateStreamDischarge, calculateWaterBudgetChange } from '../src/components/events/dynamicplanet/freshwaterCalculators.js';
import { calculateEquivalentResistance, calculateSeriesParallel, calculateOhmsLaw } from '../src/components/events/circuitlab/circuitUtils.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

test('Dynamic Planet freshwater calculator computes stream discharge and budget balance', () => {
  const discharge = calculateStreamDischarge({ crossSectionAreaM2: 2.5, averageVelocityMps: 0.4 });
  assert.equal(discharge.dischargeM3PerSec, 1);
  assert.equal(discharge.unit, 'm³/s');

  const budget = calculateWaterBudgetChange({ inflows: [10, 3.5], outflows: [8, 1], volumeUnit: 'm³' });
  assert.equal(budget.netChange, 4.5);
  assert.equal(budget.interpretation, 'net addition');
});

test('Dynamic Planet calculator rejects invalid measurements', () => {
  assert.match(calculateStreamDischarge({ crossSectionAreaM2: 0, averageVelocityMps: 1 }).error, /positive/i);
  assert.match(calculateWaterBudgetChange({ inflows: [2, 'bad'], outflows: [], volumeUnit: 'L' }).error, /non-negative/i);
});

test('Circuit Lab calculator computes equivalent resistance and Ohm’s law', () => {
  const resistance = calculateEquivalentResistance({ resistances: [100, 200, 300] });
  assert.equal(resistance.value, 600);
  assert.equal(resistance.unit, 'Ω');

  const seriesParallel = calculateSeriesParallel({ resistances: [100, 200] });
  assert.equal(seriesParallel.series, 300);
  assert.equal(seriesParallel.parallel, 66.66666666666667);

  const ohm = calculateOhmsLaw({ voltage: '12', current: '2', resistance: '' });
  assert.equal(ohm.value, 6);
  assert.equal(ohm.unit, 'Ω');
});

test('Dynamic Planet and Circuit Lab modules are registered with manual citations', () => {
  assert.match(registrySource, /id: 'freshwater-tools'/);
  assert.match(registrySource, /Division C Rules Manual, §3\.f, pp\. C24–C25/);
  assert.match(registrySource, /id: 'circuit-practice'/);
  assert.match(registrySource, /Division C Rules Manual, pp\. C16–C17/);
});
