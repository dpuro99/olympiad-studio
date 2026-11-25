// Pure profile model. Stars are the profile: the events a student has starred
// are the only ones the dashboard, tracker and compiler switcher consider.
// This module holds no DOM or storage access and knows no event names — the
// caller supplies the valid ids from the registry.

export const PROFILE_KEY = 'olympiad-studio.profile';

export const LEVEL_OPTIONS = Object.freeze([
  Object.freeze({ value: 'regional', label: 'Regional / Invitational' }),
  Object.freeze({ value: 'state', label: 'State' }),
  Object.freeze({ value: 'national', label: 'National' })
]);

const LEVEL_VALUES = LEVEL_OPTIONS.map((option) => option.value);

export const DEFAULT_PROFILE = Object.freeze({
  displayName: 'Guest',
  level: 'regional',
  starredEventIds: Object.freeze([])
});

/** Coerce any stored value into a safe profile, dropping stale ids. */
export function normalizeProfile(raw, validIds = []) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_PROFILE, starredEventIds: [] };
  }
  const valid = new Set(validIds);
  const starredEventIds = Array.isArray(raw.starredEventIds)
    ? [...new Set(raw.starredEventIds.filter((id) => typeof id === 'string' && valid.has(id)))]
    : [];
  const name = typeof raw.displayName === 'string' ? raw.displayName.trim().slice(0, 40) : '';
  const level = LEVEL_VALUES.includes(raw.level) ? raw.level : DEFAULT_PROFILE.level;
  return { displayName: name || DEFAULT_PROFILE.displayName, level, starredEventIds };
}

/** Add or remove one star; the dashboard and tracker follow the result. */
export function toggleStar(profile, eventId, validIds = []) {
  if (typeof eventId !== 'string' || !validIds.includes(eventId)) return profile;
  const isStarred = profile.starredEventIds.includes(eventId);
  const starredEventIds = isStarred
    ? profile.starredEventIds.filter((id) => id !== eventId)
    : [...profile.starredEventIds, eventId];
  return { ...profile, starredEventIds };
}

// Keep exactly what was typed so a live input never fights the student; the
// fallback is applied on display and when a stored profile is normalized.
export function setDisplayName(profile, name) {
  return { ...profile, displayName: typeof name === 'string' ? name.slice(0, 40) : '' };
}

export function setLevel(profile, level) {
  return LEVEL_VALUES.includes(level) ? { ...profile, level } : profile;
}

/** Starred ids in the registry's own order, so sections never jump around. */
export function scopedEventIds(profile, validIds = []) {
  const starred = new Set(profile.starredEventIds);
  return validIds.filter((id) => starred.has(id));
}
