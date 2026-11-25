import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_SEASON } from '../src/seasons/manifest.js';
import { EVENT_REGISTRY } from '../src/components/events/registry.js';
import { COMPILER_STATUS } from '../src/components/general/referenceCompilerUtils.js';
import { OBJECTIVE_TRACKER_SOURCES } from '../src/components/general/dashboard/objectiveTrackerSources.js';
import {
  buildObjectiveTracker,
  filterObjectiveRows,
  pickFocus,
  scopeSources
} from '../src/components/general/dashboard/objectiveTrackerUtils.js';

const sources = OBJECTIVE_TRACKER_SOURCES;
const anatomy = sources.find((source) => source.eventId === 'anatomy');
const [firstObjective, secondObjective] = anatomy.config.objectiveGroups[0].objectives;

function savedState(statuses = {}, blocks = [], season = ACTIVE_SEASON.year) {
  return JSON.stringify({ objectiveStatus: statuses, blocks, density: 'standard', season });
}

function block(objectiveId, title = 'note') {
  return { id: `blk-${objectiveId}`, objectiveId, title, body: '' };
}

test('sources cover exactly the six compilers, with modules that exist in the registry', () => {
  assert.equal(sources.length, 6);
  for (const source of sources) {
    assert.equal(source.config.eventId, source.eventId);
    assert.equal(source.config.season.year, ACTIVE_SEASON.year);
    assert.match(source.storageKey ?? source.config.storageKey, /reference/);
    const module = EVENT_REGISTRY[source.eventId]?.modules.find((item) => item.id === source.moduleId);
    assert.ok(module, `${source.moduleId} must be registered`);
    assert.equal(module.live, true);
  }
});

test('an absent sheet reports honest not-started objectives, not an empty event', () => {
  const tracker = buildObjectiveTracker(sources, {});
  assert.equal(tracker.events.length, 6);
  assert.equal(tracker.totals.savedSheets, 0);
  assert.equal(tracker.totals.unreadable, 0);
  assert.equal(tracker.totals.notStarted, tracker.totals.objectives);
  for (const event of tracker.events) {
    assert.equal(event.saved, false);
    assert.equal(event.unreadable, false);
    assert.equal(event.confidentPercent, 0);
    assert.ok(event.objectives.every((objective) => objective.status === COMPILER_STATUS.NOT_STARTED));
  }
});

test('a saved sheet drives per-objective status, material and summary counts', () => {
  const tracker = buildObjectiveTracker(sources, {
    anatomy: savedState(
      { [firstObjective.id]: COMPILER_STATUS.CONFIDENT, [secondObjective.id]: COMPILER_STATUS.STUDYING, 'retired': COMPILER_STATUS.CONFIDENT },
      [block(firstObjective.id), block(firstObjective.id, 'second'), block('retired-id')]
    )
  });
  const event = tracker.events.find((item) => item.eventId === 'anatomy');
  assert.equal(event.saved, true);
  assert.equal(event.counts[COMPILER_STATUS.CONFIDENT], 1);
  assert.equal(event.counts[COMPILER_STATUS.STUDYING], 1);
  assert.equal(event.counts.withMaterial, 1);
  assert.equal(event.orphanedBlocks, 1);
  assert.equal(event.counts.needsEvidence, 0);

  const first = event.objectives.find((objective) => objective.id === firstObjective.id);
  assert.equal(first.blockCount, 2);
  assert.equal(first.hasMaterial, true);
  assert.equal(first.needsEvidence, false);
  assert.equal(first.groupLabel, anatomy.config.objectiveGroups[0].label);
  assert.equal(tracker.totals.savedSheets, 1);
  assert.equal(tracker.totals.confident, 1);
  assert.equal(tracker.totals.studying, 1);
  assert.equal(tracker.totals.withMaterial, 1);
});

