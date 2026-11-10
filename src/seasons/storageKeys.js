import { ACTIVE_SEASON } from './manifest.js';

// Event id → the season-data token used in practice storage keys. Division is
// part of the token because the same event name can exist in both divisions.
export const EVENT_STORAGE_CODES = {
  anatomy: 'anatomy-c',
  boomilever: 'boomilever-c',
  chemlab: 'chemlab-c',
  circuitlab: 'circuitlab-c',
  designergenes: 'designergenes-c',
  dynamicplanet: 'dynamicplanet-c',
  electricvehicle: 'electricvehicle-c',
  rocksandminerals: 'rocksandminerals-c',
  writeitdoit: 'writeitdoit-b'
};

/**
 * Build the localStorage key for season-bound practice data.
 * Keys embed the season year so a new manual isolates the previous season's
 * records on the same browser instead of silently mixing them.
 */
export function storageKey(eventId, moduleId, season = ACTIVE_SEASON) {
  const code = EVENT_STORAGE_CODES[eventId];
  if (!code) throw new Error(`Unknown event for storage key: ${eventId}`);
  return `olympiad-studio.${code}.${season.year}-${moduleId}`;
}

/**
 * Season-bound file stem for exports (JSON/CSV/print). Mirrors the storage-key
 * shape so a downloaded backup names the manual season it belongs to.
 */
export function fileStem(eventId, moduleId, season = ACTIVE_SEASON) {
  const code = EVENT_STORAGE_CODES[eventId];
  if (!code) throw new Error(`Unknown event for file stem: ${eventId}`);
  return `${code}-${season.year}-${moduleId}`;
}

// Keys written before storage keys were centralized. Reads fall back to these
// and copy the value forward, so upgrading the app never drops saved practice data.
export const LEGACY_STORAGE_KEYS = {
  anatomyNotebook: 'olympiad-studio-anatomy-c-2027-notebook',
  evPracticeRuns: 'olympiad-studio.ev-c.2027-practice-runs',
  chemlabGases: 'olympiad-studio-chemlab-gases-v1',
  chemlabKinetics: 'olympiad-studio-chemlab-kinetics-v1'
};

/** Read a season key, migrating a matching legacy key forward on first hit. */
export function readStorageWithLegacy(key, legacyKey) {
  const current = window.localStorage.getItem(key);
  if (current !== null) return current;
  if (!legacyKey) return null;
  const legacy = window.localStorage.getItem(legacyKey);
  if (legacy === null) return null;
  try {
    window.localStorage.setItem(key, legacy);
  } catch {
    // Migration is best-effort; the caller can still use the legacy value.
  }
  return legacy;
}
