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
  nonModificationPenalty = false
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
    ? 2500
    : 2 * vehicleDistanceCm + (
      !bottlePastTarget || !movingBottleRequirementsMet
        ? 400
        : bottleDistanceCm
    );
  const timeScore = Math.abs(targetTimeSec - actualRunTime) * 0.5;
  const bottleBonus = bottleFullyPastLine ? -20 : 0;
  const pusherBonus = (pusherOpeningWidthCm - 35) * 1.5;
  const competitionViolationPenalty = competitionViolation ? 150 : 0;
  const constructionViolationPenalty = constructionViolation ? 300 : 0;
  const nonModificationPenaltyPoints = nonModificationPenalty ? 50 : 0;
  const unroundedScore = 100 + distanceScore + timeScore + bottleBonus + pusherBonus +
    competitionViolationPenalty + constructionViolationPenalty + nonModificationPenaltyPoints;
  const totalScore = Math.round((unroundedScore + 1e-9) * 100) / 100;

  return {
    baseScore: 100,
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

export function calculateFinalScore({ runScores, eventTimeUsedSec = 480, nationalTournament = false, vehicleNotImpounded = false }) {
  if (!Array.isArray(runScores) || runScores.length !== 2 || !runScores.every(Number.isFinite)) {
    return null;
  }
  if (nationalTournament && (!isNonNegativeNumber(eventTimeUsedSec) || eventTimeUsedSec > 480)) return null;

  const bestRunScore = Math.min(...runScores);
  const eventTimeBonus = nationalTournament ? (eventTimeUsedSec - 480) / 30 : 0;
  const notImpoundedPenalty = vehicleNotImpounded ? 5000 : 0;

  return {
    bestRunScore,
    eventTimeBonus,
    notImpoundedPenalty,
    finalScore: bestRunScore + eventTimeBonus + notImpoundedPenalty
  };
}
