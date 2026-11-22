// Anatomy and Physiology — generated respiratory data practice.
//
// Pure functions only (no React, no DOM). Every case is generated from an
// integer seed, so the drawing, the numbers on screen and the accepted answers
// always agree. The relationships here are standard teaching relationships
// used to practise *reading* data; the tool labels them an educational
// simulation, not patient data and not an official Science Olympiad rule. The
// manual names the topics (lung volumes, spirometry, flow-volume loops, gas
// exchange and oxygen transport) but prints no curves, values or scoring
// formula, so none is invented here. Season citation lives in src/seasons/.

/** mulberry32 — tiny, deterministic, good enough for generated practice data. */
export function createRng(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Compare on a rounded difference so a two-decimal ratio plus its tolerance
// is not rejected by binary floating-point noise (e.g. 0.76 + 0.03).
const within = (value, expected, tolerance) =>
  Number.isFinite(value) && round(Math.abs(value - expected), 6) <= tolerance;

/** Pick a rounded value on a step grid inside [min, max]. */
function between(rng, min, max, step = 1) {
  const steps = Math.floor((max - min) / step);
  return round(min + Math.floor(rng() * (steps + 1)) * step, decimalsOf(step));
}

function decimalsOf(step) {
  return String(step).includes('.') ? String(step).split('.')[1].length : 0;
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length) % values.length];
}

// ---------------------------------------------------------------------------
// Spirometry / flow-volume loop
// ---------------------------------------------------------------------------

export const PATTERN_IDS = Object.freeze(['normal', 'obstructive', 'restrictive']);

export const PATTERN_LABELS = Object.freeze({
  normal: 'Normal',
  obstructive: 'Obstructive',
  restrictive: 'Restrictive'
});

// Teaching ranges in mL (volumes), L/min (peak flow) and unitless (FEV1/FVC).
// They describe the *generated* case only; they are not reference ranges a
// student should memorise as clinical thresholds.
const SPIRO_RANGES = Object.freeze({
  normal: Object.freeze({
    tv: [480, 600], irv: [2600, 3200], erv: [1100, 1500], rv: [1000, 1400],
    ratio: [0.76, 0.84], pef: [600, 760], loopShape: 'linear'
  }),
  obstructive: Object.freeze({
    tv: [480, 600], irv: [2300, 3000], erv: [1200, 1700], rv: [1900, 2700],
    ratio: [0.45, 0.65], pef: [300, 460], loopShape: 'scooped'
  }),
  restrictive: Object.freeze({
    tv: [350, 500], irv: [1400, 2000], erv: [600, 1000], rv: [550, 900],
    ratio: [0.80, 0.90], pef: [380, 540], loopShape: 'narrow'
  })
});

const SPIRO_REASONING = Object.freeze({
  normal:
    'FEV1 and FVC are both in proportion and FEV1/FVC is close to the usual teaching value near 0.8. ' +
    'The expiratory limb falls almost straight and RV is not raised: a normal pattern.',
  obstructive:
    'FEV1 has fallen much more than FVC, so FEV1/FVC is low. The raised RV and TLC show air trapping ' +
    'and the expiratory limb is scooped: an obstructive pattern.',
  restrictive:
    'FVC and TLC are both small, but FEV1/FVC is normal or high. The loop is narrow rather than scooped: ' +
    'a restrictive pattern.'
});

const normalizeSeed = (seed) => (Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) : 0) || 1;

/**
 * Build one reproducible spirometry case.
 * `type` forces a pattern; otherwise one is chosen from the seed.
 * An injected `rng` lets tests drive exact values.
 */
export function generateSpirometryCase({ type, seed = 1, rng } = {}) {
  const normalized = normalizeSeed(seed);
  const next = typeof rng === 'function' ? rng : createRng(normalized);
  const pattern = PATTERN_IDS.includes(type) ? type : pick(next, PATTERN_IDS);
  const range = SPIRO_RANGES[pattern];

  const tv = between(next, ...range.tv);
  const irv = between(next, ...range.irv);
  const erv = between(next, ...range.erv);
  const rv = between(next, ...range.rv);
  const tlc = tv + irv + erv + rv;
  const fvc = tv + irv + erv;
  const ratio = between(next, ...range.ratio, 0.01);
  const fev1 = round(ratio * fvc);
  const pef = between(next, ...range.pef, 5);

  return {
    kind: 'spirometry',
    seed: normalized,
    type: pattern,
    label: PATTERN_LABELS[pattern],
    loopShape: range.loopShape,
    volumes: { tv, irv, erv, rv, tlc, fvc, fev1 },
    ratio,
    pef,
    reasoning: SPIRO_REASONING[pattern]
  };
}

/** Expiratory flow (L/min) at a volume measured upward from RV. */
export function expiratoryFlow(caseData, volume) {
  const { fvc, pef, loopShape } = caseData.volumes
    ? { fvc: caseData.volumes.fvc, pef: caseData.pef, loopShape: caseData.loopShape }
    : caseData;
  const v = clamp(Number(volume) || 0, 0, fvc);
  const peakX = fvc * 0.86; // peak occurs just below TLC, as on a teaching loop
  if (v >= peakX) return round(pef * ((fvc - v) / (fvc - peakX)), 1);
  const t = (peakX - v) / peakX; // 0 at the peak, 1 at RV
  const exponent = loopShape === 'scooped' ? 2 : loopShape === 'narrow' ? 0.95 : 1.15;
  return round(pef * (1 - t) ** exponent, 1);
}

