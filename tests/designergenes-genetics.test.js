import test from 'node:test';
import assert from 'node:assert/strict';
import {
  combineGametes,
  gametesFor,
  hardyFromDominant,
  hardyFromP,
  hardyFromRecessive,
  heritabilityEstimates,
  mapThreePoint,
  mapTwoPoint,
  punnettCross
} from '../src/components/events/designergenes/geneticsUtils.js';

test('gametes come from allele pairs, with homozygous loci contributing one option', () => {
  assert.deepEqual(gametesFor('Aa'), { letters: ['A'], gametes: ['A', 'a'] });
  assert.deepEqual(gametesFor('AABB'), { letters: ['A', 'B'], gametes: ['AB'] });
  assert.deepEqual(gametesFor('AABb'), { letters: ['A', 'B'], gametes: ['AB', 'Ab'] });
  assert.deepEqual(gametesFor('aabb'), { letters: ['A', 'B'], gametes: ['ab'] });
  assert.deepEqual(gametesFor('AaBb'), { letters: ['A', 'B'], gametes: ['AB', 'Ab', 'aB', 'ab'] });
  assert.ok(gametesFor('A').error);
  assert.ok(gametesFor('A1').error);
  assert.ok(gametesFor('AaAa').error);
});

test('combineGametes writes the dominant allele first', () => {
  assert.equal(combineGametes('A', 'A'), 'AA');
  assert.equal(combineGametes('A', 'a'), 'Aa');
  assert.equal(combineGametes('a', 'a'), 'aa');
  assert.equal(combineGametes('Ab', 'aB'), 'AaBb');
  assert.equal(combineGametes('ab', 'ab'), 'aabb');
});

test('a monohybrid cross gives 1:2:1 genotypes and 3:1 phenotypes', () => {
  const cross = punnettCross('Aa', 'Aa');
  assert.equal(cross.total, 4);
  assert.deepEqual(cross.gametesA, ['A', 'a']);
  assert.deepEqual(cross.genotypes.map((entry) => [entry.label, entry.count]), [['Aa', 2], ['AA', 1], ['aa', 1]]);
  assert.deepEqual(cross.phenotypes.map((entry) => [entry.label, entry.count]), [['A-', 3], ['aa', 1]]);
  assert.equal(cross.genotypes.reduce((sum, entry) => sum + entry.fraction, 0), 1);
});

test('dihybrid and trihybrid crosses scale to 16 and 64 cells with expected ratios', () => {
  const di = punnettCross('AaBb', 'AaBb');
  assert.equal(di.total, 16);
  assert.equal(di.genotypes.length, 9);
  assert.deepEqual(di.phenotypes.map((entry) => entry.count), [9, 3, 3, 1]);

  const tri = punnettCross('AaBbCc', 'AaBbCc');
  assert.equal(tri.total, 64);
  assert.equal(tri.genotypes.length, 27);
  assert.deepEqual(tri.phenotypes.map((entry) => entry.count), [27, 9, 9, 9, 3, 3, 3, 1]);
  assert.ok(punnettCross('Aa', 'AaBb').error);
  assert.ok(punnettCross('not a genotype', 'Aa').error);
});

test('Hardy–Weinberg frequencies sum to one from any of the three entry modes', () => {
  const fromP = hardyFromP(0.3);
  assert.equal(fromP.p, 0.3);
  assert.equal(fromP.q, 0.7);
  assert.deepEqual(fromP.frequencies.map((entry) => Number(entry.value.toFixed(2))), [0.09, 0.42, 0.49]);

  const fromRecessive = hardyFromRecessive(16, 100);
  assert.equal(fromRecessive.q, 0.4);
  assert.equal(fromRecessive.p, 0.6);
  const fromDominant = hardyFromDominant(84, 100);
  assert.equal(fromDominant.q, 0.4);
  for (const result of [fromRecessive, fromDominant]) {
    assert.equal(result.frequencies.reduce((sum, entry) => sum + entry.value, 0), 1);
  }
  assert.ok(hardyFromP(1.2).error);
  assert.ok(hardyFromRecessive(120, 100).error);
  assert.ok(hardyFromDominant(80, 0).error);
});

test('two-point mapping converts recombinant frequency into map distance', () => {
  const result = mapTwoPoint(85, 15);
  assert.equal(result.total, 100);
  assert.equal(result.frequency, 0.15);
  assert.equal(result.centiMorgans, 15);
  assert.ok(mapTwoPoint(0, 0).error);
  assert.ok(mapTwoPoint(-5, 10).error);
});

test('three-point mapping finds gene order, interval distances and interference', () => {
  const classes = [
    { id: '1', gamete: 'ABC', count: 20 },
    { id: '2', gamete: 'abc', count: 20 },
    { id: '3', gamete: 'Abc', count: 15 },
    { id: '4', gamete: 'aBC', count: 15 },
    { id: '5', gamete: 'ABc', count: 10 },
    { id: '6', gamete: 'abC', count: 10 },
    { id: '7', gamete: 'AbC', count: 5 },
    { id: '8', gamete: 'aBc', count: 5 }
  ];
  const result = mapThreePoint(classes);
  assert.deepEqual(result.geneOrder, ['A', 'B', 'C']);
  assert.equal(result.intervals[0].centiMorgans, 40);
  assert.equal(result.intervals[1].centiMorgans, 30);
  assert.equal(result.observedDco, 10);
  assert.equal(result.expectedDco, 12);
  assert.equal(Number(result.coefficientOfCoincidence.toFixed(4)), 0.8333);
  assert.equal(Number(result.interference.toFixed(4)), 0.1667);
  assert.deepEqual(result.dcos, ['AbC', 'aBc']);
  assert.ok(mapThreePoint(classes.slice(0, 7)).error);
});

test('three-point mapping rejects inconsistent or degenerate data', () => {
  const invalidParentals = [
    { gamete: 'ABC', count: 30 }, { gamete: 'ABc', count: 30 },
    { gamete: 'Abc', count: 10 }, { gamete: 'aBC', count: 10 },
    { gamete: 'ABc', count: 5 }, { gamete: 'abc', count: 5 },
    { gamete: 'AbC', count: 5 }, { gamete: 'aBc', count: 5 }
  ];
  assert.ok(mapThreePoint(invalidParentals).error);
  assert.ok(mapThreePoint(new Array(8).fill({ gamete: 'ABC', count: 1 })).error);
});

test('heritability estimates stay null when a denominator is missing', () => {
  assert.deepEqual(heritabilityEstimates({ vg: 60, vp: 100, va: 40, response: 5, selectionDifferential: 10 }), {
    broad: 0.6, narrow: 0.4, realized: 0.5
  });
  assert.deepEqual(heritabilityEstimates({ vg: 60, vp: 0, va: 40, response: 5, selectionDifferential: 0 }), {
    broad: null, narrow: null, realized: null
  });
});
