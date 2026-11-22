// Anatomy — Digestive/Immune Process Practice (pure logic, no React/DOM).
//
// The manual-listed cases and their citations live in the season data. This
// module owns only season-invariant mechanics: level filtering, a reproducible
// display order and grading. There are no year literals or rule constants here.

const LEVEL_RANKS = Object.freeze({ base: 0, state: 1, national: 2 });

/** Cases at or below the chosen level; an unknown level falls back to base. */
export function casesForLevel(cases, level = 'base') {
  const rank = LEVEL_RANKS[level] ?? 0;
  return (Array.isArray(cases) ? cases : []).filter((item) => (LEVEL_RANKS[item.level] ?? 0) <= rank);
}

/** Non-mutating Fisher–Yates shuffle with an injectable random source. */
export function shuffle(items, random = Math.random) {
  const result = (Array.isArray(items) ? items : []).slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Add a shuffled display order to a case without changing its answer data. */
export function prepareCase(caseItem, random = Math.random) {
  if (!caseItem) return null;
  const ids = caseItem.kind === 'order'
    ? (caseItem.steps || []).map((step) => step.id)
    : (caseItem.items || []).map((item) => item.id);
  return { ...caseItem, displayIds: shuffle(ids, random) };
}

/** Grade an ordering attempt position by position; later positions still checked. */
export function gradeOrder(caseItem, chosenIds = []) {
  const steps = caseItem?.steps || [];
  const rows = steps.map((step, index) => ({
    position: index + 1,
    id: step.id,
    label: step.label,
    detail: step.detail || '',
    chosenId: chosenIds[index] ?? null,
    correct: chosenIds[index] === step.id
  }));
  const correctCount = rows.filter((row) => row.correct).length;
  const complete = chosenIds.length === rows.length;
  return {
    rows,
    correctCount,
    total: rows.length,
    complete,
    // An extra pick must not count as a perfect answer: gradeOrder only reads
    // the first `rows.length` positions, so completeness is part of correctness.
    allCorrect: complete && rows.length > 0 && correctCount === rows.length
  };
}

/** Grade a classification attempt; unanswered and wrong are distinct. */
export function gradeClassify(caseItem, assignments = {}) {
  const items = caseItem?.items || [];
  const groupNames = new Map((caseItem?.groups || []).map((group) => [group.id, group.label]));
  const rows = items.map((item) => {
    const chosenGroupId = assignments[item.id] ?? null;
    return {
      id: item.id,
      label: item.label,
      expectedGroupId: item.groupId,
      expectedGroupName: groupNames.get(item.groupId) || item.groupId,
      chosenGroupId,
      chosenGroupName: chosenGroupId ? (groupNames.get(chosenGroupId) || chosenGroupId) : 'Unsorted',
      correct: chosenGroupId === item.groupId
    };
  });
  const answered = rows.filter((row) => row.chosenGroupId).length;
  const correctCount = rows.filter((row) => row.correct).length;
  return {
    rows,
    answered,
    total: rows.length,
    correctCount,
    allCorrect: rows.length > 0 && answered === rows.length && correctCount === rows.length
  };
}
