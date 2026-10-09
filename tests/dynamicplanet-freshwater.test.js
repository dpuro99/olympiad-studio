import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateStreamDischarge, calculateWaterBudgetChange } from '../src/components/events/dynamicplanet/freshwaterCalculators.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');
const toolSource = readFileSync(new URL('../src/components/events/dynamicplanet/FreshwaterTools.jsx', import.meta.url), 'utf8');

test('stream discharge uses user-measured cross-sectional area times average velocity', () => {
  const result = calculateStreamDischarge({ crossSectionAreaM2: 2.5, averageVelocityMps: 0.4 });
  assert.equal(result.dischargeM3PerSec, 1);
  assert.equal(result.unit, 'm³/s');
});

test('stream discharge rejects invalid area and velocity', () => {
  assert.match(calculateStreamDischarge({ crossSectionAreaM2: 0, averageVelocityMps: 1 }).error, /area must be a positive/i);
  assert.match(calculateStreamDischarge({ crossSectionAreaM2: 1, averageVelocityMps: -1 }).error, /velocity must be a finite/i);
});

test('water budget totals user-entered inflows and outflows consistently', () => {
  const result = calculateWaterBudgetChange({
    inflows: [10, 3.5],
    outflows: [8, 1],
    volumeUnit: 'm³'
  });
  assert.equal(result.totalInflow, 13.5);
  assert.equal(result.totalOutflow, 9);
  assert.equal(result.netChange, 4.5);
  assert.equal(result.interpretation, 'net addition');
});

test('water budget supports net loss and balanced conditions and rejects invalid measurements', () => {
  assert.equal(calculateWaterBudgetChange({ inflows: [2], outflows: [5], volumeUnit: 'L' }).interpretation, 'net loss');
  assert.equal(calculateWaterBudgetChange({ inflows: [2], outflows: [2], volumeUnit: 'L' }).interpretation, 'balanced inputs and outputs');
  assert.match(calculateWaterBudgetChange({ inflows: [2, 'bad'], outflows: [], volumeUnit: 'L' }).error, /non-negative measurements/i);
  assert.match(calculateWaterBudgetChange({ inflows: [], outflows: [], volumeUnit: '' }).error, /volume unit/i);
});

test('Dynamic Planet exposes user-data freshwater tools rather than a fixed quiz', () => {
  assert.match(registrySource, /id: 'freshwater-tools'/);
  assert.match(registrySource, /Division C Rules Manual, §3\.f, pp\. C24–C25/);
  assert.match(toolSource, /Your own measured values/);
  assert.doesNotMatch(toolSource, /correctOption|answer key|sample dataset/i);
});
