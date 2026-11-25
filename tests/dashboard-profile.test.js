import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROFILE,
  LEVEL_OPTIONS,
  PROFILE_KEY,
  normalizeProfile,
  scopedEventIds,
  setDisplayName,
  setLevel,
  toggleStar
} from '../src/components/general/dashboard/profileUtils.js';

const IDS = ['anatomy', 'ev', 'rocksandminerals'];

function fakeStorage({ getItem, setItem } = {}) {
  return {
    getItem: getItem || (() => null),
    setItem: setItem || (() => {})
  };
}

async function withWindow(storage, run) {
  const previous = globalThis.window;
  globalThis.window = { localStorage: storage };
  try {
    await run();
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test('a new profile is a guest with no stars', () => {
  assert.deepEqual(normalizeProfile(null, IDS), {
    displayName: 'Guest', level: 'regional', starredEventIds: []
  });
  assert.deepEqual(DEFAULT_PROFILE.starredEventIds, []);
  assert.deepEqual(LEVEL_OPTIONS.map((option) => option.value), ['regional', 'state', 'national']);
  assert.equal(PROFILE_KEY, 'olympiad-studio.profile');
});

test('normalize drops stale and duplicate starred ids', () => {
  const profile = normalizeProfile({
    displayName: '  Ada  ',
    level: 'national',
    starredEventIds: ['ev', 'retired-event', 'ev', 'anatomy'],
    lastScope: 'retired-event'
  }, IDS);
  assert.equal(profile.displayName, 'Ada');
  assert.equal(profile.level, 'national');
  assert.deepEqual(profile.starredEventIds, ['ev', 'anatomy']);
  assert.equal(Object.hasOwn(profile, 'lastScope'), false);
  assert.deepEqual(scopedEventIds(profile, IDS), ['anatomy', 'ev']);
});

test('normalize clamps an unknown level and a too-long name', () => {
  const profile = normalizeProfile({ displayName: 'x'.repeat(80), level: 'world' }, IDS);
  assert.equal(profile.level, 'regional');
  assert.equal(profile.displayName.length, 40);
});

test('toggleStar adds and removes only known events', () => {
  let profile = normalizeProfile(null, IDS);
  profile = toggleStar(profile, 'ev', IDS);
  assert.deepEqual(profile.starredEventIds, ['ev']);
  profile = toggleStar(profile, 'anatomy', IDS);
  assert.deepEqual(profile.starredEventIds, ['ev', 'anatomy']);
  profile = toggleStar(profile, 'ev', IDS);
  assert.deepEqual(profile.starredEventIds, ['anatomy']);
  assert.equal(toggleStar(profile, 'retired-event', IDS), profile);
});

test('display name and level edits keep changing state as the student types', () => {
  const profile = normalizeProfile(null, IDS);
  assert.equal(setDisplayName(profile, ' ').displayName, ' ');
  assert.equal(setDisplayName(profile, null).displayName, '');
  assert.equal(setDisplayName(profile, 'y'.repeat(80)).displayName.length, 40);
  assert.equal(setLevel(profile, 'state').level, 'state');
  assert.equal(setLevel(profile, 'nonsense'), profile);
});

test('loadProfile reports a corrupt or denied store instead of an empty profile', async () => {
  const { loadProfile, saveProfile } = await import('../src/components/general/dashboard/profileStore.js');
  await withWindow(fakeStorage({ getItem: () => '{not json' }), async () => {
    const result = loadProfile(IDS);
    assert.equal(result.error, 'unreadable');
    assert.deepEqual(result.profile.starredEventIds, []);
  });
  await withWindow(fakeStorage({ getItem: () => { throw new Error('denied'); } }), async () => {
    const result = loadProfile(IDS);
    assert.equal(result.error, 'unreadable');
  });
  await withWindow(fakeStorage(), async () => {
    const result = loadProfile(IDS);
    assert.equal(result.error, null);
    assert.equal(result.profile.displayName, 'Guest');
  });
  assert.equal(saveProfile(DEFAULT_PROFILE), false); // no window in this scope
});

test('saveProfile writes a normalized profile and reports write failure', async () => {
  const { saveProfile } = await import('../src/components/general/dashboard/profileStore.js');
  const written = [];
  await withWindow(fakeStorage({ setItem: (key, value) => written.push([key, value]) }), async () => {
    const profile = { ...DEFAULT_PROFILE, displayName: 'Ada', starredEventIds: ['ev'] };
    assert.equal(saveProfile(profile), true);
    assert.equal(written[0][0], PROFILE_KEY);
    assert.deepEqual(JSON.parse(written[0][1]), profile);
  });
  await withWindow(fakeStorage({ setItem: () => { throw new Error('denied'); } }), async () => {
    assert.equal(saveProfile(DEFAULT_PROFILE), false);
  });
});
