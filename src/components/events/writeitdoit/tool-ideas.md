# Write It Do It C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C42–C43. 2027 is a rotator-building year (rotation superstructures). There is no score rounding, no relative scoring, and no tiebreak adjustments to raw scores. A writing utensil and clipboard are allowed; no rulers (building or judging time is 10–15 min, of which not all is writing).

## Tool: Writer Practice Timer
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice writing precise construction instructions for a rotating-superstructure task under realistic time pressure.
- **Core interaction loop:** 1) Load a practice prompt with a simple structure and rotation requirements. 2) Write notes on the prompt's requirements. 3) Use the timed writing session against a 10–15 min window. 4) Review a checklist of what the prompt required.
- **Content & data:** User-supplied or simple generated prompts; no official-building "answer" required.
- **UI components:** Prompt panel, timer, notes area, requirement checklist.
- **Scoring & feedback:** Checklist feedback on prompt coverage only; no raw-score simulation (no rounding/relative scoring).
- **Level gating:** none.
- **Persistence:** none.

## Tool: Builder Practice and Rubric
- **Status:** Planned
- **Category:** Practice
- **Goal:** Let a builder reproduce a written build from its instructions and score the writing against the manual's rubric dimensions.
- **Core interaction loop:** 1) Writer provides instructions (from Writer Timer or a file). 2) Builder reconstructs the structure. 3) Writer/builder score the instructions against manual rubric dimensions with the tool's guidance.
- **Content & data:** Manual §4/§5 rubric dimensions for written vs actual build; no invented relative adjustments.
- **UI components:** Instructions paste box, build-checklist, rubric scoring panel with citations.
- **Scoring & feedback:** Rubric-guided feedback; explicitly not an official raw-score calculation (manual says no rounding or relative scoring).
- **Level gating:** none.
- **Persistence:** none.