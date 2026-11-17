// Read-only probe of the work a student has actually saved for one event.
//
// Nothing here writes, migrates, or repairs storage: it reports what is there.
// A storage key that is absent, unreadable, or belongs to another tool simply
// counts as zero, and a browser where storage is blocked is reported as
// unavailable rather than as "no work" — the guide must never claim a state the
// app cannot prove.
import { storageKey } from '../../seasons/storageKeys.js';

// Registry event ids are not all season-storage tokens (`ev` is the shell id,
// `electricvehicle` is the season token). Map before building a key.
const STORAGE_EVENT_IDS = { ev: 'electricvehicle' };

/** Signal name used in the registry -> where that work lives on disk. */
export const SIGNALS = {
  notes: { module: 'notebook', kind: 'notes', label: 'note' },
  sheet: { module: 'reference-sheet', kind: 'sheet', label: 'sheet' },
  binder: { module: 'reference-binder', kind: 'sheet', label: 'binder' },
  buildLog: { module: 'build-log', kind: 'entries', label: 'build' },
  runs: { module: 'practice-runs', kind: 'entries', label: 'run' },
  gases: { module: 'gases', kind: 'notebook', label: 'gas notebook' },
  kinetics: { module: 'kinetics', kind: 'notebook', label: 'kinetics notebook' },
  cards: { module: 'specimen-cards', kind: 'cards', label: 'mineral' },
  canvas: { module: 'logic-canvas', kind: 'canvas', label: 'circuit' }
};

// Notebook records keep their settings next to their content; these keys are
// select defaults rather than evidence that the student did anything.
const SETTING_KEYS = new Set(['gasLaw', 'target', 'measurementType', 'factorId', 'timeUnit', 'density', 'season']);

function defaultStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

// A blocked store (private mode, disabled storage) is not the same as an empty
// one: `{ error: true }` lets the caller say "unreadable" instead of "nothing
// saved", which would be a claim the app cannot prove.
function readRaw(storage, key) {
  try {
    return { value: storage.getItem(key) };
  } catch {
    return { error: true };
  }
}

function parse(raw) {
  try {
    return { value: JSON.parse(raw) };
  } catch {
    return { error: true };
  }
}

function countNotebookLeaves(data) {
  let count = 0;
  const visit = (value, key) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string') {
      if (!SETTING_KEYS.has(key) && value.trim() !== '') count += 1;
      return;
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value) && !SETTING_KEYS.has(key)) count += 1;
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, key);
      return;
    }
    if (typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value)) visit(child, childKey);
    }
  };
  for (const [key, value] of Object.entries(data || {})) visit(value, key);
  return count;
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
}

/** How much real work a saved payload contains; `0` means "nothing authored yet". */
function countByKind(kind, data) {
  if (data === null || typeof data !== 'object') return 0;
  switch (kind) {
    case 'entries':
      return Array.isArray(data) ? data.length : 0;
    case 'notes':
      return Array.isArray(data.notes) ? data.notes.length : 0;
    case 'sheet': {
      const blocks = Array.isArray(data.blocks) ? data.blocks.length : 0;
      const marked = Object.values(data.objectiveStatus || {})
        .filter((status) => status && status !== 'not-started').length;
      return blocks + marked;
    }
    case 'notebook':
      return countNotebookLeaves(data);
    case 'cards':
      return Object.values(data)
        .filter((properties) => properties && typeof properties === 'object'
          && Object.values(properties).some(hasValue)).length;
    case 'canvas':
      return Array.isArray(data.wires) ? data.wires.length : 0;
    default:
      return 0;
  }
}

/**
 * Probe one module's saved work.
 * Returns `{ kind, count, started, label, unavailable }`; `kind: 'none'` means
 * the tool keeps no saved work at all (a calculator, a generated drill).
 */
export function probeModuleProgress(module, eventId, storage = defaultStorage()) {
  const signal = module && module.signal ? SIGNALS[module.signal] : null;
  if (!signal) return { kind: 'none', count: 0, started: false, label: '', unavailable: false };

  const base = { kind: signal.kind, count: 0, started: false, label: signal.label, unavailable: false };
  if (!storage) return { ...base, unavailable: true };

  const eventToken = STORAGE_EVENT_IDS[eventId] || eventId;
  let key;
  try {
    key = storageKey(eventToken, signal.module);
  } catch {
    return { ...base, unavailable: true };
  }

  const raw = readRaw(storage, key);
  if (raw.error) return { ...base, unavailable: true };
  if (raw.value === null || raw.value === undefined || raw.value === '') return base;

  const parsed = parse(raw.value);
  if (parsed.error) return { ...base, unavailable: true };

  const count = countByKind(signal.kind, parsed.value);
  return { ...base, count, started: count > 0 };
}

/** Probe every module of one event, keyed by module id. */
export function readEventProgress(eventId, event, storage = defaultStorage()) {
  const modules = event && Array.isArray(event.modules) ? event.modules : [];
  const progress = {};
  for (const module of modules) {
    progress[module.id] = probeModuleProgress(module, eventId, storage);
  }
  return progress;
}

/** Attach probe results to journey steps (pure, returns new steps). */
export function withProgress(steps, progress) {
  return steps.map((step) => ({
    ...step,
    progress: progress[step.id] || { kind: 'none', count: 0, started: false, label: '', unavailable: false }
  }));
}

/** Human-readable saved-work chip, or an empty string when there is nothing real to say. */
export function progressLabel(progress) {
  if (!progress || progress.kind === 'none') return '';
  if (progress.unavailable) return 'Saved work unreadable';
  if (!progress.started) return '';
  const { count, label } = progress;
  if (progress.kind === 'sheet') return `${label} saved`;
  return `${count} ${label}${count === 1 ? '' : 's'} saved`;
}
