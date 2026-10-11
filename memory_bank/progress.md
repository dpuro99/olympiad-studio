# Project Status

## Verified Current State

- React 19 + Vite single-page application. Supabase provides Google OAuth only; there is no backend data access yet. Practice tools persist explicitly to browser `localStorage`.
- `src/components/events/registry.js` is the source of truth for event workspaces. Every registered event has a manual-backed 2027 overview module.
- The registry lists nine events on the official 2027 slate: eight Division C events and Write It, Do It B.
- Live event tools beyond the overview:
  - Electric Vehicle: two-run Score Calculator and local Practice Run Logger (verified against the manual's example runs).
  - Chemistry Lab: Gas-Law Practice and a user-authored Kinetics experiment notebook (Regional/Invitational scope).
  - Circuit Lab: Ohm's law and series/parallel practice calculator.
  - Dynamic Planet: freshwater stream-discharge and water-budget measurement tools.
  - Boomilever: structural efficiency estimator (7,500 g bonus / 15,000 g cap).
  - Anatomy and Physiology: user-authored practice-notes journal with CSV export.
- Designer Genes, Rocks and Minerals, and Write It, Do It currently have overview modules only; their interactive tools are planned.
- `npm test` (43 tests), `npm run lint`, and `npm run build` pass.

## Cleanup Applied

- Removed unused Vite template leftovers (`src/App.css`, `react.svg`, `vite.svg`, `hero.png`, `logo.png`, `logoRect.png`, `public/icons.svg`, `public/favicon.svg`) and the orphaned `ComingSoon.jsx`.
- Removed off-slate event folders (`entomology/`, `machines/`, `metricmastery/`) and the stale `scripts/rank_tools.py`.
- Fixed the Anatomy tool (undefined styles / effect misuse), shared the CSV/safe-parse helpers from `anatomyNotes.js`, and neutralized CSV-formula injection.
- Fixed the unused Circuit Lab import, Boomilever zero-load (participation-only) case, and the Dynamic Planet manual citation (`§3.f`).
- Reconciled `memory_bank/` wording with the authentication-only Supabase reality.
- Migrated off Cline: folded `.clinerules/` into `AGENTS.md`, converted the ToolBuilder spec into the `.opencode/skill/build-event-tool` skill, and removed the Cline-only `.clinerules/` and `.github/agents/` folders.

## Remaining Work

- User preference: focus on Regional/Invitational; do not implement State/National-only material unless specifically requested. Avoid hardcoded quiz questions; prefer student-authored data tools.
- Build interactive tools from the audited `tool-ideas.md` plans, in this priority order:
  1. Event-specialized compute/simulate tools — Circuit Lab digital-logic workbench, Chemistry Lab stoichiometry/nomenclature generator, Designer Genes molecular-sequence workbench, Dynamic Planet calculator toolbox + generated map/hydrograph practice, Rocks and Minerals mineral identification key + user-authored specimen cards, Anatomy spirometry/process/diagram sims, Write It, Do It timed relay, Boomilever build/test log.
  2. The shared Reference & Study Compiler (sheet mode first: **Anatomy done**, next DG and Chem incl. per-participant Chem; then binder mode for Circuit/DP/R&M), then the build/test logs, compliance checklists, and Objective Tracker scaffold.
  3. Backburner general tools (max 1–3) tracked in `src/components/general/tool-ideas.md`.
- Continue checking official corrections, FAQ clarifications, and state/tournament-specific updates during the season.
- Preserve the manuals as ignored local source material; never commit or deploy the rule PDFs.

## Memory System

- opencode has no persistent memory between sessions. This `memory_bank/` directory is the durable cross-session project context.
- `projectBrief.md`, `systemArchitecture.md`, and `decisions.md` are auto-loaded every session through the `instructions` field in the root `opencode.json`. `progress.md` is read on demand because it changes often.
- Update `progress.md` whenever scope, architecture, behavior, known bugs, or uncertainties change. Append dated entries to the Changelog instead of rewriting past ones.

## Changelog

- **2026-10-11** — Tool taxonomy finalized and specs updated. Added a combined **Reference & Study Compiler** (manual-derived objective tracker + allowed-resource compiler + mastery-based pruning + print/export) to the six study events: sheet mode for Anatomy, Designer Genes, and Chemistry Lab (per-participant), binder mode for Circuit Lab, Dynamic Planet, and Rocks and Minerals (with pinned external items). It is one shared engine with per-event config; sheet mode ships before binder mode. Moved the Self-Quiz Flashcards idea out of the Anatomy spec into a new backburner `src/components/general/tool-ideas.md` (with an inert `generalToolIdeas.js` TODO placeholder) alongside a generic event timer and a rules-change highlighter. Rationale confirmed by research: the question/flashcard/test-exchange niche is saturated (scio.ly, olyprep, Grind, Quizlet/Anki) and official SO guidance is almost entirely about hand-built cheat sheets/binders — which nobody makes a tool for. All additions are `Planned`; no rules content, `registry.js`, components, or tests changed.
- **2026-10-11** — Tool-plan audit: reviewed all nine `tool-ideas.md` plans for prep value and cross-event reuse. Reshaped the planned "answer-bank" tools into generators/simulators/student-authored tools (also removing the recurring "content architecture needed" blocker) and added missing high-value tools. Changes: Anatomy adds Self-Quiz Flashcards, a generated spirometry/flow-volume practice, a digestive/immune process simulator, and a system diagram drill; Boomilever adds a Build/Test Log; Chemistry Lab adds a Stoichiometry/Nomenclature generator and folds the static experimental-design checklist into the kinetics notebook; Circuit Lab adds a Digital Logic & Boolean workbench and a PN-junction/LED calculator, extends practice to power/energy/Kirchhoff, and rescopes the hands-on simulator to concrete listed tasks; Designer Genes adds a Molecular Sequence Workbench and a karyotype/meiosis drill (replacing the molecular-biology answer bank); Dynamic Planet adds a freshwater calculator toolbox and generated map/hydrograph practice; Electric Vehicle adds a labeled run-planning estimator; Rocks and Minerals adds a Mineral Identification Key and makes specimen practice user-authored; Write It, Do It adds a timed relay with a structure generator. Live tools are unchanged; all additions are `Planned`. No registry/JSX/test changes.
- **2026-10-11** — Full rules-compliance audit against the official 2027 manuals (both PDFs extracted to text and cross-checked event by event). Live tools and registry were already accurate (scoring formulas and the two manual EV example runs reproduce exactly; all nine events' page citations, level gating, and exclusions verified). Fixed: added missing `manualReference` to the three EV modules; removed a fabricated FAQ permalink from `electricvehicle/info.md` (kept the verified live FAQ page); corrected Dynamic Planet citations (§3.a.ii water budgets, §3.f.ii–iii discharge, §3.h.ii lake budgets) in `registry.js`, `FreshwaterTools.jsx`, and the tests; aligned the binder rule copy to manual §2.c; wired the previously-unused `calculateSeriesParallel` into the Circuit Lab calculator and stopped overstating its coverage in the spec; added the manual §8.r.v single-successful-run note to the EV score calculator; and grounded the three planning specs (Designer Genes, Rocks and Minerals, Write It Do It) plus the anatomy V(D)J mention in actual manual text (page ranges, level tags, allowed resources, timing, scoring, tiebreaks).
- **2026-10-10** — Tooling and process pass: redesigned the `.opencode/skill/build-event-tool` skill around a canonical `## Tool:` spec block (status/goal/interaction-loop/content/UI/scoring/level-gating/persistence/open-questions), a logic-first workflow (co-located `*.js` module + unit test in `tests/` before JSX), a rule-mandatory test/lint/build gate, and reference components to copy instead of asking design questions. Converted all nine events' `tool-ideas.md` to that canonical template, preserving every verified manual citation and the Live/Planned status of each tool. Silenced the Vite >500 kB warning with `build.chunkSizeWarningLimit: 600` (main chunk is framework-only after lazy-loading). Split instructions: generic best practices (commit-asking, memory habits, a11y/security, working style) now live in the global `~/.config/opencode/AGENTS.md`; project `AGENTS.md` is repo-specific only. Commit policy is now ask-first unless the user says "commit and push" or invokes `/commit-push`.
- **2026-10-10** — Performance and hygiene pass: lazy-loaded all 9 event tool components (`React.lazy` in `registry.js`, `Suspense` fallback in `App.jsx`), cutting the initial bundle from 634 kB to 561 kB with per-tool async chunks. Validated session-restored navigation against the registry so stale event/module ids no longer leave an empty pane. Fixed the sidebar Workspace Home button emitting `module_opened` analytics for a nonexistent module. Made the dashboard shell sticky-free and stacked below 720px (`.dashboard-shell`/`.dashboard-sidebar` media query). Guarded GA4 calls when `VITE_GA4_MEASUREMENT_ID` is unset and documented the var in `.env.example`. Pinned Tabler icons to 3.49.0 and replaced the nonexistent `ti-circuit` icon with `ti-bulb`. Removed the empty `src/components/events/general/` folder.
- **2026-10-09** — Cleanup and tooling pass: removed Vite/template leftovers and the orphaned `ComingSoon.jsx`; removed off-slate event folders and `scripts/rank_tools.py`; migrated off Cline (folded `.clinerules/` into `AGENTS.md`, converted the ToolBuilder spec into the `.opencode/skill/build-event-tool` skill). Fixed the Anatomy effect/CSV issues, the unused Circuit Lab import, the Boomilever zero-load case, and the Dynamic Planet citation. Normalized line endings to LF (`.gitattributes` + `git add --renormalize`) to end whole-file CRLF churn. Added `opencode.json` memory auto-loading, `memory_bank/decisions.md`, and the `.opencode/command/commit-push.md` workflow command.

## Working Agreement

- Run `npm test`, `npm run lint`, and `npm run build` after domain/UI changes.
- Keep event calculations and rule-specific behavior inside the owning event directory.
- Cite the relevant rule-manual page/section beside rule-specific summaries and calculators.
- Do not call a tool or score official until its logic has been checked against the current packet and applicable corrections/clarifications.
