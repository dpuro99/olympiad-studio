---
name: build-event-tool
description: Use when building or extending an event-specific practice tool for Olympiad Studio. Reads the event's info.md + tool-ideas.md spec, asks only critical clarifying questions, then generates JSX and registers it in the event registry. Trigger on requests like "build the next tool for <event>", "implement <tool name>", or adding a module under src/components/events/<event>/.
---

# Build an event tool

Each event lives in its own folder `src/components/events/<event>/`, containing:

- `info.md` — full event breakdown (rules, format, scoring, competition-day walkthrough).
- `tool-ideas.md` — ranked tool specs, each in this format:

  Tool: [Name]
  Purpose: ...
  Core interaction loop: ...
  Content/data needed: ...
  UI components: ...
  Feedback/scoring logic: ...
  Difficulty/level filtering: ...

## Workflow

1. **Read context.** Load only the target event's `info.md` (rules/scoring/format) and `tool-ideas.md` (the specific spec). Do not pull in other events' files unless the user explicitly asks for a cross-event tool (e.g. a shared quiz engine).

2. **Identify the target tool.** If the user names a tool, find its `### Tool:` block. If they don't, ask which tool from the ranked list to build next (default to the highest-ranked one not yet built).

3. **Gap-check before asking.** The spec should already answer most implementation questions. Only ask what it genuinely leaves open:
   - Missing or ambiguous scoring/grading logic.
   - Unknown data source (spec defines a shape but no real content exists — confirm placeholder vs user-supplied content).
   - Genuinely ambiguous UI behavior (e.g. "drag-and-drop or click-to-order" with no pick).
   - Persistence method (localStorage, backend, or session-only) if not already established.
   - Whether tournament-level content differences from `info.md` should be reflected.

   **Do not ask about** colors, styling, fonts, spacing, or anything covered by the existing design system — infer these from the reference components. Re-read the spec before raising questions.

4. **Generate the component.** Build the JSX in `src/components/events/<event>/`, following existing conventions (reference: `electricvehicle/ArcVisualizer.jsx`, `RunLogger.jsx`, `ScoreCalc.jsx` for component patterns, state style, and shared utilities).
   - Name the file descriptively from its function (e.g. `HormoneMatrixTrainer.jsx`).
   - Co-locate formulas/scoring/parsing in the event folder (a `*Utils.js` / `*.js` module) and unit-test it.
   - Use clearly marked placeholder data (`// TODO: replace with full content set`) when real content wasn't supplied.
   - Implement the full interaction loop, UI, and feedback/scoring logic — not a stub.

5. **Register the tool.** Add a module entry in `src/components/events/registry.js` with `id, ti, label, cat, live, requiresAuth, component, desc` (plus `eventName`, `manualReference`, `eventUrl`, `rulesUrl` as the other entries do). Only set `live: false` for a genuinely unfinished module.

6. **Verify and confirm.** Run `npm test`, `npm run lint`, and `npm run build`. Summarize the component path, what is placeholder vs real, and any assumptions from step 3 before considering the tool complete.
