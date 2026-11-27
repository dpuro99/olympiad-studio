// Pure timer logic. No rule constants or season literals live here: presets
// arrive as data from the active season.

const pad = (value) => String(value).padStart(2, '0');

function wholeSeconds(value, fallback = 0) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

/** Accepts mm:ss or a bare number of seconds; returns null for invalid input. */
export function parseDuration(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
  }
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  const clock = /^(\d{1,3}):([0-5]?\d)$/.exec(trimmed);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) return Math.floor(Number(trimmed));
  return null;
}

/** Whole-second mm:ss, or h:mm:ss for intervals an hour or longer. */
export function formatClock(totalSeconds) {
  const whole = wholeSeconds(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export function remainingSeconds(durationSeconds, elapsedSecondsValue) {
  const duration = wholeSeconds(durationSeconds);
  const elapsed = Number.isFinite(elapsedSecondsValue) ? Math.max(0, elapsedSecondsValue) : 0;
  return Math.max(0, duration - elapsed);
}

/**
 * Elapsed whole seconds from a paused accumulator plus the current run. A null
 * `startedAt` means the timer is paused, so the live slice contributes nothing.
 */
export function elapsedSeconds({ accumulatedMs = 0, startedAt = null, now = null } = {}) {
  const base = Number.isFinite(accumulatedMs) ? Math.max(0, accumulatedMs) : 0;
  const running = startedAt === null || startedAt === undefined || !Number.isFinite(now)
    ? 0
    : Math.max(0, now - startedAt);
  return Math.floor((base + running) / 1000);
}

export function normalizePreset(preset) {
  const phases = Array.isArray(preset?.phases) && preset.phases.length > 0
    ? preset.phases.map((phase) => ({
      ...phase,
      durationSeconds: wholeSeconds(phase.durationSeconds)
    }))
    : [];
  const totalSeconds = phases.length > 0
    ? phases.reduce((total, phase) => total + phase.durationSeconds, 0)
    : wholeSeconds(preset?.durationSeconds);

  return { ...preset, phases, totalSeconds };
}

export function buildPresetList(presets = []) {
  return presets.map(normalizePreset);
}

export function presetById(presets = [], id) {
  return buildPresetList(presets).find((preset) => preset.id === id) ?? null;
}

/**
 * Locate the phase containing an elapsed instant. Single-duration presets are
 * represented as one synthetic phase so the UI needs only one display path.
 */
export function phaseAtElapsed(preset, elapsedSecondsValue = 0) {
  const phases = preset?.phases?.length > 0
    ? preset.phases
    : [{
      id: preset?.id ?? 'main',
      label: preset?.label ?? 'Timer',
      durationSeconds: wholeSeconds(preset?.totalSeconds ?? preset?.durationSeconds)
    }];
  const elapsed = Number.isFinite(elapsedSecondsValue) ? Math.max(0, elapsedSecondsValue) : 0;

  let cursor = 0;
  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    const duration = wholeSeconds(phase.durationSeconds);
    if (elapsed < cursor + duration || index === phases.length - 1) {
      const intoPhase = elapsed - cursor;
      return {
        phase,
        index,
        total: phases.length,
        phaseElapsedSeconds: Math.max(0, Math.min(duration, intoPhase)),
        phaseRemainingSeconds: Math.max(0, duration - intoPhase),
        isFinal: index === phases.length - 1
      };
    }
    cursor += duration;
  }

  return null;
}
