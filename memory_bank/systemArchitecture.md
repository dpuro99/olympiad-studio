# System Architecture

## Application Flow

`src/App.jsx` is the application controller. It manages:

- theme state and synchronization to `document.documentElement[data-theme]`;
- Supabase session initialization and auth-state subscriptions;
- the public landing view versus the authenticated/guest workspace;
- a browser-local **profile** (`{ displayName, level, starredEventIds }`) that decides which events appear on the Dashboard;
- `page` (`'dashboard' | 'all-tools'`) and `activeTool` (`{ kind: 'compiler', eventId }` or `{ kind: 'module', eventId, moduleId }`) as local navigation state.

There is no router, global app sidebar, lobby, field guide or separate multi-event page. The only sidebar is All Tools' local filter rail. Navigation is entirely local state with two full-screen pages:

1. **Dashboard** (`page === 'dashboard'`) — a two-column body with starred events' tool sections (`buildJourney(event)` order) in the left main column and the read-only "Study progress" tracker in a right rail. Below 1040 px the rail stacks after the tools. The compiler is not promoted to a dashboard card; it stays a normal tool inside study-event sections.
2. **All Tools** (`page === 'all-tools'`) — every registered event and every tool, grouped the same way, whether or not the event is starred. A 300 px sticky white filter rail (`Filter Tools`: live event/tool count, `Reset`, stacked search / division-scope / tool-type controls, bottom `Clear all filters`) sits beside a warm off-white feed holding only the title, subtitle and back link. Below 1024 px the rail becomes a slide-over drawer behind a `Filters` button with focus managed into and back out of it.

Opening a tool overlays the current page; closing it returns to that page. Event selection is not navigation state — it is the profile's star list.

## App Shell

- `src/components/general/AppNav.jsx` is the one persistent sticky top bar with the same controls on every view (landing, Dashboard, All Tools, tool overlays): a hover-free brand home link, `Workspace pages` buttons (Dashboard / All Tools), a breadcrumb/back crumb **only while a tool is open**, a standalone season chip, one 36px control row, and the only theme toggle. Guests get one solid primary `Sign in with Google` button; the `Profile: …` popover (`NavPopover.jsx`) mounts only when `currentUser` exists and holds profile fields + `Log out`. Clicking a page button from landing admits a guest via `enterWorkspace()`. There is deliberately no event picker in the nav; `NavPopover.jsx` also backs the in-page `EventPicker.jsx`.
- The nav is a normal-flow `position: sticky` `<header className="app-nav">`, not `position: fixed`, so document scrolling is untouched and the print sheet (`.reference-print-area`) can never be clipped by it. `@media print` hides only `.app-nav` and `.skip-link`.
- `App.jsx` renders the nav outside `AnimatePresence`, then either `LandingHome` or one `.dashboard-shell` containing a single `<main id="main-content" className="dashboard-content">`. A skip link precedes the nav. `Dashboard.jsx`, `AllTools.jsx` and `CompilerTool.jsx` render content only — they never create their own shell.
- `dashboard/EventPicker.jsx` lives in the Dashboard hero. Its `Choose events (n)` panel lists `My Events` and `All events` with `Star`/`Unstar` buttons; `AllTools.jsx` repeats the same toggle on each event section. Starring adds an event to the profile and copies its tools onto the Dashboard; unstarring removes them there but never from All Tools. The profile persists through `profileStore.js`.
- The Reference & Study Compiler is one full-screen tool (`dashboard/CompilerTool.jsx`): an event `<select>` over the six study-event configs, with the shared compiler rendered for the chosen event. No study data is copied or moved between events.
- `dashboard/DashboardTracker.jsx` embeds the read-only objective rollup in the Dashboard. It reads the saved compiler sheets for starred study events through `objectiveTrackerUtils.js`/`objectiveTrackerSources.js` and opens the owning compiler; it owns no storage.
- At ≤720 px the tool breadcrumb collapses to a single back-crumb and the dashboard cards/result panels stack; the nav keeps one theme control, one auth control and the two page buttons without horizontal overflow or wrapping (the profile trigger appears only when signed in). The in-page picker opens left-aligned so it stays on-screen.

## Season Boundary

