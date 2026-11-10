import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHOICE_COUNT,
  buildChoices,
  buildDeck,
  buildQueue,
  createSession,
  deckStats,
  gradeChoice,
  missedCards,
  recordAttempt,
  shuffle,
  signatureOf,
  summarizeSession
} from '../src/components/events/rocksandminerals/specimenDrillUtils.js';
import {
  OFFICIAL_MINERALS,
  buildCards
} from '../src/components/events/rocksandminerals/specimenCardsUtils.js';

// Deterministic stand-in for Math.random so shuffle order is reproducible.
function seeded(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const GALENA = {
  luster: ['metallic'],
  hardnessMin: '2.5',
  hardnessMax: '2.75',
  cleavage: ['perfect'],
  streak: ['gray'],
  acid: 'none',
  magnetic: 'no',
  notes: ''
};

const PYRITE = {
  luster: ['metallic'],
  hardnessMin: '6',
  hardnessMax: '6.5',
  cleavage: ['none'],
  streak: ['black'],
  acid: 'none',
  magnetic: 'no',
  notes: ''
};

const CHALCOPYRITE = {
  luster: ['metallic'],
  hardnessMin: '3.5',
  hardnessMax: '4',
  cleavage: ['poor'],
  streak: ['green'],
  acid: 'weak',
  magnetic: 'no',
  notes: ''
};

const SPHALERITE = {
  luster: ['resinous', 'adamantine'],
  hardnessMin: '3.5',
  hardnessMax: '4',
  cleavage: ['perfect'],
  streak: ['brown'],
  acid: 'none',
  magnetic: 'no',
  notes: ''
};

// A State/National mineral, so the scope toggle has something to exclude.
const ZIRCON = {
  luster: ['adamantine'],
  hardnessMin: '7.5',
  hardnessMax: '7.5',
  cleavage: ['poor'],
  streak: ['white'],
  acid: 'none',
  magnetic: 'no',
  notes: ''
};

const SULFIDES = { galena: GALENA, pyrite: PYRITE, chalcopyrite: CHALCOPYRITE, sphalerite: SPHALERITE };

test('the deck respects scope, chemical class and the recorded-properties filter', () => {
  const cards = buildCards({ ...SULFIDES, zircon: ZIRCON });

  const defaultDeck = buildDeck(cards);
  assert.equal(defaultDeck.every((card) => card.level === 'regional'), true, 'Regional is the default scope');
  assert.deepEqual(defaultDeck.map((card) => card.id).sort(), ['chalcopyrite', 'galena', 'pyrite', 'sphalerite']);

  const sulfides = buildDeck(cards, { cls: 'Sulfides' });
  assert.equal(sulfides.length, 4);
  assert.ok(sulfides.every((card) => card.cls === 'Sulfides'));

  const withState = buildDeck(cards, { includeState: true, cls: 'Silicates' });
  assert.ok(withState.some((card) => card.id === 'zircon'));

  // Without recorded properties there is nothing to prompt with, so the deck is empty.
  assert.deepEqual(buildDeck(buildCards({})), []);
  // ...unless the student explicitly drills unrecorded minerals.
  assert.equal(buildDeck(buildCards({}), { onlyRecorded: false }).length, OFFICIAL_MINERALS.length - 27);
});

test('deck stats report each filter stage instead of one misleading count', () => {
  const cards = buildCards({ ...SULFIDES, zircon: ZIRCON });
  const regional = deckStats(cards, {});
  assert.deepEqual(regional, { inScope: OFFICIAL_MINERALS.length - 27, scoped: OFFICIAL_MINERALS.length - 27, recorded: 4, deck: 4 });

  const all = deckStats(cards, { includeState: true });
  assert.equal(all.inScope, OFFICIAL_MINERALS.length);
  assert.equal(all.recorded, 5);

  const silicates = deckStats(cards, { includeState: true, cls: 'Silicates' });
  assert.equal(silicates.recorded, 1, 'only zircon has properties in the Silicates class');
  assert.equal(silicates.deck, 1);
});

test('shuffle is deterministic, returns a permutation and never mutates its input', () => {
  const deck = buildDeck(buildCards(SULFIDES));
  const first = shuffle(deck, seeded(7));
  const again = shuffle(deck, seeded(7));
  assert.deepEqual(first.map((card) => card.id), again.map((card) => card.id));
  assert.deepEqual(deck.map((card) => card.id), ['chalcopyrite', 'galena', 'pyrite', 'sphalerite'], 'input order is untouched');
  assert.deepEqual(first.map((card) => card.id).sort(), deck.map((card) => card.id).sort());
  assert.deepEqual(shuffle([], seeded(1)), []);
  assert.deepEqual(shuffle(['only'], seeded(1)), ['only']);
});

test('the question queue is a shuffled id list, reproducible from the same seed', () => {
  const deck = buildDeck(buildCards(SULFIDES));
  const queue = buildQueue(deck, seeded(11));
  assert.deepEqual(queue, buildQueue(deck, seeded(11)));
  assert.equal(queue.length, deck.length);
  assert.deepEqual([...queue].sort(), deck.map((card) => card.id).sort());
});

test('generated choices contain the answer, unique ids and same-class distractors first', () => {
  const cards = buildCards(SULFIDES);
  const deck = buildDeck(cards);
  const galena = deck.find((card) => card.id === 'galena');
  const question = buildChoices(galena, deck, { random: seeded(3) });

  assert.equal(question.cardId, 'galena');
  assert.equal(question.answerName, 'Galena');
  assert.equal(question.graded, true);
  assert.equal(question.options.length, Math.min(CHOICE_COUNT, deck.length));
  assert.ok(question.options.some((option) => option.id === 'galena'));
  assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);

  // Every other Sulfide on the list is Regional and recorded, so the three
  // distractors can all come from the answer's own chemical class.
  const others = question.options.filter((option) => option.id !== 'galena').map((option) => option.id);
  assert.deepEqual(others.sort(), ['chalcopyrite', 'pyrite', 'sphalerite']);
});

