// The only localStorage boundary for the profile. Guests get a working profile
// immediately; a denied or corrupt store is reported rather than reported as
// "no events chosen", which would be a lie to the user.

import { DEFAULT_PROFILE, PROFILE_KEY, normalizeProfile } from './profileUtils.js';

export function loadProfile(validIds = []) {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (raw === null) return { profile: normalizeProfile(null, validIds), error: null };
    return { profile: normalizeProfile(JSON.parse(raw), validIds), error: null };
  } catch {
    return { profile: { ...DEFAULT_PROFILE, starredEventIds: [] }, error: 'unreadable' };
  }
}

export function saveProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}