The app separates three layers so an annual manual change has one place to land:

1. **Season-invariant engines** — pure logic (`booleanLogic.js`, `stoichiometry.js` core, `gasLaws.js`, `kinetics.js`, `freshwaterCalculators.js`, `freshwaterToolboxUtils.js`, `mapPracticeUtils.js`, `specimenCardsUtils.js`, `specimenDrillUtils.js`, `circuitUtils.js`, chart/UI primitives, `referenceCompilerUtils.js`, `ReferenceCompiler.jsx`) and the app shell. They contain no year literals and receive rule-derived values as data. `specimenCardsUtils.js` holds the invariant mineral property vocabulary and matching rules; `specimenDrillUtils.js` holds deck building, generated choices, grading and session scoring. The official list they operate on arrives from season data.
2. **Season data** — `src/seasons/manifest.js` (`ACTIVE_SEASON`), `src/seasons/<year>/<event>.js` (rule constants, level tables, objective/resource copy, citations), `src/seasons/active.js` (`ACTIVE_DATA`), and `src/seasons/storageKeys.js` (`storageKey(event, module)`, `fileStem(event, module)`, legacy-key migration).
3. **Active wiring** — `registry.js` derives `year`/`rulesUrl`/labels from `ACTIVE_SEASON`; components read constants from `ACTIVE_DATA` instead of duplicating them.

Reference-compiler configs declare `season: ACTIVE_SEASON`; saved state is stamped with that year so a sheet authored under an older manual is announced rather than silently losing blocks whose objectives no longer exist. `tests/season-boundary.test.js` enforces the rule that no season-year literal appears outside `src/seasons/`.

## Data and Authentication

- `src/supabaseClient.js` owns the singleton browser Supabase client.
- Authentication uses Google OAuth through Supabase Auth.
- `App.jsx` calls `getSession()` during startup and subscribes to `onAuthStateChange`.
- Supabase is used for authentication only. No backend data reads or writes exist yet; every practice tool persists explicitly to browser `localStorage` and never uploads user data.
- `requiresAuth` / `AuthRequired` exist to gate modules that will need a backend identity, but no registered module sets `requiresAuth: true` yet.
- When backend practice storage is added, it must be scoped by the authenticated user id and event id, and Row Level Security (not client-side filters) must be the guard.
- Database failures must be distinguishable from an empty result. Demo/fallback records must never appear as real user history without an explicit demo state.

## Registry Contract

`src/components/events/registry.js` is the single source of truth for event workspaces and modules. An event entry contains `name`, `code`, `division`, `description`, `categories`, `journey`, and `modules`. A module contains:

```js
{
	id,
	ti,
	label,
	cat,
	live,
	requiresAuth,
	component,
	desc,
	// tool-card metadata (additive)
	stage,          // 'learn' | 'prepare' | 'practice' | 'record' | 'reference'
	gain,           // "input → output" one-liner shown on the tool card
	signal          // name of the saved-work probe in eventProgress.js
}
```

`stage` and `gain` are present on every module and `signal` only on modules that keep saved work; an event's `journey` is an ordered array of module ids that may reorder the tool cards but never drop a module. `overview({...})` accepts `journey` and passes it through; the EV entry (not built by `overview`) declares its own.

Shared views consume registry data. New tools must be registered rather than hardcoded into `Dashboard.jsx` or `App.jsx`. Unfinished tools use `live: false`.

`requiresAuth: true` identifies modules that need an authenticated Supabase user or another backend capability. `App.jsx` gates those modules for guests with the shared `AuthRequired` view before the module component mounts. Backend-dependent tools should declare this capability in the registry instead of implementing guest checks themselves.

## Dashboard Event Sections & Study Progress

The old field guide (`EventHome.jsx`) and standalone overview tool are gone; the manual-verified summary is event-level registry data rendered in each event section:

