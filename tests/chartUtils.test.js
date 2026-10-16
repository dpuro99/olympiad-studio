import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clamp,
  extent,
  linearScale,
  niceTicks,
  pathFromPoints
} from '../src/components/general/ui/chartUtils.js';

test('extent returns min and max over finite values', () => {
  assert.deepEqual(extent([3, 1, 7]), [1, 7]);
  assert.deepEqual(extent([-2, 0, 5]), [-2, 5]);
  assert.deepEqual(extent([4]), [4, 4]);
});

test('extent falls back to [0, 0] for empty or unusable input', () => {
  assert.deepEqual(extent([]), [0, 0]);
  assert.deepEqual(extent(null), [0, 0]);
  assert.deepEqual(extent(['a', 'b']), [0, 0]);
  assert.deepEqual(extent([NaN, undefined]), [0, 0]);
  assert.deepEqual(extent([1, 'x', 9]), [1, 9]);
});

test('linearScale maps the data domain onto the pixel range', () => {
  const scale = linearScale([0, 10], [0, 100]);
  assert.equal(scale(0), 0);
  assert.equal(scale(10), 100);
  assert.equal(scale(5), 50);
  assert.equal(scale(2.5), 25);

  const yScale = linearScale([0, 1], [180, 0]);
  assert.equal(yScale(0), 180);
  assert.equal(yScale(1), 0);
});

test('linearScale handles a degenerate (zero-width) domain', () => {
  const scale = linearScale([5, 5], [0, 100]);
  assert.equal(scale(5), 50);
  assert.equal(scale(999), 50);
});

test('clamp keeps values inside their bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
});

test('niceTicks produces a 1/2/5-style step that covers the domain', () => {
  assert.deepEqual(niceTicks(0, 10, 4), [0, 2, 4, 6, 8, 10]);
  assert.deepEqual(niceTicks(0, 1, 4), [0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(niceTicks(0, 10, 6), [0, 2, 4, 6, 8, 10]);

  const ticks = niceTicks(0, 7, 4);
  assert.equal(ticks[0], 0);
  assert.equal(ticks[ticks.length - 1], 6);
  assert.equal(ticks[1] - ticks[0], 2);
});

test('niceTicks handles negative and degenerate domains', () => {
  const negative = niceTicks(-10, 0, 5);
  assert.deepEqual(negative, [-10, -8, -6, -4, -2, 0]);
  assert.deepEqual(niceTicks(3, 3, 4), [3]);
  assert.deepEqual(niceTicks(0, 10, 0), [0, 10]);
});

test('niceTicks returns [] for non-finite input', () => {
  assert.deepEqual(niceTicks(NaN, 5), []);
  assert.deepEqual(niceTicks(0, Infinity), []);
});

test('pathFromPoints builds an SVG path and handles empty input', () => {
  assert.equal(pathFromPoints([{ x: 4, y: 5 }, { x: 9, y: 12 }]), 'M4 5 L9 12');
  assert.equal(pathFromPoints([{ x: 1, y: 2 }]), 'M1 2');
  assert.equal(pathFromPoints([]), '');
  assert.equal(pathFromPoints(undefined), '');
});
