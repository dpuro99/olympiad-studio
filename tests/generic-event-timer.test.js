import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPresetList,
  elapsedSeconds,
  formatClock,
  parseDuration,
  phaseAtElapsed,
  presetById,
  remainingSeconds
} from '../src/components/general/genericTimerUtils.js';
import { ACTIVE_DATA } from '../src/seasons/active.js';

test('parseDuration accepts mm:ss and bare seconds but rejects malformed clocks', () => {
  assert.equal(parseDuration('25:00'), 1500);
  assert.equal(parseDuration('8:00'), 480);
  assert.equal(parseDuration('0:05'), 5);
  assert.equal(parseDuration('90'), 90);
  assert.equal(parseDuration(90), 90);
  assert.equal(parseDuration('2:60'), null);
  assert.equal(parseDuration('-1:00'), null);
  assert.equal(parseDuration(''), null);
  assert.equal(parseDuration(null), null);
});

test('formatClock renders mm:ss and h:mm:ss for longer intervals', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(5), '00:05');
  assert.equal(formatClock(125), '02:05');
  assert.equal(formatClock(3661), '1:01:01');
  assert.equal(formatClock(-4), '00:00');
});

test('remainingSeconds clamps at zero and the preset duration', () => {
  assert.equal(remainingSeconds(480, 0), 480);
  assert.equal(remainingSeconds(480, 90), 390);
  assert.equal(remainingSeconds(480, 500), 0);
  assert.equal(remainingSeconds(480, -10), 480);
});

test('elapsedSeconds combines a paused accumulator with the live run', () => {
  assert.equal(elapsedSeconds({ accumulatedMs: 65_000, startedAt: null, now: 99_000 }), 65);
  assert.equal(elapsedSeconds({ accumulatedMs: 65_000, startedAt: 1_000, now: 2_400 }), 66);
  assert.equal(elapsedSeconds({ accumulatedMs: 0, startedAt: 1_000, now: 500 }), 0);
});

test('season presets derive their lengths from the owning event data', () => {
  const presets = buildPresetList(ACTIVE_DATA.general.timerPresets);
  assert.equal(presetById(presets, 'widi-relay').totalSeconds, 1500 + 1200);
  assert.equal(presetById(presets, 'boomilever-testing').totalSeconds, 360);
  assert.equal(presetById(presets, 'ev-run-window').totalSeconds, 480);
  assert.equal(presetById(presets, 'custom').totalSeconds, 0);
  assert.equal(presetById(presets, 'missing'), null);
});

test('phaseAtElapsed switches WIDI phases at the cited boundary', () => {
  const presets = buildPresetList(ACTIVE_DATA.general.timerPresets);
  const relay = presetById(presets, 'widi-relay');

  const writing = phaseAtElapsed(relay, 1499);
  assert.equal(writing.phase.id, 'writing');
  assert.equal(writing.phaseRemainingSeconds, 1);

  const building = phaseAtElapsed(relay, 1500);
  assert.equal(building.phase.id, 'building');
  assert.equal(building.phaseElapsedSeconds, 0);
  assert.equal(building.phaseRemainingSeconds, 1200);

  const finished = phaseAtElapsed(relay, 2700);
  assert.equal(finished.phase.id, 'building');
  assert.equal(finished.phaseRemainingSeconds, 0);
  assert.equal(finished.isFinal, true);
});

test('phaseAtElapsed presents a single-duration preset as one phase', () => {
  const presets = buildPresetList(ACTIVE_DATA.general.timerPresets);
  const ev = presetById(presets, 'ev-run-window');
  const status = phaseAtElapsed(ev, 30);
  assert.equal(status.total, 1);
  assert.equal(status.phase.label, 'EV run window');
  assert.equal(status.phaseElapsedSeconds, 30);
  assert.equal(status.phaseRemainingSeconds, 450);
});
