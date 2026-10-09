import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculatePracticeScore } from '../src/components/events/electricvehicle/scoreUtils.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');
const evOverviewSource = readFileSync(new URL('../src/components/events/electricvehicle/ArcVisualizer.jsx', import.meta.url), 'utf8');

test('registry is limited to current-season project events', () => {
  assert.match(registrySource, /year: 2027/);
  assert.doesNotMatch(registrySource, /entomology|machines|metricmastery/i);
});

test('EV numeric scoring stays disabled until the official 2027 rules are verified', () => {
  const score = calculatePracticeScore();

  assert.equal(score.status, 'pending-2027-rule-verification');
  assert.match(score.note, /official 2027 Rules Manual/);
  assert.equal(score.totalScore, null);
  assert.equal('canBonus' in score, false);
  assert.equal('distanceScore' in score, false);
});

test('EV overview contains the verified 2027 task and omits old task assumptions', () => {
  assert.match(evOverviewSource, /push a bottle past a line/i);
  assert.match(evOverviewSource, /Move backward/i);
  assert.doesNotMatch(evOverviewSource, /can bonus|arc-and-can/i);
});