/** Inspiratory flow (L/min, negative) at a volume measured upward from RV. */
export function inspiratoryFlow(caseData, volume) {
  const fvc = caseData.volumes ? caseData.volumes.fvc : caseData.fvc;
  const pef = caseData.pef;
  const v = clamp(Number(volume) || 0, 0, fvc);
  return round(-0.55 * pef * Math.sin((Math.PI * v) / fvc), 1);
}

/** Points for the SVG loop; both limbs share the same volume axis. */
export function sampleLoop(caseData, steps = 60) {
  const fvc = caseData.volumes.fvc;
  // Include the exact apex volume so the drawn curve reaches PEF even when the
  // uniform sampling grid would step over it.
  const volumes = Array.from({ length: steps + 1 }, (_, i) => (fvc * i) / steps);
  volumes.push(fvc * 0.86);
  volumes.sort((a, b) => a - b);
  const expiratory = volumes.map((volume) => ({
    x: round(volume, 1), y: expiratoryFlow(caseData, volume)
  }));
  const inspiratory = volumes.map((volume) => ({
    x: round(volume, 1), y: inspiratoryFlow(caseData, volume)
  }));
  return { expiratory, inspiratory, fvc };
}

const FVC_TOLERANCE = 150; // mL
const RATIO_TOLERANCE = 0.03;

/** Grade a spirometry answer; grading is an explicit action in the UI. */
export function checkSpirometry(caseData, answer = {}) {
  const fvc = Number(answer.fvc);
  const ratio = Number(answer.ratio);
  const checks = {
    fvc: within(fvc, caseData.volumes.fvc, FVC_TOLERANCE),
    ratio: within(ratio, caseData.ratio, RATIO_TOLERANCE),
    pattern: answer.pattern === caseData.type
  };
  return {
    checks,
    correct: checks.fvc && checks.ratio && checks.pattern,
    expected: {
      fvc: caseData.volumes.fvc,
      ratio: caseData.ratio,
      fev1: caseData.volumes.fev1,
      pattern: caseData.type,
      patternLabel: caseData.label
    },
    tolerance: { fvc: FVC_TOLERANCE, ratio: RATIO_TOLERANCE },
    reasoning: caseData.reasoning
  };
}

// ---------------------------------------------------------------------------
// Gas exchange / oxygen-haemoglobin curve
// ---------------------------------------------------------------------------

export const SHIFT_IDS = Object.freeze(['none', 'right', 'left']);
export const SHIFT_LABELS = Object.freeze({
  none: 'No shift (reference)',
  right: 'Right shift',
  left: 'Left shift'
});

// P50 in mmHg; the standard teaching value is ~26.6. Shifts change affinity:
// a higher P50 needs a higher PO2 for the same saturation (right shift).
export const REFERENCE_P50 = 26.6;
const SHIFT_VALUES = Object.freeze({ none: REFERENCE_P50, right: 32, left: 21 });
const GAS_PO2_RANGES = Object.freeze({ none: [90, 105], right: [60, 92], left: [45, 80] });

const GAS_REASONING = Object.freeze({
  none:
    'P50 is close to the usual teaching value near 27 mmHg, so the case curve sits on the reference curve. ' +
    'Read saturation at the case PO2.',
  right:
    'P50 is above the usual teaching value: a lower affinity puts the curve to the right, so saturation is ' +
    'lower at the same PO2.',
  left:
    'P50 is below the usual teaching value: a higher affinity puts the curve to the left, so saturation is ' +
    'higher at the same PO2.'
});

/** Hill-equation saturation (%) for a PO2 and a P50, both in mmHg. */
export function oxygenSaturation(po2, p50) {
  const exponent = 2.7;
  const pressure = Math.max(0, Number(po2) || 0) ** exponent;
  const half = (Number(p50) || SHIFT_VALUES.none) ** exponent;
  return round((100 * pressure) / (pressure + half), 1);
}

export function generateGasExchangeCase({ shift, seed = 1, rng } = {}) {
  const normalized = normalizeSeed(seed);
  const next = typeof rng === 'function' ? rng : createRng(normalized);
  const direction = SHIFT_IDS.includes(shift) ? shift : pick(next, SHIFT_IDS);
  const p50 = SHIFT_VALUES[direction];
  const po2 = between(next, ...GAS_PO2_RANGES[direction]);
  return {
    kind: 'gas',
    seed: normalized,
    shift: direction,
    label: SHIFT_LABELS[direction],
    p50,
    po2,
    saturation: oxygenSaturation(po2, p50),
    referenceSaturation: oxygenSaturation(po2, REFERENCE_P50),
    reasoning: GAS_REASONING[direction]
  };
}

/** Saturation points for the case curve and the fixed reference curve. */
export function sampleOxygenCurve(p50, steps = 60) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const po2 = (120 * i) / steps;
    points.push({ x: round(po2, 1), y: oxygenSaturation(po2, p50) });
  }
  return points;
}

const SAT_TOLERANCE = 3; // percentage points

export function checkGasExchange(caseData, answer = {}) {
  const saturation = Number(answer.saturation);
  const checks = {
    saturation: within(saturation, caseData.saturation, SAT_TOLERANCE),
    shift: answer.shift === caseData.shift
  };
  return {
    checks,
    correct: checks.saturation && checks.shift,
    expected: {
      saturation: caseData.saturation,
      shift: caseData.shift,
      shiftLabel: caseData.label,
      referenceSaturation: caseData.referenceSaturation
    },
    tolerance: { saturation: SAT_TOLERANCE },
    reasoning: caseData.reasoning
  };
}
