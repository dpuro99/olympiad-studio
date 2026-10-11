# Chemistry Lab C — verified 2027 tools

Source: supplied 2027 Division C Rules Manual, pp. C14–C15. The event requires at least one activity in each of gases and kinetics; time is not scored or a tiebreaker. Nomenclature and stoichiometry are supporting tools that may appear — and are a strong generator target. Each participant may bring one double-sided 8.5 × 11 in sheet, so the Reference & Study Compiler runs in per-participant mode.

## Tool: Gas-Law Practice
- **Status:** Live — `src/components/events/chemlab/GasLawPractice.jsx` (logic in `gasLaws.js`)
- **Category:** Calculator
- **Goal:** Practice 2027 gas laws with unit-aware unknown solving.
- **Core interaction loop:** 1) Choose a law (Boyle, Charles, Gay-Lussac, Avogadro, combined, ideal, Dalton partial-pressure remainder, Graham's rate ratio). 2) Enter known values with units. 3) Solve for the unknown and review step/unit conventions.
- **Content & data:** Manual §3.e (p. C14) gas-law coverage; user-entered values.
- **UI components:** Law selector, unit-aware inputs, result readout.
- **Scoring & feedback:** Requires positive inputs, insists on Kelvin for temperature, states unit conventions, labels unsupported dimensions/assumptions; saves explicitly to localStorage and exports CSV; practice, not scoring.
- **Level gating:** State/National quantitative kinetics is separate (Kinetics).
- **Persistence:** localStorage (explicit) + CSV export, formula-injection-safe.

## Tool: Reaction-Rate Experiment Notebook
- **Status:** Live — `src/components/events/chemlab/KineticsPractice.jsx` (logic in `kinetics.js`)
- **Category:** Notebook
- **Goal:** Run a user-authored reaction-rate experiment and compare measured average rates (Regional/Invitational scope).
- **Core interaction loop:** 1) Select one manual-listed factor (temperature, concentration, particle size, catalyst). 2) Read the inline experimental-design guidance (change one variable at a time, control the rest) and mark items applied. 3) Write each trial's condition. 4) Enter own initial/final measurement and elapsed time. 5) Compare calculated average rates; record controls and write a conclusion.
- **Content & data:** User-authored measurements only; rate = measured-change-over-time with direction from reactant-consumed/product-formed; units from the user. The former standalone "Experimental Design Guidance" checklist is folded in here as inline guidance rather than a separate low-value tool.
- **UI components:** Factor selector, guidance checklist, per-trial condition + measurement inputs, rate comparison table, notes/conclusion area.
- **Scoring & feedback:** Identifies invalid direction/time inputs; does not interpret results as an official answer. No preset questions, answers, or simulated measurements.
- **Level gating:** Regional/Invitational focus.
- **Persistence:** localStorage (explicit save/restore) + CSV export, formula-injection-safe; no upload.

## Tool: Stoichiometry and Nomenclature Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Generate unlimited practice balancing equations and doing mole/mass/nomenclature conversions.
- **Core interaction loop:** 1) Choose a mode (balance equation, mole/mass/volume conversion, limiting reagent, percent yield, name ↔ formula). 2) Solve generated problems. 3) Check the step-by-step worked solution.
- **Content & data:** Manual §3 supporting tools — stoichiometry (mole conversions, percent yield) and formula writing/nomenclature; ion/formula scope from the manual (expanded at State/National). Problems are generated, not a fixed answer bank.
- **UI components:** Mode selector, generated prompt, answer input, worked-solution panel.
- **Scoring & feedback:** Checks numeric/formula answers and shows work; practice only.
- **Level gating:** required ion knowledge and formula scope expand at State/National; keep core Regional scope front and center.
- **Persistence:** none (or localStorage if requested).
- **Open questions:** confirm which ion/formula lists are Regional vs State/National (manual §3.d).

## Tool: Reference & Study Compiler
- **Status:** Planned
- **Category:** Notebook
- **Goal:** Build each participant's allowed double-sided reference sheet and track coverage of the manual's topics.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, small tables, diagrams) filed under the matching objective. 3) Prune: hide Confident items so the sheet holds only what still needs support. 4) Export a print-ready sheet sized to 8.5 × 11 in, both sides.
- **Content & data:** Objective outline transcribed from manual pp. C14–C15 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one double-sided 8.5 × 11 in sheet per participant (laminated/protected); the equipment list is a separate allowed item.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, mastery-prune filter, live space budget, print/export.
- **Scoring & feedback:** none (organizer); space budget warns when content exceeds one double-sided sheet.
- **Level gating:** objectives tagged Core / State-National / National-only.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (sheet mode, per-participant multiplicity).

## Notes
- A question/practice feature that relies on fixed quiz questions still requires a content architecture first. The generator approach above (and the cross-event student-authored flashcard archetype) avoids that dependency.
- Nomenclature, formula writing, and stoichiometry are supporting tools and must not displace the required gases and kinetics content.
