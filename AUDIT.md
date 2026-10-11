# Olympiad Studio — Browser Audit Report

**Date:** 2026-10-11 (second pass — "drive the medium" hardening)
**Scope:** Full sweep. This pass stopped treating observable states (print/PDF, responsive, theme, storage, a11y) as "not verifiable headlessly" and now reproduces each environment in the harness and asserts real output.
**Audited commit:** `421b35a` (working tree includes the e2e harness + app fixes below, not yet committed)
**Tooling:** Playwright + headless Chromium ("chromium-headless-shell" 156), driven by `tests/e2e/`; guest mode only (no OAuth).

## Summary

| Gate | Result |
| --- | --- |
| Playwright E2E (`npm run test:e2e`) | **79 / 79 passed** |
| Unit tests (`npm test`) | 53 / 53 passed |
| Lint (`npm run lint`) | clean |
| Build (`npm run build`) | success |
| Console errors / failed requests during E2E | none (beyond filtered analytics/Supabase noise) |

Every registered event workspace and module was opened, visually captured, and checked for console errors. Interactive tools were exercised with real input, not just rendered.

### Coverage

- **Core / navigation:** landing page → guest entry, lobby → event workspace → module click-through, light/dark theme toggle + persistence.
- **All 9 events, all 23 registered modules** rendered and matched their expected content (`test-results/screenshots/module_*.png` + `.txt` DOM snapshots).
- **Responsive:** every module rendered at **375 px** with a horizontal-overflow assertion and a screenshot (`mobile_*.png`), plus a **720 px breakpoint** test proving the shell is `row` at 721 px and `column` at 720 px.
- **Theme actually applies:** computed `body` background differs between light and dark (not just the `data-theme` attribute).
- **A11y:** every visible heading must have a unique accessible name (duplicate-name guard wired into every module render).
- **Print/PDF:** the print stylesheet is exercised with `emulateMedia({ media: 'print' })` (visibility + non-zero box), and the compilers emit a real PDF via `page.pdf()` whose extracted text must contain the authored block (blank-printout regression guard).
- **Resilience:** disabled `localStorage` (compiler still exports), corrupt `localStorage` for the compiler + anatomy notes + gas laws + kinetics + run logger (each shows `role="alert"`, no page error), corrupt `sessionStorage` navigation (falls back to landing), cancelling the Clear/Delete confirmations leaves data intact, and a JSON import rehydrates the editor.
- **Interactive flows driven:**
  - EV score calculator — reproduces both 2027 manual example runs (**118.17** and **109.79**, final 109.79).
  - EV practice run logger — save, `localStorage` persistence, delete-with-confirmation.
  - Anatomy & Physiology practice notes — save, CSV export, clear.
  - Gas-law workbook — unknown solver, notebook save, CSV export, clear.
  - Circuit practice — series (600 Ω), parallel (54.5455 Ω), Ohm's law (24 Ω).
  - Freshwater workbench — discharge (3 m³/s) and water-budget (net +500 m³).
  - Boomilever estimator — load score, efficiency, bonus/tier text.
  - **All 6 Reference & Study Compilers** (anatomy, designer genes, chemistry lab, circuit lab, dynamic planet, rocks & minerals) — mark objective confident, author a block, prune confident objectives, change density preset, save + verify `localStorage`, JSON export (filename verified), clear with confirmation.

## Findings

### HIGH — "Print sheet" produced a blank page (found post-run, now fixed)

Reported by the user after the first sweep. The `@media print` block in `src/index.css` hid the app **including `#root`** with `display: none`, but `.reference-print-area` is rendered *inside* `#root` (`ReferenceCompiler.jsx:364`, nested under `.dashboard-shell` → `.dashboard-content`). A descendant cannot override an ancestor's `display: none`, so `display: block !important` on the print area had no effect and every printout was empty.

- **Root cause:** `src/index.css` print rules — `#root, .dashboard-shell, .dashboard-sidebar, .dashboard-content, .reference-print-area { display: none; }`.
- **Fix:** hide the app with `visibility: hidden` (which descendants *can* override) and re-reveal `.reference-print-area, .reference-print-area *`, positioning it at the page origin. No `display: none` on ancestors.
- **Regression guard:** `expectPrintSheetRenders()` in `tests/e2e/helpers.js` now runs `page.emulateMedia({ media: 'print' })`, asserts the print area is visible with a non-zero box, and checks real content is present — wired into the shared compiler flow (a blank printout now fails the suite).

### MEDIUM — Mobile dashboard overflowed the viewport by ~11 px (found this pass, now fixed)

