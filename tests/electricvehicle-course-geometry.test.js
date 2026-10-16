import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEVELS,
  averageSpeed,
  levelById,
  metresPerSecondToKmh,
  runScoreFor,
  scoreSweep,
  summarizeCourse
} from '../src/components/events/electricvehicle/courseUtils.js';
import { calculateRunScore } from '../src/components/events/electricvehicle/scoreUtils.js';

test('EV course levels carry the manual bottle-line distances', () => {
  assert.deepEqual(LEVELS.map((level) => level.bottleLineM), [2, 3, 4]);
  assert.equal(levelById('national').bottleLineM, 4);
  assert.equal(levelById('nope').id, 'regional');
});

test('averageSpeed derives a uniform-speed value and rejects bad input', () => {
  assert.equal(averageSpeed(2, 10), 0.2);
  assert.equal(averageSpeed(3, 6), 0.5);
  assert.equal(averageSpeed(2, 0), null);
  assert.equal(averageSpeed(-1, 5), null);
  assert.equal(averageSpeed(NaN, 5), null);
});

test('metresPerSecondToKmh converts and guards non-finite input', () => {
  assert.equal(metresPerSecondToKmh(1), 3.6);
  assert.equal(metresPerSecondToKmh(0.5), 1.8);
  assert.equal(metresPerSecondToKmh(Infinity), null);
  assert.equal(metresPerSecondToKmh('x'), null);
});

test('runScoreFor reuses the verified scoring contract', () => {
  const args = { targetTimeSec: 10, vehicleDistanceCm: 500, bottleDistanceCm: 30, pusherOpeningWidthCm: 35 };
  const expected = calculateRunScore({
    targetTimeSec: 10,
    runTimeSec: 10,
    vehicleDistanceCm: 500,
    bottleDistanceCm: 30,
    pusherOpeningWidthCm: 35,
    bottlePastTarget: true,
    bottleFullyPastLine: false,
    movingBottleRequirementsMet: true,
    competitionViolation: false,
    constructionViolation: false,
    nonModificationPenalty: false
  });
  assert.deepEqual(runScoreFor(10, args), expected);
  // distance 2*500 + 30 = 1030, no time error, no bonus => 100 + 1030.
  assert.equal(runScoreFor(10, args).totalScore, 1130);
});

test('runScoreFor returns null when the run time is unusable', () => {
  assert.equal(runScoreFor(NaN, { targetTimeSec: 10, vehicleDistanceCm: 500, bottleDistanceCm: 30, pusherOpeningWidthCm: 35 }), null);
});

test('runScoreFor applies the bottle bonus when the bottle is fully past the line', () => {
  const base = { targetTimeSec: 10, vehicleDistanceCm: 500, bottleDistanceCm: 30, pusherOpeningWidthCm: 35 };
  assert.equal(runScoreFor(10, { ...base, bottleFullyPastLine: true }).totalScore, 1110);
  assert.equal(runScoreFor(10, { ...base, bottleFullyPastLine: true }).bottleBonus, -20);
});

test('scoreSweep is symmetric about the target time and lowest there', () => {
  const scenario = { targetTimeSec: 10, vehicleDistanceCm: 500, bottleDistanceCm: 30, pusherOpeningWidthCm: 35 };
  const sweep = scoreSweep({ ...scenario, centreRunTimeSec: 10, windowSec: 2, steps: 20 });
  assert.equal(sweep.length, 21);

  const atTarget = sweep.find((point) => point.runTimeSec === 10);
  assert.equal(atTarget.totalScore, 1130);
  assert.equal(Math.min(...sweep.map((point) => point.totalScore)), 1130);

  const low = sweep.find((point) => point.runTimeSec === 8);
  const high = sweep.find((point) => point.runTimeSec === 12);
  assert.equal(low.totalScore, high.totalScore);
  assert.equal(low.totalScore, 1131);
});

test('scoreSweep guards unusable sweep parameters', () => {
  const scenario = { targetTimeSec: 10, vehicleDistanceCm: 500, bottleDistanceCm: 30, pusherOpeningWidthCm: 35 };
  assert.deepEqual(scoreSweep({ ...scenario, centreRunTimeSec: NaN }), []);
  assert.deepEqual(scoreSweep({ ...scenario, centreRunTimeSec: 10, windowSec: 0 }), []);
  assert.deepEqual(scoreSweep({ ...scenario, centreRunTimeSec: 10, steps: 1 }), []);
});

test('summarizeCourse uses the level preset and derives pacing', () => {
  const summary = summarizeCourse({
    levelId: 'state',
    targetTimeSec: 10,
    runTimeSec: 11,
    vehicleDistanceCm: 500,
    bottleDistanceCm: 30,
    pusherOpeningWidthCm: 35
  });
  assert.equal(summary.levelId, 'state');
  assert.equal(summary.levelLabel, 'State');
  assert.equal(summary.bottleLineM, 3);
  assert.equal(summary.requiredSpeedMps, 0.3);
  assert.equal(Number(summary.requiredSpeedKmh.toFixed(3)), 1.08);
  assert.equal(summary.timeErrorSec, 1);
  assert.equal(summary.runScore.timeScore, 0.5);
  assert.equal(summary.runScore.totalScore, 1130.5);
});

test('summarizeCourse honours an explicit bottle line and reports null score on bad time', () => {
  const custom = summarizeCourse({
    levelId: 'regional',
    bottleLineM: 1.5,
    targetTimeSec: 5,
    runTimeSec: 5,
    vehicleDistanceCm: 200,
    bottleDistanceCm: 10,
    pusherOpeningWidthCm: 36
  });
  assert.equal(custom.bottleLineM, 1.5);
  assert.equal(custom.requiredSpeedMps, 0.3);

  const bad = summarizeCourse({
    levelId: 'regional',
    targetTimeSec: NaN,
    runTimeSec: 5,
    vehicleDistanceCm: 200,
    bottleDistanceCm: 10,
    pusherOpeningWidthCm: 36
  });
  assert.equal(bad.runScore, null);
  assert.equal(bad.requiredSpeedMps, null);
});
