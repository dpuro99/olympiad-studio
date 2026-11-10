// Boomilever — 2027 Division C rule constants.
// Source: 2027 Division C Rules Manual, pp. C7–C12.
export const boomilever2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C7–C12',
  loadSupportedCapGrams: 15000,
  loadScoredBonusGrams: 7500,
  bonusHoldsKg: 15,
  baseOptions: Object.freeze([
    Object.freeze({ id: 'standard', label: '15 cm standard boundary' }),
    Object.freeze({ id: 'bonus', label: '10 cm bonus boundary' })
  ]),
  tiers: Object.freeze(['Tier 1', 'Tier 2', 'Tier 3 (participation only)']),
  scoringNote: 'Score = Load Scored / Structure Mass. Bonus applies only when the 10 cm wall-contact boundary is met and 15 kg is held.'
});
