// Pure rollup over the six saved Reference & Study Compiler sheets.
// It reads serialized states as data and derives views; it never writes, and
// it never invents mastery. Not-started is the honest default for an event with
// no saved sheet, and an unreadable sheet is reported, never treated as empty.

import {
  COMPILER_STATUS,
  countOrphanedBlocks,
  normalizeStatus,
  safeParseState
} from '../referenceCompilerUtils.js';

const EMPTY_STATE = { objectiveStatus: {}, blocks: [], season: null };

function sourceState(source, stored) {
  const raw = stored?.[source.eventId];
  if (raw === undefined) {
    return { state: EMPTY_STATE, saved: false, unreadable: false, seasonMismatch: false };
  }
  if (typeof raw !== 'string') {
    return { state: EMPTY_STATE, saved: false, unreadable: true, seasonMismatch: false };
  }
  const parsed = safeParseState(raw);
  if (parsed.error) {
    return { state: EMPTY_STATE, saved: false, unreadable: true, seasonMismatch: false };
  }
  const state = parsed.value;
  return {
    state,
    saved: true,
    unreadable: false,
    seasonMismatch: Number.isInteger(state.season) && state.season !== source.config.season.year
  };
}

function pct(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/**
 * @param sources array of { eventId, eventName, moduleId, config }
 * @param stored  plain object of eventId -> serialized compiler state
 */
export function buildObjectiveTracker(sources, stored = {}) {
  const events = sources.map((source) => {
    const { state, saved, unreadable, seasonMismatch } = sourceState(source, stored);
    const blocks = state.blocks || [];
    const objectives = (source.config.objectiveGroups || []).flatMap((group) => (
      (group.objectives || []).map((objective) => {
        const status = normalizeStatus(state.objectiveStatus[objective.id]);
        const blockCount = blocks.filter((block) => block.objectiveId === objective.id).length;
        return {
          id: objective.id,
          label: objective.label,
          level: objective.level || 'core',
          groupLabel: group.label,
          status,
          blockCount,
          hasMaterial: blockCount > 0,
          // A confident mark with no authored block is a self-check hint, not
          // a verdict: the compiler is still where status gets changed.
          needsEvidence: status === COMPILER_STATUS.CONFIDENT && blockCount === 0
        };
      })
    ));
    const counts = objectives.reduce((sum, objective) => {
      sum[objective.status] += 1;
      if (objective.hasMaterial) sum.withMaterial += 1;
      if (objective.needsEvidence) sum.needsEvidence += 1;
      return sum;
    }, {
      [COMPILER_STATUS.NOT_STARTED]: 0,
      [COMPILER_STATUS.STUDYING]: 0,
      [COMPILER_STATUS.CONFIDENT]: 0,
      withMaterial: 0,
      needsEvidence: 0
    });
    const total = objectives.length;
    return {
      eventId: source.eventId,
      eventName: source.eventName,
      moduleId: source.moduleId,
      manualReference: source.config.manualReference,
      storageKey: source.config.storageKey,
      objectives,
      counts,
      total,
      saved,
      unreadable,
      seasonMismatch,
      orphanedBlocks: saved ? countOrphanedBlocks(source.config, blocks) : 0,
      startedPercent: pct(counts[COMPILER_STATUS.STUDYING] + counts[COMPILER_STATUS.CONFIDENT], total),
      confidentPercent: pct(counts[COMPILER_STATUS.CONFIDENT], total)
    };
  });

  const totals = events.reduce((sum, event) => {
    sum.objectives += event.total;
    sum.notStarted += event.counts[COMPILER_STATUS.NOT_STARTED];
    sum.studying += event.counts[COMPILER_STATUS.STUDYING];
    sum.confident += event.counts[COMPILER_STATUS.CONFIDENT];
    sum.withMaterial += event.counts.withMaterial;
    sum.needsEvidence += event.counts.needsEvidence;
    if (event.saved) sum.savedSheets += 1;
    if (event.unreadable) sum.unreadable += 1;
    if (event.seasonMismatch) sum.seasonMismatches += 1;
    return sum;
  }, {
    events: events.length,
    objectives: 0,
    notStarted: 0,
    studying: 0,
    confident: 0,
    withMaterial: 0,
    needsEvidence: 0,
    savedSheets: 0,
    unreadable: 0,
    seasonMismatches: 0
  });

  return { events, totals, focus: pickFocus(events, 6) };
}

const FOCUS_PRIORITY = {
  needsEvidence: 0,
  [COMPILER_STATUS.STUDYING]: 1,
  [COMPILER_STATUS.NOT_STARTED]: 2,
  [COMPILER_STATUS.CONFIDENT]: 3
};

function focusRank(objective) {
  if (objective.needsEvidence) return FOCUS_PRIORITY.needsEvidence;
  return FOCUS_PRIORITY[objective.status];
}

/** A short, deterministic study queue: unfinished work before finished work. */
export function pickFocus(events, limit = 6) {
  return events
    .flatMap((event) => event.objectives.map((objective) => ({
      eventId: event.eventId,
      eventName: event.eventName,
      moduleId: event.moduleId,
      objective
    })))
    .sort((a, b) => focusRank(a.objective) - focusRank(b.objective))
    .slice(0, Math.max(0, limit));
}

/**
 * Narrow the six compiler sources to the events the profile has starred.
 * Source order is preserved so cards and focus lists never jump around, and
 * unknown ids are ignored rather than becoming empty phantom events.
 */
export function scopeSources(sources, eventIds = []) {
  const allowed = new Set(eventIds);
  return sources.filter((source) => allowed.has(source.eventId));
}

/** Live filter over objective rows; all comparisons are case-insensitive. */
export function filterObjectiveRows(events, { eventId = 'all', status = 'all', query = '' } = {}) {
  const needle = query.trim().toLowerCase();
  return events.flatMap((event) => {
    if (eventId !== 'all' && event.eventId !== eventId) return [];
    return event.objectives
      .filter((objective) => status === 'all' || objective.status === status)
      .filter((objective) => !needle
        || objective.label.toLowerCase().includes(needle)
        || objective.groupLabel.toLowerCase().includes(needle)
        || event.eventName.toLowerCase().includes(needle))
      .map((objective) => ({
        eventId: event.eventId,
        eventName: event.eventName,
        moduleId: event.moduleId,
        objective
      }));
  });
}
