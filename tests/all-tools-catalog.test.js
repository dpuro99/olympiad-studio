import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOG_SCOPES,
  CATALOG_TOOL_TYPES,
  catalogCounts,
  filterCatalog
} from '../src/components/general/dashboard/catalogUtils.js';

const module = (id, label, stage, extra = {}) => ({
  id,
  label,
  stage,
  cat: 'Event',
  gain: `${label} gain`,
  desc: `${label} description`,
  live: true,
  ...extra
});

const REGISTRY = {
  anatomy: {
    name: 'Anatomy and Physiology',
    code: 'ANAT',
    division: 'C',
    description: 'Respiratory, digestive, and immune systems.',
    modules: [
      module('notes', 'Practice Notes', 'record'),
      module('drill', 'System Diagram Drill', 'practice'),
      module('sheet', 'Reference Sheet', 'prepare')
    ]
  },
  writeitdoit: {
    name: 'Write It, Do It',
    code: 'WIDI',
    division: 'B',
    description: 'Describe and build a target.',
    modules: [module('relay', 'Timed Relay', 'practice')]
  }
};

test('the catalog controls expose the documented scope and tool-type options', () => {
  assert.deepEqual(CATALOG_SCOPES.map((scope) => scope.id), ['all', 'B', 'C', 'mine']);
  assert.deepEqual(CATALOG_TOOL_TYPES.map((type) => type.id), [
    'all', 'prepare', 'practice', 'record'
  ]);
});

test('the default catalog keeps every event and every tool in journey order', () => {
  const sections = filterCatalog(REGISTRY);
  assert.deepEqual(sections.map((section) => section.eventId), ['anatomy', 'writeitdoit']);
  assert.deepEqual(sections[0].steps.map((step) => step.id), ['sheet', 'drill', 'notes']);
  assert.deepEqual(catalogCounts(sections), { events: 2, tools: 4 });
});

test('division and starred scopes narrow events without changing their tools', () => {
  assert.deepEqual(
    filterCatalog(REGISTRY, { scope: 'B' }).map((section) => section.eventId),
    ['writeitdoit']
  );
  assert.deepEqual(
    filterCatalog(REGISTRY, { scope: 'C' }).map((section) => section.eventId),
    ['anatomy']
  );
  assert.deepEqual(
    filterCatalog(REGISTRY, { scope: 'mine', starred: ['anatomy'] }).map((section) => section.eventId),
    ['anatomy']
  );
});

test('tool type filters tools and omits events with no surviving tools', () => {
  const sections = filterCatalog(REGISTRY, { toolType: 'prepare' });
  assert.deepEqual(sections.map((section) => section.eventId), ['anatomy']);
  assert.deepEqual(sections[0].steps.map((step) => step.id), ['sheet']);
});

test('a tool query keeps only that tool; an event query keeps the whole event', () => {
  const byTool = filterCatalog(REGISTRY, { query: 'Diagram' });
  assert.deepEqual(byTool.map((section) => section.eventId), ['anatomy']);
  assert.deepEqual(byTool[0].steps.map((step) => step.id), ['drill']);

  const byEvent = filterCatalog(REGISTRY, { query: 'ANAT' });
  assert.deepEqual(byEvent[0].steps.map((step) => step.id), ['sheet', 'drill', 'notes']);
});

test('combined controls compose and a no-match query returns an empty catalog', () => {
  const sections = filterCatalog(REGISTRY, {
    query: 'notes', scope: 'C', toolType: 'record', starred: ['anatomy']
  });
  assert.deepEqual(sections.map((section) => section.eventId), ['anatomy']);
  assert.deepEqual(sections[0].steps.map((step) => step.id), ['notes']);
  assert.deepEqual(filterCatalog(REGISTRY, { query: 'not-a-tool' }), []);
});
