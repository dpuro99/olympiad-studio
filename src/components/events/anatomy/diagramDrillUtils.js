// Anatomy — System Diagram Drill (pure logic, no React/DOM).
//
// The manual's content outline names the structures this drill may use; those
// names and their citations live in src/seasons/2027/anatomy.js. This module
// owns only the season-invariant drill mechanics: a reproducible shuffle,
// choice generation and answer grading. No year literals or rule content here.

/** Non-mutating Fisher–Yates shuffle; `random` is injectable for tests. */
export function shuffle(items, random = Math.random) {
  const result = (Array.isArray(items) ? items : []).slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build a choice set that always contains the correct structure, with unique
 * distractors drawn from the same system. Asking for more choices than exist
 * returns every structure once.
 */
export function buildChoices(structures, correctId, count, random = Math.random) {
  const list = Array.isArray(structures) ? structures : [];
  if (!list.some((structure) => structure.id === correctId)) {
    return { error: 'The correct structure is not in this system.' };
  }
  const wanted = Math.min(Math.max(1, Number(count) || 1), list.length);
  const distractors = shuffle(list.filter((structure) => structure.id !== correctId), random);
  const chosen = [];
  const seen = new Set([correctId]);
  for (const structure of distractors) {
    if (chosen.length >= wanted - 1) break;
    if (seen.has(structure.id)) continue;
    seen.add(structure.id);
    chosen.push(structure);
  }
  return { choices: shuffle([list.find((structure) => structure.id === correctId), ...chosen], random) };
}

/** Grade every hotspot. An unanswered target is distinct from a wrong one. */
export function gradeDiagram(diagram, answers = {}) {
  const hotspots = (diagram?.hotspots || []).filter((spot) => spot && spot.id && spot.structureId);
  const correctIds = [];
  const wrongIds = [];
  const unansweredIds = [];
  for (const spot of hotspots) {
    const answer = answers[spot.id];
    if (answer === undefined || answer === '') unansweredIds.push(spot.id);
    else if (answer === spot.structureId) correctIds.push(spot.id);
    else wrongIds.push(spot.id);
  }
  const total = hotspots.length;
  return {
    total,
    correctCount: correctIds.length,
    correctIds,
    wrongIds,
    unansweredIds,
    allCorrect: total > 0 && correctIds.length === total
  };
}

/**
 * Join a grade to the named structures for the reveal panel. Never trusts the
 * caller's answer id: an unknown choice is reported as "Unlabelled".
 */
export function describeResults(diagram, structures, answers = {}) {
  const byId = new Map((Array.isArray(structures) ? structures : []).map((item) => [item.id, item]));
  const grade = gradeDiagram(diagram, answers);
  const rows = (diagram?.hotspots || []).map((spot) => {
    const expected = byId.get(spot.structureId);
    const chosen = byId.get(answers[spot.id]);
    return {
      hotspotId: spot.id,
      expectedId: spot.structureId,
      expectedName: expected?.name || spot.structureId,
      note: expected?.note || '',
      chosenName: chosen?.name || 'Unlabelled',
      correct: answers[spot.id] === spot.structureId
    };
  });
  return { ...grade, rows };
}
