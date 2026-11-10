// Rocks and Minerals — specimen-card store and mineral-key filtering.
//
// Season-invariant engine: the official list (names, chemical classes, levels)
// arrives from season data, and the property vocabulary below is standard
// mineralogy rather than a rule constant. Nothing here holds a diagnostic value
// for a specific mineral — those are recorded by the student — so the tool can
// never drift from the manual by pretending to be an answer key.
import { storageKey } from '../../../seasons/storageKeys.js';
import { ACTIVE_DATA } from '../../../seasons/active.js';

export const SPECIMEN_STORAGE_KEY = storageKey('rocksandminerals', 'specimen-cards');
export const MINERAL_KEY = ACTIVE_DATA.rocksandminerals.mineralKey;
export const OFFICIAL_MINERALS = ACTIVE_DATA.rocksandminerals.minerals;

// A hand specimen is judged in the field: a measured hardness within half a
// point of the mineral's published range is the same observation.
export const HARDNESS_TOLERANCE = 0.5;
export const HARDNESS_MIN = 1;
export const HARDNESS_MAX = 10;

export const LUSTER_OPTIONS = Object.freeze([
  Object.freeze({ id: 'metallic', label: 'Metallic' }),
  Object.freeze({ id: 'submetallic', label: 'Submetallic' }),
  Object.freeze({ id: 'vitreous', label: 'Vitreous (glassy)' }),
  Object.freeze({ id: 'adamantine', label: 'Adamantine' }),
  Object.freeze({ id: 'pearly', label: 'Pearly' }),
  Object.freeze({ id: 'silky', label: 'Silky' }),
  Object.freeze({ id: 'greasy', label: 'Greasy' }),
  Object.freeze({ id: 'resinous', label: 'Resinous' }),
  Object.freeze({ id: 'earthy', label: 'Earthy / dull' })
]);

export const CLEAVAGE_OPTIONS = Object.freeze([
  Object.freeze({ id: 'perfect', label: 'Perfect' }),
  Object.freeze({ id: 'good', label: 'Good / distinct' }),
  Object.freeze({ id: 'poor', label: 'Poor / indistinct' }),
  Object.freeze({ id: 'none', label: 'None (fracture)' })
]);

export const STREAK_OPTIONS = Object.freeze([
  Object.freeze({ id: 'white', label: 'White / colorless' }),
  Object.freeze({ id: 'gray', label: 'Gray' }),
  Object.freeze({ id: 'black', label: 'Black' }),
  Object.freeze({ id: 'brown', label: 'Brown' }),
  Object.freeze({ id: 'red', label: 'Red' }),
  Object.freeze({ id: 'orange', label: 'Orange / yellow' }),
  Object.freeze({ id: 'green', label: 'Green' }),
  Object.freeze({ id: 'blue', label: 'Blue' })
]);

export const ACID_OPTIONS = Object.freeze([
  Object.freeze({ id: 'none', label: 'No reaction' }),
  Object.freeze({ id: 'weak', label: 'Weak (warm or dilute acid)' }),
  Object.freeze({ id: 'strong', label: 'Strong (cold dilute HCl)' })
]);

export const MAGNETIC_OPTIONS = Object.freeze([
  Object.freeze({ id: 'yes', label: 'Attracted to a magnet' }),
  Object.freeze({ id: 'no', label: 'Not magnetic' })
]);

// Manual list order (pp. C55–C56); used to scan candidates in the order the
// students see them on their allowed sheet.
export const CHEMICAL_CLASSES = Object.freeze(
  Array.from(new Set(OFFICIAL_MINERALS.map((entry) => entry.cls)))
);

const TAGS = {
  luster: new Set(LUSTER_OPTIONS.map((option) => option.id)),
  cleavage: new Set(CLEAVAGE_OPTIONS.map((option) => option.id)),
  streak: new Set(STREAK_OPTIONS.map((option) => option.id))
};
const ENUMS = {
  acid: new Set(ACID_OPTIONS.map((option) => option.id)),
  magnetic: new Set(MAGNETIC_OPTIONS.map((option) => option.id))
};
const LABELS = Object.fromEntries(
  [LUSTER_OPTIONS, CLEAVAGE_OPTIONS, STREAK_OPTIONS, ACID_OPTIONS, MAGNETIC_OPTIONS]
    .flat()
    .map((option) => [option.id, option.label])
);

