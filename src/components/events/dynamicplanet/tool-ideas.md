# Dynamic Planet C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C24–C25. This season is freshwater-focused; former oceanography, ENSO, and ocean-circulation tools are out of scope for this event year. A binder of any size is permitted; during relevant specimen/display station rotations, pages may not be removed from the binder.

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

## Tool: Freshwater Map/Data Stations
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice topographic-map interpretation, watershed/drainage divides, stream networks, well-level contour maps, groundwater flow lines, hydrographs, stream gauging, discharge, and lag/peak analysis from supplied evidence.
- **Core interaction loop:** 1) Load a sourced dataset/station. 2) Answer interpretation prompts. 3) Review reasoning against course content.
- **Content & data:** Clearly sourced datasets; ask students to reason from the supplied evidence.
- **UI components:** Data/station viewer, interpretation prompts, reference panel.
- **Scoring & feedback:** Feedback on reasoning; practice only.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Process and Calculation Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice water budgets/reservoirs, climate/topography controls, stream order, channel sinuosity, sediment competence/capacity, channel/floodplain processes, flood recurrence, aquifers/karst, lake stratification/turnover, wetlands, and human impacts.
- **Core interaction loop:** 1) Choose a process or formula. 2) Answer or solve with user-provided values. 3) Check results against manual course content.
- **Content & data:** Manual §3 course content; formulas checked against the course content and user-provided values.
- **UI components:** Process chooser, formula/answer panel.
- **Scoring & feedback:** No invented official score weights; practice feedback only.
- **Level gating:** none.
- **Persistence:** none.