// Pure filtering for the All Tools catalog. The registry stays the single
// source of truth; these helpers only decide which registered tools to show.
import { buildJourney } from '../journeyUtils.js';
import { normalizeStage } from '../stages.js';

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
 * an empty card. General tools have no division, so they appear only in the
 * All Divisions scope; they still obey search and tool-type filters.
 */
export function filterCatalog(
  registry,
  { query = '', scope = 'all', toolType = 'all', starred = [] } = {},
  generalRegistry = {}
) {
  const needle = query.trim().toLowerCase();
  const stars = new Set(starred);

  const events = Object.entries(registry).flatMap(([eventId, event]) => {
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

    return steps.length ? [{ kind: 'event', eventId, event, steps }] : [];
  });

  const generalTools = Object.values(generalRegistry).filter((tool) => {
    if (scope !== 'all') return false;
    if (toolType !== 'all' && normalizeStage(tool.stage) !== toolType) return false;
    if (!needle) return true;
    return [tool.id, tool.label, tool.gain, tool.desc, tool.cat]
      .some((value) => matches(value, needle));
  });

  return [
    ...events,
    ...(generalTools.length > 0 ? [{ kind: 'general', tools: generalTools }] : [])
  ];
}

/** Counts for the live result line in the filter rail. */
export function catalogCounts(sections) {
  return {
    events: sections.filter((section) => section.kind !== 'general').length,
    tools: sections.reduce(
      (total, section) => total + (Array.isArray(section.tools) ? section.tools.length : section.steps.length),
      0
    )
  };
}
