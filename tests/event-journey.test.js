import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { STAGES } from '../src/components/general/stages.js';
import { buildJourney, pickNextStep, summarizeJourney } from '../src/components/general/journeyUtils.js';
import {
  progressLabel,
  probeModuleProgress,
  readEventProgress,
  withProgress
} from '../src/components/general/eventProgress.js';
import { storageKey } from '../src/seasons/storageKeys.js';

const registrySource = readFileSync(
  new URL('../src/components/events/registry.js', import.meta.url),
  'utf8'
);

const steps = (modules) => buildJourney({ modules });

// --- journey order -------------------------------------------------------

test('every module becomes exactly one numbered step', () => {
  const event = {
    modules: [
      { id: 'a', stage: 'learn' },
      { id: 'b', stage: 'practice' },
      { id: 'c', stage: 'prepare' }
    ]
  };
  const journey = buildJourney(event);
  assert.deepEqual(journey.map((step) => step.id), ['a', 'c', 'b']);
  assert.deepEqual(journey.map((step) => step.index), [1, 2, 3]);
});

test('a per-event journey reorders without dropping modules', () => {
  const event = {
    journey: ['c', 'a', 'missing'],
    modules: [
      { id: 'a', stage: 'learn' },
      { id: 'b', stage: 'practice' },
      { id: 'c', stage: 'reference' }
    ]
  };
  const journey = buildJourney(event);
  assert.deepEqual(journey.map((step) => step.id), ['c', 'a', 'b']);
  assert.equal(journey.length, event.modules.length);
});

test('a registry without a journey still orders by stage', () => {
  const journey = steps([
    { id: 'ref', stage: 'reference' },
    { id: 'learn', stage: 'learn' },
    { id: 'prep', stage: 'prepare' }
  ]);
  assert.deepEqual(journey.map((step) => step.id), ['learn', 'prep', 'ref']);
});

test('a module with no stage is treated as practice, not dropped', () => {
  const journey = steps([{ id: 'unknown' }, { id: 'learn', stage: 'learn' }]);
  assert.deepEqual(journey.map((step) => step.id), ['learn', 'unknown']);
  assert.equal(journey[1].stage, 'practice');
});

test('buildJourney tolerates missing data', () => {
  assert.deepEqual(buildJourney(null), []);
  assert.deepEqual(buildJourney({}), []);
});

// --- next step -----------------------------------------------------------

const withProbes = (definitions) => withProgress(
  steps(definitions.map(([id, stage]) => ({ id, stage }))),
  Object.fromEntries(definitions.map(([id, , kind, started]) => [id, {
    kind: kind || 'none', started: Boolean(started), count: started ? 1 : 0, label: 'item', unavailable: false
  }]))
);

test('the first tracked step is next when nothing is saved', () => {
  assert.equal(pickNextStep(withProbes([['a', 'learn'], ['b', 'practice', 'entries', false]])), 'b');
});

test('next skips steps that already have saved work', () => {
  const journey = withProbes([
    ['a', 'prepare', 'sheet', true],
    ['b', 'practice', 'canvas', false],
    ['c', 'record', 'entries', false]
  ]);
  assert.equal(pickNextStep(journey), 'b');
});

test('a tool that keeps no saved work can never be next', () => {
  const journey = withProbes([
    ['calculator', 'reference'],
    ['compiler', 'prepare', 'sheet', true],
    ['log', 'record', 'entries', false]
  ]);
  assert.equal(pickNextStep(journey), 'log');
});

test('next is null when every tracked step has work, and never invents one', () => {
  const journey = withProbes([
    ['compiler', 'prepare', 'sheet', true],
    ['log', 'record', 'entries', true]
  ]);
  assert.equal(pickNextStep(journey), null);
});

test('an event with nothing to track points at its first step', () => {
  assert.equal(pickNextStep(withProbes([['overview', 'learn'], ['key', 'reference']])), 'overview');
  assert.equal(pickNextStep([]), null);
});

test('summarizeJourney counts only what is really saved', () => {
  const journey = withProbes([
    ['a', 'prepare', 'sheet', true],
    ['b', 'reference'],
    ['c', 'record', 'entries', false]
  ]);
  assert.deepEqual(summarizeJourney(journey), {
    total: 3,
    tracked: 2,
    withWork: 1,
    nextStepId: 'c'
  });
});

// --- storage probe -------------------------------------------------------

function fakeStorage(entries = {}) {
  return {
    getItem: (key) => (key in entries ? entries[key] : null)
  };
}

const moduleWith = (signal) => ({ id: 'probe', signal });

test('an absent key means no saved work, not an error', () => {
  const progress = probeModuleProgress(moduleWith('runs'), 'ev', fakeStorage());
  assert.equal(progress.started, false);
  assert.equal(progress.count, 0);
  assert.equal(progress.unavailable, false);
});

test('the shell id ev reads the electricvehicle storage token', () => {
  const key = storageKey('electricvehicle', 'practice-runs');
  const progress = probeModuleProgress(moduleWith('runs'), 'ev', fakeStorage({
    [key]: JSON.stringify([{ score: 70 }, { score: 80 }])
  }));
  assert.equal(progress.started, true);
  assert.equal(progress.count, 2);
});

test('a sheet counts blocks and non-default objective statuses', () => {
  const key = storageKey('anatomy', 'reference-sheet');
  const storage = fakeStorage({
    [key]: JSON.stringify({ blocks: [{ id: 'b1', objectiveId: 'o1' }], objectiveStatus: { o1: 'studying', o2: 'not-started' } })
  });
  assert.equal(probeModuleProgress(moduleWith('sheet'), 'anatomy', storage).count, 2);
  const empty = fakeStorage({ [key]: JSON.stringify({ blocks: [], objectiveStatus: {}, density: 'standard' }) });
  assert.equal(probeModuleProgress(moduleWith('sheet'), 'anatomy', empty).started, false);
});

