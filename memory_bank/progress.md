# Project Status

## Verified Current State

- React 19 + Vite single-page application; Supabase provides Google OAuth and persistence.
- `src/components/events/registry.js` is the source of truth for event workspaces.
- The registry now lists only project events present on the official 2027 B/C slate: Anatomy and Physiology C, Boomilever C, Chemistry Lab C, Circuit Lab C, Designer Genes C, Dynamic Planet C, Electric Vehicle C, Rocks and Minerals C, and Write It, Do It B.
- Official Science Olympiad event pages establish high-level objectives, but explicitly defer to the current Rules Manual.
- EV displays only the official high-level objective; numeric scoring remains disabled until the 2027 manual and current clarifications are checked.
- Other event-specific modules are disabled pending rule-by-rule verification.

## Domain Risks and Blockers

- Previous `info.md` and `tool-ideas.md` files contained detailed rules claims that were not verified against the official 2027 manuals. They must not be used as active 2027 references.
- The official 2027 rules are distributed from the Science Olympiad rules page by email form. The complete Division B/C packets are not present in this workspace.
- Rules corrections and event clarifications change or clarify the manuals during the season; both sources must be checked before enabling formulas or requirements.

## Working Agreement

- Run `npm run lint` after JavaScript/JSX changes and `npm run build` after application integration changes.
- Keep event calculations and rule-specific behavior inside the owning event directory.
- Do not report rule-specific compliance as complete until it has been checked against the current official packet and current corrections/clarifications.