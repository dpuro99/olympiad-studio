// Pure engine for the WIDI timed relay. It builds synthetic targets from a
// season-supplied vocabulary, grades a recorded build against that target for
// practice only, and formats the rule-derived timers. No year or rule copy here.

export function createRng(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

export function generateStructure(seed, vocabulary) {
  const rng = createRng(seed);
  const count = 4 + Math.floor(rng() * 3);
  const pieces = [];
  for (let index = 0; index < count; index += 1) {
    const material = pick(vocabulary.materials, rng);
    const earlier = pieces.length ? pick(pieces, rng) : null;
    pieces.push({
      id: `P${index + 1}`,
      material: material.id,
      materialLabel: material.label,
      size: pick(material.sizes, rng),
      color: pick(vocabulary.colors, rng),
      location: pick(vocabulary.locations, rng),
      orientation: pick(vocabulary.orientations, rng),
      connectedTo: earlier ? earlier.id : null
    });
  }
  return { seed, pieces };
}

export function connectionValue(value) {
  // null is the target's "free-standing" marker; an empty UI selection is not
  // an answer and must never match it.
  return value == null ? 'none' : value;
}

export function connectionOptions(structure, pieceId) {
  const index = structure.pieces.findIndex((piece) => piece.id === pieceId);
  const earlier = index < 0 ? [] : structure.pieces.slice(0, index);
  return [
    { value: 'none', label: 'Free-standing (not connected)' },
    ...earlier.map((piece) => ({ value: piece.id, label: `Connected to ${piece.id}` }))
  ];
}

export function reviewStructure(structure, guesses, dimensions) {
  const rows = structure.pieces.map((piece) => {
    const guess = guesses[piece.id] || {};
    const checks = {};
    for (const dimension of dimensions) {
      const target = dimension.id === 'connection' ? connectionValue(piece.connectedTo) : piece[dimension.id];
      // Undefined means the builder never recorded that dimension; it must not
      // fall back to 'none' and match a free-standing target by accident.
      const answer = dimension.id === 'connection'
        ? (guess.connection === undefined ? undefined : connectionValue(guess.connection))
        : guess[dimension.id];
      checks[dimension.id] = answer != null && answer === target;
    }
    const matched = dimensions.reduce((sum, dimension) => sum + (checks[dimension.id] ? 1 : 0), 0);
    return { id: piece.id, target: piece, guess, checks, matched, total: dimensions.length };
  });
  return {
    rows,
    matched: rows.reduce((sum, row) => sum + row.matched, 0),
    possible: rows.length * dimensions.length,
    practiceOnly: true
  };
}

export function scanDescription(text, phrases) {
  const lower = (text || '').toLowerCase();
  const flagged = phrases.filter((phrase) => lower.includes(phrase.toLowerCase()));
  return { flagged, clean: flagged.length === 0 };
}

export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${String(minutes).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}
