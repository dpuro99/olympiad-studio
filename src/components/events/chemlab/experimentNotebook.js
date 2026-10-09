import { calculateObservedRate, RATE_FACTORS } from './kinetics.js';

export const EXPERIMENT_STORAGE_KEY = 'olympiad-studio-chemlab-kinetics-v1';

export function createEmptyExperiment() {
  return {
    factorId: 'temperature',
    factorUnit: '',
    measurementType: 'reactant-consumed',
    quantityUnit: '',
    timeUnit: 's',
    controls: '',
    conclusion: '',
    trials: [createEmptyTrial(1), createEmptyTrial(2)]
  };
}

export function createEmptyTrial(id) {
  return { id, condition: '', initialValue: '', finalValue: '', elapsedTime: '' };
}

export function parseSavedExperiment(serialized) {
  try {
    const data = JSON.parse(serialized);
    const knownFactor = RATE_FACTORS.some((factor) => factor.id === data?.factorId);
    const validType = ['reactant-consumed', 'product-formed'].includes(data?.measurementType);
    if (!data || !knownFactor || !validType || !Array.isArray(data.trials)) {
      return { error: 'Saved notebook data has an unsupported format.' };
    }
    return {
      value: {
        ...createEmptyExperiment(),
        ...data,
        trials: data.trials.map((trial, index) => ({
          ...createEmptyTrial(index + 1),
          ...trial,
          id: index + 1
        }))
      }
    };
  } catch {
    return { error: 'Saved notebook data could not be read.' };
  }
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function buildExperimentCsv(experiment) {
  const factor = RATE_FACTORS.find((item) => item.id === experiment.factorId);
  if (!factor || !Array.isArray(experiment.trials)) return { error: 'Notebook data is incomplete.' };

  const headers = [
    'factor', 'factor_unit', 'condition', 'measurement_type', 'quantity_unit',
    'time_unit', 'initial_measurement', 'final_measurement', 'elapsed_time',
    'calculated_rate', 'rate_unit', 'rate_error', 'controls', 'conclusion'
  ];
  const rateUnit = experiment.quantityUnit && experiment.timeUnit
    ? `${experiment.quantityUnit}/${experiment.timeUnit}`
    : '';
  const rows = experiment.trials.map((trial) => {
    const hasMeasurements = trial.initialValue !== '' && trial.finalValue !== '' && trial.elapsedTime !== '';
    const calculation = hasMeasurements
      ? calculateObservedRate({
        measurementType: experiment.measurementType,
        initialValue: Number(trial.initialValue),
        finalValue: Number(trial.finalValue),
        elapsedTime: Number(trial.elapsedTime)
      })
      : null;
    return [
      factor.label,
      experiment.factorUnit,
      trial.condition,
      experiment.measurementType,
      experiment.quantityUnit,
      experiment.timeUnit,
      trial.initialValue,
      trial.finalValue,
      trial.elapsedTime,
      calculation && !calculation.error ? calculation.rate : '',
      rateUnit,
      calculation?.error || '',
      experiment.controls,
      experiment.conclusion
    ];
  });
  return { csv: [headers, ...rows].map((row) => row.map(safeCsvCell).join(',')).join('\r\n') };
}
