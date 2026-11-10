# Rocks and Minerals C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C52–C56 (main event C52–C54 plus the official 2027 rock/mineral list C55–C56). Scope is rocks, minerals, and rock-forming processes, balanced across igneous, sedimentary, and metamorphic coverage. Identification is 30–50% of points; the rest is on topics and processes. Teams may bring the official specimen list, a binder of any size, and a field guide. Identification tools should be student-authored or generator-based, not a hardcoded answer bank. Because a binder plus external allowed items are permitted, the Reference & Study Compiler runs in binder mode with pinned external resources.

## Tool: Official-List Specimen Practice
- **Status:** Live — `src/components/events/rocksandminerals/SpecimenPractice.jsx` (engines `specimenDrillUtils.js` + `specimenCardsUtils.js`, shared editor `PropertyForm.jsx`)
- **Category:** Practice
- **Goal:** Practice identifying 2027 official-list specimens across minerals, rocks, and rock-forming processes.
- **Core interaction loop:** 1) Configure the deck: Regional or State/National scope, an optional chemical class, and whether to draw only cards with recorded properties. 2) Answer a generated multiple-choice question from the recorded properties (name hidden), or use Flashcard mode and self-grade after revealing. 3) Review the session scoreboard and missed list, drill the missed minerals again, and record missing properties inline.
- **Content & data:** User-authored cards seeded from the official 2027 Division C specimen list (manual pp. C55–C56); every property value is student-authored, as in the Mineral ID Key, because the manual prints none. Distractors are generated at runtime and exclude any mineral whose recorded properties are identical to the answer's. Cards, not a bundled answer key.
- **UI components:** Deck scope card with stage-by-stage counts, Graded/Flashcard tabs, generated choice buttons, reveal/card-details panel, session scoreboard, missed list, inline `PropertyForm`.
- **Interactivity:** Drill: every readout derives from state; the name is hidden until answered or revealed, and self-grading is an explicit action because it records a result.
- **Scoring & feedback:** Session-only scoreboard (asked / correct / missed / accuracy) and a de-duplicated missed list. Practice-only; identification is 30–50% of event points, but this tool does not simulate official point breakdowns.
- **Level gating:** Regional by default; starred State/National specimens only when the scope toggle is on.
- **Persistence:** The shared `specimen-cards` store (`olympiad-studio.rocksandminerals-c.<year>-specimen-cards`) is the only persistence: the drill session is session-only and the deck reshuffles only when its membership changes.
- **Open questions:** none for minerals. Rock and rock-forming-process cards remain out of scope until the list supplies them (the 2027 official list is minerals only); see Process and Diagram Practice for the non-mineral half.

## Tool: Mineral Identification Key
- **Status:** Live — `src/components/events/rocksandminerals/MineralIdKey.jsx` (engine `specimenCardsUtils.js`, season list `src/seasons/2027/rocksandminerals.js`)
- **Category:** Practice
- **Goal:** Narrow candidate minerals from observed properties using a filter key over the official list.
- **Core interaction loop:** 1) Record a mineral's properties (luster, hardness range, cleavage/fracture, streak, acid reaction, magnetism, notes) — inline or by exporting the list as CSV, filling it in a spreadsheet, and importing it back. 2) Select the properties you observed; the candidate list re-ranks live while each remaining mineral keeps its own record. 3) Compare the surviving candidates, read the reason each ruled-out mineral failed, and see which properties are still unrecorded for the unjudged ones.
- **Content & data:** The official 2027 list (81 minerals, names + chemical-class grouping + State/National asterisks, pp. C55–C56) is transcribed into season data as a **skeleton**. **Every property value is student-authored** — the manual prints none (footnote 1: identification material is provided at the tournament), so no answer key is shipped. Shared with Official-List Specimen Practice through one `specimen-cards` store.
- **UI components:** Scope card (State/National toggle, coverage count, judging legend), property filters, candidate / unjudged / ruled-out lists, inline property editor, CSV import/export, confirmed clear.
- **Interactivity:** Direct manipulation: every property selection re-ranks the candidate list during render. Recording and import are explicit actions (authoring), and the live candidate list is the immediate feedback.
- **Scoring & feedback:** Practice feedback; does not simulate official scoring. `match` / `needs properties recorded` / `ruled out` (+ the conflict) — an unrecorded property is never treated as a guess.
- **Level gating:** Regional by default; starred State/National minerals appear only when the scope toggle is on.
- **Persistence:** `localStorage` key `olympiad-studio.rocksandminerals-c.<year>-specimen-cards`; CSV import/export; corrupt or unavailable storage surfaces a recoverable alert.

## Tool: Process and Diagram Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice rock-forming process identification and rock cycle / classification diagrams.
- **Core interaction loop:** 1) Pick a process (igneous/sedimentary/metamorphic formation conditions, rock cycle path). 2) Identify from a diagram or describe the conditions. 3) Check against the course content and specimen list.
- **Content & data:** Manual §3 topics, formation processes, and diagrams; no invented sample images. Prefer an interactive rock-cycle/classification diagram over a static prompt.
- **UI components:** Diagram canvas, input, reference feedback.
- **Interactivity:** Direct manipulation: an interactive rock-cycle/classification diagram with immediate feedback.
- **Scoring & feedback:** Practice feedback only.
- **Level gating:** State/National thin-section photomicrograph skills gated (requires imagery).
- **Persistence:** none.

## Tool: Reference & Study Compiler
- **Status:** Live — `src/components/events/rocksandminerals/RocksAndMineralsReferenceCompiler.jsx` (shared engine `src/components/general/ReferenceCompiler.jsx`)
- **Category:** Notebook
- **Goal:** Build the allowed reference binder and track coverage of the manual's topics and specimen list.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topics and the official specimen list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, tables, diagrams) filed under the matching objective. 3) Export a print-ready, paginated binder with a tab/section index.
- **Content & data:** Objective outline transcribed from manual pp. C52–C56 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one binder of any size, one commercial field guide, and one copy of the 2027 National Rocks and Minerals List; during specimen/display stations only the official list may be removed from the binder.
- **UI components:** Objective checklist with status filter, reference block editor grouped by objective, pinned external items (field guide, official list), section/tab index, paginated print/export with a no-removal reminder.
- **Interactivity:** Authoring tool: live budget and index preview; Save/Print/Export are explicit actions.
- **Scoring & feedback:** none (organizer).
- **Level gating:** objectives tagged Core / State-National / National-only.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (binder mode plus pinned external resources).

This document is a planning tool only; it does not invent official scoring.
