import { ACTIVE_DATA } from '../../../seasons/active.js';

const isNonNegativeNumber = (value) => Number.isFinite(value) && value >= 0;

export function calculateRunScore({
  targetTimeSec,
  runTimeSec,
  vehicleDistanceCm,
  bottleDistanceCm,
  pusherOpeningWidthCm,
  failedRun = false,
  bottlePastTarget = true,
  bottleFullyPastLine = false,
  movingBottleRequirementsMet = true,
  competitionViolation = false,
  constructionViolation = false,
  nonModificationPenalty = false,
  constants = ACTIVE_DATA.electricvehicle
}) {
  if (!isNonNegativeNumber(targetTimeSec) || !isNonNegativeNumber(pusherOpeningWidthCm)) {
    return null;
  }

  if (!failedRun && (
    !isNonNegativeNumber(runTimeSec) ||
    !isNonNegativeNumber(vehicleDistanceCm) ||
    !isNonNegativeNumber(bottleDistanceCm)
  )) {
    return null;
  }

  const actualRunTime = failedRun ? 0 : runTimeSec;
  const distanceScore = failedRun
    ? constants.failedRunDistanceScore
    : constants.distanceVehicleMultiplier * vehicleDistanceCm + (
      !bottlePastTarget || !movingBottleRequirementsMet
        ? constants.bottleDistanceFallbackCm
        : bottleDistanceCm
    );
  const timeScore = Math.abs(targetTimeSec - actualRunTime) * constants.timeErrorRatePtPerSec;
  const bottleBonus = bottleFullyPastLine ? -constants.bottleFullyPastLineBonus : 0;
  const pusherBonus = (pusherOpeningWidthCm - constants.pusherReferenceOpeningCm) * constants.pusherBonusRatePtPerCm;
  const competitionViolationPenalty = competitionViolation ? constants.competitionViolationPenalty : 0;
  const constructionViolationPenalty = constructionViolation ? constants.constructionViolationPenalty : 0;
  const nonModificationPenaltyPoints = nonModificationPenalty ? constants.nonModificationPenaltyPoints : 0;
  const unroundedScore = constants.baseScore + distanceScore + timeScore + bottleBonus + pusherBonus +
    competitionViolationPenalty + constructionViolationPenalty + nonModificationPenaltyPoints;
  const totalScore = Math.round((unroundedScore + 1e-9) * 100) / 100;

  return {
    baseScore: constants.baseScore,
    distanceScore,
    timeScore,
    bottleBonus,
    pusherBonus,
    competitionViolationPenalty,
    constructionViolationPenalty,
    nonModificationPenaltyPoints,
    totalScore
  };
}

export function calculateFinalScore({
  runScores,
  eventTimeUsedSec = ACTIVE_DATA.electricvehicle.maxEventTimeSec,
  nationalTournament = false,
  vehicleNotImpounded = false,
  constants = ACTIVE_DATA.electricvehicle
}) {
  if (!Array.isArray(runScores) || runScores.length !== 2 || !runScores.every(Number.isFinite)) {
    return null;
  }
  if (
    nationalTournament &&
    (!isNonNegativeNumber(eventTimeUsedSec) || eventTimeUsedSec > constants.maxEventTimeSec)
  ) {
    return null;
  }

  const bestRunScore = Math.min(...runScores);
  const eventTimeBonus = nationalTournament
    ? (eventTimeUsedSec - constants.maxEventTimeSec) / constants.nationalEventTimeBonusDivisor
    : 0;
  const notImpoundedPenalty = vehicleNotImpounded ? constants.notImpoundedPenalty : 0;

  return {
    bestRunScore,
    eventTimeBonus,
    notImpoundedPenalty,
    finalScore: bestRunScore + eventTimeBonus + notImpoundedPenalty
  };
}
