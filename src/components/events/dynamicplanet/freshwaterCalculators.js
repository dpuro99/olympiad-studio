function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

export function calculateStreamDischarge({ crossSectionAreaM2, averageVelocityMps }) {
  if (!Number.isFinite(crossSectionAreaM2) || crossSectionAreaM2 <= 0) {
    return { error: 'Cross-sectional area must be a positive finite value.' };
  }
  if (!finiteNonNegative(averageVelocityMps)) {
    return { error: 'Average velocity must be a finite, non-negative value.' };
  }

  return {
    dischargeM3PerSec: crossSectionAreaM2 * averageVelocityMps,
    crossSectionAreaM2,
    averageVelocityMps,
    equation: 'Q = A × v',
    unit: 'm³/s'
  };
}

function sumFlows(flows, label) {
  if (!Array.isArray(flows) || !flows.every(finiteNonNegative)) {
    return { error: `${label} flows must be a list of finite, non-negative measurements.` };
  }
  return { total: flows.reduce((sum, value) => sum + value, 0) };
}

export function calculateWaterBudgetChange({ inflows, outflows, volumeUnit }) {
  if (typeof volumeUnit !== 'string' || !volumeUnit.trim()) {
    return { error: 'Enter the volume unit used for all flows.' };
  }
  const inputTotal = sumFlows(inflows, 'Inflow');
  if (inputTotal.error) return inputTotal;
  const outputTotal = sumFlows(outflows, 'Outflow');
  if (outputTotal.error) return outputTotal;

  const netChange = inputTotal.total - outputTotal.total;
  return {
    totalInflow: inputTotal.total,
    totalOutflow: outputTotal.total,
    netChange,
    volumeUnit: volumeUnit.trim(),
    interpretation: netChange > 0 ? 'net addition' : netChange < 0 ? 'net loss' : 'balanced inputs and outputs'
  };
}
