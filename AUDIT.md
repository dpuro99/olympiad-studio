# Olympiad Studio — Browser Audit Report

**Date:** 2026-11-26 (nav/dashboard polish + Phase 3 item 5 Generic Event Timer sweep)
**Scope:** Full sweep (all 15 spec files, 158 tests), `CI=1 npx playwright test --reporter=list`.
**Audited state:** `HEAD` = `6a7a9f0` (`Polish navigation and dashboard controls`, committed locally, nothing pushed), plus the uncommitted Generic Event Timer work: dedicated general-tool registry with `activeTool.kind === 'general'` wiring, a shared General tools section on Dashboard and All Tools, catalog count/filter handling for general tools, cited WIDI/Boomilever/EV presets, and a new interactive `general.spec.js`. This run used the plain full-suite runner, so the baseline file remains `8fb8441`; it was not restamped.
**Tooling:** Playwright + headless Chromium, driven by the repo's `tests/e2e/` harness; guest mode only (no OAuth). `.env` present and loaded by the dev server.

## Current-run scope note

This sweep includes the Dashboard `Choose events` dropdown refactor: the helper paragraph was removed; every row in `My Events` and `All events` is a single full-row button with star icon, event name, and division; starred events show a filled amber `ti-star-filled` icon; the whole row has a hover/focus state. Adding or removing an event opens a styled in-app `ConfirmDialog` (`role="dialog" aria-modal="true"`, warm minimalist styling, focus trap/return, Escape/backdrop close, Cancel autofocus) instead of `window.confirm`; cancelling leaves the profile untouched. The remove dialog says "Remove <event> from My Events?" with the button "Remove from My Events". All Tools catalog and Dashboard two-column layout (tools left, Objective Tracker right rail, 68/32 split, unclipped dropdown) are also covered. No registered module, rule citation, storage key or season data changed.

## Summary

| Gate | Result |
| --- | --- |
| Playwright E2E — full sweep | **158 / 158 passed** (38.5 min, 1 worker) |
| Playwright E2E — focused re-runs | core 73/73, general timer 4/4, nav 13/13 passed |
| Unit tests (`npm test`) | 301 / 301 passed |
| Lint (`npm run lint`) | clean |
| Build (`npm run build`) | success (pre-existing >600 kB main-chunk advisory) |
| Console / page errors / failed requests during E2E | none beyond filtered analytics noise |
| Baseline | unchanged at `8fb8441` (plain full-suite run, not the baseline-stamping runner) |

Every registered event workspace and module was opened, visually captured (200+ screenshot/DOM artifacts in `test-results/screenshots/`), and checked for console errors. Interactive tools were exercised with real input, not just rendered.

### Coverage

- **Core / navigation:** landing → guest entry, full-screen workspace, Dashboard / All Tools page buttons, in-page `Choose events` dropdown (whole-row buttons, filled star, in-app confirmation for both add and remove), breadcrumb/back from an open tool, theme toggle + persistence, persistent top nav, skip link. The nav contains **no event picker** — starring happens in the Dashboard dropdown or in an All Tools section. The nav bar is identical on landing, both workspace pages and tool overlays, with one solid `Sign in` button for guests and no hover/underline treatment on the brand.
- **Dashboard / All Tools:** starred events' tools sit in the left column and the Objective Tracker in a right rail at desktop width (asserted by bounding boxes); below 1040 px they stack with tools first. All Tools has a sticky left filter rail beside the event feed: its desktop geometry, live count, Reset / Clear all filters, search / scope / tool-type filtering, pastel stage badges, responsive card grid and phone-width drawer flow are all asserted. The drawer declares dialog semantics, moves focus to `Close filters`, traps Tab, covers the nav, and returns focus to `Filters` on Escape; a whitespace-only query leaves Reset/Clear disabled. All Tools still lists every registered event and tool. Starring and unstarring were exercised in both directions (including the add-confirmation cancel path); the full-screen compiler returns to the launching page and has no dedicated dashboard card or `Open compiler` shortcut.
- **Objective Tracker:** a read-only right-rail panel over the six Reference & Study Compilers, using the same visual language as other tool panels; verified not-started totals, live Status/search filters, a saved sheet's status/notes rollup, corrupt and other-manual sheet notices, denied-`localStorage` announcement, opening the owning compiler from its rows, and 375 px fit.
- **Choose events dropdown:** the hero no longer clips the absolutely positioned dialog; an `elementFromPoint` probe below the hero boundary confirms the panel is hit-testable; whole-row hover, filled star for starred events, in-app confirmation on both add and remove (including cancel on remove), and keyboard flows all pass.
- **All 9 events, all registered modules** rendered and matched expected content, including the event sections' manual-verified rule summaries and tools in journey order.
- **General tools:** the top-level `generalTools` inventory covers the Generic Event Timer's render and 375 px fit. Interactive flows drive the WIDI 25:00 writing → 20:00 building phase strip with its citation, the EV 8:00 and Boomilever 6:00 presets, invalid custom-duration validation, and countdown → pause → reset → completion. General tools appear as a star-free section on both workspace pages, count as tools (not events) in the catalog, and stay out of division scopes.
- **Responsive:** every module at **375 px** with a horizontal-overflow assertion, plus the **720 px** breakpoint test (`row` at 721 px, `column` at 720 px) and a full-viewport dashboard-shell check at desktop and phone widths.
- **Theme actually applies:** computed `body` background differs between light and dark (not just the `data-theme` attribute).
- **A11y:** every visible heading has a unique accessible name (duplicate-name guard on every module render).
- **Print/PDF:** print stylesheet exercised with `emulateMedia({ media: 'print' })` (visibility + non-zero box); compilers emit a real PDF via `page.pdf()` whose extracted text must contain the authored block.
- **Resilience:** disabled and corrupt `localStorage` per tool, corrupt navigation payload, cancelling Clear/Delete confirmations, JSON import/rehydration, and cross-manual sheet notices.
- **Interactive flows driven:** EV score (manual examples 118.17 / 109.79), EV run logger, EV course geometry, EV kit/program compliance checklist (live `n of m` self-check summary, kit-clause switch, per-clause notes and confirm-gated reset), boomilever estimator + build log + structure compliance worksheet (live 40–45 cm / 2.5 cm geometry checks, contact-depth Tier 2 consequence, 15 kg bonus gate and section-cited build rules), circuit lab hands-on simulator (seeded 42 cases: probe the mystery resistor with a focusable SVG node and check the derived value, light a 3-way SPDT lamp then hand control between switches, and locate an open/short by probing voltages), gas laws / kinetics / stoichiometry, anatomy respiratory data practice (reading a generated flow-volume loop and a shifted O₂–Hb curve, then grading both), anatomy system diagram drill (labelling SVG targets, the keyboard path, check/reveal and a system switch), anatomy digestive/immune process practice (ordering the alimentary canal, sorting innate/adaptive terms and revealing the cited key, with the level gate), circuit practice + PN-junction/LED calculator (live resistor/power readouts, orientation and forward-drop checks) + digital logic workbench + drag canvas (wire deletion, tidy-up, persistence, corrupt recovery), freshwater tools + toolbox + map/hydrograph cases, designer genes molecular sequence workbench + genetics workbench (live Punnett squares, Hardy–Weinberg, gated two-/three-point mapping and heritability) + karyotype/meiosis drill (seed-fixed stage classification, nondisjunction gamete/zygote derivation, direct-manipulation karyotype rows and the level-gated somatic-recombination note), mineral ID key + specimen practice, WIDI timed relay (writer description with a live drawing-reference check, target hidden during the build phase, per-piece recording and the practice-only rubric reveal), and all 6 Reference & Study Compilers.

