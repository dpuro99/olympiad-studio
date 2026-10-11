---
name: build-event-tool
description: Use when building or extending an event-specific practice tool for Olympiad Studio. Reads the target event's info.md + tool-ideas.md, extracts the tool contract, asks only critical clarifying questions, then generates the domain module + unit test + JSX and registers it lazily in the event registry. Trigger on "build the next tool for <event>", "implement <tool name>", or "add a module to <event>".
---

# Build an event tool

Every event owns a folder `src/components/events/<event>/`:

- `info.md` — the verified rules, format, and scoring contract for the current season.
- `tool-ideas.md` — the source spec: one `## Tool:` block per candidate tool (see template below). Built tools are marked `Status: Live` with their file path.

Use these two files as the single source of truth. Do not import rules or content from prior seasons or other events.

## Tool spec template (used in `tool-ideas.md`)

```markdown
## Tool: <Name>
- **Status:** Planned | Live — `src/components/events/<event>/<File>.jsx`
- **Category:** Calculator | Practice | Notebook | Worksheet
- **Goal:** one sentence on what the student accomplishes.
- **Core interaction loop:** numbered steps the user goes through.
- **Content & data:** required constants/datasets/shapes and their source (manual section); what the user supplies.
- **UI components:** controls, panels, and outputs to build.
- **Scoring & feedback:** how results are computed/displayed; what is practice vs official.
- **Level gating:** Regional | State | National constraints from the manual.
- **Persistence:** localStorage (explicit) | none | notes-export (CSV).
- **Open questions:** only genuinely unresolved items; leave empty when none.
```

## Workflow

1. **Read context.** Load only the target event's `info.md` and `tool-ideas.md`. Never pull other events' files unless the user asks for a cross-event tool.

2. **Pick the tool.** If the user named a tool, find its `## Tool:` block. Otherwise choose the highest-ranked `Status: Planned` tool. If every tool is built or the spec is ambiguous, say so and ask the user what to build.

3. **Extract the contract.** From the tool block, pin down: inputs, the calculation/interaction loop, level gating, persistence, and what must be labeled practice vs official. Cross-check formulas against `info.md` and a manual section.

4. **Gap-check before asking.** The block answers most implementation questions. Ask only about what it genuinely leaves open:
   - Unspecified scoring/grading logic or an ambiguous formula.
   - Content defined by shape but with no real data (confirm placeholder vs user-supplied).
   - Persistence unspecified (localStorage vs session-only vs none).
   - A real UI-behavior fork the spec doesn't resolve.

   **Do not ask about** colors, fonts, spacing, or layout — infer them from the reference components:
   - `electricvehicle/RunLogger.jsx` / `ScoreCalc.jsx` — panels, inputs, result tables, localStorage persistence.
   - `circuitlab/CircuitLabPractice.jsx` / `chemlab/GasLawPractice.jsx` — generated-question or calculator patterns.
   - `dynamicplanet/FreshwaterTools.jsx` — multi-field measurement tools.
   - `anatomy/AnatomyPractice.jsx` + `anatomyNotes.js` — notebook/notes and CSV export with formula-injection protection.
   - Always use theme variables, `ti-*` Tabler icons, monospace for technical values, and stacking layouts for narrow screens.

5. **Implement, logic-first.**
   - Put all formulas/parsing/constants in a co-located `*Utils.js` / `*.js` module (no UI logic).
   - Write a focused unit test for that module first in `tests/<event>-<util>.test.js` using `node:test` (import the module directly; follow `tests/` naming and style).
   - Build the JSX component against the contract, wiring `localStorage`/CSV persistence where the spec calls for it and labeling practice-vs-official output.
   - Mark placeholder content clearly (`// TODO: replace with full content set`) when real data wasn't supplied — never present it as real.

6. **Register the tool.** Add a module entry in `src/components/events/registry.js` with `id, ti, label, cat, live, requiresAuth, component, desc` plus `eventName`, `manualReference`, `eventUrl`, `rulesUrl` as the other entries do. Wire `component` as a lazy import at the top of `registry.js`: `const MyTool = lazy(() => import('./myevent/MyTool'));`. Only set `live: false` for a genuinely unfinished module.

7. **Verify and report.** Run `npm test`, `npm run lint`, and `npm run build`. Summarize: the component path, the new test file, what is placeholder vs real, and any assumptions from step 4 — then stop; do not commit unless asked.

## Hard rules

- Never invent Science Olympiad rules or scoring formulas. Cite the manual page/section beside rule-specific summaries and calculators.
- Default to Regional/Invitational scope; keep State/National content level-gated, not front and center.
- Prefer student-authored data tools over hardcoded quiz/answer banks. No preset quiz questions without an explicit, approved content architecture.
- CSV/text exports must escape cells and neutralize spreadsheet formula injection (see `anatomyNotes.js`).