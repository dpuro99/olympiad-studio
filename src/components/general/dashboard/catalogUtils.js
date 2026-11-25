// Pure filtering for the All Tools catalog. The registry stays the single
// source of truth; these helpers only decide which registered tools to show.
import { buildJourney } from '../journeyUtils.js';

export const CATALOG_SCOPES = [
  { id: 'all', label: 'All Divisions' },
  { id: 'B', label: 'Division B' },
  { id: 'C', label: 'Division C' },
  { id: 'mine', label: 'My Events' }
];

export const CATALOG_TOOL_TYPES = [
  { id: 'all', label: 'All types' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'practice', label: 'Practice' },
  { id: 'record', label: 'Record' }
];

function matches(haystack, needle) {
  return String(haystack ?? '').toLowerCase().includes(needle);
}

/**
 * Return only the events and tools that match the catalog controls.
 *
 * A query that matches an event keeps all of that event's tools (still subject
 * to the tool-type filter), while a query that only matches a tool keeps just
 * that tool. An event with no surviving tools is omitted rather than shown as
 * an empty card.
 */
export function filterCatalog(registry, { query = '', scope = 'all', toolType = 'all', starred = [] } = {}) {
  const needle = query.trim().toLowerCase();
  const stars = new Set(starred);

  return Object.entries(registry).flatMap(([eventId, event]) => {
    if (scope === 'mine' && !stars.has(eventId)) return [];
    if (scope === 'B' && event.division !== 'B') return [];
    if (scope === 'C' && event.division !== 'C') return [];

    const eventMatches = !needle || [
      event.name,
      event.code,
      event.division && `Division ${event.division}`,
      event.description
    ].some((value) => matches(value, needle));

    const steps = buildJourney(event).filter((step) => {
      if (toolType !== 'all' && step.stage !== toolType) return false;
      if (eventMatches) return true;
      return [
        step.module.label,
        step.gain,
        step.module.desc,
        step.stageLabel,
        step.module.cat
      ].some((value) => matches(value, needle));
    });

    return steps.length ? [{ eventId, event, steps }] : [];
  });
}

/** Counts for the live result line in the filter rail. */
export function catalogCounts(sections) {
  return {
    events: sections.length,
    tools: sections.reduce((total, section) => total + section.steps.length, 0)
  };
}
