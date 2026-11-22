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
- **Interactivity:** Authoring journal; no live computation to derive, so a form + explicit Save is the right model here (an interactive surface would be a different tool). Live feedback limited to the saved list.
- **Scoring & feedback:** none (notebook); CSV text escaped and formula-injection-safe.
- **Level gating:** user tags core vs State/National vs National-only.
- **Persistence:** localStorage, explicit save/restore; CSV export.
- **Open questions:** none.

## Tool: Reference & Study Compiler
- **Status:** Live — `src/components/events/anatomy/AnatomyReferenceCompiler.jsx` (engine in `src/components/general/ReferenceCompiler.jsx` with `referenceCompilerUtils.js`)
- **Category:** Notebook
- **Goal:** Build the one allowed double-sided reference sheet and track coverage of the manual's official objectives.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, small tables, diagrams) filed under the matching objective. 3) Prune: hide Confident items so the sheet holds only what still needs support. 4) Export a print-ready sheet sized to 8.5 × 11 in, both sides.
- **Content & data:** Objective outline transcribed from manual pp. C3–C5 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one double-sided 8.5 × 11 in sheet per team; lamination/sheet protector permitted; multiple sheets and affixed labels prohibited.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, mastery-prune filter, live space budget, print/export.
- **Interactivity:** Authoring tool: the live space-budget meter and mastery-prune preview update as you edit; Save/Print/Export are explicit actions.
- **Scoring & feedback:** none (organizer); space budget warns when content exceeds one double-sided sheet.
- **Level gating:** objectives tagged Core / State-National / National-only.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (this is sheet mode); binder mode ships later for Circuit/DP/R&M.

## Tool: Respiratory Data Practice
- **Status:** Live — `src/components/events/anatomy/RespiratoryDataPractice.jsx` (engine in `respiratoryDataUtils.js`)
- **Category:** Practice
- **Goal:** Interpret lung volumes/capacities, spirometry, flow-volume loops, obstructive-vs-restrictive patterns, gas exchange, and oxygen-hemoglobin curves.
- **Core interaction loop:** 1) Choose or randomize a case type (normal, obstructive, restrictive). 2) Read the generated flow-volume loop and lung-volume table. 3) Classify the pattern and compute the listed values (e.g., FEV1/FVC). 4) Reveal the case and the manual-cited reasoning.
- **Content & data:** Values/curves generated from manual-listed respiratory parameters (lung volumes, spirometry, flow-volume loops, gas exchange, oxygen-hemoglobin); no fabricated real-patient measurements.
- **UI components:** Case picker, SVG flow-volume plot, values table, classification inputs, reference panel.
- **Interactivity:** Live + direct manipulation: generated case with an interactive SVG flow-volume plot; classification and computed ratios update as entered; a check action grades.
- **Scoring & feedback:** Checks the classification and computed ratios; practice feedback only; higher-level regulation and extra disorders level-gated.
- **Level gating:** higher-level regulation and extra disorders gated to State/National.
- **Persistence:** none.
- **Open questions:** resolved by the roadmap — the generator models only the respiratory topics the manual names (lung volumes, spirometry, flow-volume loops, gas exchange, oxygen transport) and labels its math an educational simulation, not clinical data or an official answer.

## Tool: Digestive/Immune Process Practice
- **Status:** Live — `src/components/events/anatomy/ProcessPractice.jsx` + `processPracticeUtils.js`
- **Category:** Practice
- **Goal:** Trace manual-listed digestive and immune processes by ordering steps and sorting named terms, then check against a cited key.
- **Core interaction loop:** 1) Choose a competition level and one of the manual-listed cases. 2) Place the steps in order or sort the terms into groups; the progress counter updates live. 3) Check to reveal the cited key and the short reason beside each item.
- **Content & data:** Six cases transcribed into `src/seasons/2027/anatomy.js`: alimentary canal route (§3.b.i & iv), digestion → absorption (§3.b.vi–viii), canal vs accessory organs (§3.b.ii), innate vs adaptive (§3.c.ii–iii), transplant terms (§3.c.ix, State/National) and tumor immunology (§3.c.xi, National). Only names and processes the manual itself prints are used; the sequence/grouping is a study aid derived from the manual's topic order, not an official answer key. Immunization and the five immunoglobulin classes (§3.c.v–vi) stay in the Reference Compiler objectives — the manual names them but prints no distinguishing detail, so no answer-key case is fabricated for them.
- **UI components:** Level and Case selects, Stepper, ordering buttons with undo, classification button groups, live progress counter, Check/Start over actions, and a result table with a manual-scope note.
- **Interactivity:** Live: placed steps, sorted terms and the progress counter update as the student works; Check/reveal is explicit because grading is a side effect.
- **Scoring & feedback:** Per-step and per-term correct/wrong/unsorted feedback against the manual-listed key; practice only, session-only.
- **Level gating:** Regional/Invitational cases first; State/National transplantation and National tumor immunology appear only when the level selector is raised. Liver/pancreas cellular detail and detailed immunoglobulin structure (§3.b.xi–xii, §3.c.viii) remain level notes, since the manual prints no sortable terms for them.
- **Persistence:** none.

## Tool: System Diagram Drill
- **Status:** Live — `src/components/events/anatomy/SystemDiagramDrill.jsx` + `diagramDrillUtils.js`
- **Category:** Practice
- **Goal:** Identify structures of the respiratory, digestive, and immune systems on diagrams or models.
- **Core interaction loop:** 1) Choose a system. 2) Select a numbered target on a schematic and choose its structure name. 3) Check labels to reveal the manual-cited names and short study notes for every target.
- **Content & data:** State-drawn SVG schematics with cosmetic target markers; the only structure names used are the ones the manual itself lists (respiratory §3.a.iii, digestive §3.b.ii–iv, immune §3.c.i), transcribed into `src/seasons/2027/anatomy.js` with the subsection citation. The short notes are general biology study aids, labelled as such in the UI — not official text. No user-supplied images and no invented anatomy.
- **UI components:** Diagram SVG with keyboard-focusable targets, structure-name choice buttons, Stepper, Tabs, result table with a manual-scope note.
- **Interactivity:** Direct manipulation: click/Enter/Space to select a numbered SVG target (each is a named button), then pick a name; choices, labelled markers and the coverage count all derive live. Check/reveal is an explicit action because grading is a side effect.
- **Scoring & feedback:** Identify-against-key; correct / wrong / unlabelled are reported separately in the reveal table. Practice only — no score is stored or ranked.
- **Level gating:** The drill uses the manual's base-level named structures; a level note states that State/National additions are outside this drill. No per-structure level tags (the manual does not tag individual structures).
- **Persistence:** none — a round is session-only and a system switch resets it.
- **Open questions:** none (state-drawn SVG schematics chosen; user-supplied images rejected because the targets and answer key could not be rule-grounded).

This document is a planning tool only; it does not invent official scoring.
