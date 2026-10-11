# Chemistry Lab C — verified 2027 tools

Source: supplied 2027 Division C Rules Manual, pp. C14–C15. The event requires at least one activity in each of gases and kinetics; time is not scored or a tiebreaker. Nomenclature and stoichiometry are supporting tools that may appear.

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
- **Core interaction loop:** 1) Select one manual-listed factor (temperature, concentration, particle size, catalyst). 2) Write each trial's condition. 3) Enter own initial/final measurement and elapsed time. 4) Compare calculated average rates; record controls and write a conclusion.
- **Content & data:** User-authored measurements only; rate = measured-change-over-time with direction from reactant-consumed/product-formed; units from the user.
- **UI components:** Factor selector, per-trial condition + measurement inputs, rate comparison table, notes/conclusion area.
- **Scoring & feedback:** Identifies invalid direction/time inputs; does not interpret results as an official answer. No preset questions, answers, or simulated measurements.
- **Level gating:** Regional/Invitational focus.
- **Persistence:** localStorage (explicit save/restore) + CSV export, formula-injection-safe; no upload.

## Tool: Experimental Design Guidance
- **Status:** Planned
- **Category:** Guidance
- **Goal:** Prompt students to change one variable at a time, keep relevant conditions controlled, and measure progress over time using supervisor-approved procedures.
- **Core interaction loop:** Read guidance cards and mark items applied to the current experiment.
- **Content & data:** Manual-based experimental-design points.
- **UI components:** Guidance checklist.
- **Scoring & feedback:** none.
- **Level gating:** none.
- **Persistence:** none.

## Notes
- A future question/practice feature requires a content architecture first: curated/reviewed question data with provenance or a separately approved generation system. Do not add fixed quiz questions directly in a component.
- Nomenclature, formula writing, and stoichiometry may be added as additional Regional/Invitational practice but must not displace required gases and kinetics content.