Every module failed the new 375 px overflow assertion: `document.documentElement.scrollWidth` was **386** against a **375** viewport. Root cause was the mobile sidebar: at ≤720 px `.dashboard-sidebar` becomes a horizontal `row`, but `.dashboard-sidebar .dashboard-brand-button` kept `width: 100%` (the desktop value from `src/index.css:96`) while being `flex-shrink: 0`, so the brand button occupied the entire 375 px and pushed the tool `<nav>` past the right edge.

- **Root cause:** `src/index.css` mobile media query — brand button missing `width: auto`.
- **Fix:** `src/index.css` `.dashboard-sidebar .dashboard-brand-button { width: auto; }` inside the `@media (max-width: 720px)` block; the sidebar is now 375 px with no document-level overflow.
- **Regression guard:** `expectNoHorizontalOverflow(page, 375)` in `tests/e2e/helpers.js`, applied to all 23 modules in `core.spec.js`.

### LOW — Duplicate accessible heading names (module label + tool title) — fixed

`App.jsx:413` renders an `<h1>` with the module label, and several tool components rendered a near-identical `<h2>`, producing two headings with the same accessible name (e.g. `<h1>Reference & Study Compiler</h1>` + `<h2>Reference & Study Compiler</h2>`; `<h1>Circuit Practice Calculator</h1>` + `<h2>Circuit practice calculator</h2>`; `<h1>Practice Notes</h1>` + `<h2>Practice notes</h2>`). Screen-reader heading navigation listed the title twice and heading-based automation was ambiguous.

- **Fix:** removed the redundant in-tool `<h2>` titles (the page `<h1>` already carries them) and promoted the section headings `h3`→`h2` in `ReferenceCompiler.jsx`, `AnatomyPractice.jsx`, and `CircuitLabPractice.jsx`.
- **Regression guard:** `expectUniqueHeadingNames(page)` in `tests/e2e/helpers.js`, wired into every module render; a duplicate visible heading name now fails the suite.

### LOW — EV run logger's custom validation message is unreachable

`RunLogger.jsx:113` sets the numeric inputs `required`, so the browser's native constraint validation blocks submit before `saveRun` runs. The component's own clearer message (`RunLogger.jsx:75–82`, e.g. "Enter target/run times, both ES-measured distances, and the pusher opening width.") is therefore never shown for a normal run. Impact: users get a less specific native tooltip. Suggest `noValidate` on the form and rely on the existing custom validation (or remove the now-dead branch). Covered by `tests/e2e/specs/events/electricvehicle.spec.js` → "run logger blocks an incomplete run".

### INFO — No error boundary around lazy tool modules

`App.jsx:417–423` renders lazy modules in `<Suspense>` (loading fallback) but there is no error boundary. A thrown render error in any tool would blank the whole app rather than degrade to one panel. Not observed during this audit; the resilience suite confirms malformed *stored data* is handled, but a render-time throw is still unguarded. Noted as a robustness gap.

### INFO — Print pagination beyond content presence

The compilers' "Print sheet" button calls `window.print()`. The harness now proves the sheet renders under print media **and** that `page.pdf()` output contains the authored content (see coverage). What remains unverified is exact pagination/paging (page-break placement, physical margins) in a real print dialog; a manual print preview is still worthwhile before relying on printed sheets.

### INFO — Single-run final score requires marking Run 2 failed

`calculateFinalScore` needs exactly two completed run scores; a team with one successful run must mark Run 2 as failed to see a final score. This matches the manual and is documented in the tool copy (`ScoreCalc.jsx:179`), but is worth confirming is acceptable UX.

## Not verified / limitations

Each of these was deliberately reproduced in the harness or is genuinely external; do not treat "headless" as a reason to skip an observable behavior.

- **Google OAuth sign-in** and any `requiresAuth` gating — no module currently requires auth, so guest mode covers all registered modules.
- **Real Supabase network behavior** beyond session init; no backend reads/writes exist.
- **Cross-browser:** Chromium only.
- **Real print dialog / OS-level pagination** (content presence and print-media visibility *are* now covered).

## How to run

```bash
npm run test:e2e            # full sweep
npm run test:e2e:changed    # only what changed since the last audit (baseline-aware)
npm run audit               # alias for the changed-only run
npx playwright show-report  # open the HTML report (playwright-report/)
```

Artifacts: full-page screenshots + DOM text snapshots in `test-results/screenshots/`, HTML report in `playwright-report/`, traces on failure in `test-results/`.
