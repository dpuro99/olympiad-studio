// Turn an event's registry entry into the numbered field-guide spine.
//
// Two rules matter here:
//  - the registry is the only source of truth for which tools exist, and
//  - a per-event `journey` may reorder them, but it can never drop one. Any
//    module the override forgets is appended in stage order, so adding a tool
//    to the registry always makes it appear in the guide.
import { normalizeStage, stageIndex, stageMeta } from './stages.js';

/**
 * Build the ordered journey for one event.
 * Steps carry the module plus its stage/gain/signal metadata; nothing here
 * touches storage, so the same result is produced on the server, in a test,
 * and in the browser.
 */
export function buildJourney(event) {
  if (!event || !Array.isArray(event.modules)) return [];

  const modules = event.modules;
  const byId = new Map(modules.map((module) => [module.id, module]));
  const ordered = [];
  const seen = new Set();

  for (const id of Array.isArray(event.journey) ? event.journey : []) {
    const module = byId.get(id);
    if (!module || seen.has(id)) continue;
    ordered.push(module);
    seen.add(id);
  }

  const remainder = modules
    .map((module, position) => ({ module, position }))
    .filter(({ module }) => !seen.has(module.id))
    .sort((a, b) => (
      stageIndex(a.module.stage) - stageIndex(b.module.stage) || a.position - b.position
    ))
    .map(({ module }) => module);

  return [...ordered, ...remainder].map((module, position) => ({
    index: position + 1,
    id: module.id,
    module,
    stage: normalizeStage(module.stage),
    stageLabel: stageMeta(module.stage).short,
    gain: module.gain || '',
    signal: module.signal || null,
    live: module.live !== false
  }));
}

/**
 * The one step the guide points at.
 *
 * Only steps the app can actually observe are eligible: a calculator keeps no
 * saved work, so it can never be "next" and can never be stuck there forever
 * either. When everything observable has saved work there is no next step, and
 * the guide says so instead of inventing one.
 */
export function pickNextStep(steps) {
  if (!Array.isArray(steps) || !steps.length) return null;
  const tracked = steps.filter((step) => step.progress && step.progress.kind !== 'none');
  if (!tracked.length) return steps[0].id;
  const pending = tracked.find((step) => !step.progress.started);
  return pending ? pending.id : null;
}

/** Real counts only: what exists in this browser, summed across the journey. */
export function summarizeJourney(steps) {
  const tracked = steps.filter((step) => step.progress && step.progress.kind !== 'none');
  const saved = tracked.filter((step) => step.progress.started);
  return {
    total: steps.length,
    tracked: tracked.length,
    withWork: saved.length,
    nextStepId: pickNextStep(steps)
  };
}