// Import accepts either the stored id or the human-readable label, so an
// exported sheet can be filled in a spreadsheet and imported back unchanged.
const ID_BY_LABEL = Object.fromEntries(
  [LUSTER_OPTIONS, CLEAVAGE_OPTIONS, STREAK_OPTIONS, ACID_OPTIONS, MAGNETIC_OPTIONS]
    .flat()
    .map((option) => [option.label.toLowerCase(), option.id])
);

export function propertyLabel(id) {
  return LABELS[id] || id;
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampHardness(value) {
  const parsed = toNumberOrNull(value);
  if (parsed === null) return '';
  return Math.min(HARDNESS_MAX, Math.max(HARDNESS_MIN, parsed));
}

export function createEmptyProperties() {
  return {
    luster: [],
    hardnessMin: '',
    hardnessMax: '',
    cleavage: [],
    streak: [],
    acid: '',
    magnetic: '',
    notes: ''
  };
}

function sanitizeTags(raw, allowed) {
  if (!Array.isArray(raw)) return [];
  return Array.from(new Set(raw.filter((tag) => allowed.has(tag))));
}

/** Keep only recognised property fields/values so saved or imported junk cannot reach the UI. */
export function sanitizeProperties(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const acid = ENUMS.acid.has(source.acid) ? source.acid : '';
  const magnetic = ENUMS.magnetic.has(source.magnetic) ? source.magnetic : '';
  return {
    luster: sanitizeTags(source.luster, TAGS.luster),
    hardnessMin: clampHardness(source.hardnessMin),
    hardnessMax: clampHardness(source.hardnessMax),
    cleavage: sanitizeTags(source.cleavage, TAGS.cleavage),
    streak: sanitizeTags(source.streak, TAGS.streak),
    acid,
    magnetic,
    notes: typeof source.notes === 'string' ? source.notes.slice(0, 2000) : ''
  };
}

export function createCard(mineral, properties) {
  return {
    id: mineral.id,
    name: mineral.name,
    cls: mineral.cls,
    level: mineral.level,
    group: mineral.group || '',
    note: mineral.note || '',
    properties: sanitizeProperties(properties)
  };
}

/**
 * Merge the student's property records onto the official list. Class, level and
 * name always come from season data, so a saved or imported record can never
 * relabel a mineral or promote it out of the State/National tier.
 */
export function buildCards(authored = {}) {
  const store = authored && typeof authored === 'object' && !Array.isArray(authored) ? authored : {};
  return OFFICIAL_MINERALS.map((mineral) => createCard(mineral, store[mineral.id]));
}

export function hasRecordedProperties(properties = {}) {
  const safe = sanitizeProperties(properties);
  return Boolean(
    safe.luster.length
    || safe.cleavage.length
    || safe.streak.length
    || safe.acid
    || safe.magnetic
    || safe.hardnessMin !== ''
    || safe.hardnessMax !== ''
  );
}

export function hardnessRange(properties = {}) {
  const low = toNumberOrNull(properties.hardnessMin);
  const high = toNumberOrNull(properties.hardnessMax);
  if (low === null && high === null) return null;
  const min = low === null ? high : low;
  const max = high === null ? low : high;
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

export function formatHardness(properties = {}) {
  const range = hardnessRange(properties);
  if (!range) return '';
  if (range.min === range.max) return String(range.min);
  return `${range.min}–${range.max}`;
}

/** Human-readable property chips for a card; empty values are omitted, never guessed. */
export function propertyReadouts(card) {
  const properties = sanitizeProperties(card.properties);
  const readouts = [];
  if (properties.luster.length) readouts.push({ label: 'Luster', value: properties.luster.map(propertyLabel).join(', ') });
  const hardness = formatHardness(properties);
  if (hardness) readouts.push({ label: 'Hardness', value: hardness });
  if (properties.cleavage.length) readouts.push({ label: 'Cleavage', value: properties.cleavage.map(propertyLabel).join(', ') });
  if (properties.streak.length) readouts.push({ label: 'Streak', value: properties.streak.map(propertyLabel).join(', ') });
  if (properties.acid) readouts.push({ label: 'Acid', value: propertyLabel(properties.acid) });
  if (properties.magnetic) readouts.push({ label: 'Magnet', value: propertyLabel(properties.magnetic) });
  return readouts;
}

export function createCriteria() {
  return { cls: '', luster: [], hardness: '', cleavage: [], streak: [], acid: '', magnetic: '' };
}

export function activeCriteriaCount(criteria) {
  if (!criteria) return 0;
  let count = 0;
  if (criteria.cls) count += 1;
  for (const key of ['luster', 'cleavage', 'streak']) {
    if (Array.isArray(criteria[key]) && criteria[key].length) count += 1;
  }
  for (const key of ['hardness', 'acid', 'magnetic']) {
    if (criteria[key] !== '' && criteria[key] !== null && criteria[key] !== undefined) count += 1;
  }
  return count;
}

const TAG_FIELDS = [
  { key: 'luster', label: 'Luster' },
  { key: 'cleavage', label: 'Cleavage' },
  { key: 'streak', label: 'Streak' }
];

/**
 * Judge one card against the observed properties.
 * - `excluded`: a recorded value contradicts the observation.
 * - `unknown`: the card has no value recorded for an observation, so it cannot
 *   be judged either way (kept separate so the key never implies a false match).
 * - `match`: every observation agrees with a recorded value.
 */
export function matchCard(card, criteria = {}) {
  const properties = sanitizeProperties(card.properties);
  const conflicts = [];
  const missing = [];

  if (criteria.cls && criteria.cls !== card.cls) {
    conflicts.push({ property: 'Chemical class', wanted: criteria.cls, recorded: card.cls });
  }

  for (const field of TAG_FIELDS) {
    const wanted = Array.isArray(criteria[field.key]) ? criteria[field.key] : [];
    if (!wanted.length) continue;
    const recorded = properties[field.key];
    if (!recorded.length) {
      missing.push(field.label);
    } else if (!recorded.some((tag) => wanted.includes(tag))) {
      conflicts.push({
        property: field.label,
        wanted: wanted.map(propertyLabel).join(' or '),
        recorded: recorded.map(propertyLabel).join(', ')
      });
    }
  }

  const observedHardness = toNumberOrNull(criteria.hardness);
  if (observedHardness !== null) {
    const range = hardnessRange(properties);
    if (!range) {
      missing.push('Hardness');
    } else if (
      range.max < observedHardness - HARDNESS_TOLERANCE
      || range.min > observedHardness + HARDNESS_TOLERANCE
    ) {
      conflicts.push({
        property: 'Hardness',
        wanted: `${observedHardness} ± ${HARDNESS_TOLERANCE}`,
        recorded: formatHardness(properties)
      });
    }
  }

  for (const field of [{ key: 'acid', label: 'Acid reaction' }, { key: 'magnetic', label: 'Magnet' }]) {
    const wanted = criteria[field.key];
    if (!wanted) continue;
    const recorded = properties[field.key];
    if (!recorded) {
      missing.push(field.label);
    } else if (recorded !== wanted) {
      conflicts.push({
        property: field.label,
        wanted: propertyLabel(wanted),
        recorded: propertyLabel(recorded)
      });
    }
  }

  const status = conflicts.length ? 'excluded' : missing.length ? 'unknown' : 'match';
  return { status, conflicts, missing };
}

function sortByName(entries) {
  return entries.slice().sort((a, b) => a.card.name.localeCompare(b.card.name));
}

/** Split the candidate pool into judged buckets, preserving name order inside each. */
export function rankCandidates(cards, criteria) {
  const matched = [];
  const unknown = [];
  const excluded = [];
  for (const card of cards) {
    const verdict = matchCard(card, criteria);
    const bucket = verdict.status === 'match' ? matched : verdict.status === 'unknown' ? unknown : excluded;
    bucket.push({ card, verdict });
  }
  return {
    matched: sortByName(matched),
    unknown: sortByName(unknown),
    excluded: sortByName(excluded)
  };
}

/** Cards visible at the requested scope: Regional default, State/National on request. */
export function cardsInScope(cards, includeStateAndNational) {
  return includeStateAndNational ? cards.slice() : cards.filter((card) => card.level !== 'state');
}

export function coverageOf(cards) {
  const total = cards.length;
  const recorded = cards.filter((card) => hasRecordedProperties(card.properties)).length;
  return { recorded, total };
}

export function safeParseAuthored(serialized) {
  try {
    const data = JSON.parse(serialized);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Saved specimen properties have an unsupported format.' };
    }
    const authored = {};
    for (const [id, properties] of Object.entries(data)) {
      authored[id] = sanitizeProperties(properties);
    }
    return { value: authored };
  } catch {
    return { error: 'Saved specimen properties could not be read.' };
  }
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = /^\s*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export const CSV_HEADERS = Object.freeze([
  'mineral',
  'class',
  'level',
  'luster',
  'hardness_min',
  'hardness_max',
  'cleavage',
  'streak',
  'acid',
  'magnetic',
  'notes'
]);

const CSV_TAG_FIELDS = [
  { header: 'luster', key: 'luster' },
  { header: 'cleavage', key: 'cleavage' },
  { header: 'streak', key: 'streak' }
];

function joinTags(values) {
  return values.join('; ');
}

/**
 * Export the whole official list with whatever has been recorded, so a student
 * can fill the file in a spreadsheet and import it back. Property values are
 * written as their readable labels; import accepts a label or an id.
 */
export function buildCardsCsv(cards) {
  const rows = cards.map((card) => {
    const properties = sanitizeProperties(card.properties);
    return [
      card.name,
      card.cls,
      card.level === 'state' ? 'State/National' : 'Regional',
      joinTags(properties.luster.map(propertyLabel)),
      properties.hardnessMin,
      properties.hardnessMax,
      joinTags(properties.cleavage.map(propertyLabel)),
      joinTags(properties.streak.map(propertyLabel)),
      propertyLabel(properties.acid),
      propertyLabel(properties.magnetic),
      properties.notes
    ];
  });
  return [CSV_HEADERS.join(','), ...rows.map((row) => row.map(safeCsvCell).join(','))].join('\r\n');
}

/** Minimal RFC-4180 parser: quoted cells, doubled quotes, CRLF or LF rows. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const input = String(text ?? '');
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => value.trim() !== ''));
}

function resolveTag(value, allowed) {
  const needle = String(value ?? '').trim().toLowerCase();
  if (allowed.has(needle)) return needle;
  const fromLabel = ID_BY_LABEL[needle];
  return fromLabel && allowed.has(fromLabel) ? fromLabel : '';
}

function splitTags(value, allowed) {
  const resolved = String(value ?? '')
    .split(/[;|]/)
    .map((tag) => resolveTag(tag, allowed))
    .filter(Boolean);
  return Array.from(new Set(resolved));
}

function matchTagId(value, allowed) {
  return resolveTag(value, allowed);
}

/**
 * Import a filled-in CSV over the official list.
 * Unknown minerals and unrecognised property values are reported, never guessed,
 * and the class/level columns are ignored (season data owns them).
 */
export function importCardsCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return { error: 'That file has no rows to import.' };
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const index = (name) => headers.indexOf(name);
  const nameIndex = index('mineral');
  if (nameIndex === -1) return { error: 'The CSV needs a "mineral" column.' };

  const byName = new Map(OFFICIAL_MINERALS.map((mineral) => [mineral.name.toLowerCase(), mineral]));
  const byId = new Map(OFFICIAL_MINERALS.map((mineral) => [mineral.id, mineral]));
  const authored = {};
  const applied = [];
  const skipped = [];
  let ignoredValues = 0;

  for (const row of rows.slice(1)) {
    const rawName = String(row[nameIndex] ?? '').trim();
    if (!rawName) continue;
    const mineral = byName.get(rawName.toLowerCase()) || byId.get(rawName);
    if (!mineral) {
      skipped.push(rawName);
      continue;
    }
    const properties = createEmptyProperties();
    let dropped = 0;
    for (const field of CSV_TAG_FIELDS) {
      const column = index(field.header);
      if (column === -1) continue;
      const raw = String(row[column] ?? '').trim();
      const tags = splitTags(raw, TAGS[field.key]);
      if (raw && !tags.length) dropped += 1;
      properties[field.key] = tags;
    }
    for (const key of ['hardness_min', 'hardness_max']) {
      const column = index(key);
      if (column === -1) continue;
      const raw = String(row[column] ?? '').trim();
      if (!raw) continue;
      const numeric = toNumberOrNull(raw);
      if (numeric === null) {
        dropped += 1;
        continue;
      }
      properties[key === 'hardness_min' ? 'hardnessMin' : 'hardnessMax'] = clampHardness(numeric);
    }
    for (const field of [{ header: 'acid', key: 'acid' }, { header: 'magnetic', key: 'magnetic' }]) {
      const column = index(field.header);
      if (column === -1) continue;
      const raw = String(row[column] ?? '').trim();
      if (!raw) continue;
      const value = matchTagId(raw, ENUMS[field.key]);
      if (!value) {
        dropped += 1;
        continue;
      }
      properties[field.key] = value;
    }
    const notesColumn = index('notes');
    if (notesColumn !== -1) properties.notes = String(row[notesColumn] ?? '').trim().slice(0, 2000);
    ignoredValues += dropped;
    authored[mineral.id] = sanitizeProperties(properties);
    applied.push(mineral.name);
  }

  return { authored, applied, skipped, ignoredValues };
}
