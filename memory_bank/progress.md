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
- Build interactive tools for Designer Genes, Rocks and Minerals, and Write It, Do It from their verified tool plans.
- Continue checking official corrections, FAQ clarifications, and state/tournament-specific updates during the season.
- Preserve the manuals as ignored local source material; never commit or deploy the rule PDFs.

## Memory System

- opencode has no persistent memory between sessions. This `memory_bank/` directory is the durable cross-session project context.
- `projectBrief.md`, `systemArchitecture.md`, and `decisions.md` are auto-loaded every session through the `instructions` field in the root `opencode.json`. `progress.md` is read on demand because it changes often.
- Update `progress.md` whenever scope, architecture, behavior, known bugs, or uncertainties change. Append dated entries to the Changelog instead of rewriting past ones.

## Changelog

- **2026-10-09** — Cleanup and tooling pass: removed Vite/template leftovers and the orphaned `ComingSoon.jsx`; removed off-slate event folders and `scripts/rank_tools.py`; migrated off Cline (folded `.clinerules/` into `AGENTS.md`, converted the ToolBuilder spec into the `.opencode/skill/build-event-tool` skill). Fixed the Anatomy effect/CSV issues, the unused Circuit Lab import, the Boomilever zero-load case, and the Dynamic Planet citation. Normalized line endings to LF (`.gitattributes` + `git add --renormalize`) to end whole-file CRLF churn. Added `opencode.json` memory auto-loading, `memory_bank/decisions.md`, and the `.opencode/command/commit-push.md` workflow command.

## Working Agreement

- Run `npm test`, `npm run lint`, and `npm run build` after domain/UI changes.
- Keep event calculations and rule-specific behavior inside the owning event directory.
- Cite the relevant rule-manual page/section beside rule-specific summaries and calculators.
- Do not call a tool or score official until its logic has been checked against the current packet and applicable corrections/clarifications.
