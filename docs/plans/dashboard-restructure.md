# Dashboard restructure (implemented)

**Status:** built and verified; uncommitted at the end of this pass. No push, PR, or deploy.

**Goal:** replace the old sidebar/lobby/field-guide/multi-event shell with two clean full-screen workspaces:

1. **Dashboard** — the browser-local profile's starred events, grouped by event, with the Objective Tracker on the same page.
2. **All Tools** — every registered tool for every event, grouped by event.

The Reference & Study Compiler remains one full-screen tool with its internal event selector. Nothing elsewhere moves study data between events.

## Final model

- `src/App.jsx` owns `page` (`'dashboard' | 'all-tools'`), `activeTool`, `profile`, `theme`, auth and landing/dashboard state. An open tool is an overlay on whichever page launched it; closing it returns to that page.
- `src/components/general/AppNav.jsx` has no event picker. It has the logo/home button, `Workspace pages` buttons (Dashboard / All Tools), a breadcrumb/back crumb **only while a tool is open**, the season chip, the profile menu, and one theme/auth control.
- `src/components/general/dashboard/EventPicker.jsx` is the event chooser on the Dashboard: `Choose events (n)` opens a panel with `My Events` and `All events` sections and `Star`/`Unstar` buttons. It is not in the nav.
- `src/components/general/dashboard/EventToolSection.jsx` renders one event section: manual links, citation, a collapsed `Event rules at a glance` summary, and a tool card per registered module in `buildJourney(event)` order. Every tool is a plain button; nothing is gated from this surface.
- `src/components/general/dashboard/Dashboard.jsx` renders the hero with Choose events and the All Tools link, then a two-column body: starred events' `EventToolSection`s in the left main column and the `Study progress` tracker in a right rail. Below 1040 px the rail stacks after the tools. The hero is overflow-visible so the Choose events dialog is not clipped.
- `src/components/general/dashboard/AllTools.jsx` renders every event with the same section component, plus optional star toggles. Unstarring removes a section from the Dashboard but never from All Tools.
- `src/components/general/dashboard/DashboardTracker.jsx` and `objectiveTrackerUtils.js` are unchanged in purpose: a read-only rollup of the six saved compiler sheets, scoped through `scopeSources`. The tracker is now a quiet right-rail panel with no dedicated `Open compiler` shortcut — the compiler remains a normal tool card inside each study event's section. Absent, corrupt, other-year and denied reads are announced honestly; rows open the owning compiler and the tracker writes no storage.
- `src/components/general/dashboard/CompilerTool.jsx` is the one full-screen compiler: a `Compiler event` selector over the six configs, with each config keeping its own storage key. Its back button says `Back to your page`.

## Profile and storage

- Key: `olympiad-studio.profile`; shape: `{ displayName, level, starredEventIds }`. The old `lastScope`/`setScope`/`Dashboard scope` model was removed: page selection is navigation state, not profile state.
- `profileUtils.js` is pure: normalize, star toggle, display name, level and registry-ordered `scopedEventIds`. `profileStore.js` is the only `localStorage` boundary and reports corrupt/denied reads instead of pretending the student chose no events.
- Session navigation persists as `{ currentView, isGuest, theme, page, activeTool }` under `olympiad-studio-navigation`; analytics virtual paths are `/dashboard`, `/all-tools`, `/compiler/<event>` and `/events/<id>/<module>`.

## Deleted and retained files

- Deleted: `src/components/general/Home.jsx`, `src/components/general/EventHome.jsx`, `src/components/general/nav/ScopeSwitcher.jsx` (and the earlier `multiEvent/` page).
- Retained/restored where needed: `LandingHome.jsx`, `AuthRequired.jsx`, `Logo.jsx`, `stages.js`, `journeyUtils.js`, all event tools and all season data.
- Added: `dashboard/EventPicker.jsx`, `dashboard/EventToolSection.jsx`, `dashboard/AllTools.jsx`, `nav/NavPopover.jsx`, `nav/ProfileMenu.jsx`, `tests/dashboard-profile.test.js`, `tests/e2e/specs/multi-event.spec.js`.

## Verification contract

- Keep all registry ids, lazy imports, manual citations, storage keys, compiler configs and `expectText` guards. Update e2e anchors only when the copy or structure genuinely moved.
- `NavPopover` supports left alignment so the in-page picker stays on-screen at 375 px.
- `expectModuleRendered` scopes `expectText` to `#main-content` because the hidden mobile breadcrumb otherwise wins the match; analytics/Google request failures are filtered from both console and request-failed handlers.
- A heading-name uniqueness guard runs on every module render; every module gets a 375 px overflow check.
- Final gates: `npm test`, `npm run lint`, `npm run build`, focused Playwright, then a full baseline-aware browser sweep. Exact results are recorded in `AUDIT.md` and the dated `memory_bank/` entries.

## Rejected alternatives

- An event dropdown in the nav bar — explicitly rejected by David: "No, i dont want the event picker in the nav bar. I just want a button to go back to the main dashboard."
- A separate per-event overview tool or field guide page — the manual-verified summary now lives in the event section on both pages.
- Keeping the separate multi-event page — the tracker is on the Dashboard, one click closer.
- Six compiler copies or moving study data between events — one shared compiler with per-event configs is the only source of truth.