## Findings

No new functional defects found in this sweep. All 158 tests passed, including the regression guards for previously fixed issues and the new nav/catalog, general-tool and timer coverage:

- **HIGH (fixed earlier, still guarded)** — blank printed page from `#root { display: none }` in print CSS; `expectPrintSheetRenders()` + real `page.pdf()` text assertion prevent recurrence.
- **MEDIUM (fixed earlier, still guarded)** — ~11 px mobile sidebar overflow at 375 px; `expectNoHorizontalOverflow(page, 375)` runs on every module.
- **LOW (fixed earlier, still guarded)** — duplicate accessible heading names; `expectUniqueHeadingNames(page)` runs on every module.
- **LOW (fixed earlier, still guarded)** — EV run-logger native validation shadowing its custom message; e2e drives the incomplete-run path.
- **LOW (fixed in the previous sweep, still guarded)** — the tracker's `sr-only` table-header span leaked into `document.documentElement.scrollWidth` at 375 px; the header now uses `aria-label` on `<th>`. Its 375 px fit is asserted on the embedded tracker too.
- **LOW (fixed in this build, still guarded)** — the hidden 375 px nav breadcrumb won `expectModuleRendered`'s page-wide text match; the guard now scopes `expectText` to `#main-content`. Analytics `requestfailed` noise is filtered from both console and request handlers.
- **MEDIUM (fixed in this build, still guarded)** — `.dashboard-hero { overflow: hidden }` clipped the `Choose events` dialog at the card border. The hero is now overflow-visible (with its accent stripe rounded instead of clipped), the hero sits above the right rail in the stacking order, and `elementFromPoint` must hit the dialog below the hero boundary.
- **LOW (fixed during catalog verification, still guarded)** — the desktop geometry guard assumed the feed header touched `.catalog-main`'s outer edge; the container has a 28 px content inset, so the assertion now checks a 16–32 px inset against that box. The mobile drawer's `Close filters` button was not focused while CSS `visibility` was still transitioning; visibility now flips instantly on open (delayed only on close) and focus is deferred to the next animation frame. Both paths are asserted in `nav.spec.js`.
- **LOW (fixed during catalog review, still guarded)** — Reset / `Clear all filters` treated a whitespace-only query as dirty although the pure filter trims it; `hasFilters` now uses `query.trim()`. The drawer had a dimming backdrop and Tab trap but exposed no dialog semantics, and the sticky nav painted above it and stayed clickable; the open drawer now declares `role="dialog"`/`aria-modal`, raises above the nav and pointer-disables it, with e2e assertions for the semantics and an `elementFromPoint` hit over the old nav strip.
- **LOW (fixed in this sweep, still guarded)** — `nav.spec.js` hard-coded the catalog total as `9 events · 33 tools`; adding the timer made it 34 and failed the full sweep. The assertion now derives the tool count from the rendered cards (`allToolCount`), so registering a general tool no longer stales the guard.
- **INFO — audit hygiene:** an earlier dashboard sweep failed with navigation/teardown timeouts because Playwright's `reuseExistingServer: true` kept using a stale project Vite server (PIDs 5776/23772, started 2026-11-23, ~3188 CPU seconds). Only those project-owned processes were stopped; no Chrome processes were touched. The reported 147/147, 150/150 and 158/158 results are fresh-server sweeps.

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