- `src/components/general/dashboard/EventToolSection.jsx` renders a shared section for both pages: division/code/year eyebrow, event name, description, event + rules links, `manualReference`, a collapsed `Event rules at a glance` summary from event-level `ruleSummary`, and tool cards in `buildJourney(event)` order. An overview-only event would show just the summary.
- `src/components/general/dashboard/Dashboard.jsx` renders only sections for `scopedEventIds(profile, registryIds)`; `AllTools.jsx` renders one section for every registered event. Both use the same component, so the two pages cannot disagree about an event's tools.
- `src/components/general/dashboard/catalogUtils.js` is the pure All Tools filter engine over registry data: search (an event-name match keeps that event's tools, a tool-name match keeps that tool), division/starred scope and tool type compose, and the live event/tool counts come from the same filtered result. `EventToolSection.jsx` takes optional `steps`/`catalog` props so All Tools renders filtered journeys with pastel stage badges and a 1/2/3-column card grid while Dashboard stays untouched; the drawer only changes where the same controls render.
- `src/components/general/stages.js` owns the five-stage vocabulary `learn → prepare → practice → record → reference` with `STAGE_META`, `stageIndex`, `normalizeStage`, and `stageMeta`. A module with no stage falls back to `practice`.
- `src/components/general/journeyUtils.js` is pure: `buildJourney(event)` appends any module the `journey` override forgets in stage order, so adding a module always shows it on both pages.
- `src/components/general/dashboard/profileUtils.js` is pure: star/name/level transitions and registry-ordered `scopedEventIds`. `profileStore.js` is the only `localStorage` boundary for the profile and reports corrupt/unavailable reads.
- `src/components/general/dashboard/objectiveTrackerUtils.js` is the read-only tracker engine over the six saved compiler sheets: `collectProgress`, `summarize`, `pickFocus`, `filterRows` and `scopeSources`. `objectiveTrackerSources.js` holds the six config imports. Absent = not started, corrupt = unreadable, other-year = season mismatch, denied read = announced alert; the tracker opens the owning compiler and never writes storage.

Both pages are workbenches, not gates: every tool is a plain button, nothing is locked, and choosing a tool is one click from the section it belongs to.

## Module Boundaries

- `src/components/general/` contains the public landing page and dashboard shell views.
- `src/components/events/[event-name]/` contains event-specific UI and domain logic.
- EV geometry belongs in `electricvehicle/CourseGeometry.jsx` with its pure logic in `courseUtils.js`; the manual-verified event overview is event-level registry data rendered in the event section, not a separate tool component.
- EV scoring belongs in `electricvehicle/ScoreCalc.jsx` or a nearby EV utility module.
- EV practice persistence belongs in `electricvehicle/RunLogger.jsx` and currently writes only to browser `localStorage`.
- R&M mineral property storage and candidate ranking live in `rocksandminerals/specimenCardsUtils.js`; the official mineral list, its classes/levels and the key's citations belong in season data. One `specimen-cards` store is shared by every R&M practice tool, so a second tool must extend the engine rather than open its own key.
- R&M card authoring has exactly one editor: `rocksandminerals/PropertyForm.jsx` (`PropertyForm` plus the `TagChecks` fieldset) owns the draft and the hardness-order check, while each tool keeps its own persistence and status messages. The Mineral ID Key and Specimen Practice both render it, so a property added to the vocabulary shows up in both.
- `rocksandminerals/SpecimenPractice.jsx` is a drill, not a second store: it derives its deck from the shared cards, generates choices at runtime (`buildChoices`, whose distractors exclude any mineral with an identical recorded-property signature) and keeps the session scoreboard/missed list in component state — session-only, never persisted. The drill round is remounted on a deck-membership key (`ids joined`), so the draw order is rebuilt without a state-syncing effect and never reshuffles when a card's properties are edited.
- Global files should provide composition and shared infrastructure, not event-specific formulas.

## Implementation Invariants

- Use semantic buttons or links for interactive controls.
- Keep hover styling in CSS rather than JavaScript mouse handlers.
- Use theme variables instead of scattered hardcoded UI colors.
- Keep side effects in event handlers or effects, never during render.
- Declare helpers before their use when doing so improves readability and avoids dependency/order errors.
- Mutations need pending, success, and failure states that prevent accidental duplicate submissions.
- Destructive actions require an explicit confirmation step.
- Preserve responsive behavior: tool panels should stack cleanly on narrow screens.
- Treat formula and rule changes as domain changes requiring verification and focused tests.