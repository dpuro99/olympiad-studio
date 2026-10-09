const gasLawVariables = {
  boyle: ['p1', 'v1', 'p2', 'v2'],
  charles: ['v1', 't1', 'v2', 't2'],
  gayLussac: ['p1', 't1', 'p2', 't2'],
  avogadro: ['v1', 'n1', 'v2', 'n2'],
  combined: ['p1', 'v1', 't1', 'p2', 'v2', 't2'],
  ideal: ['p', 'v', 'n', 't']
};

export const GAS_LAW_DEFINITIONS = {
  boyle: {
    name: "Boyle's law",
    equation: 'P₁V₁ = P₂V₂',
    description: 'For a fixed amount of gas at constant temperature.',
    units: { p1: 'kPa', v1: 'L', p2: 'kPa', v2: 'L' }
  },
  charles: {
    name: "Charles's law",
    equation: 'V₁/T₁ = V₂/T₂',
    description: 'For a fixed amount of gas at constant pressure. Use absolute temperature.',
    units: { v1: 'L', t1: 'K', v2: 'L', t2: 'K' }
  },
  gayLussac: {
    name: "Gay-Lussac's law",
    equation: 'P₁/T₁ = P₂/T₂',
    description: 'For a fixed amount of gas at constant volume. Use absolute temperature.',
    units: { p1: 'kPa', t1: 'K', p2: 'kPa', t2: 'K' }
  },
  avogadro: {
    name: "Avogadro's law",
    equation: 'V₁/n₁ = V₂/n₂',
    description: 'For a gas at constant temperature and pressure.',
    units: { v1: 'L', n1: 'mol', v2: 'L', n2: 'mol' }
  },
  combined: {
    name: 'Combined gas law',
    equation: 'P₁V₁/T₁ = P₂V₂/T₂',
    description: 'For a fixed amount of gas. Use absolute temperature.',
    units: { p1: 'kPa', v1: 'L', t1: 'K', p2: 'kPa', v2: 'L', t2: 'K' }
  },
  ideal: {
    name: 'Ideal gas law',
    equation: 'PV = nRT',
    description: 'Use SI inputs: pressure in Pa, volume in m³, amount in mol, temperature in K. R = 8.314 Pa·m³/(mol·K).',
    units: { p: 'Pa', v: 'm³', n: 'mol', t: 'K' }
  }
};

export const GAS_VARIABLE_LABELS = {
  p1: 'Initial pressure', v1: 'Initial volume', t1: 'Initial temperature', n1: 'Initial amount',
  p2: 'Final pressure', v2: 'Final volume', t2: 'Final temperature', n2: 'Final amount',
  p: 'Pressure', v: 'Volume', n: 'Amount of gas', t: 'Temperature'
};

function validPositive(value) {
  return Number.isFinite(value) && value > 0;
}

function computeGasLaw(law, target, x) {
  const { p1, v1, t1, n1, p2, v2, t2, n2, p, v, n, t } = x;

  switch (law) {
    case 'boyle':
      if (target === 'p1') return p2 * v2 / v1;
      if (target === 'v1') return p2 * v2 / p1;
      if (target === 'p2') return p1 * v1 / v2;
      return p1 * v1 / p2;
    case 'charles':
      if (target === 'v1') return v2 * t1 / t2;
      if (target === 't1') return v1 * t2 / v2;
      if (target === 'v2') return v1 * t2 / t1;
      return v2 * t1 / v1;
    case 'gayLussac':
      if (target === 'p1') return p2 * t1 / t2;
      if (target === 't1') return p1 * t2 / p2;
      if (target === 'p2') return p1 * t2 / t1;
      return p2 * t1 / p1;
    case 'avogadro':
      if (target === 'v1') return v2 * n1 / n2;
      if (target === 'n1') return v1 * n2 / v2;
      if (target === 'v2') return v1 * n2 / n1;
      return v2 * n1 / v1;
    case 'combined': {
      if (target === 'p1') return p2 * v2 * t1 / (t2 * v1);
      if (target === 'v1') return p2 * v2 * t1 / (t2 * p1);
      if (target === 't1') return p1 * v1 * t2 / (p2 * v2);
      if (target === 'p2') return p1 * v1 * t2 / (t1 * v2);
      if (target === 'v2') return p1 * v1 * t2 / (t1 * p2);
      return p2 * v2 * t1 / (p1 * v1);
    }
    case 'ideal': {
      const gasConstant = 8.314;
      if (target === 'p') return n * gasConstant * t / v;
      if (target === 'v') return n * gasConstant * t / p;
      if (target === 'n') return p * v / (gasConstant * t);
      return p * v / (n * gasConstant);
    }
    default:
      return null;
  }
}

export function solveGasLaw({ law, target, values }) {
  const variables = gasLawVariables[law];
  if (!variables || !variables.includes(target)) {
    return { error: 'Choose a supported gas law and an unknown from that law.' };
  }

  const knownVariables = variables.filter((variable) => variable !== target);
  const numbers = {};
  for (const variable of knownVariables) {
    const value = Number(values?.[variable]);
    if (!validPositive(value)) {
      return { error: `Enter a positive value for ${GAS_VARIABLE_LABELS[variable]}.` };
    }
    numbers[variable] = value;
  }

  const result = computeGasLaw(law, target, numbers);
  if (!Number.isFinite(result) || result <= 0) {
    return { error: 'These values do not produce a positive finite result.' };
  }

  return {
    value: result,
    unit: GAS_LAW_DEFINITIONS[law].units[target],
    target,
    law,
    equation: GAS_LAW_DEFINITIONS[law].equation
  };
}

export function calculateDaltonPartialPressure({ totalPressure, knownPartialPressures }) {
  if (!validPositive(totalPressure)) {
    return { error: 'Total pressure must be a positive finite value.' };
  }
  if (!Array.isArray(knownPartialPressures) || knownPartialPressures.length === 0) {
    return { error: 'Enter at least one known partial pressure.' };
  }
  if (!knownPartialPressures.every(validPositive)) {
    return { error: 'Every known partial pressure must be a positive finite value.' };
  }

  const knownTotal = knownPartialPressures.reduce((sum, pressure) => sum + pressure, 0);
  const unknownPartialPressure = totalPressure - knownTotal;
  if (unknownPartialPressure <= 0) {
    return { error: 'Known partial pressures must sum to less than the total pressure.' };
  }

  return {
    value: unknownPartialPressure,
    knownTotal,
    totalPressure,
    unit: 'kPa',
    equation: 'P_total = ΣP_i'
  };
}

export function calculateGrahamRateRatio({ molarMass1, molarMass2 }) {
  if (!validPositive(molarMass1) || !validPositive(molarMass2)) {
    return { error: 'Both molar masses must be positive finite values.' };
  }
  return {
    rateRatio: Math.sqrt(molarMass2 / molarMass1),
    molarMass1,
    molarMass2,
    equation: 'r₁/r₂ = √(M₂/M₁)',
    unit: 'dimensionless'
  };
}
