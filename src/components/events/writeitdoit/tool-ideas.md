# Write It, Do It B — verified 2027 tool plan

Source: supplied 2027 Division B Rules Manual, p. B61. One participant writes a description of an object; the other builds from it. Time: 25 minutes for the writer, 20 minutes for the builder. Only the writer brings a writing utensil — no other materials or resources are allowed. Construction-phase time is the tiebreaker. The differentiated tool for this event is a full timed relay with a random, unseen structure, which no general practice platform offers.

## Tool: Writer Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice writing precise construction instructions under the manual's time constraint.
- **Core interaction loop:** 1) Load a practice prompt with a structure buildable from common materials. 2) Write notes on the prompt's requirements. 3) Time the writing session to the manual's 25-minute limit. 4) Review a checklist of what the prompt required (drawings/diagrams prohibited).
- **Content & data:** User-supplied or simple generated prompts; no official-building "answer" required; the builder phase is 20 minutes (manual p. B61).
- **UI components:** Prompt panel, timer, notes area, requirement checklist.
- **Interactivity:** Live: the timer runs as a live countdown and the checklist updates as items are marked; the notes area is authored text.
- **Scoring & feedback:** Checklist feedback on prompt coverage and the prohibited-drawing rule only; no raw-score simulation — the manual scores pieces for size, color, location, orientation, and/or connection.
- **Level gating:** none.
- **Persistence:** none.

## Tool: Timed Relay with Structure Generator
- **Status:** Planned
- **Category:** Practice
- **Goal:** Run a full writer → builder practice rep with a random, unseen structure and a rubric review.
- **Core interaction loop:** 1) Generate a random object from a parametric library. 2) Show it to the writer only and start the 25-minute writing timer. 3) Hide the object, pass along the description, and start the builder's 20-minute timer. 4) Reveal the target and score each piece against the rubric. 5) Record the build-phase time (the tiebreaker).
- **Content & data:** Parametric structures built from common/simple science materials (shapes, colors, orientations, connections); no official models. This is the event's core skill and its only purpose-built practice harness.
- **UI components:** Structure viewer with a writer-only gate, phase timers, description transfer, target reveal, rubric review.
- **Interactivity:** Live: phase timers count down continuously; the structure is gated/revealed by phase; the rubric review is interactive.
- **Scoring & feedback:** Rubric-guided piece review (size, color, location, orientation, connection); explicitly not an official raw score; build-phase time recorded.
- **Level gating:** none.
- **Persistence:** none (or localStorage if requested).
- **Open questions:** the shape/connection vocabulary the generator should support.

## Tool: Builder Practice and Scoring Guidance
- **Status:** Planned
- **Category:** Practice
- **Goal:** Let a builder reproduce a build from the instructions and review it against the manual's per-piece scoring rubric.
- **Core interaction loop:** 1) Writer provides instructions (from Writer Practice or a file). 2) Builder reconstructs the structure in 20 minutes. 3) Writer/builder review each piece against the manual rubric dimensions (size, color, location, orientation, connection).
- **Content & data:** Manual §4 rubric dimensions and Tier/DQ rules (subsection drawing, model drawing), pp. B61; no invented relative adjustments.
- **UI components:** Instructions paste box, rubric checklist with citations, 20-minute timer.
- **Interactivity:** Live: an always-updating countdown plus an interactive rubric checklist.
- **Scoring & feedback:** Rubric-guided feedback; explicitly not an official raw-score calculation. Construction-phase time is the tiebreaker.
- **Level gating:** none.
- **Persistence:** none.

This document is a planning tool only; it does not invent official scoring.
