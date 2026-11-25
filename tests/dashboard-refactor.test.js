import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const section = source('../src/components/general/dashboard/EventToolSection.jsx');
const tracker = source('../src/components/general/dashboard/DashboardTracker.jsx');
const nav = source('../src/components/general/AppNav.jsx');
const registry = source('../src/components/events/registry.js');
const picker = source('../src/components/general/dashboard/EventPicker.jsx');
const confirmDialog = source('../src/components/general/ui/ConfirmDialog.jsx');
const app = source('../src/App.jsx');
const css = source('../src/index.css');

test('tool cards show stage chips and a Coming Soon badge, never a Live bullet', () => {
  assert.match(section, /dashboard-stage-\$\{step\.stage\}/);
  assert.match(section, /Coming Soon/);
  assert.doesNotMatch(section, /● Live/);
  assert.doesNotMatch(section, /catalog-live/);
});

test('registry gain copy is scannable instead of input → output prose', () => {
  const gains = [...registry.matchAll(/gain: '([^']*)'/g)].map((match) => match[1]);
  assert.ok(gains.length > 20);
  assert.equal(gains.some((gain) => gain.includes(' → ')), false);
});

test('the objective table is a real modal, not a permanent dashboard table', () => {
  assert.match(tracker, /createPortal\(/);
  assert.match(tracker, /role="dialog"/);
  assert.match(tracker, /aria-modal="true"/);
  assert.match(tracker, /Review all objectives/);
  assert.match(tracker, /slice\(0, 4\)/);
  assert.match(tracker, /onOpenCompiler\('chemlab'\)/);
});

test('guest sync copy sits beside the profile control', () => {
  assert.match(nav, /app-nav-guest-hint/);
  assert.match(nav, /Sign in to sync across devices/);
});

test('the event picker uses one whole-row button per event and no helper paragraph', () => {
  assert.doesNotMatch(picker, /picker-intro/);
  assert.doesNotMatch(picker, /Star an event to put its tools/);
  assert.match(picker, /<button\s+type="button"\s+className="scope-row"/);
  assert.doesNotMatch(picker, /className="scope-star"\s*$/m);
  assert.match(picker, /ti-star-filled/);
  assert.match(css, /\.scope-row:hover/);
});

test('starring and unstarring use an in-app dialog instead of a native confirm', () => {
  assert.match(confirmDialog, /role="dialog"/);
  assert.match(confirmDialog, /aria-modal="true"/);
  assert.match(app, /<ConfirmDialog/);
  assert.match(app, /isStarred/);
  assert.match(app, /Add to My Events/);
  assert.match(app, /Remove from My Events/);
  assert.doesNotMatch(app, /window\.confirm\(/);
});

test('stage pills use distinct pastel tokens and cards lift one pixel', () => {
  for (const stage of ['prepare', 'practice', 'record', 'reference']) {
    assert.match(css, new RegExp(`--catalog-stage-${stage}-bg`));
    assert.match(css, new RegExp(`dashboard-stage-${stage}`));
  }
  assert.match(css, /content: '→'/);
  assert.match(css, /transform: translateY\(-1px\)/);
  assert.doesNotMatch(css, /transform: translateY\(-2px\)/);
});
