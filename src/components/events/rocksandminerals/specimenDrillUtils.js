// Rocks and Minerals — specimen drill (deck building, generated choices, scoring).
//
// Season-invariant engine. It reuses the specimen-card store and matching
// vocabulary from `specimenCardsUtils.js` rather than duplicating them: the
// official list stays in season data, the properties stay student-authored, and
// this module only decides what to ask and how to score it.
import {
  cardsInScope,
  hasRecordedProperties,
  hardnessRange,
  sanitizeProperties
} from './specimenCardsUtils.js';

export const CHOICE_COUNT = 4;

function hardnessKey(properties) {
  const range = hardnessRange(properties);
  return range ? `${range.min}-${range.max}` : '';
}

/**
 * Canonical fingerprint of the properties that can be graded. Two minerals with
 * the same fingerprint are indistinguishable from their recorded values, so one
 * must never be offered as a distractor for the other — that would mark a
 * student wrong for an answer their own notes support.
 */
export function signatureOf(card) {
  const properties = sanitizeProperties(card?.properties);
  return JSON.stringify([
    [...properties.luster].sort(),
    hardnessKey(properties),
    [...properties.cleavage].sort(),
    [...properties.streak].sort(),
    properties.acid,
    properties.magnetic
  ]);
}

/** Fisher–Yates over a copy; `random` is injectable so tests are deterministic. */
export function shuffle(items, random = Math.random) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * The cards a drill can draw from: scope first (Regional by default), then an
 * optional chemical class, then — unless the student asks otherwise — only cards
 * that actually have properties to prompt with.
 */
export function buildDeck(cards, { includeState = false, cls = '', onlyRecorded = true } = {}) {
  return cardsInScope(cards, includeState)
    .filter((card) => !cls || card.cls === cls)
    .filter((card) => !onlyRecorded || hasRecordedProperties(card.properties));
}

export function deckStats(cards, options) {
  const inScope = cardsInScope(cards, options?.includeState);
  const scoped = inScope.filter((card) => !options?.cls || card.cls === options.cls);
  const recorded = scoped.filter((card) => hasRecordedProperties(card.properties));
  return { inScope: inScope.length, scoped: scoped.length, recorded: recorded.length, deck: buildDeck(cards, options).length };
}

/** A shuffled queue of card ids; reshuffle when it empties. */
export function buildQueue(deck, random = Math.random) {
  return shuffle(deck, random).map((card) => card.id);
}

/**
 * Generated multiple-choice question: the answer plus up to three distractors,
 * same chemical class first (harder, more realistic), never a mineral whose
 * recorded properties are identical to the answer's.
 */
export function buildChoices(card, deck, { random = Math.random, count = CHOICE_COUNT } = {}) {
  const answerSignature = signatureOf(card);
  const others = deck.filter((entry) => entry.id !== card.id
    && entry.name.toLowerCase() !== card.name.toLowerCase()
    && signatureOf(entry) !== answerSignature);
  const sameClass = others.filter((entry) => entry.cls === card.cls);
  const rest = others.filter((entry) => entry.cls !== card.cls);
  const wanted = Math.max(1, count);
  const distractors = [...shuffle(sameClass, random), ...shuffle(rest, random)].slice(0, wanted - 1);
  const options = shuffle([card, ...distractors], random).map((entry) => ({ id: entry.id, name: entry.name }));
  return {
    cardId: card.id,
    answerName: card.name,
    options,
    // A one-option question cannot be graded honestly, so the UI falls back to
    // reveal-and-self-grade instead of pretending there was a choice.
    graded: options.length > 1
  };
}

export function gradeChoice(question, chosenId) {
  const chosen = question.options.find((option) => option.id === chosenId);
  return {
    correct: Boolean(chosen) && chosen.id === question.cardId,
    chosenName: chosen ? chosen.name : '',
    answerName: question.answerName
  };
}

export function createSession() {
  return { asked: 0, correct: 0, missed: [] };
}

export function recordAttempt(session, card, correct) {
  return {
    asked: session.asked + 1,
    correct: session.correct + (correct ? 1 : 0),
    missed: correct ? session.missed : [...session.missed, { id: card.id, name: card.name }]
  };
}

export function summarizeSession(session) {
  const asked = session?.asked || 0;
  const correct = session?.correct || 0;
  const missed = session?.missed || [];
  return {
    asked,
    correct,
    missed: missed.length,
    accuracy: asked ? Math.round((correct / asked) * 100) : null
  };
}

/** Cards missed this session, in first-missed order, de-duplicated. */
export function missedCards(session, cards) {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const seen = new Set();
  const result = [];
  for (const entry of session?.missed || []) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    const card = byId.get(entry.id);
    if (card) result.push(card);
  }
  return result;
}
