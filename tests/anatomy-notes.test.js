import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildNotesCsv, createEmptyNote, safeParseNotes } from '../src/components/events/anatomy/anatomyNotes.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

test('anatomy notes save and restore user-authored observations', () => {
  const note = createEmptyNote();
  note.systemId = 'respiratory';
  note.label = 'Asthma mechanism';
  note.focus = 'Airway resistance';
  note.notes = 'Compare obstructive vs restrictive patterns.';
  const restored = safeParseNotes(JSON.stringify({ notes: [note] }));
  assert.equal(restored.value.notes[0].label, 'Asthma mechanism');
  assert.equal(restored.value.notes[0].systemId, 'respiratory');
});

test('anatomy CSV export includes user-entered notes and computed fields', () => {
  const csv = buildNotesCsv([{ systemId: 'digestive', label: 'GERD', focus: 'Reflux', notes: 'Mechanism review' }]);
  assert.match(csv, /digestive/);
  assert.match(csv, /GERD/);
  assert.match(csv, /Mechanism review/);
});

test('anatomy notes parser rejects corrupt save data', () => {
  assert.match(safeParseNotes('{bad').error, /could not be read/i);
  assert.match(safeParseNotes(JSON.stringify({ notes: 'not an array' })).error, /unsupported format/i);
});

test('anatomy registry exposes the user-authored notes workspace', () => {
  assert.match(registrySource, /id: 'anatomy-notes'/);
  assert.match(registrySource, /Practice Notes/);
  assert.match(registrySource, /Division C Rules Manual, pp\. C3–C5/);
});
