import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePracticeScore } from '../src/components/events/electricvehicle/scoreUtils.js';

test('matches the 2026 rules example with a can bonus', () => {
  const score = calculatePracticeScore({
    distanceFromTarget: 27.6,
    targetTime: 14,
    runTime: 16.37,
    hasCans: true,
    successCan: true,
    insideCanDist: 50,
    penalties: 0
  });

  assert.equal(score.distanceScore, 55.2);
  assert.ok(Math.abs(score.timeScore - 2.37) < 1e-12);
  assert.equal(score.canBonus, -30);
  assert.equal(Number(score.totalScore.toFixed(2)), 127.57);
});

test('does not apply a can bonus when the run does not earn it', () => {
  const score = calculatePracticeScore({
    distanceFromTarget: 5,
    targetTime: 15,
    runTime: 15,
    hasCans: true,
    successCan: false,
    insideCanDist: 50,
    penalties: 10
  });

  assert.equal(score.canBonus, 0);
  assert.equal(score.totalScore, 120);
});
