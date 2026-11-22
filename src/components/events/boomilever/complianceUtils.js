// Pure engine for the Boomilever construction self-check.
// Rule copy, numeric limits and citations arrive from season data; this module
// owns only the status shapes and the derived comparisons. It never assigns an
// official score or pretends to be an Event Supervisor ruling.

export const VERDICTS = Object.freeze(['pass', 'fail', 'unset']);

export function createEmptyWorksheet(baseOption = 'standard') {
  return {
    baseOption,
    chainDistanceCm: '',
    chainOffsetCm: '',
    contactDepthCm: '',
    holds15kg: null,
    checks: {}
  };
}

export function setCheckValue(worksheet, id, value) {
  if (value !== null && value !== true && value !== false) {
    throw new Error(`Unknown check value for ${id}`);
  }
  return { ...worksheet, checks: { ...worksheet.checks, [id]: value } };
}

export function setField(worksheet, key, value) {
  return { ...worksheet, [key]: value };
}

function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inRange(value, min, max) {
  if (value === null) return 'unset';
  if (min !== undefined && value < min) return 'fail';
  if (max !== undefined && value > max) return 'fail';
  return 'pass';
}

function checkVerdict(value) {
  if (value === true) return 'pass';
  if (value === false) return 'fail';
  return 'unset';
}

/**
 * Derive every displayed result from the entered values. `compliance` is the
 * season-data object (numeric rules, boolean checks, consequence copy).
 */
export function evaluateWorksheet(worksheet, compliance) {
  const chainDistance = parseNumber(worksheet.chainDistanceCm);
  const chainOffset = parseNumber(worksheet.chainOffsetCm);
  const contactDepth = parseNumber(worksheet.contactDepthCm);

  const numeric = compliance.numeric.map((rule) => {
    // The contact-depth row is informational here; the tier/bonus panels below
    // carry its rule-specific consequences.
    const derived = (() => {
      if (rule.id === 'chainDistance') {
        return { value: chainDistance, status: inRange(chainDistance, rule.min, rule.max) };
      }
      if (rule.id === 'chainOffset') {
        const value = chainOffset === null ? null : Math.abs(chainOffset);
        return { value, status: inRange(value, undefined, rule.max) };
      }
      return { value: contactDepth, status: contactDepth === null ? 'unset' : 'pass' };
    })();
    return { ...rule, ...derived };
  });

  const checks = compliance.checks.map((check) => ({
    ...check,
    status: checkVerdict(worksheet.checks[check.id])
  }));

  const depthRule = compliance.numeric.find((rule) => rule.id === 'contactDepth');
  const tierLine = depthRule ? depthRule.tierLineCm : 15;
  const bonusLine = depthRule ? depthRule.bonusLineCm : 10;

  let tier = { status: 'unset', label: 'Not measured', detail: 'Enter the deepest wall contact to see the contact-depth consequence.' };
  if (contactDepth !== null) {
    tier = contactDepth >= tierLine
      ? { status: 'fail', label: 'Tier 2 trigger', detail: compliance.consequences.tier2 }
      : { status: 'pass', label: 'No contact-depth Tier 2 trigger', detail: 'The deepest contact is above the 15 cm line (§3.h.i).' };
  }

  let bonus = null;
  if (worksheet.baseOption === 'bonus') {
    if (contactDepth === null || worksheet.holds15kg === null) {
      bonus = { status: 'unset', label: 'Not enough information', detail: 'Enter the wall contact depth and whether 15 kg was held.' };
    } else if (contactDepth >= bonusLine) {
      bonus = { status: 'fail', label: 'Bonus not earned — scored under §3.h', detail: compliance.consequences.bonusFallback };
    } else if (worksheet.holds15kg === false) {
      bonus = { status: 'fail', label: 'Bonus not earned — 15 kg not held', detail: compliance.consequences.holdKg };
    } else {
      bonus = { status: 'pass', label: 'Bonus requirements recorded', detail: 'Contact is above the 10 cm line and 15 kg was held (§3.i).' };
    }
  }

  const items = [...numeric.filter((row) => row.id !== 'contactDepth'), ...checks];
  const counts = { pass: 0, fail: 0, unset: 0 };
  const attention = [];
  for (const item of items) {
    counts[item.status] += 1;
    if (item.status !== 'pass') attention.push(item.label);
  }

  return {
    numeric,
    checks,
    tier,
    bonus,
    summary: {
      total: items.length,
      ...counts,
      ready: counts.fail === 0 && counts.unset === 0,
      attention
    }
  };
}
