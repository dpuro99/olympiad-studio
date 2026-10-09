import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateFinalScore, calculateRunScore } from '../src/components/events/electricvehicle/scoreUtils.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');
const evOverviewSource = readFileSync(new URL('../src/components/events/electricvehicle/ArcVisualizer.jsx', import.meta.url), 'utf8');

test('registry is limited to current-season project events', () => {
  assert.match(registrySource, /year: 2027/);
  assert.doesNotMatch(registrySource, /entomology|machines|metricmastery/i);
});

test('EV scoring matches the two 2027 manual example runs', () => {
  const run1 = calculateRunScore({
    targetTimeSec: 14,
    runTimeSec: 12.27,
    vehicleDistanceCm: 17.6,
    bottleDistanceCm: 10.6,
    pusherOpeningWidthCm: 16,
    bottlePastTarget: true,
    bottleFullyPastLine: false
  });
  const run2 = calculateRunScore({
    targetTimeSec: 14,
    runTimeSec: 16.37,
    vehicleDistanceCm: 22.5,
    bottleDistanceCm: 12.1,
    pusherOpeningWidthCm: 16,
    bottlePastTarget: true,
    bottleFullyPastLine: true
  });

  assert.equal(run1.totalScore.toFixed(2), '118.17');
  assert.equal(run2.totalScore.toFixed(2), '109.79');
  assert.equal(calculateFinalScore({ runScores: [run1.totalScore, run2.totalScore] }).finalScore, run2.totalScore);
});

test('failed EV runs receive fixed distance score and use zero run time', () => {
  const score = calculateRunScore({
    targetTimeSec: 14,
    pusherOpeningWidthCm: 35,
    failedRun: true
  });

  assert.equal(score.distanceScore, 2500);
  assert.equal(score.timeScore, 7);
  assert.equal(score.totalScore, 2607);
});

test('bottle-distance fallback and run penalties follow the 2027 manual', () => {
  const score = calculateRunScore({
    targetTimeSec: 14,
    runTimeSec: 14,
    vehicleDistanceCm: 10,
    bottleDistanceCm: 5,
    pusherOpeningWidthCm: 35,
    bottlePastTarget: false,
    movingBottleRequirementsMet: true,
    competitionViolation: true,
    constructionViolation: true,
    nonModificationPenalty: true
  });

  assert.equal(score.distanceScore, 420);
  assert.equal(score.totalScore, 1020);
});

test('National event-time bonus and missed-impound final penalty are applied only to final score', () => {
  const final = calculateFinalScore({
    runScores: [100, 110],
    eventTimeUsedSec: 450,
    nationalTournament: true,
    vehicleNotImpounded: true
  });

  assert.equal(final.eventTimeBonus, -1);
  assert.equal(final.notImpoundedPenalty, 5000);
  assert.equal(final.finalScore, 5099);
  assert.equal(calculateFinalScore({ runScores: [100], eventTimeUsedSec: 480 }), null);
  assert.equal(calculateFinalScore({ runScores: [100, 110], eventTimeUsedSec: 481, nationalTournament: true }), null);
});

test('EV overview contains verified 2027 constraints and points to the official FAQ', () => {
  assert.match(evOverviewSource, /pushes a water bottle past a line/i);
  assert.match(evOverviewSource, /eight AA batteries/i);
  assert.match(evOverviewSource, /80\.0 cm/i);
  assert.match(evOverviewSource, /8 minutes/i);
  assert.match(evOverviewSource, /faq\/electric-vehicle-div-c/i);
});
