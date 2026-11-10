# Dynamic Planet C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C24–C25. This season is freshwater-focused; former oceanography, ENSO, and ocean-circulation tools are out of scope for this event year. A binder of any size is permitted; during relevant specimen/display station rotations, pages may not be removed from the binder. Freshwater work is calculation- and interpretation-heavy, so generator tools fit better than a fixed question bank. Because a binder of any size is allowed, the Reference & Study Compiler runs in binder mode.

## Tool: Freshwater Calculation Tools
- **Status:** Live — `src/components/events/dynamicplanet/FreshwaterTools.jsx` (logic in `freshwaterCalculators.js`)
- **Category:** Calculator
- **Goal:** Compute stream discharge and a water-budget balance from user-entered field data.
- **Core interaction loop:** 1) Discharge: enter measured cross-sectional area and average velocity; read Q = A × v with SI units. 2) Water budget: enter comma-separated inflow and outflow amounts over the same interval and a shared volume unit; read total inflow, total outflow, and net change.
- **Content & data:** Manual course content (water budgets §3.a.ii; discharge, velocity, and load §3.f.ii–iii; lake water budgets §3.h.ii, pp. C24–C25); user-supplied values only.
- **UI components:** Two input forms and result readouts.
- **Interactivity:** Live: discharge and budget figures derive from the fields as typed, with a schematic channel cross-section and inflow/outflow budget bars.
- **Scoring & feedback:** Unit-aware results labeled practice; no invented official score weights.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Freshwater Calculator Toolbox
- **Status:** Live — `src/components/events/dynamicplanet/FreshwaterToolbox.jsx` (logic in `freshwaterToolboxUtils.js`; citations and formula basis in `src/seasons/2027/dynamicplanet.js`)
- **Category:** Calculator
- **Goal:** Extend the live tools into a unit-aware toolbox covering the rest of the manual's quantitative freshwater content.
- **Core interaction loop:** 1) Choose a calculator. 2) Enter user-provided values in the unit measured. 3) Read the live result, the equation, and the manual section that names the quantity.
- **Content & data:** Six calculators, each tied to the section that names the quantity: channel sinuosity (§3.d.i, where the manual explicitly asks for the calculation), hydraulic gradient (§3.g.iii), Darcy groundwater flow (§3.g.iii), reservoir residence time (§3.a.ii), flood recurrence interval (§3.f.iv), and Manning open-channel flow (§3.f.iii). The manual lists topics rather than printing formulas, so each calculator shows the section that names the quantity, the equation it applies, and whether that relationship is the standard definition for the quantity; the ranked-record plotting-position convention is explicitly left to the problem statement.
- **UI components:** Calculator tabs, per-calculator unit-aware inputs (number + unit selector), live readouts, sinuosity/meander and well/water-table schematics, per-calculator citation footer.
- **Interactivity:** Live: every result derives during render from the current inputs; no Calculate button.
- **Scoring & feedback:** Practice only; results labeled practice, no invented official score weights.
- **Level gating:** none.
- **Persistence:** none.
- **Open questions:** none blocking. Stream ordering and sediment load/competence/capacity were deliberately left to the generated-case tool below, because stream order needs a network surface and an explicit Strahler/Shreve convention before it is honest to compute.

## Tool: Freshwater Map and Hydrograph Practice
- **Status:** Live — `src/components/events/dynamicplanet/MapPractice.jsx` (logic in `mapPracticeUtils.js`; citations and conventions in `src/seasons/2027/dynamicplanet.js`)
- **Category:** Practice
- **Goal:** Practice the manual's interpretation tasks — topographic contours (§3.k.i), stream order (§3.c.ii), the water table from well data (§3.k.ii), and storm hydrographs (§3.k.iii) — from cases the tool generates itself.
- **Core interaction loop:** 1) Pick a case type and read the generated SVG. 2) Enter the answers, or keep the seed and retry the same case. 3) Check to see per-question grading, the revealed map (well contours and flow arrow), and the worked reasoning.
- **Content & data:** Four generators driven by an integer seed (`mulberry32`), so a case is reproducible and can be revisited: a synthetic tilted-plus-undulating height field with marching-squares contours (points A and B sit on labelled contours); a binary tributary network laid out from the tree; three well heads fitted to a water-table plane with regular 5 m contours and a downhill flow arrow; and a synthetic hydrograph with a hyetograph above it. No real place or station record is presented as authentic. Conventions the manual does not fix are stated in the case: Strahler ordering (Shreve noted), lag measured from the rainfall centroid, and the gradient as a straight-line average.
- **UI components:** Case tabs, seed field with a New case button, one hand-rolled SVG per case (contour map with scale bar and contour labels, drainage network, well map with grid and reveal, hydrograph with hyetograph and axis ticks), numeric answer fields, explicit Check answers, per-question feedback with the expected value, worked solution, and a per-case citation footer.
- **Interactivity:** Live where it is honest and explicit where it is not: the case redraws from the seed during render, answers and grading are state, and Check is an explicit action because grading and revealing the map are side effects, not recomputation.
- **Scoring & feedback:** Per-question correct/not-yet with the accepted value and a three-line worked solution; practice only, never an official score.
- **Level gating:** none.
- **Persistence:** none (a case is reproducible from its seed, so there is nothing to save).

## Tool: Reference & Study Compiler
- **Status:** Live — `src/components/events/dynamicplanet/DynamicPlanetReferenceCompiler.jsx` (shared engine `src/components/general/ReferenceCompiler.jsx`)
- **Category:** Notebook
- **Goal:** Build the allowed reference binder and track coverage of the manual's course content.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's course content and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, tables, diagrams) filed under the matching objective. 3) Export a print-ready, paginated binder with a tab/section index, flagged so it stays intact during specimen/display stations.
- **Content & data:** Objective outline transcribed from manual pp. C24–C25 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one binder of any size/content/source per team; tabs, labels, lamination, and sheet protectors permitted; nothing may be removed during specimen/display stations.
- **UI components:** Objective checklist with status filter, reference block editor grouped by objective, section/tab index, paginated print/export with a no-removal reminder.
- **Interactivity:** Authoring tool: live budget and index preview; Save/Print/Export are explicit actions.
- **Scoring & feedback:** none (organizer).
- **Level gating:** none.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (binder mode).

This document is a planning tool only and does not invent official scoring.
