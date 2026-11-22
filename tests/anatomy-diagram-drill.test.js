import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChoices,
  describeResults,
  gradeDiagram,
  shuffle
} from '../src/components/events/anatomy/diagramDrillUtils.js';
import { ACTIVE_DATA } from '../src/seasons/active.js';

const lcg = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const structures = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gamma' },
  { id: 'd', name: 'Delta' }
];
const diagram = {
  hotspots: [
    { id: 'h1', structureId: 'a' },
    { id: 'h2', structureId: 'c' },
    { id: 'h3', structureId: 'd' }
  ]
};

test('the season supplies manual-cited structures for all three systems', () => {
  const diagrams = ACTIVE_DATA.anatomy.diagrams;
  assert.deepEqual(diagrams.map((entry) => entry.id), ['respiratory', 'digestive', 'immune']);
  for (const entry of diagrams) {
    assert.ok(entry.label, `${entry.id} needs a tab label`);
    assert.match(entry.citation, /§3\.[abc]/);
    assert.ok(entry.structures.length >= 5);
    assert.ok(entry.structures.every((structure) => structure.id && structure.name && structure.note));
  }
  const respiratory = diagrams.find((entry) => entry.id === 'respiratory');
  assert.deepEqual(respiratory.structures.map((structure) => structure.id), [
    'pharynx', 'larynx', 'trachea', 'bronchi', 'bronchioles', 'alveoli'
  ]);
});

test('shuffle is a reproducible permutation and never mutates its input', () => {
  const input = [1, 2, 3, 4, 5];
  const once = shuffle(input, lcg(7));
  assert.deepEqual(once, shuffle(input, lcg(7)));
  assert.deepEqual([...once].sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
});

test('choices include the answer, are unique, and cap at the available structures', () => {
  const { choices } = buildChoices(structures, 'b', 3, lcg(11));
  assert.equal(choices.length, 3);
  assert.equal(new Set(choices.map((choice) => choice.id)).size, 3);
  assert.ok(choices.some((choice) => choice.id === 'b'));
  const all = buildChoices(structures, 'a', 99, lcg(12)).choices;
  assert.equal(all.length, structures.length);
  assert.ok(all.some((choice) => choice.id === 'a'));
  assert.equal(buildChoices(structures, 'missing', 2, lcg(13)).error, 'The correct structure is not in this system.');
});

test('grading separates correct, wrong and unanswered targets', () => {
  assert.deepEqual(gradeDiagram(diagram, { h1: 'a', h2: 'b', h3: '' }), {
    total: 3,
    correctCount: 1,
    correctIds: ['h1'],
    wrongIds: ['h2'],
    unansweredIds: ['h3'],
    allCorrect: false
  });
  assert.equal(gradeDiagram(diagram, { h1: 'a', h2: 'c', h3: 'd' }).allCorrect, true);
  assert.equal(gradeDiagram(diagram, {}).unansweredIds.length, 3);
  assert.equal(gradeDiagram({}, {}).allCorrect, false);
});

test('the reveal joins expected names and notes without trusting answers', () => {
  const result = describeResults(diagram, structures, { h1: 'a', h2: 'b' });
  assert.equal(result.rows.length, 3);
  assert.deepEqual(result.rows[0], {
    hotspotId: 'h1', expectedId: 'a', expectedName: 'Alpha', note: '', chosenName: 'Alpha', correct: true
  });
  assert.equal(result.rows[1].chosenName, 'Beta');
  assert.equal(result.rows[1].correct, false);
  assert.equal(result.rows[2].chosenName, 'Unlabelled');
  assert.equal(result.rows[2].correct, false);
});
