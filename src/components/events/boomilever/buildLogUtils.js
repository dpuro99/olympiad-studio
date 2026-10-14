import { calculateBoomileverScore } from './boomileverScore.js';

export const STORAGE_KEY = 'olympiad-studio.boomilever-c.2027-build-log';

export const BASE_OPTIONS = [
  { id: 'standard', label: '15 cm standard boundary' },
  { id: 'bonus', label: '10 cm bonus boundary' }
];

export const TIERS = ['Tier 1', 'Tier 2', 'Tier 3 (participation only)'];

export function createEmptyEntry() {
  return {
    label: '',
    structureMassGrams: '',
    memberDescription: '',
    baseOption: 'standard',
    loadSupportedGrams: '',
    holds15Kg: false,
    tier: 'Tier 1',
    failureMode: '',
    changes: ''
  };
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function baseOptionLabel(id) {
  return BASE_OPTIONS.find((option) => option.id === id)?.label || '15 cm standard boundary';
}

/**
 * Reduce a raw build entry to its test status and efficiency.
 * A build with no load recorded is "not yet tested"; efficiency needs both a
 * positive structure mass and a recorded load.
 */
export function summarizeEntry(entry) {
  const mass = toNumberOrNull(entry.structureMassGrams);
  const hasMass = mass !== null && mass > 0;
  const loadValue = toNumberOrNull(entry.loadSupportedGrams);
  const tested = loadValue !== null;

  if (!tested) {
    return { tested: false, scored: false, mass: hasMass ? mass : null };
  }
  if (!hasMass) {
    return { tested: true, scored: false, mass: null, error: 'Add a positive structure mass to score this build.' };
  }

  const result = calculateBoomileverScore({
    loadSupportedGrams: loadValue,
    structureMassGrams: mass,
    meetsBonusRequirements: entry.baseOption === 'bonus',
    holds15Kg: Boolean(entry.holds15Kg),
    tier: entry.tier || 'Tier 1'
  });
  if (result.error) {
    return { tested: true, scored: false, mass, error: result.error };
  }
  return {
    tested: true,
    scored: true,
    mass,
    loadScored: result.loadScored,
    loadScoredBonus: result.loadScoredBonus,
    score: result.score,
    tier: result.tier
  };
}

export function safeParseEntries(serialized) {
  try {
    const data = JSON.parse(serialized);
    if (!Array.isArray(data)) {
      return { error: 'Saved build log has an unsupported format.' };
    }
    return { value: data.map((entry) => ({ ...createEmptyEntry(), ...(entry && typeof entry === 'object' ? entry : {}) })) };
  } catch {
    return { error: 'Saved build log could not be read.' };
  }
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function buildBuildLogCsv(entries) {
  const headers = [
    'prototype', 'structure_mass_g', 'members_material', 'base_option',
    'load_supported_g', 'held_15kg', 'tier', 'load_scored_g', 'efficiency', 'failure_mode', 'changes'
  ];
  const rows = entries.map((entry) => {
    const summary = summarizeEntry(entry);
    return [
      entry.label,
      entry.structureMassGrams,
      entry.memberDescription,
      baseOptionLabel(entry.baseOption),
      summary.tested ? entry.loadSupportedGrams : '',
      summary.tested ? (entry.holds15Kg ? 'yes' : 'no') : '',
      summary.tested ? (entry.tier || '') : '',
      summary.scored ? Number(summary.loadScored.toFixed(2)) : '',
      summary.scored ? Number(summary.score.toFixed(4)) : '',
      entry.failureMode,
      entry.changes
    ];
  });
  return [headers.join(','), ...rows.map((row) => row.map(safeCsvCell).join(','))].join('\r\n');
}
