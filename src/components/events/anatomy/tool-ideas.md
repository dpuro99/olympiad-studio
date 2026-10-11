# Anatomy and Physiology C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C3–C5. 2027 focus is respiratory, digestive, and immune systems. Keep content segmented Regional / State / National; do not import prior-year nervous/senses/endocrine material. Disease/treatment content must come from the exact manual list. Tie every item to the manual's objective and cite the source provision.

The event is recall-heavy and allows exactly one double-sided 8.5 × 11 in sheet, so the Reference & Study Compiler is the highest-value organizer. The strongest other tools let students interpret generated data rather than answer a preset bank.

## Tool: Practice Notes
- **Status:** Live — `src/components/events/anatomy/AnatomyPractice.jsx` (helpers in `anatomyNotes.js`)
- **Category:** Notebook
- **Goal:** Record study observations for the respiratory, digestive, and immune systems and export as CSV.
- **Core interaction loop:** 1) Add a note with system/objective tag. 2) Review saved notes by system and objective. 3) Export notes to CSV.
- **Content & data:** User-authored notes only; no preset questions or simulated content.
- **UI components:** Note form, filterable list, CSV export.
- **Scoring & feedback:** none (notebook); CSV text escaped and formula-injection-safe.
- **Level gating:** user tags core vs State/National vs National-only.
- **Persistence:** localStorage, explicit save/restore; CSV export.
- **Open questions:** none.

## Tool: Reference & Study Compiler
- **Status:** Planned
- **Category:** Notebook
- **Goal:** Build the one allowed double-sided reference sheet and track coverage of the manual's official objectives.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, small tables, diagrams) filed under the matching objective. 3) Prune: hide Confident items so the sheet holds only what still needs support. 4) Export a print-ready sheet sized to 8.5 × 11 in, both sides.
- **Content & data:** Objective outline transcribed from manual pp. C3–C5 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one double-sided 8.5 × 11 in sheet per team; lamination/sheet protector permitted; multiple sheets and affixed labels prohibited.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, mastery-prune filter, live space budget, print/export.
- **Scoring & feedback:** none (organizer); space budget warns when content exceeds one double-sided sheet.
- **Level gating:** objectives tagged Core / State-National / National-only.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (this is sheet mode); binder mode ships later for Circuit/DP/R&M.

## Tool: Respiratory Data Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Interpret lung volumes/capacities, spirometry, flow-volume loops, obstructive-vs-restrictive patterns, gas exchange, and oxygen-hemoglobin curves.
- **Core interaction loop:** 1) Choose or randomize a case type (normal, obstructive, restrictive). 2) Read the generated flow-volume loop and lung-volume table. 3) Classify the pattern and compute the listed values (e.g., FEV1/FVC). 4) Reveal the case and the manual-cited reasoning.
- **Content & data:** Values/curves generated from manual-listed respiratory parameters (lung volumes, spirometry, flow-volume loops, gas exchange, oxygen-hemoglobin); no fabricated real-patient measurements.
- **UI components:** Case picker, SVG flow-volume plot, values table, classification inputs, reference panel.
- **Scoring & feedback:** Checks the classification and computed ratios; practice feedback only; higher-level regulation and extra disorders level-gated.
- **Level gating:** higher-level regulation and extra disorders gated to State/National.
- **Persistence:** none.
- **Open questions:** confirm which manual-listed respiratory parameters may be modeled for the generated curves.

## Tool: Digestive/Immune Process Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Work through case-based process chains for digestion/absorption, motility, immunity, immunization, antibody classes, and listed disorders.
- **Core interaction loop:** 1) Choose a case. 2) Order/trace the process or classify the response (step ordering / classification controls). 3) Get manual-cited feedback.
- **Content & data:** Manual-listed disorders and processes only, presented as interactive ordering/classification rather than a fixed question-and-answer bank.
- **UI components:** Case prompt, sequence/classification inputs, references.
- **Scoring & feedback:** Evaluates the ordering/classification against manual objectives; practice only.
- **Level gating:** liver/pancreas pathways (State/National); immunoglobulin constant-region variation, detailed immunoglobulin structure/function, and organ-transplant immunology (State/National); tumor immunology (National) — all level-tagged per the manual.
- **Persistence:** none.

## Tool: System Diagram Drill
- **Status:** Planned
- **Category:** Practice
- **Goal:** Identify structures of the respiratory, digestive, and immune systems on diagrams or models.
- **Core interaction loop:** 1) Choose a system. 2) Label/select structures on a diagram view. 3) Reveal manual-cited names and functions.
- **Content & data:** Simple schematic diagrams (state-drawn SVG) or user-supplied images; no invented anatomy. Official resources stress identifying structures on diagrams and models.
- **UI components:** Diagram canvas, label targets, reveal panel.
- **Scoring & feedback:** Identify-against-key; practice only.
- **Level gating:** level-tagged structures.
- **Persistence:** none.
- **Open questions:** source of diagram artwork (state-drawn SVG schematics vs user-supplied images).

This document is a planning tool only; it does not invent official scoring.
