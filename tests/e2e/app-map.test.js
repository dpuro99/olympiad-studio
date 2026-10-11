import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const registrySource = readFileSync(path.join(here, '../../src/components/events/registry.js'), 'utf8');
const appMap = JSON.parse(readFileSync(path.join(here, 'app-map.json'), 'utf8'));

function parseRegistry(source) {
  const events = {};
  const eventKeys = [...source.matchAll(/^ {2}([\w]+): (overview\(\{|{)/gm)];
  for (let i = 0; i < eventKeys.length; i += 1) {
    const id = eventKeys[i][1];
    const isOverview = eventKeys[i][2].startsWith('overview');
    const start = eventKeys[i].index + eventKeys[i][0].length;
    const end = eventKeys[i + 1] ? eventKeys[i + 1].index : source.length;
    const body = source.slice(start, end);
    const moduleIds = [...body.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
    // overview() synthesizes the shared 'main' module inside the helper.
    if (isOverview) moduleIds.push('main');
    events[id] = new Set(moduleIds);
  }
  return events;
}

test('app-map.json event codes match the registry exactly', () => {
  const registryEvents = parseRegistry(registrySource);
  const mapped = appMap.events.map((entry) => entry.code).sort();
  const registered = Object.keys(registryEvents).sort();
  assert.deepEqual(mapped, registered, 'event codes in app-map.json differ from registry.js');
});

test('app-map.json module ids match the registry exactly', () => {
  const registryEvents = parseRegistry(registrySource);
  for (const entry of appMap.events) {
    const registered = [...registryEvents[entry.code]].sort();
    const mapped = entry.modules.map((module) => module.id).sort();
    assert.deepEqual(mapped, registered, `module ids for ${entry.code} differ from registry.js`);
    assert.ok(entry.label.length > 0, `event ${entry.code} needs a label`);
    for (const module of entry.modules) {
      assert.ok(module.label.length > 0, `module ${entry.code}/${module.id} needs a label`);
      assert.ok(module.expectText.length > 0, `module ${entry.code}/${module.id} needs expectText`);
    }
  }
});