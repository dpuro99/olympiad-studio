function isPositiveFinite(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateEquivalentResistance({ resistances }) {
  if (!Array.isArray(resistances) || resistances.length === 0) {
    return { error: 'Provide at least one resistance value.' };
  }
  if (!resistances.every(isPositiveFinite)) {
    return { error: 'Every resistance must be a positive finite value.' };
  }
  const total = resistances.reduce((sum, value) => sum + value, 0);
  return { value: total, unit: 'Ω', equation: 'R_eq = ΣR_i' };
}

export function calculateSeriesParallel({ resistances }) {
  if (!Array.isArray(resistances) || resistances.length < 2) {
    return { error: 'Provide at least two resistance values.' };
  }
  if (!resistances.every(isPositiveFinite)) {
    return { error: 'Every resistance must be a positive finite value.' };
  }
  const series = resistances.reduce((sum, value) => sum + value, 0);
  const parallel = 1 / resistances.reduce((sum, value) => sum + 1 / value, 0);
  return {
    series,
    parallel,
    seriesUnit: 'Ω',
    parallelUnit: 'Ω',
    equationSeries: 'R_eq = ΣR_i',
    equationParallel: '1/R_eq = Σ(1/R_i)'
  };
}

export function calculateOhmsLaw({ voltage, current, resistance }) {
  const hasVoltage = voltage !== '' && voltage !== null && voltage !== undefined;
  const hasCurrent = current !== '' && current !== null && current !== undefined;
  const hasResistance = resistance !== '' && resistance !== null && resistance !== undefined;
  const count = [hasVoltage, hasCurrent, hasResistance].filter(Boolean).length;

  if (count < 2) {
    return { error: 'Provide at least two of voltage, current, and resistance.' };
  }
  if (count === 3) {
    return { error: 'Provide exactly two values; the tool calculates the third.' };
  }

  const v = Number(voltage);
  const i = Number(current);
  const r = Number(resistance);

  if (count === 2) {
    if (hasVoltage && hasCurrent) {
      if (!isPositiveFinite(i)) return { error: 'Current must be positive and finite.' };
      return { value: v / i, unit: 'Ω', equation: 'R = V / I' };
    }
    if (hasVoltage && hasResistance) {
      if (!isPositiveFinite(r)) return { error: 'Resistance must be positive and finite.' };
      return { value: v / r, unit: 'A', equation: 'I = V / R' };
    }
    if (hasCurrent && hasResistance) {
      if (!isPositiveFinite(i) || !isPositiveFinite(r)) return { error: 'Current and resistance must be positive and finite.' };
      return { value: i * r, unit: 'V', equation: 'V = I × R' };
    }
  }

  return { error: 'Unexpected input combination.' };
}
