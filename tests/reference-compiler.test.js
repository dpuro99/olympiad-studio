import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  addBlock,
  assembleSheet,
  COMPILER_STATUS,
  computeBudget,
  countCharacters,
  createEmptyState,
  progressSummary,
  removeBlock,
  safeParseState,
  setObjectiveStatus,
  updateBlock
} from '../src/components/general/referenceCompilerUtils.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

const config = {
  objectiveGroups: [
    {
      id: 'respiratory',
      label: 'Respiratory system',
      objectives: [
        { id: 'resp-anatomy', label: 'Anatomy and function', level: 'core' },
        { id: 'resp-regulation', label: 'Regulation', level: 'state-national' }
      ]
    },
    {
      id: 'immune',
      label: 'Immune system',
      objectives: [{ id: 'imm-organs', label: 'Organs', level: 'core' }]
    }
  ]
};

test('compiler tracks objective status immutably and normalizes unknown values', () => {
  const state = createEmptyState();
  const next = setObjectiveStatus(state, 'resp-anatomy', COMPILER_STATUS.CONFIDENT);
  assert.equal(state.objectiveStatus['resp-anatomy'], undefined);
  assert.equal(next.objectiveStatus['resp-anatomy'], COMPILER_STATUS.CONFIDENT);
  assert.equal(setObjectiveStatus(state, 'resp-anatomy', 'bogus').objectiveStatus['resp-anatomy'], COMPILER_STATUS.NOT_STARTED);
});

test('compiler adds, updates and removes author blocks without mutating state', () => {
  const empty = createEmptyState();
  const added = addBlock(empty, { objectiveId: 'imm-organs', title: '  Thymus  ', body: ' T-cell maturation ' });
  assert.equal(empty.blocks.length, 0);
  assert.equal(added.blocks.length, 1);
  assert.equal(added.blocks[0].title, 'Thymus');
  assert.equal(added.blocks[0].body, 'T-cell maturation');

  const id = added.blocks[0].id;
  const updated = updateBlock(added, id, { body: 'T-cell maturation site' });
  assert.equal(updated.objectiveStatus, added.objectiveStatus);
  assert.equal(updated.blocks[0].body, 'T-cell maturation site');
  assert.equal(updated.blocks[0].objectiveId, 'imm-organs');

  assert.equal(removeBlock(updated, id).blocks.length, 0);
});

test('compiler rejects empty author blocks', () => {
  const state = addBlock(createEmptyState(), { objectiveId: '', title: 'x', body: '' });
  assert.equal(state.blocks.length, 0);
  assert.equal(addBlock(createEmptyState(), { objectiveId: 'imm-organs', title: '', body: '' }).blocks.length, 0);
});

test('compiler space budget counts title and body against the double-sided capacity', () => {
  const blocks = [
    { id: 'a', objectiveId: 'imm-organs', title: 'abc', body: 'de' },
    { id: 'b', objectiveId: 'resp-anatomy', title: '', body: 'f' }
  ];
  assert.equal(countCharacters(blocks), 6);
  const budget = computeBudget(6, 2, 2);
  assert.equal(budget.capacity, 4);
  assert.equal(budget.over, true);
  assert.equal(budget.overBy, 2);
});

test('compiler prunes confident objectives when assembling the sheet', () => {
  let state = createEmptyState();
  state = addBlock(state, { objectiveId: 'resp-anatomy', body: 'Alveoli' });
  state = addBlock(state, { objectiveId: 'resp-regulation', body: 'Chemoreceptors' });
  state = setObjectiveStatus(state, 'resp-anatomy', COMPILER_STATUS.CONFIDENT);

  const full = assembleSheet(config, state);
  assert.equal(full[0].sections.length, 2);

  const pruned = assembleSheet(config, state, { pruneConfident: true });
  assert.equal(pruned.length, 1);
  assert.equal(pruned[0].sections.length, 1);
  assert.equal(pruned[0].sections[0].objective.id, 'resp-regulation');
});

test('compiler progress summary counts every manual objective', () => {
  const state = setObjectiveStatus(createEmptyState(), 'resp-anatomy', COMPILER_STATUS.STUDYING);
  const summary = progressSummary(config, state);
  assert.equal(summary.total, 3);
  assert.equal(summary.studying, 1);
  assert.equal(summary['not-started'], 2);
});

test('compiler save parser rejects corrupt data and restores valid blocks', () => {
  assert.match(safeParseState('{bad').error, /could not be read/i);
  assert.match(safeParseState(JSON.stringify({ blocks: 'nope' })).error, /unsupported format/i);

  const restored = safeParseState(JSON.stringify({
    objectiveStatus: { 'imm-organs': COMPILER_STATUS.CONFIDENT },
    blocks: [{ id: 'b1', objectiveId: 'imm-organs', title: 'Lymph', body: 'nodes' }, { nope: true }],
    density: 'large'
  }));
  assert.equal(restored.value.blocks.length, 1);
  assert.equal(restored.value.density, 'large');
  assert.equal(restored.value.objectiveStatus['imm-organs'], COMPILER_STATUS.CONFIDENT);
  assert.equal(safeParseState(JSON.stringify({ density: 'bogus' })).value.density, 'standard');
});

test('anatomy registry exposes the reference and study compiler module', () => {
  assert.match(registrySource, /id: 'anatomy-reference-compiler'/);
  assert.match(registrySource, /Reference & Study Compiler/);
  assert.match(registrySource, /ReferenceCompiler/);
});
