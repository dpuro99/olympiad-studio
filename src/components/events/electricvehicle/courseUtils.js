// Geometry and pacing helpers for the Electric Vehicle Course & Geometry tool.
//
// Manual basis: 2027 Division C Rules Manual, pp. C26–C31 (+ official EV FAQ).
// Run scoring is delegated to the verified scoreUtils.calculateRunScore so this
// tool and the Score Calculator can never drift apart. Anything that depends on
// a uniform-speed assumption rather than a manual rule is returned separately
// and must be labelled as an assumption in the UI.

import { calculateRunScore } from './scoreUtils.js';

// Bottle-line distances announced by level (manual pp. C26–C31).
export const LEVELS = [
  { id: 'regional', label: 'Regional / Invitational', bottleLineM: 2 },
  { id: 'state', label: 'State', bottleLineM: 3 },
  { id: 'national', label: 'National', bottleLineM: 4 }
];

// Construction limits (manual pp. C26–C31).
export const MAX_VEHICLE_LENGTH_CM = 80.0;
export const MAX_VEHICLE_WIDTH_CM = 35.0;
export const PUSHER_BONUS_RATE_PT_PER_CM = 1.5;

export function levelById(levelId) {
  return LEVELS.find((level) => level.id === levelId) || LEVELS[0];
}

export function metresPerSecondToKmh(metresPerSecond) {
  if (!Number.isFinite(metresPerSecond)) return null;
  return metresPerSecond * 3.6;
}

// Average speed needed to cover `distanceM` in `timeSec`, assuming a constant
// speed. Educational only: the manual does not require the vehicle to hold a
// constant speed, so this is a planning aid, not a rule.
export function averageSpeed(distanceM, timeSec) {
  if (!Number.isFinite(distanceM) || !Number.isFinite(timeSec) || distanceM < 0 || timeSec <= 0) {
    return null;
  }
  return distanceM / timeSec;
}

// Score for one scenario at one specific run time. Only the time term depends
// on run time, which is what makes the sweep chart meaningful.
export function runScoreFor(runTimeSec, {
  targetTimeSec,
  vehicleDistanceCm,
  bottleDistanceCm,
  pusherOpeningWidthCm,
  bottleFullyPastLine = false
}) {
  return calculateRunScore({
    targetTimeSec,
    runTimeSec,
    vehicleDistanceCm,
    bottleDistanceCm,
    pusherOpeningWidthCm,
    bottlePastTarget: true,
    bottleFullyPastLine,
    movingBottleRequirementsMet: true,
    competitionViolation: false,
    constructionViolation: false,
    nonModificationPenalty: false
  });
}

// Sweep the run time around a centre to show how the score changes with timing
// error. Returns [{ runTimeSec, totalScore }]; [] when the inputs are unusable.
export function scoreSweep({
  targetTimeSec,
  vehicleDistanceCm,
  bottleDistanceCm,
  pusherOpeningWidthCm,
  bottleFullyPastLine = false,
  centreRunTimeSec,
  windowSec = 2,
  steps = 21
}) {
  if (
    !Number.isFinite(centreRunTimeSec) || !Number.isFinite(windowSec) || windowSec <= 0 ||
    !Number.isFinite(steps) || steps < 2
  ) {
    return [];
  }
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const runTimeSec = centreRunTimeSec - windowSec + (2 * windowSec * index) / steps;
    if (runTimeSec < 0) continue;
    const score = runScoreFor(runTimeSec, { targetTimeSec, vehicleDistanceCm, bottleDistanceCm, pusherOpeningWidthCm, bottleFullyPastLine });
    if (!score) continue;
    points.push({ runTimeSec: Number(runTimeSec.toPrecision(6)), totalScore: score.totalScore });
  }
  return points;
}

// One scenario summary for the diagram and the live readouts.
export function summarizeCourse({
  levelId = 'regional',
  bottleLineM,
  targetTimeSec,
  runTimeSec,
  vehicleDistanceCm,
  bottleDistanceCm,
  pusherOpeningWidthCm,
  bottleFullyPastLine = false
}) {
  const level = levelById(levelId);
  const line = Number(bottleLineM);
  const lineM = Number.isFinite(line) && line > 0 ? line : level.bottleLineM;
  const runScore = runScoreFor(runTimeSec, { targetTimeSec, vehicleDistanceCm, bottleDistanceCm, pusherOpeningWidthCm, bottleFullyPastLine });
  const requiredSpeedMps = averageSpeed(lineM, targetTimeSec);
  const timeErrorSec = Number.isFinite(targetTimeSec) && Number.isFinite(runTimeSec)
    ? Math.abs(targetTimeSec - runTimeSec)
    : null;

  return {
    levelId: level.id,
    levelLabel: level.label,
    bottleLineM: lineM,
    requiredSpeedMps,
    requiredSpeedKmh: metresPerSecondToKmh(requiredSpeedMps),
    timeErrorSec,
    runScore
  };
}
