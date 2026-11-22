# Olympiad Studio — Browser Audit Report

**Date:** 2026-11-22 (EV Compliance Checklist sweep)
**Scope:** Full sweep (all 13 spec files), forced with `npm run test:e2e:changed -- full`.
**Audited state:** `HEAD` = `e0fcc49` (clean tree; Phase 2.5 + Respiratory Data Practice + LED calculator + System Diagram Drill + Digestive/Immune Process Practice + DG Genetics Workbench + DG Karyotype & Meiosis Drill + WIDI Timed Relay + Phase 3 item 1 EV Compliance Checklist all committed locally, nothing pushed). Baseline stamped to `e0fcc49` on success.
**Tooling:** Playwright + headless Chromium, driven by the repo's `tests/e2e/` harness; guest mode only (no OAuth). `.env` present and loaded by the dev server.

## Summary

| Gate | Result |
| --- | --- |
| Playwright E2E — full sweep | **140 / 140 passed** (5.6 min, 1 worker) |
| Unit tests (`npm test`) | 246 / 246 passed |
| Lint (`npm run lint`) | clean |
| Build (`npm run build`) | success (pre-existing >600 kB main-chunk advisory) |
| Console / page errors / failed requests during E2E | none beyond filtered analytics noise |
| Baseline | stamped to `e0fcc49` |

Every registered event workspace and module was opened, visually captured (179 screenshots + DOM snapshots in `test-results/screenshots/`), and checked for console errors. Interactive tools were exercised with real input, not just rendered.

### Coverage

- **Core / navigation:** landing → guest entry, lobby → workspace → module click-through, theme toggle + persistence, persistent top nav, breadcrumbs, skip link.
- **All 9 events, all registered modules** rendered and matched expected content, including the field guide's folded-in rule summary and the "Up next" step.
- **Responsive:** every module at **375 px** with a horizontal-overflow assertion, plus the **720 px** breakpoint test (`row` at 721 px, `column` at 720 px).
- **Theme actually applies:** computed `body` background differs between light and dark (not just the `data-theme` attribute).
- **A11y:** every visible heading has a unique accessible name (duplicate-name guard on every module render).
- **Print/PDF:** print stylesheet exercised with `emulateMedia({ media: 'print' })` (visibility + non-zero box); compilers emit a real PDF via `page.pdf()` whose extracted text must contain the authored block.
- **Resilience:** disabled and corrupt `localStorage` per tool, corrupt navigation payload, cancelling Clear/Delete confirmations, JSON import/rehydration, and cross-manual sheet notices.
- **Interactive flows driven:** EV score (manual examples 118.17 / 109.79), EV run logger, EV course geometry, EV kit/program compliance checklist (live `n of m` self-check summary, kit-clause switch, per-clause notes and confirm-gated reset), boomilever estimator + build log, gas laws / kinetics / stoichiometry, anatomy respiratory data practice (reading a generated flow-volume loop and a shifted O₂–Hb curve, then grading both), anatomy system diagram drill (labelling SVG targets, the keyboard path, check/reveal and a system switch), anatomy digestive/immune process practice (ordering the alimentary canal, sorting innate/adaptive terms and revealing the cited key, with the level gate), circuit practice + PN-junction/LED calculator (live resistor/power readouts, orientation and forward-drop checks) + digital logic workbench + drag canvas (wire deletion, tidy-up, persistence, corrupt recovery), freshwater tools + toolbox + map/hydrograph cases, designer genes molecular sequence workbench + genetics workbench (live Punnett squares, Hardy–Weinberg, gated two-/three-point mapping and heritability) + karyotype/meiosis drill (seed-fixed stage classification, nondisjunction gamete/zygote derivation, direct-manipulation karyotype rows and the level-gated somatic-recombination note), mineral ID key + specimen practice, WIDI timed relay (writer description with a live drawing-reference check, target hidden during the build phase, per-piece recording and the practice-only rubric reveal), and all 6 Reference & Study Compilers.

## Findings

No new functional defects found in this sweep. All 140 tests passed, including the regression guards for previously fixed issues:

- **HIGH (fixed earlier, still guarded)** — blank printed page from `#root { display: none }` in print CSS; `expectPrintSheetRenders()` + real `page.pdf()` text assertion prevent recurrence.
- **MEDIUM (fixed earlier, still guarded)** — ~11 px mobile sidebar overflow at 375 px; `expectNoHorizontalOverflow(page, 375)` runs on every module.
- **LOW (fixed earlier, still guarded)** — duplicate accessible heading names; `expectUniqueHeadingNames(page)` runs on every module.
- **LOW (fixed earlier, still guarded)** — EV run-logger native validation shadowing its custom message; e2e drives the incomplete-run path.

### INFO — No error boundary around lazy tool modules

`App.jsx` renders lazy modules in `<Suspense>` but without an error boundary. A thrown render error in any tool would blank the whole app rather than degrade to one panel. Not observed in this audit; the resilience suite confirms malformed *stored data* is handled, but a render-time throw is still unguarded. Robustness gap, not a defect found.

### INFO — Print pagination beyond content presence

The harness proves the sheet renders under print media and that `page.pdf()` output contains authored content. Exact pagination (page-break placement, physical margins) in a real print dialog remains unverified; a manual print preview is worthwhile before relying on printed sheets.

### INFO — Single-run final score requires marking Run 2 failed

`calculateFinalScore` needs two completed run scores; a team with one successful run must mark Run 2 as failed to see a final score. This matches the manual and is documented in `ScoreCalc.jsx`, but is worth confirming as acceptable UX.

## Not verified / limitations

Each item was either reproduced in the harness or is genuinely external; "headless" is not treated as a reason to skip an observable behavior.

- **Google OAuth sign-in** and `requiresAuth` gating — no module currently requires auth, so guest mode covers all registered modules.
- **Real Supabase network behavior** beyond session init; no backend reads/writes exist.
- **Cross-browser:** Chromium only.
- **Real print dialog / OS-level pagination** (content presence and print-media visibility *are* covered).

## How to run

```bash
npm run test:e2e                    # full sweep
npm run test:e2e:changed            # only what changed since the last audit (baseline-aware)
npm run test:e2e:changed -- full    # force a full sweep and stamp the baseline
npm run audit                       # alias for the changed-only run
npx playwright show-report          # open the HTML report (playwright-report/)
```

Artifacts: full-page screenshots + DOM text snapshots in `test-results/screenshots/`, HTML report in `playwright-report/`, traces on failure in `test-results/`.
