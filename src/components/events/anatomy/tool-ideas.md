# Anatomy and Physiology C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C3–C5. 2027 focus is respiratory, digestive, and immune systems. Keep content segmented Regional / State / National; do not import prior-year nervous/senses/endocrine material. Disease/treatment content must come from the exact manual list. Tie every item to the manual's objective and cite the source provision.

## Tool: Practice Notes
- **Status:** Live — `src/components/events/anatomy/AnatomyPractice.jsx` (helpers in `anatomyNotes.js`)
- **Category:** Notebook
- **Goal:** Record study observations for the respiratory, digestive, and immune systems and export as CSV.
- **Core interaction loop:** 1) Add a note with system/objective tag. 2) Review saved notes by system and objective. 3) Export notes to CSV.
- **Content & data:** User-authored notes only; no preset questions or simulated content.
- **UI components:** Note form, filterable list, CSV export.
- **Scoring & feedback:** none (notebook); CSV text escaped and formula-injection-safe.
- **Level gating:** user tags core vs State/National vs National-only.
- **Persistence:** localStorage, explicit save/restore; CSV export.

## Tool: System-Based Station Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Practice respiratory, digestive, and immune content with immediate per-objective feedback.
- **Core interaction loop:** 1) Pick a system and level. 2) Answer short-answer / model-identification / quantitative / data-interpretation prompts. 3) See the objective and manual citation for each item with the response evaluation.
- **Content & data:** Manual-listed objectives and disorders only; track the specific objective per question.
- **UI components:** Prompt panel, input, answer/reference reveal, level filter.
- **Scoring & feedback:** Per-question evaluation tied to a manual objective; practice scoring, not official.
- **Level gating:** core vs State/National vs National-only additions.
- **Persistence:** none.
- **Open questions:** Authoring content bank (curated content architecture needed — no fixed quiz questions without approval).

## Tool: Respiratory Data Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Interpret lung-volume/capacity, spirometry, flow-volume loops, obstructive-vs-restrictive, gas exchange, and oxygen-hemoglobin curves.
- **Core interaction loop:** 1) Load a teacher-provided or cited dataset. 2) Answer interpretation prompts. 3) Review reasoning against manual-standard answers.
- **Content & data:** Teacher-provided or clearly cited datasets; no fabricated measurements.
- **UI components:** Dataset viewer, interpretation prompts, reference panel.
- **Scoring & feedback:** Feedback only on listed content; higher regulation and extra disorders level-gated.
- **Level gating:** higher-level regulation and extra disorders gated to State/National.
- **Persistence:** none.

## Tool: Digestive/Immune Process Practice
- **Status:** Planned
- **Category:** Practice
- **Goal:** Work through case-based prompts on digestion/absorption, motility, immunity, immunization, antibody classes, and listed disorders.
- **Core interaction loop:** 1) Choose a case. 2) Trace the process or classify the response. 3) Get manual-cited feedback.
- **Content & data:** Manual-listed disorders and processes only.
- **UI components:** Case prompt, sequence/classification inputs, references.
- **Scoring & feedback:** Evaluates responses against manual objectives.
- **Level gating:** liver/pancreas pathways, V(D)J immunology/transplant, and National tumor immunology must be level-tagged.
- **Persistence:** none.

This document is a planning tool only; it does not invent official scoring.