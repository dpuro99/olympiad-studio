export const RATE_FACTORS = [
  { id: 'temperature', label: 'Temperature' },
  { id: 'concentration', label: 'Concentration' },
  { id: 'particle-size', label: 'Particle size' },
  { id: 'catalyst', label: 'Catalyst' }
];

export function calculateObservedRate({ measurementType, initialValue, finalValue, elapsedTime }) {
  if (!['reactant-consumed', 'product-formed'].includes(measurementType)) {
    return { error: 'Choose whether the measured quantity is reactant consumed or product formed.' };
  }
  if (![initialValue, finalValue].every((value) => Number.isFinite(value) && value >= 0)) {
    return { error: 'Initial and final measurements must be finite, non-negative values.' };
  }
  if (!Number.isFinite(elapsedTime) || elapsedTime <= 0) {
    return { error: 'Elapsed time must be a positive finite value.' };
  }

  const change = measurementType === 'reactant-consumed'
    ? initialValue - finalValue
    : finalValue - initialValue;
  if (change < 0) {
    return {
      error: measurementType === 'reactant-consumed'
        ? 'A consumed reactant should not have a larger final amount than initial amount.'
        : 'A formed product should not have a smaller final amount than initial amount.'
    };
  }

  return {
    change,
    rate: change / elapsedTime,
    measurementType
  };
}
