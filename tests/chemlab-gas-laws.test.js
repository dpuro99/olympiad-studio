import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calculateDaltonPartialPressure,
  calculateGrahamRateRatio,
  solveGasLaw
} from '../src/components/events/chemlab/gasLaws.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

test('Boyle law solves pressure and volume unknowns', () => {
  assert.equal(solveGasLaw({
    law: 'boyle', target: 'p2', values: { p1: 100, v1: 2, v2: 1 }
  }).value, 200);
  assert.equal(solveGasLaw({
    law: 'boyle', target: 'v2', values: { p1: 100, v1: 2, p2: 50 }
  }).value, 4);
});

test('Charles and Gay-Lussac laws use absolute temperature inputs', () => {
  assert.equal(solveGasLaw({
    law: 'charles', target: 'v2', values: { v1: 2, t1: 300, t2: 450 }
  }).value, 3);
  assert.equal(solveGasLaw({
    law: 'gayLussac', target: 'p2', values: { p1: 100, t1: 300, t2: 450 }
  }).value, 150);
});

test('Avogadro law and combined gas law solve unknowns', () => {
  assert.equal(solveGasLaw({
    law: 'avogadro', target: 'v2', values: { v1: 5, n1: 2, n2: 4 }
  }).value, 10);
  assert.equal(solveGasLaw({
    law: 'combined', target: 'v2', values: { p1: 100, v1: 2, t1: 300, p2: 100, t2: 300 }
  }).value, 2);
  assert.equal(solveGasLaw({
    law: 'combined', target: 't2', values: { p1: 100, v1: 2, t1: 300, p2: 100, v2: 4 }
  }).value, 600);
});

test('ideal gas law uses the stated SI gas constant', () => {
  const result = solveGasLaw({
    law: 'ideal', target: 'p', values: { v: 0.024, n: 1, t: 273 }
  });
  assert.equal(result.unit, 'Pa');
  assert.ok(Math.abs(result.value - (8.314 * 273 / 0.024)) < 1e-9);
});

test('gas law solver rejects unsupported laws and non-positive values', () => {
  assert.ok(solveGasLaw({ law: 'dalton', target: 'p', values: {} }).error);
  assert.ok(solveGasLaw({ law: 'boyle', target: 'p2', values: { p1: 0, v1: 2, v2: 1 } }).error);
  assert.ok(solveGasLaw({ law: 'boyle', target: 'missing', values: {} }).error);
});

test('Dalton law calculates the remainder and rejects impossible partial-pressure totals', () => {
  const result = calculateDaltonPartialPressure({
    totalPressure: 100,
    knownPartialPressures: [40, 25]
  });
  assert.equal(result.value, 35);
  assert.equal(result.unit, 'kPa');
  assert.match(calculateDaltonPartialPressure({ totalPressure: 50, knownPartialPressures: [30, 25] }).error, /less than the total/i);
});

test('Graham law compares rates using the inverse square root of molar masses', () => {
  const result = calculateGrahamRateRatio({ molarMass1: 4, molarMass2: 16 });
  assert.equal(result.rateRatio, 2);
  assert.equal(result.unit, 'dimensionless');
  assert.match(calculateGrahamRateRatio({ molarMass1: 0, molarMass2: 16 }).error, /positive finite/i);
});

test('Chemistry Lab registry exposes the live gas-law practice tool', () => {
  assert.match(registrySource, /id: 'gas-laws'/);
  assert.match(registrySource, /label: 'Gas-Law Practice'/);
  assert.match(registrySource, /live: true/);
  assert.match(registrySource, /Division C Rules Manual, §3\.e, p\. C14/);
});