test('confident without an authored block is surfaced as a self-check hint', () => {
  const tracker = buildObjectiveTracker(sources, {
    anatomy: savedState({ [firstObjective.id]: COMPILER_STATUS.CONFIDENT })
  });
  const event = tracker.events.find((item) => item.eventId === 'anatomy');
  assert.equal(event.counts.needsEvidence, 1);
  assert.equal(event.objectives.find((objective) => objective.id === firstObjective.id).needsEvidence, true);
  assert.equal(tracker.focus[0].objective.id, firstObjective.id);
});

test('corrupt and non-string values are unreadable, never silently empty', () => {
  const tracker = buildObjectiveTracker(sources, { anatomy: 'not json', chemlab: null });
  const anatomyEvent = tracker.events.find((item) => item.eventId === 'anatomy');
  const chemEvent = tracker.events.find((item) => item.eventId === 'chemlab');
  assert.equal(anatomyEvent.unreadable, true);
  assert.equal(anatomyEvent.saved, false);
  assert.equal(chemEvent.unreadable, true);
  assert.equal(tracker.totals.unreadable, 2);
  assert.equal(tracker.totals.savedSheets, 0);
});

test('a sheet saved under another manual is flagged without hiding its content', () => {
  const otherYear = ACTIVE_SEASON.year + 1;
  const tracker = buildObjectiveTracker(sources, {
    anatomy: savedState({ [firstObjective.id]: COMPILER_STATUS.STUDYING }, [], otherYear)
  });
  const event = tracker.events.find((item) => item.eventId === 'anatomy');
  assert.equal(event.seasonMismatch, true);
  assert.equal(event.counts[COMPILER_STATUS.STUDYING], 1);
  assert.equal(tracker.totals.seasonMismatches, 1);
});

test('objective rows filter live by event, status and text', () => {
  const tracker = buildObjectiveTracker(sources, {
    anatomy: savedState({ [firstObjective.id]: COMPILER_STATUS.CONFIDENT })
  });
  const all = filterObjectiveRows(tracker.events);
  assert.equal(all.length, tracker.totals.objectives);

  const byEvent = filterObjectiveRows(tracker.events, { eventId: 'anatomy' });
  assert.ok(byEvent.length > 0);
  assert.ok(byEvent.every((row) => row.eventId === 'anatomy'));

  const confident = filterObjectiveRows(tracker.events, { status: COMPILER_STATUS.CONFIDENT });
  assert.equal(confident.length, 1);
  assert.equal(confident[0].objective.id, firstObjective.id);

  const searched = filterObjectiveRows(tracker.events, { query: firstObjective.label.toUpperCase() });
  assert.ok(searched.some((row) => row.objective.id === firstObjective.id));
  assert.equal(filterObjectiveRows(tracker.events, { query: 'no-such-objective' }).length, 0);
});

test('scopeSources keeps only starred events, in source order', () => {
  assert.deepEqual(scopeSources(sources, []), []);
  assert.deepEqual(
    scopeSources(sources, ['chemlab', 'anatomy', 'retired-event']).map((source) => source.eventId),
    ['anatomy', 'chemlab']
  );
  const scoped = buildObjectiveTracker(scopeSources(sources, ['anatomy']), {
    anatomy: savedState({ [firstObjective.id]: COMPILER_STATUS.CONFIDENT })
  });
  assert.equal(scoped.events.length, 1);
  assert.equal(scoped.totals.events, 1);
  assert.equal(scoped.totals.confident, 1);
  assert.equal(scoped.focus.length, 6);
  assert.ok(scoped.focus.every((row) => row.eventId === 'anatomy'));
});

test('focus queue prefers unfinished work and respects the limit', () => {
  const tracker = buildObjectiveTracker(sources, {
    anatomy: savedState({
      [firstObjective.id]: COMPILER_STATUS.CONFIDENT,
      [secondObjective.id]: COMPILER_STATUS.STUDYING
    }, [block(firstObjective.id)])
  });
  const focus = pickFocus(tracker.events, 4);
  assert.equal(focus.length, 4);
  assert.equal(focus[0].objective.id, secondObjective.id);
  assert.ok(focus.every((row) => row.objective.status !== COMPILER_STATUS.CONFIDENT || row.objective.needsEvidence));
  assert.deepEqual(pickFocus(tracker.events, 0), []);
});