test('anatomy notes count saved entries', () => {
  const key = storageKey('anatomy', 'notebook');
  const storage = fakeStorage({ [key]: JSON.stringify({ notes: [{ notes: 'one' }, { notes: 'two' }] }) });
  assert.equal(probeModuleProgress(moduleWith('notes'), 'anatomy', storage).count, 2);
});

test('a gas notebook only counts entered values, not its selected law', () => {
  const key = storageKey('chemlab', 'gases');
  const blank = {
    gasLaw: 'boyle', target: 'p1', values: {},
    dalton: { totalPressure: '', knownPressures: '' },
    graham: { molarMass1: '', molarMass2: '' },
    notes: ''
  };
  assert.equal(probeModuleProgress(moduleWith('gases'), 'chemlab', fakeStorage({
    [key]: JSON.stringify(blank)
  })).started, false);
  assert.equal(probeModuleProgress(moduleWith('gases'), 'chemlab', fakeStorage({
    [key]: JSON.stringify({ ...blank, notes: 'Pressure doubled at constant temperature.' })
  })).count, 1);
});

test('a saved circuit needs at least one wire to count', () => {
  const key = storageKey('circuitlab', 'logic-canvas');
  const nodes = [{ id: 'A', type: 'input', x: 0, y: 0 }];
  const unwired = fakeStorage({ [key]: JSON.stringify({ nodes, wires: [] }) });
  assert.equal(probeModuleProgress(moduleWith('canvas'), 'circuitlab', unwired).started, false);
  const wired = fakeStorage({ [key]: JSON.stringify({ nodes, wires: [{ from: 'A', to: 'OUT', port: 'a' }] }) });
  assert.equal(probeModuleProgress(moduleWith('canvas'), 'circuitlab', wired).count, 1);
});

test('recorded minerals count only cards with an authored property', () => {
  const key = storageKey('rocksandminerals', 'specimen-cards');
  const storage = fakeStorage({
    [key]: JSON.stringify({
      galena: { luster: ['Metallic'], hardnessMin: '', hardnessMax: '' },
      pyrite: { luster: [], hardnessMin: '', hardnessMax: '' }
    })
  });
  assert.equal(probeModuleProgress(moduleWith('cards'), 'rocksandminerals', storage).count, 1);
});

test('unreadable storage is reported as unavailable rather than empty', () => {
  const key = storageKey('boomilever', 'build-log');
  const corrupt = probeModuleProgress(moduleWith('buildLog'), 'boomilever', fakeStorage({ [key]: '{broken' }));
  assert.equal(corrupt.unavailable, true);
  assert.equal(corrupt.started, false);

  const blocked = probeModuleProgress(moduleWith('buildLog'), 'boomilever', {
    getItem() { throw new Error('SecurityError'); }
  });
  assert.equal(blocked.unavailable, true);

  assert.equal(probeModuleProgress(moduleWith('buildLog'), 'boomilever', null).unavailable, true);
});

test('a tool without a signal keeps no saved work at all', () => {
  const progress = probeModuleProgress({ id: 'score' }, 'ev', fakeStorage());
  assert.deepEqual(progress, { kind: 'none', count: 0, started: false, label: '', unavailable: false });
});

test('readEventProgress keys every module of the event', () => {
  const key = storageKey('boomilever', 'build-log');
  const event = { modules: [{ id: 'overview' }, { id: 'log', signal: 'buildLog' }] };
  const progress = readEventProgress('boomilever', event, fakeStorage({
    [key]: JSON.stringify([{ label: 'prototype 1' }])
  }));
  assert.deepEqual(Object.keys(progress), ['overview', 'log']);
  assert.equal(progress.log.count, 1);
});

// --- labels --------------------------------------------------------------

test('saved-work labels are plural, honest, and silent when empty', () => {
  const base = { kind: 'entries', unavailable: false, label: 'run' };
  assert.equal(progressLabel({ ...base, count: 1, started: true }), '1 run saved');
  assert.equal(progressLabel({ ...base, count: 3, started: true }), '3 runs saved');
  assert.equal(progressLabel({ ...base, count: 0, started: false }), '');
  assert.equal(progressLabel({ kind: 'sheet', count: 1, started: true, label: 'binder', unavailable: false }), 'binder saved');
  assert.equal(progressLabel({ ...base, unavailable: true }), 'Saved work unreadable');
  assert.equal(progressLabel({ kind: 'none' }), '');
});

// --- registry drift guard ------------------------------------------------

test('every registered module declares a stage from the shared vocabulary', () => {
  const moduleIds = [...registrySource.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
  const stages = [...registrySource.matchAll(/stage: '([^']+)'/g)].map((match) => match[1]);
  assert.ok(moduleIds.length > 0);
  assert.equal(stages.length, moduleIds.length, 'every module needs a stage field');
  for (const stage of stages) {
    assert.ok(STAGES.includes(stage), `${stage} is not one of ${STAGES.join(', ')}`);
  }
});

test('every signal named in the registry is one the probe understands', () => {
  const signals = [...registrySource.matchAll(/signal: '([^']+)'/g)].map((match) => match[1]);
  for (const signal of signals) {
    const progress = probeModuleProgress({ id: 'x', signal }, 'anatomy', fakeStorage());
    assert.notEqual(progress.kind, 'none', `${signal} is not a known signal`);
    assert.equal(progress.unavailable, false, `${signal} is not a known signal`);
  }
});
