import { calculateDaltonPartialPressure, calculateGrahamRateRatio, solveGasLaw } from './gasLaws.js';

export const GAS_NOTEBOOK_STORAGE_KEY = 'olympiad-studio-chemlab-gases-v1';

export function createEmptyGasNotebook() {
  return {
    gasLaw: 'boyle',
    target: 'p1',
    values: {},
    dalton: { totalPressure: '', knownPressures: '' },
    graham: { molarMass1: '', molarMass2: '' },
    notes: ''
  };
}

export function parseGasNotebook(serialized) {
  try {
    const data = JSON.parse(serialized);
    const empty = createEmptyGasNotebook();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Saved gas notebook has an unsupported format.' };
    }
    if (data.gasLaw && !['boyle', 'charles', 'gayLussac', 'avogadro', 'combined', 'ideal'].includes(data.gasLaw)) {
      return { error: 'Saved gas notebook contains an unknown gas law.' };
    }
    return {
      value: {
        ...empty,
        ...data,
        values: { ...empty.values, ...(data.values || {}) },
        dalton: { ...empty.dalton, ...(data.dalton || {}) },
        graham: { ...empty.graham, ...(data.graham || {}) }
      }
    };
  } catch {
    return { error: 'Saved gas notebook could not be read.' };
  }
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function csvRow(values) {
  return values.map(safeCsvCell).join(',');
}

export function buildGasNotebookCsv(notebook) {
  const lawResult = solveGasLaw({
    law: notebook.gasLaw,
    target: notebook.target,
    values: notebook.values
  });
  const pressures = notebook.dalton.knownPressures.split(',').map((value) => Number(value.trim()));
  const daltonResult = calculateDaltonPartialPressure({
    totalPressure: Number(notebook.dalton.totalPressure),
    knownPartialPressures: pressures
  });
  const grahamResult = calculateGrahamRateRatio({
    molarMass1: Number(notebook.graham.molarMass1),
    molarMass2: Number(notebook.graham.molarMass2)
  });

  const lines = [
    csvRow(['tool', 'input', 'value', 'unit', 'notes']),
    csvRow(['Gas law', notebook.gasLaw, lawResult.error ? '' : lawResult.value, lawResult.error ? '' : lawResult.unit, lawResult.error || '']),
    csvRow(['Dalton partial pressure', notebook.dalton.knownPressures, daltonResult.error ? '' : daltonResult.value, daltonResult.error ? '' : daltonResult.unit, daltonResult.error || '']),
    csvRow(['Graham rate ratio', `${notebook.graham.molarMass1}/${notebook.graham.molarMass2}`, grahamResult.error ? '' : grahamResult.rateRatio, grahamResult.error ? '' : grahamResult.unit, grahamResult.error || '']),
    csvRow(['User notes', '', '', '', notebook.notes])
  ];
  return { csv: lines.join('\r\n') };
}
