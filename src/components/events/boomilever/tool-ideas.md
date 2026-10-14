# Boomilever C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C7–C12. Prior checks using a 5,000 g bonus or earlier contact geometry are invalid. Boomilever is an iterate-and-test event, so a build/test history is as valuable as the one-off score estimate.

## Tool: Efficiency Estimator
- **Status:** Live — `src/components/events/boomilever/BoomileverEstimator.jsx` (logic in `boomileverScore.js`)
- **Category:** Calculator
- **Goal:** Estimate structural efficiency from user-entered load supported and structure mass.
- **Core interaction loop:** 1) Enter load supported (g) and structure mass (g). 2) Flag whether the bonus contact boundary was met and 15 kg was held. 3) View Load Scored and efficiency, with statuses for tiers and participation-only outcomes.
- **Content & data:** Manual scoring — bonus applies `+7,500 g` only when the bonus contact requirement is met and 15 kg is held; `Load Scored / Structure Mass`; Load Supported capped at 15,000 g; tiebreaks structure mass then estimated load closest to actual.
- **UI components:** Input fields, status flags, result card with rule citations.
- **Scoring & feedback:** Reports statuses rather than numeric estimates for participation-only runs; labeled practice, not official scoring.
- **Level gating:** contact above 15 cm standard, 10 cm bonus boundary.
- **Persistence:** none.
- **Open questions:** Any strength/failure simulator requires user-supplied assumptions and must be clearly labeled educational.

## Tool: Build/Test Log
- **Status:** Live — `src/components/events/boomilever/BoomileverBuildLog.jsx` (logic in `buildLogUtils.js`)
- **Category:** Notebook
- **Goal:** Track each prototype's build and test results so designs can be compared across iterations.
- **Core interaction loop:** 1) Record a build (structure mass, member dimensions/material, base option: 15 cm standard vs 10 cm bonus). 2) Enter the test outcome (load supported, held 15 kg?, failure mode/where it broke, changes made). 3) View each build's efficiency and a side-by-side comparison of all builds; export CSV.
- **Content & data:** Same scoring contract as the Efficiency Estimator (`Load Scored ÷ Structure Mass` with the +7,500 g bonus and 15 kg condition); user-entered measurements only.
- **UI components:** Build entry form, history/comparison table, CSV export.
- **Scoring & feedback:** Uses the verified formulas; labeled practice, not an ES ruling.
- **Level gating:** bonus boundary optional; 15 cm standard / 10 cm bonus.
- **Persistence:** localStorage (explicit save/restore); CSV export escaped and formula-injection-safe.
- **Open questions:** none.

## Tool: Structure Compliance Worksheet
- **Status:** Planned
- **Category:** Worksheet
- **Goal:** Record material/adhesive, wall-contact lines, chain position, loading-block height, and check explicit manual constraints.
- **Core interaction loop:** 1) Enter each measured/observed value. 2) Check the explicit constraints: wood bonded by adhesive; chain 40–45 cm horizontal from wall and within 2.5 cm of centerline; contact outside vertical width lines; loading block above bolt centerline before sand; base contacts above 15 cm (or 10 cm bonus). 3) Read the pass/warn result per rule with its section citation.
- **Content & data:** Manual construction constraints and their sections.
- **UI components:** Per-rule inputs and pass/warn per rule with section citations.
- **Scoring & feedback:** Report each rule separately; must not claim to pre-judge an ES inspection.
- **Level gating:** bonus boundary treated as optional.
- **Persistence:** none (or localStorage if requested).
