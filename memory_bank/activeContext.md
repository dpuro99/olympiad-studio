# Active Context

## Current Focus (2026-11-05)
**Redesign ("Warm Workshop") — foundation complete.** The app shell and shared design system were redesigned to be polished, casual, and approachable for students while keeping the engineering workbench feel. All tools, registry, navigation, calculations, and localStorage keys remain functionally unchanged.

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
- **58 pre-existing uncommitted modified files** in the working tree (unrelated in-progress work). Do not touch or stage them. The redesign changes are limited to `src/index.css`, `src/App.jsx`, `src/components/general/ui/primitives.jsx`, `src/components/general/LandingHome.jsx`, `Home.jsx`, `Logo.jsx`, `AuthRequired.jsx`, `index.html`, `PRODUCT.md`, and `memory_bank/activeContext.md`.
- Event tool components with legacy/local styling that are already in the dirty set cannot be migrated now without risking conflicts; CSS aliases keep them functional. Migrate only when those files are clean or with explicit coordination.

## Recent Changes (2026-11-05 continued)
- Improved module page chrome in `src/App.jsx`/`src/index.css` for better navigation/ease of use: breadcrumbs now show in workspace home + module pages; sidebar header shows current event name + Division/code; loading spinner uses Citrus accent + accessible text; consistent content padding (`0 24px 32px`); friendly "Module not found" empty state with back action; `@keyframes spin` in CSS.
- **Visual polish of shared `ReferenceCompiler.jsx`** (used by all 6 study-event compilers; pre-existing dirty, presentation-only edits): refreshed card styling with consistent radii/shadows, expressive status chips with color-coded active states (Not Started/Studying/Confident), improved level badges with semantic colors, better empty state with icon, enhanced budget bar with animated fill + knob + icon feedback, action buttons with icons and clearer saved/dirty state indicators, message area with icons, all spacing/typography aligned to Citrus Workshop design system. All logic/state/season handling unchanged.
- **Tool intuitiveness overhaul** (clean/untracked tool files only): added progressive-disclosure primitives (`Collapsible`, `Accordion`, `Stepper`, `EmptyState`, `PrimaryAction`) to `src/components/general/ui/primitives.jsx`; redesigned three clean event tools to use step-by-step workflows with accordion sections instead of overwhelming all-at-once layouts:
  - `MineralIdKey.jsx` (Rocks & Minerals): 5-step workflow (Scope → Observations → Candidates → Record → Backup) with accordion sections, toggle-chip observation UI, clear empty states.
  - `SpecimenPractice.jsx` (Rocks & Minerals): 4-step workflow (Deck → Drill → Missed → Record) with accordion sections, inline drill scoreboard, missed-list practice loop.
  - `MolecularSequenceWorkbench.jsx` (Designer Genes): 2-step workflow (Sequence → Tools) with accordion for composition, tabbed tools, collapsible mutation table.
- `PropertyForm.jsx` (shared R&M): grouped fields into collapsible sections for less visual clutter.
- Earlier this pass: `src/components/general/Home.jsx` event cards show ready-tool previews with clearer ARIA labels; `EventRulesOverview.jsx` and shared `ReferenceCompiler.jsx` (all 6 event compilers) shed robotic mono for sans styling; reference compiler primary actions use Citrus accent; `.breadcrumb-link` hover styling, Citrus `::selection`, `button:disabled` state added to `src/index.css`.

## Next Steps
1. Run broader e2e (resilience and/or key event specs) if desired to catch regressions beyond core render/responsive coverage.
2. Incrementally migrate clean (non-dirty) event tool components to the new design system/primitives when safe; re-verify print/reference compiler rendering and responsive behavior after visual changes.
3. Update `memory_bank/progress.md` with further redesign batches as they land.
4. Do **not** commit, amend, push, or open a PR unless explicitly asked.
