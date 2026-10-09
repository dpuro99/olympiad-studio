# Project Status

## Verified Current State

- React 19 + Vite single-page application; Supabase provides Google OAuth and existing backend infrastructure.
- `src/components/events/registry.js` is the source of truth for event workspaces.
- The registry lists nine project events on the official 2027 slate: eight Division C events and Write It, Do It B.
- The 2027 Division B and Division C manuals are in the git-ignored `rules/` directory and were inspected locally. That directory is intentionally excluded from Git.
- Every registered event now has a rules summary and tool plan checked against its manual section; the Dynamic Planet and Chemistry Lab content has been corrected to the current freshwater and kinetics/gases scopes.
- Non-EV workspaces render a concise summary with the manual page reference and official links. Their event-specific interactive tools are still planned, not implemented.
- Chemistry Lab has live, manual-cited Gas-Law Practice and Kinetics Practice workspaces. Both support explicit browser-local save/load and CSV export of user-entered work. Kinetics intentionally focuses on Regional/Invitational needs: the four all-level reaction-rate factors, not State/National-only rate-law or activation-energy calculations.
- EV overview, calculator and local-only practice journal use the verified 2027 rules. The calculator matches the manual’s published two-run example.
- Official corrections were reviewed; official event FAQ pages were checked, including the EV program-development clarification.

## Remaining Work

- User preference: focus on Regional/Invitational; do not implement State/National-only material unless specifically requested. Avoid hardcoded quiz questions; prefer student-authored data/tools, or design a reviewed question database/AI system before adding generated-question functionality.
- Chemistry Lab kinetics is a user-authored experiment notebook: enter factor condition and measurements; app only computes measured rate. It contains no fixed questions or answer key. Explicit save/load is browser-local, and CSV export contains only user-entered records.
- Continue implementing and testing event-specific tools one at a time, prioritizing student-data workspaces over fixed quiz banks.
- Implement event tools for Anatomy, Boomilever, Circuit Lab, Designer Genes, Dynamic Planet, Rocks and Minerals, and Write It, Do It from the verified tool plans.
- Continue checking official corrections, FAQ clarifications, and state/tournament-specific updates during the season.
- Preserve the manuals as ignored local source material; never commit or deploy the rule PDFs.

## Working Agreement

- Run `npm test`, `npm run lint`, and `npm run build` after domain/UI changes.
- Keep event calculations and rule-specific behavior inside the owning event directory.
- Cite the relevant rule-manual page/section beside rule-specific summaries and calculators.
- Do not call a tool or score official until its logic has been checked against the current packet and applicable corrections/clarifications.