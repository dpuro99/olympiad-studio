// Circuit Lab — LED series resistor / silicon PN-junction helper.
//
// Pure functions only (no React, no DOM). The manual's written scope names
// "silicon PN-junction devices including diodes/LEDs" (Division C Rules
// Manual, pp. C16–C17) but prints no forward-drop table, resistor series or
// design-margin convention. The numbers below are therefore standard teaching
// assumptions and common engineering practice, explicitly labelled as such in
// the UI — never presented as official event values. Season citation lives in
// src/seasons/ and the registry; this engine holds no season-bound constants.

/** Preferred number series used to pick a real resistor at or above the target. */
export const E12_BASE = Object.freeze([10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]);

/** Common through-hole resistor power ratings, in watts. */
export const RESISTOR_RATINGS_W = Object.freeze([0.125, 0.25, 0.5, 1, 2]);

/**
 * Typical LED forward voltages at about 20 mA. These are device-physics
 * teaching values, not manual data; the ranges exist only to sanity-check the
 * student's stated assumption.
 */
export const LED_VF_PRESETS = Object.freeze([
  Object.freeze({ id: 'infrared', label: 'Infrared', vf: 1.2, range: Object.freeze([1.1, 1.4]) }),
  Object.freeze({ id: 'red', label: 'Red', vf: 1.8, range: Object.freeze([1.6, 2.0]) }),
  Object.freeze({ id: 'amber', label: 'Amber / yellow', vf: 2.0, range: Object.freeze([1.8, 2.2]) }),
  Object.freeze({ id: 'green', label: 'Green (standard)', vf: 2.0, range: Object.freeze([1.8, 2.4]) }),
  Object.freeze({ id: 'blue', label: 'Blue', vf: 3.0, range: Object.freeze([2.8, 3.4]) }),
  Object.freeze({ id: 'white', label: 'White', vf: 3.2, range: Object.freeze([3.0, 3.6]) })
]);

const round = (value, decimals = 6) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Smallest E12 value at or above `resistance`, scaled across decades. */
export function nearestE12AtLeast(resistance) {
  if (!Number.isFinite(resistance) || resistance <= 0) return null;
  let scale = 1;
  while (resistance / scale > 82) scale *= 10;
  while (resistance / scale < 10) scale /= 10;
  const base = resistance / scale;
  const found = E12_BASE.find((value) => value >= base - 1e-9);
  const chosen = found === undefined ? 10 * scale * 10 : found * scale;
  return { value: round(chosen), series: 'E12' };
}

/** A common design margin — never an official event rule. */
export function recommendPowerRating(resistorPower) {
  if (!Number.isFinite(resistorPower) || resistorPower <= 0) return null;
  const needed = resistorPower * 2;
  return RESISTOR_RATINGS_W.find((watts) => watts >= needed) ?? null;
}

/**
 * Size the series resistor for one LED driven from a DC supply.
 * Target current is entered in mA; resistance comes back in ohms.
 */
export function calculateLedSeries({ supplyVoltage, forwardVoltage, targetCurrentMa }) {
  const supply = Number(supplyVoltage);
  const vf = Number(forwardVoltage);
  const currentMa = Number(targetCurrentMa);

  if (String(supplyVoltage).trim() === '' || !Number.isFinite(supply) || supply <= 0) {
    return { error: 'Supply voltage must be a positive number.' };
  }
  if (String(forwardVoltage).trim() === '' || !Number.isFinite(vf) || vf < 0) {
    return { error: 'Forward voltage must be zero or a positive number.' };
  }
  if (String(targetCurrentMa).trim() === '' || !Number.isFinite(currentMa) || currentMa <= 0) {
    return { error: 'Target current must be a positive number.' };
  }
  if (vf >= supply) {
    return { error: 'Supply voltage must exceed the LED forward voltage for current to flow.' };
  }

  const currentA = currentMa / 1000;
  const resistorVoltage = supply - vf;
  const resistance = resistorVoltage / currentA;
  const resistorPower = resistorVoltage * currentA;
  const standard = nearestE12AtLeast(resistance);
  const actualCurrentMa = standard ? (resistorVoltage / standard.value) * 1000 : null;
  const actualResistorPower = standard ? (resistorVoltage ** 2) / standard.value : null;

  return {
    supply,
    vf,
    currentMa,
    resistorVoltage,
    resistance: round(resistance),
    resistorPower: round(resistorPower, 4),
    ledPower: round(vf * currentA, 4),
    supplyPower: round(supply * currentA, 4),
    standard,
    actualCurrentMa: actualCurrentMa === null ? null : round(actualCurrentMa, 2),
    actualResistorPower: actualResistorPower === null ? null : round(actualResistorPower, 4),
    recommendedRatingW: recommendPowerRating(resistorPower),
    equations: {
      resistance: 'R = (Vsupply − Vf) ÷ I',
      power: 'P = I² × R = (Vsupply − Vf) × I'
    }
  };
}

/**
 * Ideal-model orientation verdict for a diode / LED. Reverse breakdown and
 * real leakage are outside the listed device scope and are not modelled.
 */
export function checkOrientation(orientation, circuit) {
  if (orientation === 'reverse') {
    return {
      state: 'blocked',
      message: 'Reverse-biased: in the ideal model the device blocks current, so the LED stays dark. Real diodes also have a reverse breakdown rating, which this tool does not model.'
    };
  }
  if (orientation !== 'forward') {
    return { state: 'unknown', message: 'Choose the device orientation to check it.' };
  }
  // The calculator reports a supply that cannot exceed the forward drop as an
  // error, so a valid circuit here always has enough voltage to conduct.
  if (!circuit || circuit.error) {
    return { state: 'unknown', message: 'Enter valid circuit values to check orientation.' };
  }
  return {
    state: 'conducts',
    message: 'Forward-biased with enough voltage: current is set by the series resistor, not by the LED.'
  };
}

/** Sanity-check a stated forward drop against the selected teaching preset. */
export function checkForwardDrop(presetId, forwardVoltage) {
  const preset = LED_VF_PRESETS.find((entry) => entry.id === presetId);
  const vf = Number(forwardVoltage);
  if (!preset || String(forwardVoltage).trim() === '' || !Number.isFinite(vf)) return null;
  const [min, max] = preset.range;
  if (vf >= min && vf <= max) {
    return {
      tone: 'ok',
      message: `${vf} V is consistent with the typical ${preset.label} drop.`
    };
  }
  return {
    tone: 'warn',
    message: `${vf} V is outside the typical ${preset.label} range (${min.toFixed(1)}–${max.toFixed(1)} V). Check the assumption before trusting the resistor value.`
  };
}
