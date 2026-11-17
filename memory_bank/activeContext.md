# Active Context

## Current Focus (2026-11-17)
**Phase 2.5 — Intuitive workflow & tool simplification.** Approved and recorded in `memory_bank/roadmap.md` v1.8. Two tracks: Track A makes each event read as an ordered workflow; Track B makes each tool less busy. Track B runs first. First pass complete: `FreshwaterToolbox.jsx` now shows one calculator at a time behind a stepper + select, with optional inputs and equations collapsed. Also folded the manual-verified overview into the field guide and removed the standalone overview tool — the guide now carries the rule summary, citation and working event/rules links, and events with no tools (WIDI) show only that summary. Both changes are verified and **await the commit David approved with "Go"**. Next = B1 (CircuitLabPractice, ScoreCalc, BoomileverEstimator, FreshwaterTools, KineticsPractice, GasLawPractice). The 2026-11-05 redesign foundation and 2026-11-12 field guide are the preceding work, committed as baseline `3d4bf32`.

## Recent Changes
- Created `PRODUCT.md` (product truth for redesign).
- Overhauled design tokens in `src/index.css`: warm amber-accent palette (dark/light), Inter typography, softer radii (`--radius-*`), shadow/spacing/transition scales, loading pulse animation; preserved print/circuit/EV-course rules and added backward-compat aliases for `--border-radius-*` so legacy tool styles still resolve.
- Added Inter font load in `index.html`.
- Redesigned shared primitives in `src/components/general/ui/primitives.jsx` (visual refresh only; prop signatures and behavior unchanged).
- Redesigned shell in `src/App.jsx` (sidebar/header/breadcrumbs/loading/module nav styling; navigation, auth, registry, and handlers unchanged).
- Redesigned `src/components/general/Logo.jsx`, `LandingHome.jsx`, `Home.jsx`, and `AuthRequired.jsx` (warmer, student-friendly copy/visuals; functionality and contracts preserved).
- Refined the first pages to be less centered/more complex (2026-11-05 follow-up): `LandingHome.jsx` now uses an asymmetric hero + “inside the studio” rail + bento grid (with responsive `.landing-*`/`.lobby-hero-grid` classes in `index.css`); dashboard lobby `Home.jsx` uses an asymmetric stats header. Landing year label now derives from `ACTIVE_SEASON` (fixing a season-boundary test regression from a hardcoded “2027”).
- Palette tightened to “Citrus Workshop” (`#FFC15E #F7B05B #F7934C #CC5803 #1F1300` adapted); blue `--color-*-info` tokens were replaced with warm palette-tight values in `src/index.css`.
- Robotic/monospace UI chrome reduced in safe files: `LandingHome.jsx`, `Home.jsx`, `App.jsx` labels/badges, `ui/primitives.jsx` (`Eyebrow` + default input sans), and form defaults in `src/index.css`. `RangeField` numeric readouts and print/reference print styling remain mono by design.
- Fixed remaining mono on event/reference-compiler chrome (2026-11-05): `src/components/general/EventRulesOverview.jsx` “Verified against {year} official rules” label now uses sans styling; `src/components/general/ReferenceCompiler.jsx` (shared, used by all per-event reference compilers) had minimal targeted mono→sans edits on its header, level badges, local input style, and progress/budget stats. `ReferenceCompiler.jsx` was pre-existing dirty; only presentation-only style changes were made.

## Active Decisions
- "Warm Workshop" direction: approachable/warm, not robotic/computery; accent moved to `--color-accent-primary` (amber) while semantic `--color-text-info` remains available.
- Registry, local-state navigation, formulas, storage keys, and module contracts must not change.
- Backward-compat CSS aliases added to avoid breaking event tools that still reference `--border-radius-*`.

## Blockers / Uncertainties
- **Resolved 2026-11-17:** the "58 pre-existing uncommitted modified files" warning was stale. Re-checked: 27 entries, all this project's own uncommitted redesign + field-guide work (no alien changes). User approved committing them as the baseline before Phase 2.5 starts.
- `Stepper` is now used by `FreshwaterToolbox.jsx` (first 2.5 pass); `Accordion` is still exported from `ui/primitives.jsx` but unused — B2 either uses it or deletes it.
- The FreshwaterToolbox simplification and the overview-into-guide merge are verified (191 unit / lint / build, focused Playwright 70/70, full e2e sweep pending) and await the commit David approved with "Go" — do not push or open a PR.

## Recent Changes (2026-11-05 continued)
- Improved module page chrome in `src/App.jsx`/`src/index.css` for better navigation/ease of use: breadcrumbs now show in workspace home + module pages; sidebar header shows current event name + Division/code; loading spinner uses Citrus accent + accessible text; consistent content padding (`0 24px 32px`); friendly "Module not found" empty state with back action; `@keyframes spin` in CSS.
- **Visual polish of shared `ReferenceCompiler.jsx`** (used by all 6 study-event compilers; pre-existing dirty, presentation-only edits): refreshed card styling with consistent radii/shadows, expressive status chips with color-coded active states (Not Started/Studying/Confident), improved level badges with semantic colors, better empty state with icon, enhanced budget bar with animated fill + knob + icon feedback, action buttons with icons and clearer saved/dirty state indicators, message area with icons, all spacing/typography aligned to Citrus Workshop design system. All logic/state/season handling unchanged.
- **Tool intuitiveness overhaul** (clean/untracked tool files only): added progressive-disclosure primitives (`Collapsible`, `Accordion`, `Stepper`, `EmptyState`, `PrimaryAction`) to `src/components/general/ui/primitives.jsx`; redesigned three clean event tools to use step-by-step workflows with accordion sections instead of overwhelming all-at-once layouts:
  - `MineralIdKey.jsx` (Rocks & Minerals): 5-step workflow (Scope → Observations → Candidates → Record → Backup) with accordion sections, toggle-chip observation UI, clear empty states.
  - `SpecimenPractice.jsx` (Rocks & Minerals): 4-step workflow (Deck → Drill → Missed → Record) with accordion sections, inline drill scoreboard, missed-list practice loop.
  - `MolecularSequenceWorkbench.jsx` (Designer Genes): 2-step workflow (Sequence → Tools) with accordion for composition, tabbed tools, collapsible mutation table.
- `PropertyForm.jsx` (shared R&M): grouped fields into collapsible sections for less visual clutter.
- Earlier this pass: `src/components/general/Home.jsx` event cards show ready-tool previews with clearer ARIA labels; `EventRulesOverview.jsx` and shared `ReferenceCompiler.jsx` (all 6 event compilers) shed robotic mono for sans styling; reference compiler primary actions use Citrus accent; `.breadcrumb-link` hover styling, Citrus `::selection`, `button:disabled` state added to `src/index.css`.

## Next Steps (2026-11-17)
1. Baseline redesign + field-guide work committed as `3d4bf32` (done).
2. Commit the verified `FreshwaterToolbox.jsx` simplification and the overview-into-guide merge together — David said "Go" to that commit; do not push or open a PR.
3. Phase 2.5 Track B continues with B1 (CircuitLabPractice, ScoreCalc, BoomileverEstimator, FreshwaterTools, KineticsPractice, GasLawPractice) → B3 → B4, each with `npm test`/`lint`/`build` and the event e2e flow.
4. Track A afterwards: tune each event's `journey`/`gain` and the guide's next-step wording.
5. Update `progress.md` as each batch lands. Do **not** push or open a PR without a new explicit ask; commits are only for what David approves.
