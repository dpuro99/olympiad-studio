// Dynamic Planet — quantitative freshwater toolbox.
//
// Pure functions only (no React, no DOM). The calculators take SI values and
// return SI values; unit conversion is a separate, testable layer so a student
// can enter a measurement in the unit they actually measured it in. Manual
// sections and the basis for each relationship live in
// src/seasons/<year>/dynamicplanet.js — nothing here is season-bound.

// Unit → factor to convert that unit into the SI base unit of its dimension.
// `yr` is the Julian year (365.25 days), stated in the UI footnote.
const UNIT_FACTORS = Object.freeze({
  length: Object.freeze({ m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, mi: 1609.344 }),
  area: Object.freeze({ 'm²': 1, 'km²': 1e6, ha: 1e4, 'ft²': 0.09290304, acre: 4046.8564224 }),
  volume: Object.freeze({
    'm³': 1,
    L: 0.001,
    'km³': 1e9,
    'ft³': 0.028316846592,
    'acre-ft': 1233.48183754752
  }),
  time: Object.freeze({ s: 1, min: 60, h: 3600, day: 86400, yr: 31557600 }),
  velocity: Object.freeze({ 'm/s': 1, 'cm/s': 0.01, 'mm/s': 0.001, 'ft/s': 0.3048, 'm/day': 1 / 86400 }),
  conductivity: Object.freeze({ 'm/s': 1, 'cm/s': 0.01, 'm/day': 1 / 86400, 'ft/day': 0.3048 / 86400 })
});

/** Units offered for a dimension, in display order. */
export function unitOptions(dimension) {
  const table = UNIT_FACTORS[dimension];
  if (!table) throw new Error(`Unknown unit dimension: ${dimension}`);
  return Object.keys(table);
}

function unitFactor(dimension, unit) {
  const table = UNIT_FACTORS[dimension];
  if (!table) throw new Error(`Unknown unit dimension: ${dimension}`);
  const factor = table[unit];
  if (!Number.isFinite(factor)) throw new Error(`Unknown ${dimension} unit: ${unit}`);
  return factor;
}

/** Convert a value in `unit` of `dimension` into that dimension's SI base unit. */
export function toSI(value, unit, dimension) {
  return Number(value) * unitFactor(dimension, unit);
}

/** Convert an SI value back into `unit` of `dimension`. */
export function fromSI(value, unit, dimension) {
  return Number(value) / unitFactor(dimension, unit);
}

/**
 * Format a measurement with a bounded number of significant figures. Very
 * small and very large magnitudes fall back to exponential notation so
 * hydraulic conductivities and discharges stay readable.
 */
export function formatMeasurement(value, significant = 4) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude >= 1e6 || magnitude < 1e-4) return value.toExponential(2);
  return String(Number(value.toPrecision(significant)));
}

function positive(value) {
  return Number.isFinite(value) && value > 0;
}

function nonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

// Common textbook channel-pattern bands. These are descriptive conventions,
// not Science Olympiad scoring rules.
export const SINUOSITY_BANDS = Object.freeze([
  { max: 1.05, label: 'Straight' },
  { max: 1.5, label: 'Sinuous' },
  { max: Infinity, label: 'Meandering' }
]);

export function classifySinuosity(sinuosity) {
  return SINUOSITY_BANDS.find((band) => sinuosity < band.max).label;
}

/**
 * Sinuosity: channel (thalweg) length ÷ valley-axis length. The manual asks for
 * the calculation in §3.d.i; the ratio is the standard definition.
 */
export function calculateSinuosity({ channelLengthM, valleyLengthM }) {
  if (!positive(channelLengthM)) {
    return { error: 'Channel length must be a positive finite value.' };
  }
  if (!positive(valleyLengthM)) {
    return { error: 'Valley length must be a positive finite value.' };
  }
  const sinuosity = channelLengthM / valleyLengthM;
  return {
    sinuosity,
    classification: classifySinuosity(sinuosity),
    percentLonger: (sinuosity - 1) * 100,
    channelLengthM,
    valleyLengthM,
    equation: 'S = channel length ÷ valley length',
    // A channel cannot be shorter than its valley axis. Report it rather than
    // silently accepting swapped inputs.
    warning: sinuosity < 1
      ? 'Sinuosity below 1 means the channel is shorter than the valley axis; check whether the two lengths were swapped.'
      : null
  };
}

/**
 * Hydraulic gradient: head change ÷ flow-path length (dimensionless, m/m).
 * Named in §3.g.iii alongside groundwater flow.
 */
export function calculateHydraulicGradient({ headChangeM, flowPathM }) {
  if (!Number.isFinite(headChangeM)) {
    return { error: 'Head change must be a finite value.' };
  }
  if (!positive(flowPathM)) {
    return { error: 'Flow-path length must be a positive finite value.' };
  }
  const gradient = headChangeM / flowPathM;
  return {
    gradient,
    percent: gradient * 100,
    magnitude: Math.abs(gradient),
    headChangeM,
    flowPathM,
    equation: 'i = Δh ÷ L'
  };
}

