/**
 * Changed-only e2e scope resolver + runner for Olympiad Studio.
 *
 * Usage:
 *   node tests/e2e/incremental.mjs            # changed-only (baseline-aware)
 *   node tests/e2e/incremental.mjs full       # force full sweep
 *
 * Baseline = the last successfully audited commit, stored per-repo in a
 * gitignored `.opencode-audit.baseline` at the repo root. A run with no
 * baseline or with `full` runs the entire suite. Otherwise the changed file
 * set maps to the smallest spec list that covers it and the runner stamps the
 * baseline on success. (Repo-local on purpose: under WSL the browser runner
 * uses Windows node, whose home differs from the agent shell's `$HOME`.)
 *
 * Mapping rules (mirrored by the global /audit command):
 *   src/components/events/<event>/**            -> core spec + that event's spec
 *   src/components/general/**, shared app files -> all specs
 *   tests/e2e/**, configs, package.json         -> all specs
 *   anything unknown                            -> all specs
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const specsDir = path.join(repoRoot, 'tests/e2e/specs');

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(`${cmd} ${args.join(' ')} failed:\n${result.stderr}\n`);
    process.exit(1);
  }
  return result.stdout.trim();
}

function collectSpecs(dir, base = dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectSpecs(full, base));
    } else if (entry.endsWith('.spec.js')) {
      found.push(path.relative(base, full));
    }
  }
  return found;
}

function baselinePath() {
  return path.join(repoRoot, '.opencode-audit.baseline');
}

function changedFiles(baseline) {
  const toplevel = run('git', ['rev-parse', '--show-toplevel']).replace(/\\/g, '/');
  const root = repoRoot.replace(/\\/g, '/');
  if (toplevel.toLowerCase() !== root.toLowerCase()) {
    process.stderr.write(`incremental: unexpected git toplevel ${toplevel} (expected ${root})\n`);
    process.exit(1);
  }
  const unreported = new Set();
  const porcelain = spawnSync('git', ['status', '--porcelain'], { cwd: repoRoot, encoding: 'utf8' });
  for (const line of porcelain.stdout.split('\n')) {
    if (!line.trim()) continue;
    const entry = line.slice(3).trim();
    if (entry) unreported.add(entry);
  }
  const committed = spawnSync('git', ['diff', '--name-only', baseline, 'HEAD'], { cwd: repoRoot, encoding: 'utf8' });
  for (const line of committed.stdout.split('\n')) {
    if (line.trim()) unreported.add(line.trim());
  }
  return [...unreported];
}

function mapFilesToSpecs(changed, allSpecs) {
  if (changed.some((file) => file.startsWith('src/components/events/'))) {
    const touched = new Set(
      changed
        .filter((file) => file.startsWith('src/components/events/'))
        .map((file) => file.split('/')[3])
    );
    const targets = new Set(['core.spec.js']);
    for (const code of touched) {
      const spec = allSpecs.find((s) => s.endsWith(`/events/${code}.spec.js`));
      if (spec) targets.add(spec);
    }
    return [...targets].sort();
  }
  // Shared code or configs -> full suite for safety.
  return allSpecs;
}

const fullSpecs = collectSpecs(specsDir);
const eventCodes = fullSpecs
  .filter((spec) => spec.includes('/events/'))
  .map((spec) => path.basename(spec, '.spec.js'));

const wantFull = process.argv.includes('full') || process.argv.includes('--full');
const baselineFile = baselinePath();
let baseline = null;
try {
  baseline = readFileSync(baselineFile, 'utf8').trim();
} catch {
  baseline = null;
}

let selected = [];
if (wantFull || !baseline) {
  selected = fullSpecs;
  console.log(`incremental: full sweep (${selected.length} spec files)` +
    (baseline ? '' : ' — no baseline yet'));
} else {
  const changed = changedFiles(baseline);
  if (changed.length === 0) {
    console.log('incremental: nothing changed since the last audit — nothing to test.');
    process.exit(0);
  }
  selected = mapFilesToSpecs(changed, fullSpecs, eventCodes);
  console.log(`incremental: ${changed.length} changed path(s) -> ${selected.length} spec file(s)`);
  for (const file of changed) console.log(`  changed: ${file}`);
}

const targetLines = selected.map((spec) => `tests/e2e/specs/${spec.split(path.sep).join('/')}`);

if (process.argv.includes('--list')) {
  for (const line of targetLines) console.log(line);
  process.exit(0);
}

console.log(`playwright ${targetLines.join(' ')}`);
const playwrightCli = path.join(repoRoot, 'node_modules', '@playwright', 'test', 'cli.js');
const runResult = spawnSync(process.execPath, [playwrightCli, 'test', ...targetLines], {
  cwd: repoRoot,
  stdio: 'inherit'
});

if (runResult.status === 0) {
  try {
    const head = run('git', ['rev-parse', 'HEAD']);
    writeFileSync(baselineFile, `${head}\n`);
    console.log(`incremental: baseline stamped -> ${baselineFile} (${head})`);
  } catch {
    console.log('incremental: audit passed but could not stamp the baseline.');
  }
} else {
  console.log('incremental: test run failed — baseline NOT stamped.');
}
process.exit(runResult.status || 0);