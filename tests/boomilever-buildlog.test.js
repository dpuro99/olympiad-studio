import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildBuildLogCsv,
  createEmptyEntry,
  safeParseEntries,
  summarizeEntry
} from '../src/components/events/boomilever/buildLogUtils.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

test('summarizeEntry scores a tested build with the 7,500 g bonus', () => {
  const summary = summarizeEntry({
    ...createEmptyEntry(),
    structureMassGrams: '100',
    baseOption: 'bonus',
    loadSupportedGrams: '15000',
    holds15Kg: true,
    tier: 'Tier 1'
  });
  assert.equal(summary.tested, true);
  assert.equal(summary.scored, true);
  assert.equal(summary.loadScoredBonus, 7500);
  assert.equal(summary.loadScored, 22500);
  assert.equal(summary.score, 225);
});

test('summarizeEntry awards no bonus when 15 kg is not held', () => {
  const summary = summarizeEntry({
    ...createEmptyEntry(),
    structureMassGrams: '200',
    baseOption: 'bonus',
    loadSupportedGrams: '12000',
    holds15Kg: false
  });
  assert.equal(summary.loadScoredBonus, 0);
  assert.equal(summary.score, 60);
});

test('an untested build is recorded without an efficiency', () => {
  const summary = summarizeEntry({ ...createEmptyEntry(), structureMassGrams: '180' });
  assert.equal(summary.tested, false);
  assert.equal(summary.scored, false);
});

test('a tested build without a valid mass cannot be scored', () => {
  const summary = summarizeEntry({ ...createEmptyEntry(), loadSupportedGrams: '5000' });
  assert.equal(summary.tested, true);
  assert.equal(summary.scored, false);
  assert.match(summary.error, /structure mass/);
});

test('safeParseEntries recovers stored arrays and rejects other shapes', () => {
  const parsed = safeParseEntries(JSON.stringify([{ label: 'v2', structureMassGrams: '200' }]));
  assert.equal(parsed.value.length, 1);
  assert.equal(parsed.value[0].members, undefined);
  assert.equal(parsed.value[0].baseOption, 'standard');
  assert.match(safeParseEntries('{ broken').error, /could not be read/);
  assert.match(safeParseEntries('{"not":"array"}').error, /unsupported format/);
});

test('CSV export escapes cells and neutralizes formula injection', () => {
  const csv = buildBuildLogCsv([
    { ...createEmptyEntry(), label: '=cmd()', structureMassGrams: '100', memberDescription: 'a"b', loadSupportedGrams: '15000', baseOption: 'bonus', holds15Kg: true }
  ]);
  assert.match(csv, /"'=cmd\(\)"/);
  assert.match(csv, /"a""b"/);
  assert.match(csv, /"10 cm bonus boundary"/);
});

test('registry exposes the manual-cited build/test log module', () => {
  assert.match(registrySource, /id: 'boomilever-build-log'/);
  assert.match(registrySource, /Division C Rules Manual, pp\. C7–C12/);
});
