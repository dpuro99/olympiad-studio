import { ACTIVE_DATA } from '../../../seasons/active.js';

function isPositiveFinite(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateBoomileverScore({
  loadSupportedGrams,
  structureMassGrams,
  meetsBonusRequirements = false,
  holds15Kg = false,
  tier = 'Tier 1',
  estimatedLoadSupportedGrams = null,
  constants = ACTIVE_DATA.boomilever
}) {
  if (!isPositiveFinite(structureMassGrams)) {
    return { error: 'Structure mass must be a positive finite value.' };
  }
  if (loadSupportedGrams !== null && !(Number.isFinite(loadSupportedGrams) && loadSupportedGrams >= 0)) {
    return { error: 'Load supported must be a finite, non-negative value or null.' };
  }
  if (loadSupportedGrams !== null && loadSupportedGrams > constants.loadSupportedCapGrams) {
    return { error: `Load supported is capped at ${constants.loadSupportedCapGrams.toLocaleString('en-US')} g.` };
  }

  const cappedLoadSupported = loadSupportedGrams === null
    ? 0
    : Math.min(loadSupportedGrams, constants.loadSupportedCapGrams);
  const loadScoredBonus = meetsBonusRequirements && holds15Kg ? constants.loadScoredBonusGrams : 0;
  const loadScored = cappedLoadSupported + loadScoredBonus;
  const score = loadScored / structureMassGrams;

  return {
    loadSupportedGrams: cappedLoadSupported,
    loadScoredBonus,
    loadScored,
    structureMassGrams,
    score,
    tier,
    estimatedLoadSupportedGrams,
    note: constants.scoringNote
  };
}