/**
 * Darcy's law: specific discharge q = K·i, total discharge Q = q·A, and (when a
 * porosity is supplied) seepage velocity v = q ÷ n. Named in §3.g.iii.
 */
export function calculateDarcyFlow({ conductivityMps, areaM2, headChangeM, flowPathM, porosity }) {
  const gradient = calculateHydraulicGradient({ headChangeM, flowPathM });
  if (gradient.error) return gradient;
  if (!nonNegative(conductivityMps)) {
    return { error: 'Hydraulic conductivity must be a finite, non-negative value.' };
  }
  if (!positive(areaM2)) {
    return { error: 'Cross-sectional area must be a positive finite value.' };
  }
  const hasPorosity = porosity !== null && porosity !== undefined && porosity !== '';
  if (hasPorosity && (!Number.isFinite(Number(porosity)) || Number(porosity) <= 0 || Number(porosity) > 1)) {
    return { error: 'Porosity must be greater than 0 and no more than 1 (a fraction, not a percentage).' };
  }

  const specificDischargeMps = conductivityMps * gradient.gradient;
  const dischargeM3PerSec = specificDischargeMps * areaM2;
  return {
    gradient: gradient.gradient,
    specificDischargeMps,
    dischargeM3PerSec,
    seepageVelocityMps: hasPorosity ? specificDischargeMps / Number(porosity) : null,
    porosity: hasPorosity ? Number(porosity) : null,
    conductivityMps,
    areaM2,
    equation: 'q = K · (Δh ÷ L), Q = q · A, v = q ÷ n'
  };
}

/**
 * Residence time: storage volume ÷ throughput. Named in §3.a.ii ("storage
 * reservoirs, residence times, and water budgets"). Throughput must be a
 * volume per unit time.
 */
export function calculateResidenceTime({ storageM3, throughputM3PerSec }) {
  if (!nonNegative(storageM3)) {
    return { error: 'Storage volume must be a finite, non-negative value.' };
  }
  if (!positive(throughputM3PerSec)) {
    return { error: 'Throughput must be a positive finite volume per unit time.' };
  }
  const seconds = storageM3 / throughputM3PerSec;
  return {
    seconds,
    days: seconds / 86400,
    years: seconds / 31557600,
    storageM3,
    throughputM3PerSec,
    equation: 'τ = storage ÷ throughput'
  };
}

/**
 * Flood recurrence interval: return period T = 1 ÷ annual exceedance
 * probability, plus the chance of at least one exceedance in n years. Named in
 * §3.f.iv; the manual does not print a plotting-position formula, so this is
 * the definitional relationship only — the ranking convention comes from the
 * problem statement.
 */
export function calculateFloodRecurrence({ annualExceedanceProbability, periodYears }) {
  const probability = Number(annualExceedanceProbability);
  if (!Number.isFinite(probability) || probability <= 0 || probability > 1) {
    return { error: 'Annual exceedance probability must be greater than 0 and no more than 1 (a fraction, not a percentage).' };
  }
  const years = Number(periodYears);
  if (!nonNegative(years)) {
    return { error: 'Period of interest must be a finite, non-negative number of years.' };
  }
  const returnPeriodYears = 1 / probability;
  const chanceAtLeastOnce = 1 - (1 - probability) ** years;
  return {
    returnPeriodYears,
    chanceAtLeastOnce,
    chanceAtLeastOncePercent: chanceAtLeastOnce * 100,
    annualExceedanceProbability: probability,
    periodYears: years,
    equation: 'T = 1 ÷ P,   P(at least once in n years) = 1 − (1 − P)ⁿ'
  };
}

/**
 * Manning's equation for average open-channel velocity, fed by the hydraulic
 * radius R = A ÷ wetted perimeter. The manual calls for the mathematical
 * relationships describing open-channel flow in §3.f.iii.
 */
export function calculateManningFlow({ areaM2, wettedPerimeterM, slope, roughnessN }) {
  if (!positive(areaM2)) {
    return { error: 'Cross-sectional area must be a positive finite value.' };
  }
  if (!positive(wettedPerimeterM)) {
    return { error: 'Wetted perimeter must be a positive finite value.' };
  }
  if (!nonNegative(slope)) {
    return { error: 'Channel slope must be a finite, non-negative value (m/m).' };
  }
  if (!positive(roughnessN)) {
    return { error: 'Manning roughness n must be a positive finite value.' };
  }
  const hydraulicRadiusM = areaM2 / wettedPerimeterM;
  const velocityMps = (1 / roughnessN) * hydraulicRadiusM ** (2 / 3) * Math.sqrt(slope);
  return {
    hydraulicRadiusM,
    velocityMps,
    dischargeM3PerSec: velocityMps * areaM2,
    areaM2,
    wettedPerimeterM,
    slope,
    roughnessN,
    equation: 'R = A ÷ P,  v = (1/n) · R^(2/3) · S^(1/2),  Q = A · v'
  };
}
