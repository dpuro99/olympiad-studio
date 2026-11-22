import test from 'node:test';
import assert from 'node:assert/strict';
import {
  connectionOptions,
  connectionValue,
  formatTime,
  generateStructure,
  reviewStructure,
  scanDescription
} from '../src/components/events/writeitdoit/relayUtils.js';

const vocabulary = {
  materials: [
    { id: 'stick', label: 'Stick', sizes: ['short', 'long'] },
    { id: 'cup', label: 'Cup', sizes: ['small', 'large'] }
  ],
  colors: ['red', 'blue'],
  locations: ['left', 'right'],
  orientations: ['horizontal', 'vertical']
};
const dimensions = [
  { id: 'size', label: 'Size' },
  { id: 'color', label: 'Color' },
  { id: 'location', label: 'Location' },
  { id: 'orientation', label: 'Orientation' },
  { id: 'connection', label: 'Connection' }
];

test('generated targets are reproducible and every connection points to an earlier piece', () => {
  for (let seed = 1; seed <= 50; seed += 1) {
    const first = generateStructure(seed, vocabulary);
    assert.deepEqual(generateStructure(seed, vocabulary), first);
    assert.ok(first.pieces.length >= 4 && first.pieces.length <= 6);
    const ids = new Set();
    first.pieces.forEach((piece, index) => {
      assert.equal(ids.has(piece.id), false);
      assert.ok(vocabulary.colors.includes(piece.color));
      assert.ok(vocabulary.locations.includes(piece.location));
      assert.ok(vocabulary.orientations.includes(piece.orientation));
      const material = vocabulary.materials.find((entry) => entry.id === piece.material);
      assert.ok(material.sizes.includes(piece.size));
      if (index === 0) assert.equal(piece.connectedTo, null);
      else assert.ok(ids.has(piece.connectedTo));
      ids.add(piece.id);
    });
  }
});

test('sequential seeds produce visibly different targets', () => {
  const signatures = new Set();
  for (let seed = 1; seed <= 40; seed += 1) {
    signatures.add(generateStructure(seed, vocabulary).pieces.map((piece) => `${piece.material}:${piece.color}:${piece.size}`).join('|'));
  }
  assert.ok(signatures.size >= 20, `only ${signatures.size} distinct targets`);
});

test('connection options only offer earlier pieces and a free-standing choice', () => {
  const structure = generateStructure(7, vocabulary);
  assert.deepEqual(connectionOptions(structure, 'P1').map((option) => option.value), ['none']);
  assert.deepEqual(connectionOptions(structure, structure.pieces[2].id).map((option) => option.value), ['none', 'P1', 'P2']);
  assert.equal(connectionValue(null), 'none');
  assert.equal(connectionValue('P2'), 'P2');
});

test('review compares every rubric dimension and stays explicitly practice-only', () => {
  const structure = generateStructure(11, vocabulary);
  const guesses = {};
  for (const piece of structure.pieces) {
    guesses[piece.id] = {
      size: piece.size,
      color: piece.color,
      location: piece.location,
      orientation: piece.orientation,
      connection: connectionValue(piece.connectedTo)
    };
  }
  const perfect = reviewStructure(structure, guesses, dimensions);
  assert.equal(perfect.practiceOnly, true);
  assert.equal(perfect.matched, perfect.possible);
  assert.equal(perfect.possible, structure.pieces.length * dimensions.length);
  assert.ok(perfect.rows.every((row) => row.total === 5 && row.matched === 5));

  guesses[structure.pieces[0].id].size = structure.pieces[0].size === 'short' ? 'long' : 'short';
  const flawed = reviewStructure(structure, guesses, dimensions);
  assert.equal(flawed.matched, perfect.matched - 1);
  assert.equal(flawed.rows[0].checks.size, false);
});

test('an unrecorded piece contributes zeroes rather than matching by accident', () => {
  const structure = generateStructure(3, vocabulary);
  const result = reviewStructure(structure, { [structure.pieces[0].id]: {} }, dimensions);
  assert.equal(result.rows[0].matched, 0);
  assert.equal(result.matched, 0);
  assert.equal(result.possible, structure.pieces.length * dimensions.length);
});

test('description scan is a case-insensitive reminder, not a rule ruling', () => {
  const phrases = ['see diagram', 'as drawn', 'sketch below'];
  assert.equal(scanDescription('Build a vertical stick, then a cup to its left.', phrases).clean, true);
  const flagged = scanDescription('See DIAGRAM below for the layout.', phrases);
  assert.deepEqual(flagged.flagged, ['see diagram']);
  assert.equal(flagged.clean, false);
});

test('timer formatting clamps negatives and pads seconds', () => {
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(1200), '20:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(-4), '00:00');
});
