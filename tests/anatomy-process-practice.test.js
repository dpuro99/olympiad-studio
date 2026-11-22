import test from 'node:test';
import assert from 'node:assert/strict';
import {
  casesForLevel,
  gradeClassify,
  gradeOrder,
  prepareCase
} from '../src/components/events/anatomy/processPracticeUtils.js';
import { ACTIVE_DATA } from '../src/seasons/active.js';

const lcg = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const CASES = ACTIVE_DATA.anatomy.processCases;

test('season cases are manual-cited and internally consistent', () => {
  assert.ok(CASES.length >= 4);
  const ids = new Set();
  for (const caseItem of CASES) {
    assert.ok(!ids.has(caseItem.id), `duplicate case id ${caseItem.id}`);
    ids.add(caseItem.id);
    assert.ok(caseItem.label && caseItem.prompt && caseItem.citation);
    assert.match(caseItem.citation, /§3\.[bc]/);
    assert.ok(['base', 'state', 'national'].includes(caseItem.level));
    if (caseItem.kind === 'order') {
      const stepIds = caseItem.steps.map((step) => step.id);
      assert.equal(new Set(stepIds).size, stepIds.length, `${caseItem.id} has duplicate steps`);
      assert.ok(stepIds.length >= 3);
      assert.ok(caseItem.steps.every((step) => step.label && step.detail));
    } else if (caseItem.kind === 'classify') {
      const groupIds = new Set(caseItem.groups.map((group) => group.id));
      assert.ok(groupIds.size >= 2);
      const itemIds = caseItem.items.map((item) => item.id);
      assert.equal(new Set(itemIds).size, itemIds.length, `${caseItem.id} has duplicate items`);
      assert.ok(caseItem.items.every((item) => item.label && groupIds.has(item.groupId)));
    } else {
      assert.fail(`unexpected case kind ${caseItem.kind}`);
    }
  }
  // State/National cases must carry the manual's own level label in the cite.
  const state = CASES.find((caseItem) => caseItem.level === 'state');
  const national = CASES.find((caseItem) => caseItem.level === 'national');
  assert.match(state.citation, /State/);
  assert.match(national.citation, /National/);
});

test('level filtering keeps base cases in view and gates advanced ones', () => {
  const base = casesForLevel(CASES, 'base').map((caseItem) => caseItem.id);
  const state = casesForLevel(CASES, 'state').map((caseItem) => caseItem.id);
  const national = casesForLevel(CASES, 'national').map((caseItem) => caseItem.id);
  assert.ok(base.length > 0 && !base.includes('transplant') && !base.includes('tumor-immunology'));
  assert.ok(state.includes('transplant') && !state.includes('tumor-immunology'));
  assert.ok(national.includes('tumor-immunology') && national.length > state.length);
  assert.deepEqual(casesForLevel(CASES, 'unknown'), casesForLevel(CASES, 'base'));
});

test('prepareCase gives a reproducible permutation and never mutates the case', () => {
  const caseItem = CASES.find((entry) => entry.id === 'canal-route');
  const original = caseItem.steps.map((step) => step.id);
  const once = prepareCase(caseItem, lcg(21));
  assert.deepEqual(once.displayIds, prepareCase(caseItem, lcg(21)).displayIds);
  assert.deepEqual([...once.displayIds].sort(), [...original].sort());
  assert.deepEqual(caseItem.steps.map((step) => step.id), original);
});

test('order grading reports each position, incomplete work and extra picks', () => {
  const caseItem = CASES.find((entry) => entry.id === 'canal-route');
  const correct = caseItem.steps.map((step) => step.id);
  const perfect = gradeOrder(caseItem, correct);
  assert.equal(perfect.allCorrect, true);
  assert.equal(perfect.correctCount, 4);
  assert.equal(perfect.complete, true);

  const partial = gradeOrder(caseItem, [correct[0], 'wrong']);
  assert.equal(partial.allCorrect, false);
  assert.equal(partial.complete, false);
  assert.deepEqual(partial.rows.map((row) => row.correct), [true, false, false, false]);
  assert.equal(partial.rows[1].chosenId, 'wrong');

  const extra = gradeOrder(caseItem, [...correct, 'extra']);
  assert.equal(extra.complete, false);
  assert.equal(extra.allCorrect, false);
});

test('classification grading separates unsorted, wrong and correct items', () => {
  const caseItem = CASES.find((entry) => entry.id === 'innate-vs-adaptive');
  const all = Object.fromEntries(caseItem.items.map((item) => [item.id, item.groupId]));
  assert.equal(gradeClassify(caseItem, all).allCorrect, true);

  const partial = gradeClassify(caseItem, { barriers: 'innate', bCells: 'innate' });
  assert.equal(partial.answered, 2);
  assert.equal(partial.correctCount, 1);
  assert.equal(partial.allCorrect, false);
  assert.equal(partial.rows.find((row) => row.id === 'tlr').chosenGroupName, 'Unsorted');
  assert.equal(partial.rows.find((row) => row.id === 'tlr').expectedGroupName, 'Innate');
  assert.equal(gradeClassify(caseItem, {}).answered, 0);
});
