# Rocks and Minerals C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C52–C56 (main event C52–C54 plus the official 2027 rock/mineral list C55–C56). Scope is rocks, minerals, and rock-forming processes, balanced across igneous, sedimentary, and metamorphic coverage. Identification is 30–50% of points; the rest is on topics and processes. Teams may bring the official specimen list, a binder of any size, and a field guide. Identification tools should be student-authored or generator-based, not a hardcoded answer bank. Because a binder plus external allowed items are permitted, the Reference & Study Compiler runs in binder mode with pinned external resources.

## Tool: Official-List Specimen Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice identifying 2027 official-list specimens across minerals, rocks, and rock-forming processes.
- **Core interaction loop:** 1) Author a specimen card (name, class, key physical properties, distinguishing notes, level) seeded from the official list. 2) Drill a chosen set or a random draw. 3) Reveal the answer and card details.
- **Content & data:** User-authored cards seeded from the official 2027 Division C specimen list (manual pp. C55–C56) grouped as mineral / rock / rock-forming process; hard-to-distinguish pairs flagged. Cards, not a bundled answer key. Lead with properties rather than a single image — memorizing one photo is a known failure mode of ID flashcard tools.
- **UI components:** Card author form, specimen chooser / random drill, flashcard prompt, reveal panel.
- **Interactivity:** Authoring + drill: user-authored cards; interactive flip, self-grade, and random draw; Save/CSV are explicit actions.
- **Scoring & feedback:** Practice-only; identification is 30–50% of event points, but this tool does not simulate official point breakdowns.
- **Level gating:** starred State/National specimens from the list footnotes tagged per card.
- **Persistence:** localStorage (explicit save/restore); CSV import/export.
- **Open questions:** whether to ship a seeded starter set or require the full dataset to be entered via the management screen.

## Tool: Mineral Identification Key
- **Status:** Planned
- **Category:** Practice
- **Goal:** Narrow candidate minerals from observed properties using a dichotomous/filter key.
- **Core interaction loop:** 1) Select observed properties (luster, hardness, cleavage/fracture, streak, acid reaction, color/other). 2) The tool narrows the candidate list. 3) Compare remaining candidates and read the diagnostic reasoning.
- **Content & data:** Manual-listed physical/other properties, limited habits, and formula/property relationships; a property filter over a user-authored specimen card set. No invented diagnostic criteria beyond manual/published sources.
- **UI components:** Property selectors, live candidate list, reasoning panel.
- **Interactivity:** Direct manipulation: property selections filter a live candidate list as they change.
- **Scoring & feedback:** Practice feedback; does not simulate official scoring.
- **Level gating:** none (list is year-specific).
- **Persistence:** none (operates on authored cards if present).

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
