import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateObservedRate, RATE_FACTORS } from '../src/components/events/chemlab/kinetics.js';
import { buildExperimentCsv, createEmptyExperiment, parseSavedExperiment } from '../src/components/events/chemlab/experimentNotebook.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');
const practiceSource = readFileSync(new URL('../src/components/events/chemlab/KineticsPractice.jsx', import.meta.url), 'utf8');

test('kinetics notebook offers the four manual-listed factors but no prewritten quiz bank', () => {
  assert.deepEqual(RATE_FACTORS.map((factor) => factor.id), [
    'temperature', 'concentration', 'particle-size', 'catalyst'
  ]);
  assert.doesNotMatch(practiceSource, /Practice question|Choose the best explanation|correctOption|options\.map/);
  assert.match(practiceSource, /Your measurements/);
  assert.match(practiceSource, /Your conclusion/);
});

test('observed rate calculates reactant consumption and product formation from entered data', () => {
  const consumed = calculateObservedRate({
    measurementType: 'reactant-consumed', initialValue: 10, finalValue: 4, elapsedTime: 3
  });
  const formed = calculateObservedRate({
    measurementType: 'product-formed', initialValue: 2, finalValue: 8, elapsedTime: 3
  });
  assert.equal(consumed.change, 6);
  assert.equal(consumed.rate, 2);
  assert.equal(formed.change, 6);
  assert.equal(formed.rate, 2);
});

test('observed rate accepts zero change and requires positive elapsed time', () => {
  const noChange = calculateObservedRate({
    measurementType: 'product-formed', initialValue: 5, finalValue: 5, elapsedTime: 2
  });
  assert.equal(noChange.rate, 0);
  assert.match(calculateObservedRate({
    measurementType: 'product-formed', initialValue: 5, finalValue: 6, elapsedTime: 0
  }).error, /elapsed time must be a positive/i);
});

test('observed rate rejects inconsistent direction, invalid measurements and unknown mode', () => {
  assert.match(calculateObservedRate({
    measurementType: 'reactant-consumed', initialValue: 2, finalValue: 5, elapsedTime: 1
  }).error, /consumed reactant/i);
  assert.match(calculateObservedRate({
    measurementType: 'product-formed', initialValue: -1, finalValue: 5, elapsedTime: 1
  }).error, /non-negative/i);
  assert.match(calculateObservedRate({
    measurementType: 'unknown', initialValue: 1, finalValue: 2, elapsedTime: 1
  }).error, /choose whether/i);
});

test('Kinetics registry advertises a user-data experiment notebook', () => {
  assert.match(registrySource, /id: 'kinetics'/);
  assert.match(registrySource, /user-defined reaction-rate experiment/);
  assert.match(registrySource, /Regional\/Invitational scope/);
  assert.match(registrySource, /Division C Rules Manual, §3\.f\.i, p\. C14/);
});

test('experiment notebook saves/restores student-authored conditions and measurements', () => {
  const experiment = createEmptyExperiment();
  experiment.factorId = 'temperature';
  experiment.trials = [{ id: 1, condition: '22 C', initialValue: '10', finalValue: '4', elapsedTime: '3' }];
  experiment.conclusion = 'Rate increased with temperature';
  const restored = parseSavedExperiment(JSON.stringify(experiment));

  assert.equal(restored.value.factorId, 'temperature');
  assert.equal(restored.value.trials[0].condition, '22 C');
  assert.equal(restored.value.conclusion, 'Rate increased with temperature');
});

test('CSV export contains only entered data and computed rates, safely escaped', () => {
  const experiment = createEmptyExperiment();
  experiment.quantityUnit = 'g';
  experiment.timeUnit = 's';
  experiment.trials = [{ id: 1, condition: 'warm, "high"', initialValue: '10', finalValue: '4', elapsedTime: '3' }];
  experiment.controls = '=IMPORTDATA("x")';
  const result = buildExperimentCsv(experiment);

  assert.match(result.csv, /"warm, ""high"""/);
  assert.match(result.csv, /"2"/);
  assert.match(result.csv, /"'=IMPORTDATA\(""x""\)"/);
});

test('saved notebook rejects unknown formats instead of silently replacing user data', () => {
  assert.match(parseSavedExperiment('{broken').error, /could not be read/i);
  assert.match(parseSavedExperiment(JSON.stringify({ factorId: 'unknown', trials: [] })).error, /unsupported format/i);
});
