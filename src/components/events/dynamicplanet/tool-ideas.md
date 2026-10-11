# Dynamic Planet C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C24–C25. This season is freshwater-focused; former oceanography, ENSO, and ocean-circulation tools are out of scope for this event year. A binder of any size is permitted; during relevant specimen/display station rotations, pages may not be removed from the binder. Freshwater work is calculation- and interpretation-heavy, so generator tools fit better than a fixed question bank. Because a binder of any size is allowed, the Reference & Study Compiler runs in binder mode.

## Tool: Freshwater Calculation Tools
- **Status:** Live — `src/components/events/dynamicplanet/FreshwaterTools.jsx` (logic in `freshwaterCalculators.js`)
- **Category:** Calculator
- **Goal:** Compute stream discharge and a water-budget balance from user-entered field data.
- **Core interaction loop:** 1) Discharge: enter measured cross-sectional area and average velocity; read Q = A × v with SI units. 2) Water budget: enter comma-separated inflow and outflow amounts over the same interval and a shared volume unit; read total inflow, total outflow, and net change.
- **Content & data:** Manual course content (water budgets §3.a.ii; discharge, velocity, and load §3.f.ii–iii; lake water budgets §3.h.ii, pp. C24–C25); user-supplied values only.
- **UI components:** Two input forms and result readouts.
- **Scoring & feedback:** Unit-aware results labeled practice; no invented official score weights.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Freshwater Calculator Toolbox
- **Status:** Planned
- **Category:** Calculator
- **Goal:** Extend the live tools into a unit-aware toolbox covering the rest of the manual's quantitative freshwater content.
- **Core interaction loop:** 1) Choose a calculator. 2) Enter user-provided values. 3) Read the unit-aware result with the course-content reference.
- **Content & data:** Manual §3 course content — flood recurrence interval, stream order (network ordering), channel sinuosity, hydraulic gradient, Darcy/groundwater flow, residence time, sediment load/competence/capacity, and lake stratification/turnover; formulas checked against the course content. Immediate candidates: flood recurrence interval, stream order, sinuosity, hydraulic gradient, residence time.
- **UI components:** Calculator chooser, per-calculator inputs, results panel.
- **Scoring & feedback:** Practice only; no invented official score weights.
- **Level gating:** none.
- **Persistence:** none.
- **Open questions:** confirm which formulas the course content actually supplies (e.g., the recurrence-interval method) before labeling any as rule-derived.

## Tool: Freshwater Map and Hydrograph Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice topographic/contour, stream-network, groundwater, and hydrograph interpretation from generated cases.
- **Core interaction loop:** 1) Choose a generated case (contour-map gradient, stream-network order, hydrograph lag/peak/recession, well-level/groundwater flow). 2) Reason/answer from the displayed evidence. 3) Review against the course content.
- **Content & data:** Generated or clearly sourced datasets; no fabricated real-world records presented as authentic. Generating the cases removes the previous dependency on externally sourced station data.
- **UI components:** Case viewer (SVG maps/charts), interpretation prompts, reference panel.
- **Scoring & feedback:** Feedback on reasoning; practice only.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Reference & Study Compiler
- **Status:** Planned
- **Category:** Notebook
- **Goal:** Build the allowed reference binder and track coverage of the manual's course content.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's course content and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, tables, diagrams) filed under the matching objective. 3) Export a print-ready, paginated binder with a tab/section index, flagged so it stays intact during specimen/display stations.
- **Content & data:** Objective outline transcribed from manual pp. C24–C25 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one binder of any size/content/source per team; tabs, labels, lamination, and sheet protectors permitted; nothing may be removed during specimen/display stations.
- **UI components:** Objective checklist with status filter, reference block editor grouped by objective, section/tab index, paginated print/export with a no-removal reminder.
- **Scoring & feedback:** none (organizer).
- **Level gating:** none.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (binder mode).

This document is a planning tool only and does not invent official scoring.
