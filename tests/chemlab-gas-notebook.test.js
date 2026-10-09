import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGasNotebookCsv,
  createEmptyGasNotebook,
  parseGasNotebook
} from '../src/components/events/chemlab/gasLawNotebook.js';

test('gas notebook restores student-entered values and notes', () => {
  const notebook = createEmptyGasNotebook();
  notebook.gasLaw = 'boyle';
  notebook.target = 'p2';
  notebook.values = { p1: '100', v1: '2', v2: '1' };
  notebook.notes = 'Measured in lab';

  const restored = parseGasNotebook(JSON.stringify(notebook));
  assert.equal(restored.value.gasLaw, 'boyle');
  assert.equal(restored.value.values.p1, '100');
  assert.equal(restored.value.notes, 'Measured in lab');
});

test('gas notebook CSV includes calculated outputs and user notes', () => {
  const notebook = createEmptyGasNotebook();
  notebook.gasLaw = 'boyle';
  notebook.target = 'p2';
  notebook.values = { p1: '100', v1: '2', v2: '1' };
  notebook.dalton = { totalPressure: '100', knownPressures: '40, 25' };
  notebook.graham = { molarMass1: '4', molarMass2: '16' };
  notebook.notes = 'My calculation';
  const result = buildGasNotebookCsv(notebook);

  assert.match(result.csv, /"Gas law","boyle","200","kPa"/);
  assert.match(result.csv, /"Dalton partial pressure","40, 25","35","kPa"/);
  assert.match(result.csv, /"Graham rate ratio","4\/16","2","dimensionless"/);
  assert.match(result.csv, /"User notes".*"My calculation"/);
});

test('gas notebook CSV neutralizes spreadsheet formulas in free-text notes', () => {
  const notebook = createEmptyGasNotebook();
  notebook.notes = '=HYPERLINK("https://example.invalid")';
  const result = buildGasNotebookCsv(notebook);
  assert.match(result.csv, /"'=HYPERLINK\(""https:\/\/example\.invalid""\)"/);
});

test('gas notebook parser rejects corrupt and unsupported save data', () => {
  assert.match(parseGasNotebook('{invalid').error, /could not be read/i);
  assert.match(parseGasNotebook(JSON.stringify({ gasLaw: 'made-up-law' })).error, /unknown gas law/i);
});