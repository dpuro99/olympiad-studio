import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applicableChecks,
  CHECK_STATUSES,
  createCheckState,
  summarizeChecklist,
  updateCheckState
} from '../src/components/events/electricvehicle/complianceUtils.js';

const checks = [
  { id: 'mods', label: 'Mods', scope: 'kit', citation: '§3.k.i' },
  { id: 'pusher', label: 'Pusher', scope: 'kit', citation: '§3.k.ii' },
  { id: 'program', label: 'Program', scope: 'all', citation: '§3.l' }
];

test('a fresh checklist starts every item unreviewed with an empty note', () => {
  assert.deepEqual(createCheckState(checks), {
    mods: { status: 'unreviewed', note: '' },
    pusher: { status: 'unreviewed', note: '' },
    program: { status: 'unreviewed', note: '' }
  });
});

test('kit checks are excluded when no purchased or open-source kit is used', () => {
  assert.deepEqual(applicableChecks(checks, false).map((check) => check.id), ['program']);
  assert.deepEqual(applicableChecks(checks, true).map((check) => check.id), ['mods', 'pusher', 'program']);
});

test('statuses validate and updates are immutable', () => {
  const initial = createCheckState(checks);
  const updated = updateCheckState(initial, 'mods', { status: 'ok', note: 'two documented changes' });
  assert.deepEqual(initial.mods, { status: 'unreviewed', note: '' });
  assert.deepEqual(updated.mods, { status: 'ok', note: 'two documented changes' });
  assert.equal(updated.program, initial.program);
  assert.throws(() => updateCheckState(initial, 'mods', { status: 'pass' }), /Unknown check status/);
  assert.deepEqual(CHECK_STATUSES, ['unreviewed', 'ok', 'fix']);
});

test('the summary counts only applicable checks and names what still needs attention', () => {
  let state = createCheckState(checks);
  const empty = summarizeChecklist(checks, state, false);
  assert.deepEqual(empty, {
    applicable: 1, ok: 0, fix: 0, unreviewed: 1, withNotes: 0,
    ready: false, attention: ['program']
  });

  state = updateCheckState(state, 'program', { status: 'ok', note: ' contributor logged ' });
  const ready = summarizeChecklist(checks, state, false);
  assert.equal(ready.ready, true);
  assert.equal(ready.withNotes, 1);
  assert.deepEqual(ready.attention, []);

  state = updateCheckState(state, 'mods', { status: 'fix' });
  const withKit = summarizeChecklist(checks, state, true);
  assert.equal(withKit.applicable, 3);
  assert.equal(withKit.fix, 1);
  assert.equal(withKit.unreviewed, 1);
  assert.equal(withKit.ready, false);
  assert.deepEqual(withKit.attention, ['mods', 'pusher']);
});

test('a missing saved entry is treated as unreviewed, never as compliant', () => {
  const summary = summarizeChecklist(checks, {}, true);
  assert.equal(summary.ready, false);
  assert.equal(summary.unreviewed, 3);
  assert.deepEqual(summary.attention, ['mods', 'pusher', 'program']);
});
