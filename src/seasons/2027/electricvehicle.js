// Electric Vehicle — 2027 Division C rule constants.
// Source: 2027 Division C Rules Manual, pp. C26–C31 (+ official EV FAQ).
export const electricvehicle2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C26–C31',
  levels: Object.freeze([
    Object.freeze({ id: 'regional', label: 'Regional / Invitational', bottleLineM: 2 }),
    Object.freeze({ id: 'state', label: 'State', bottleLineM: 3 }),
    Object.freeze({ id: 'national', label: 'National', bottleLineM: 4 })
  ]),
  maxVehicleLengthCm: 80.0,
  maxVehicleWidthCm: 35.0,
  baseScore: 100,
  distanceVehicleMultiplier: 2,
  failedRunDistanceScore: 2500,
  bottleDistanceFallbackCm: 400,
  timeErrorRatePtPerSec: 0.5,
  bottleFullyPastLineBonus: 20,
  pusherBonusRatePtPerCm: 1.5,
  pusherReferenceOpeningCm: 35,
  competitionViolationPenalty: 150,
  constructionViolationPenalty: 300,
  nonModificationPenaltyPoints: 50,
  maxEventTimeSec: 480,
  nationalEventTimeBonusDivisor: 30,
  notImpoundedPenalty: 5000
});
