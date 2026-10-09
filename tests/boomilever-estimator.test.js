import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateBoomileverScore } from '../src/components/events/boomilever/boomileverScore.js';

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');

test('Boomilever score uses 7,500 g bonus and caps load at 15,000 g', () => {
  const score = calculateBoomileverScore({
    loadSupportedGrams: 15000,
    structureMassGrams: 100,
    meetsBonusRequirements: true,
    holds15Kg: true,
    tier: 'Tier 1'
  });
  assert.equal(score.loadScoredBonus, 7500);
  assert.equal(score.loadSupportedGrams, 15000);
  assert.equal(score.loadScored, 22500);
  assert.equal(score.score, 225);
});

test('Boomilever score applies no bonus when 15 kg is not held', () => {
  const score = calculateBoomileverScore({
    loadSupportedGrams: 12000,
    structureMassGrams: 200,
    meetsBonusRequirements: true,
    holds15Kg: false,
    tier: 'Tier 1'
  });
  assert.equal(score.loadScoredBonus, 0);
  assert.equal(score.loadScored, 12000);
  assert.equal(score.score, 60);
});

test('Boomilever score applies tier 2 and participation-only outcomes', () => {
  assert.equal(calculateBoomileverScore({ loadSupportedGrams: 5000, structureMassGrams: 150, tier: 'Tier 2' }).tier, 'Tier 2');
  assert.equal(calculateBoomileverScore({ loadSupportedGrams: 0, structureMassGrams: 150, tier: 'Tier 3' }).tier, 'Tier 3');
});

test('Boomilever registry exposes the manual-cited efficiency estimator', () => {
  assert.match(registrySource, /id: 'boomilever-estimator'/);
  assert.match(registrySource, /Division C Rules Manual, pp\. C7–C12/);
});
