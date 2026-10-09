function isPositiveFinite(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateBoomileverScore({
  loadSupportedGrams,
  structureMassGrams,
  meetsBonusRequirements = false,
  holds15Kg = false,
  tier = 'Tier 1',
  estimatedLoadSupportedGrams = null
}) {
  if (!isPositiveFinite(structureMassGrams)) {
    return { error: 'Structure mass must be a positive finite value.' };
  }
  if (loadSupportedGrams !== null && !isPositiveFinite(loadSupportedGrams)) {
    return { error: 'Load supported must be a positive finite value or null.' };
  }
  if (loadSupportedGrams !== null && loadSupportedGrams > 15000) {
    return { error: 'Load supported is capped at 15,000 g.' };
  }

  const cappedLoadSupported = loadSupportedGrams === null ? 0 : Math.min(loadSupportedGrams, 15000);
  const loadScoredBonus = meetsBonusRequirements && holds15Kg ? 7500 : 0;
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
    note: 'Score = Load Scored / Structure Mass. Bonus applies only when the 10 cm wall-contact boundary is met and 15 kg is held.'
  };
}
