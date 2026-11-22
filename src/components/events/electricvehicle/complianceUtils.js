// Pure engine for the EV kit/program self-check. Rule copy and citations arrive
// from season data; this module only owns status shapes and derived counts.

export const CHECK_STATUSES = ['unreviewed', 'ok', 'fix'];

export function createCheckState(checks) {
  return checks.reduce((state, check) => ({
    ...state,
    [check.id]: { status: 'unreviewed', note: '' }
  }), {});
}

export function updateCheckState(state, id, patch) {
  const current = state[id] || { status: 'unreviewed', note: '' };
  const next = { ...current, ...patch };
  if (!CHECK_STATUSES.includes(next.status)) throw new Error(`Unknown check status: ${next.status}`);
  return { ...state, [id]: next };
}

export function applicableChecks(checks, usesKit) {
  return checks.filter((check) => check.scope === 'all' || usesKit);
}

export function summarizeChecklist(checks, state, usesKit) {
  const applicable = applicableChecks(checks, usesKit);
  const counts = { ok: 0, fix: 0, unreviewed: 0, withNotes: 0 };
  const attention = [];
  for (const check of applicable) {
    const entry = state[check.id] || { status: 'unreviewed', note: '' };
    counts[entry.status] += 1;
    if (String(entry.note).trim()) counts.withNotes += 1;
    if (entry.status !== 'ok') attention.push(check.id);
  }
  return {
    applicable: applicable.length,
    ...counts,
    ready: counts.fix === 0 && counts.unreviewed === 0,
    attention
  };
}
