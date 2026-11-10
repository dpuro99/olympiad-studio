import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACTIVE_SEASON } from '../src/seasons/manifest.js';
import { fileStem, storageKey } from '../src/seasons/storageKeys.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '../src');
const seasonsDir = path.join(srcDir, 'seasons');

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(js|jsx)$/.test(entry) ? [full] : [];
  });
}

test('no season-year literals outside the season folder', () => {
  const offenders = [];
  for (const file of sourceFiles(srcDir)) {
    if (file.startsWith(seasonsDir + path.sep)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      // XML namespace URLs and explicit pointers into the season folder are allowed.
      if (/xmlns|w3\.org/.test(line)) return;
      if (line.includes('src/seasons/')) return;
      // Science Olympiad season years are 2020+; older numbers are ordinary values.
      const match = line.match(/\b20[2-9]\d\b/);
      if (match) offenders.push(`${path.relative(srcDir, file)}:${index + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(offenders, [], `season literals must live in src/seasons/: ${offenders.join(' | ')}`);
});

test('storage keys and export stems embed the active season', () => {
  assert.equal(storageKey('anatomy', 'notebook'), `olympiad-studio.anatomy-c.${ACTIVE_SEASON.year}-notebook`);
  assert.equal(fileStem('circuitlab', 'logic-canvas'), `circuitlab-c-${ACTIVE_SEASON.year}-logic-canvas`);
  assert.throws(() => storageKey('unknown-event', 'x'), /Unknown event/);
  assert.throws(() => fileStem('unknown-event', 'x'), /Unknown event/);
});

test('every reference compiler config declares the active season and derives its names', () => {
  const configs = [
    'anatomy', 'chemlab', 'circuitlab', 'designergenes', 'dynamicplanet', 'rocksandminerals'
  ];
  for (const event of configs) {
    const source = readFileSync(
      path.join(srcDir, 'components/events', event, 'referenceCompilerConfig.js'),
      'utf8'
    );
    assert.match(source, /season: ACTIVE_SEASON,/, `${event} config must declare its season`);
    assert.match(source, new RegExp(`storageKey\\('${event}', 'reference-(sheet|binder)'\\)`), `${event} storage key`);
    assert.match(source, new RegExp(`fileStem\\('${event}', 'reference-(sheet|binder)'\\)`), `${event} file stem`);
  }
});
