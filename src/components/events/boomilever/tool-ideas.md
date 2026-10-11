# Boomilever C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C7–C12. Prior checks using a 5,000 g bonus or earlier contact geometry are invalid.

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

## Tool: Structure Compliance Worksheet
- **Status:** Planned
- **Category:** Worksheet
- **Goal:** Record material/adhesive, wall-contact lines, chain position, loading-block height, and check explicit manual constraints.
- **Core interaction loop:** 1) Enter each measured/observed value. 2) Check the explicit constraints: wood bonded by adhesive; chain 40–45 cm horizontal from wall and within 2.5 cm of centerline; contact outside vertical width lines; loading block above bolt centerline before sand; base contacts above 15 cm (or 10 cm bonus).
- **Content & data:** Manual construction constraints and their sections.
- **UI components:** Per-rule inputs and pass/warn per rule with section citations.
- **Scoring & feedback:** Report each rule separately; must not claim to pre-judge an ES inspection.
- **Level gating:** bonus boundary treated as optional.
- **Persistence:** none (or localStorage if requested).