test('a mineral with identical recorded properties is never offered as a distractor', () => {
  // Two cards the student recorded identically are indistinguishable from the
  // notes they would be reasoning from, so one cannot be a wrong answer.
  const cards = buildCards({ galena: GALENA, pyrite: { ...GALENA } });
  const deck = buildDeck(cards);
  assert.equal(signatureOf(deck[0]), signatureOf(deck[1]));

  const galena = deck.find((card) => card.id === 'galena');
  const question = buildChoices(galena, deck, { random: seeded(5) });
  assert.deepEqual(question.options.map((option) => option.id), ['galena']);
  assert.equal(question.graded, false, 'a one-option question falls back to self-grading');
});

test('a deck too small for four choices shrinks the question rather than padding it', () => {
  const deck = buildDeck(buildCards({ galena: GALENA, pyrite: PYRITE }));
  const galena = deck.find((card) => card.id === 'galena');
  const question = buildChoices(galena, deck, { random: seeded(9) });
  assert.equal(question.options.length, 2);
  assert.deepEqual(question.options.map((option) => option.id).sort(), ['galena', 'pyrite']);
});

test('grading answers a generated question without trusting the caller', () => {
  const deck = buildDeck(buildCards(SULFIDES));
  const galena = deck.find((card) => card.id === 'galena');
  const question = buildChoices(galena, deck, { random: seeded(13) });

  assert.deepEqual(gradeChoice(question, 'galena'), { correct: true, chosenName: 'Galena', answerName: 'Galena' });
  const wrong = gradeChoice(question, 'pyrite');
  assert.equal(wrong.correct, false);
  assert.equal(wrong.chosenName, 'Pyrite');
  assert.equal(wrong.answerName, 'Galena');
  // An id that was never offered is wrong, not a crash.
  assert.deepEqual(gradeChoice(question, 'nonsense'), { correct: false, chosenName: '', answerName: 'Galena' });
});

test('session scoring counts asked/correct and reports accuracy honestly', () => {
  const cards = buildCards(SULFIDES);
  const deck = buildDeck(cards);
  const galena = deck.find((card) => card.id === 'galena');
  const pyrite = deck.find((card) => card.id === 'pyrite');

  const empty = createSession();
  assert.deepEqual(empty, { asked: 0, correct: 0, missed: [] });
  assert.deepEqual(summarizeSession(empty), { asked: 0, correct: 0, missed: 0, accuracy: null });

  let session = recordAttempt(empty, galena, true);
  session = recordAttempt(session, pyrite, false);
  session = recordAttempt(session, pyrite, false);
  session = recordAttempt(session, galena, true);
  assert.deepEqual(summarizeSession(session), { asked: 4, correct: 2, missed: 2, accuracy: 50 });
  assert.equal(summarizeSession({ asked: 3, correct: 1, missed: [] }).accuracy, 33);

  // The original session object is untouched, so a render never mutates state.
  assert.equal(empty.asked, 0);
});

test('missed cards come back once each, in the order they were first missed', () => {
  const cards = buildCards(SULFIDES);
  const deck = buildDeck(cards);
  const pyrite = deck.find((card) => card.id === 'pyrite');
  const galena = deck.find((card) => card.id === 'galena');

  let session = recordAttempt(createSession(), pyrite, false);
  session = recordAttempt(session, galena, true);
  session = recordAttempt(session, pyrite, false);
  session = recordAttempt(session, galena, false);

  const missed = missedCards(session, cards);
  assert.deepEqual(missed.map((card) => card.id), ['pyrite', 'galena']);
  assert.equal(missed[0].name, 'Pyrite');
  assert.deepEqual(missedCards(createSession(), cards), []);
  // A card removed from the list is dropped instead of rendering a blank row.
  assert.deepEqual(missedCards(session, cards.filter((card) => card.id !== 'pyrite')).map((card) => card.id), ['galena']);
});
