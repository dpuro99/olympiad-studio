// Pure engine for the guided hands-on task simulator.
//
// The manual lists task types but prints no circuits, component values, fault
// models or task rubric. This module owns only universal circuit maths and
// explicitly labelled teaching conventions; season data owns the citations and
// the exact printed task wording. Nothing here is an official event procedure.

// Teaching component set (a common E12-style selection), not a rule-published list.
export const TEACHING_RESISTORS = Object.freeze([100, 220, 330, 470, 1000, 1500, 2200]);
export const TEACHING_SUPPLIES = Object.freeze([5, 9, 12]);
export const SWITCH_TRAVELERS = Object.freeze(['upper', 'lower']);

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

// --- Mystery resistor (manual §3.c.i) -------------------------------------

export function generateMysteryCase(seed) {
  const random = mulberry32(seed);
  const supply = pick(random, TEACHING_SUPPLIES);
  const known = pick(random, TEACHING_RESISTORS);
  const unknown = pick(random, TEACHING_RESISTORS.filter((value) => value !== known));
  const current = supply / (known + unknown);
  return {
    seed,
    supply,
    known,
    unknown,
    // An ideal simulated meter: no accuracy spec exists in the manual, so the
    // reading is the exact divider value rounded for display only.
    readings: {
      known: round(current * known),
      unknown: round(current * unknown)
    }
  };
}

export function gradeMystery(caseData, probes, answer) {
  const useful = probes.includes('known') || probes.includes('unknown');
  const entered = answer === '' || answer === null || answer === undefined ? NaN : Number(answer);
  const tolerance = Math.max(1, caseData.unknown * 0.01);
  const correct = useful && Number.isFinite(entered) && Math.abs(entered - caseData.unknown) <= tolerance;

  let derivation = 'Measure across the known resistor or the mystery resistor to get a voltage, then use the divider relationship.';
  if (probes.includes('known')) {
    const current = caseData.readings.known / caseData.known;
    const unknownVoltage = caseData.supply - caseData.readings.known;
    derivation = `I = V(known) ÷ R(known) = ${caseData.readings.known} ÷ ${caseData.known} = ${round(current)} A; V(mystery) = ${caseData.supply} − ${caseData.readings.known} = ${round(unknownVoltage)} V; R(mystery) = V(mystery) ÷ I.`;
  } else if (probes.includes('unknown')) {
    const knownVoltage = caseData.supply - caseData.readings.unknown;
    const current = knownVoltage / caseData.known;
    derivation = `V(known) = ${caseData.supply} − ${caseData.readings.unknown} = ${round(knownVoltage)} V; I = V(known) ÷ R(known) = ${round(current)} A; R(mystery) = ${caseData.readings.unknown} ÷ I.`;
  }

  return {
    correct,
    useful,
    expected: caseData.unknown,
    tolerance,
    derivation,
    feedback: !useful
      ? 'No voltage was measured across a resistor, so the divider cannot be solved yet.'
      : !Number.isFinite(entered)
        ? 'Enter the resistance you worked out.'
        : correct
          ? 'Your value matches the simulated resistor within the stated rounding tolerance.'
          : `Not yet — the simulated resistor is reported on check with the derivation.`
  };
}

// --- SPDT three-way switch (manual §3.c.vii) -------------------------------

export function generateSwitchCase(seed) {
  const random = mulberry32(seed);
  return {
    seed,
    // Stated wiring convention: the lamp is lit when both SPDT commons select
    // the same traveler. The manual names the task but prints no wiring diagram.
    positions: {
      a: pick(random, SWITCH_TRAVELERS),
      b: pick(random, SWITCH_TRAVELERS)
    }
  };
}

export function lampIsLit(positions) {
  return positions.a === positions.b;
}

export function toggleSwitch(positions, which) {
  if (which !== 'a' && which !== 'b') throw new Error(`Unknown switch ${which}`);
  return {
    ...positions,
    [which]: positions[which] === 'upper' ? 'lower' : 'upper'
  };
}

/**
 * Derive the three guided milestones from the recorded toggles. The first lit
 * state must be followed by turning the lamp off with the *other* switch, then
 * back on with the original one — the defining behaviour of a three-way pair.
 */
export function evaluateSwitchRun(log) {
  const firstLit = log.findIndex((entry) => entry.lit);
  const lit = firstLit >= 0;
  let offWithOther = false;
  let backOnWithFirst = false;
  if (lit) {
    for (let index = firstLit + 1; index < log.length; index += 1) {
      const current = log[index];
      const previous = log[index - 1];
      if (current.switch === previous.switch) continue;
      if (!offWithOther && !current.lit) offWithOther = true;
      else if (offWithOther && current.lit) backOnWithFirst = true;
    }
  }
  return {
    lit,
    offWithOther,
    backOnWithFirst,
    complete: lit && offWithOther && backOnWithFirst
  };
}

// --- Fault finding (manual §3.c.vi) ----------------------------------------

export function generateFaultCase(seed) {
  const random = mulberry32(seed);
  const resistors = Object.fromEntries(
    ['r1', 'r2', 'r3'].map((id) => [id, pick(random, TEACHING_RESISTORS)])
  );
  const location = pick(random, ['r1', 'r2', 'r3']);
  return {
    seed,
    supply: pick(random, TEACHING_SUPPLIES),
    resistors,
    fault: { at: location, type: pick(random, ['open', 'short']) }
  };
}

export function simulateFaultVoltages(caseData) {
  const ids = ['r1', 'r2', 'r3'];
  const { supply, resistors, fault } = caseData;
  const readings = {};
  if (fault.type === 'open') {
    // An ideal open breaks the loop: all supply voltage appears across it.
    for (const id of ids) readings[id] = id === fault.at ? supply : 0;
    return readings;
  }
  const remaining = ids.filter((id) => id !== fault.at);
  const total = remaining.reduce((sum, id) => sum + resistors[id], 0);
  const current = supply / total;
  for (const id of ids) readings[id] = id === fault.at ? 0 : round(current * resistors[id]);
  return readings;
}

export function gradeFault(caseData, probes, answer) {
  const probedFault = probes.includes(caseData.fault.at);
  const located = answer.at === caseData.fault.at;
  const typed = answer.type === caseData.fault.type;
  return {
    correct: probedFault && located && typed,
    probedFault,
    located,
    typed,
    feedback: !probedFault
      ? 'Measure across the faulty part before naming it — the other readings alone cannot identify it.'
      : !located
        ? 'The readings point to a different component. Compare a zero reading with the supply voltage reading.'
        : !typed
          ? 'The location is right; decide whether the component reads the full supply (open) or zero (shorted).'
          : 'Correct — the probed voltage pattern matches the simulated fault.'
  };
}
