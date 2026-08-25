export function calculatePracticeScore({
  distanceFromTarget,
  targetTime,
  runTime,
  hasCans,
  successCan,
  insideCanDist,
  penalties
}) {
  const distanceScore = distanceFromTarget * 2;
  const timeScore = Math.abs(runTime - targetTime);
  const canBonus = hasCans && successCan ? -0.5 * (110 - insideCanDist) : 0;
  const totalScore = 100 + distanceScore + timeScore + penalties + canBonus;

  return { baseScore: 100, distanceScore, timeScore, canBonus, totalScore };
}
