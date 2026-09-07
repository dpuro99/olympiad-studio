## Anatomy & Physiology C — Tool Specs

### Tool: Disorder-Mechanism Drill
**Event:** Anatomy & Physiology C
**Purpose:** Build understanding of *why* each required disorder causes its symptoms (mechanism-level knowledge), not just name recognition.
**Core interaction loop:**
1. Tool displays one disorder name (e.g., "Parkinson's Disease").
2. User fills in four blanks: (a) affected structure/system, (b) underlying mechanism, (c) resulting symptoms and physiological reason for each, (d) treatment/prevention.
3. On submit, tool reveals the correct answer for each of the four fields side-by-side with the user's answer, marking each field independently right/wrong (not one pass/fail per disorder).
4. Tool moves to the next disorder, prioritizing ones the user has previously gotten wrong.
**Content/data needed:** JSON array of disorder objects, one per required disorder across all three systems, each with fields: `name`, `system` (nervous/special_senses/endocrine), `affected_structure`, `mechanism`, `symptoms` (array, each with a short physiological explanation), `treatment`.
**UI components:** Card-style single-disorder view; 4 text input fields (or multi-select for symptoms); "Check Answer" button; side-by-side reveal comparison view; "Next" button.
**Feedback/scoring logic:** Track per-field accuracy (not just per-disorder) across sessions. Weight future question selection toward disorders/fields with lowest historical accuracy (spaced-repetition style).

---

### Tool: Interactive Labeled-Diagram Quizzer
**Event:** Anatomy & Physiology C
**Purpose:** Build fast, accurate structural identification for brain, eye, ear, and endocrine gland anatomy — tested in both written diagram questions and lab-practical specimen stations.
**Core interaction loop:**
1. Tool loads an anatomical diagram image with predefined hotspot coordinates for each labeled structure.
2. Mode A ("Click-to-ID"): tool highlights/marks one point on the image; user types or selects the structure name.
3. Mode B ("Name-to-Click"): tool displays a structure name; user clicks the corresponding point on the image.
4. On answer, tool shows correct/incorrect immediately, and if wrong, visually highlights the correct location/name.
5. Cycles through all hotspots on the current diagram before moving to the next diagram.
**Content/data needed:** Set of diagram images (brain sagittal section, cerebral vasculature, eye cross-section, ear cross-section, endocrine gland body map) each paired with a JSON list of hotspots: `{x, y, structure_name}`.
**UI components:** Image display with clickable/tappable coordinate overlay; text input or multiple-choice selector for naming; visual highlight/marker for correct location on reveal; progress indicator (X of Y structures on this diagram).
**Feedback/scoring logic:** Per-structure accuracy tracking; structures gotten wrong get requeued later in the same session and prioritized in future sessions.

---

### Tool: Hormone Matrix Trainer
**Event:** Anatomy & Physiology C
**Purpose:** Drill the gland → hormone → target → effect → disorder relational table from multiple directions so students can't rely on memorizing one fixed left-to-right list.
**Core interaction loop:**
1. Tool randomly selects one "cell" in the relationship table to quiz and one direction to quiz it from (e.g., given hormone → ask gland; given disorder → ask hormone/gland involved; given gland → ask user to list all hormones it produces).
2. User answers via text input or multi-select (for list-based questions like "name all hormones from the pituitary").
3. Tool reveals full correct relationship row after answering, regardless of which direction was asked, so the user sees the whole context.
**Content/data needed:** JSON array of hormone objects: `{gland, hormone_name, hormone_class (steroid/peptide/amine), target_organ, effect, associated_disorder_hyper, associated_disorder_hypo}`.
**UI components:** Single-question card; text input or multi-select depending on question type; full-row reveal table on answer submission; "Next" button.
**Feedback/scoring logic:** Track accuracy per gland and per query-direction (e.g., user may be strong at "hormone→gland" but weak at "disorder→hormone") to identify which relationship direction needs more practice.

---

### Tool: Timed Mixed-Format Practice Test Generator
**Event:** Anatomy & Physiology C
**Purpose:** Simulate real competition time pressure (~50 minutes) across all three systems and identify where in the test the student loses time or points.
**Core interaction loop:**
1. Tool assembles a randomized test pulling questions proportionally from nervous system, special senses, and endocrine content pools.
2. Live countdown timer starts; user answers questions (mix of multiple choice, short answer, and diagram-labeling question types) in sequence.
3. At time-up or completion, tool auto-grades and shows results broken down by system and by question type, plus time-per-question data if tracked.
**Content/data needed:** A larger question bank tagged by `system`, `subtopic`, `question_type` (MC/short-answer/diagram), with correct answers and (for short answer) acceptable answer variants or a rubric.
**UI components:** Countdown timer display; sequential question display (supports MC, text input, and click-on-diagram question types); results dashboard with breakdown by system/subtopic and time analysis.
**Feedback/scoring logic:** Score by system and subtopic to show relative weak areas; log time spent per question to flag pacing issues (e.g., "you spent 40% of your time on endocrine questions that were only 30% of the test").

---

### Tool: Cheat Sheet Builder/Optimizer
**Event:** Anatomy & Physiology C
**Purpose:** Help students make efficient use of the single allowed double-sided 8.5x11" sheet by surfacing high-value content they've forgotten to include.
**Core interaction loop:**
1. Tool presents a virtual double-sided page canvas (front/back) sized to represent the real sheet.
2. User adds text/content blocks to the canvas (freeform text entry, organized however they like).
3. Tool cross-references the content the user has entered against a checklist of required rules-based topics and flags categories with no or thin coverage (e.g., "No toxin reference detected — tetrodotoxin, curare, botulinum toxin, anatoxin-a, tetanus toxin are all testable").
4. User can dismiss flags or add content in response.
**Content/data needed:** Checklist/topic tree derived from the event rules (e.g., toxins list, hormone table, disorder list, EEG waveforms) with simple keyword/topic matching logic to detect whether user-entered text plausibly covers each item.
**UI components:** Two-page canvas editor (text boxes, freeform layout); sidebar checklist panel showing covered/flagged topics; export/print view sized to actual sheet dimensions.
**Feedback/scoring logic:** Not scored — this is a coverage-checklist tool, not a quiz. Flag state (covered/not covered) per topic is the only "feedback."

---

### Tool: EEG Waveform Identification Set
**Event:** Anatomy & Physiology C
**Purpose:** Provide repeated exposure to the narrow, specific skill of identifying simple EEG waveforms, which isn't covered by general anatomy study.
**Core interaction loop:**
1. Tool displays one EEG waveform image (e.g., normal alpha rhythm, normal beta rhythm, epileptiform spike-and-wave).
2. User selects/types the identification (waveform type and/or associated condition, if applicable).
3. Tool reveals correct answer with a short explanation of key visual features that identify it.
**Content/data needed:** Small image set of labeled sample EEG traces, each with `{image, waveform_type, associated_condition (if any), key_visual_features}`.
**UI components:** Image display; multiple-choice or text input; explanation reveal panel.
**Feedback/scoring logic:** Simple per-item accuracy tracking; repeat missed items more frequently.

---

### Tool: Pathway Tracer (Sight / Pupillary Reflex)
**Event:** Anatomy & Physiology C
**Purpose:** Reinforce visual pathway and pupillary reflex circuit sequencing, including predicting visual field defects from damage location.
**Core interaction loop:**
1. Mode A ("Sequence"): tool shows the steps of a pathway out of order; user drags/clicks them into correct sequence (e.g., retina → optic nerve → optic chiasm → optic tract → LGN → visual cortex).
2. Mode B ("Damage Scenario"): tool specifies a damage location along the pathway (e.g., "damage at the optic chiasm") and user selects/types the resulting visual field defect (e.g., bitemporal hemianopia).
3. Tool reveals correct sequence or correct defect with a brief explanation of the underlying logic.
**Content/data needed:** Ordered pathway step list for visual pathway and pupillary reflex circuit; mapping of damage locations to resulting visual field defects with explanations.
**UI components:** Drag-and-drop or click-to-order sequence builder; scenario selector with answer input; explanation reveal panel.
**Feedback/scoring logic:** Track accuracy per pathway and per damage-scenario type; surface commonly-missed damage locations for repeat practice.

---

### Tool: Goldman-Hodgkin-Katz Equation Calculator
**Event:** Anatomy & Physiology C
**Purpose:** Practice quantitative application of the GHK equation for membrane potential — one of the few calculation-based content areas in the event, explicitly requiring a Class II calculator.
**Core interaction loop:**
1. Tool provides ion concentrations inside/outside the cell (Na⁺, K⁺, Cl⁻) and their permeabilities.
2. User calculates the membrane potential using the GHK equation: Vm = (RT/F) × ln(PNa[Na]o + PK[K]o + PCl[Cl]i) / (PNa[Na]i + PK[K]i + PCl[Cl]o).
3. Tool validates the calculation and explains how changing one ion's permeability shifts Vm (e.g., increasing PNa makes the cell more positive, approaching Na's Nernst potential).
4. Tool can ask: "If a toxin blocks K⁺ channels, what happens to Vm?" (becomes less negative since PNa dominates).
**Content/data needed:** Standard intracellular/extracellular ion concentrations for neurons; reference permeability values; GHK equation in simplified form.
**UI components:** Ion concentration input table; permeability input fields; calculator workspace; GHK equation reference (with RT/F term at body temperature = ~61.5 mV); solution reveal with Nernst potential for each ion shown for comparison.
**Feedback/scoring logic:** Final Vm validated against the equation; intermediate calculation steps (numerator, denominator) validated independently; reasoning about permeability changes checked for understanding of Nernst potential logic.

---

### Tool: Action Potential Phase Identifier
**Event:** Anatomy & Physiology C
**Purpose:** Identify the phases of a neuronal action potential (resting, depolarization, repolarization, hyperpolarization) and the ion channels responsible for each — a foundational nervous system concept.
**Core interaction loop:**
1. Tool displays an action potential graph (voltage vs. time) with one phase highlighted.
2. User identifies the phase name and the primary ion movement responsible (e.g., "Depolarization — Na⁺ rushes in via voltage-gated Na⁺ channels").
3. Tool validates and explains the phase, then asks: "What would happen if voltage-gated K⁺ channels were blocked?" (prolonged depolarization, failure to repolarize).
4. Tool can compare myelinated vs. unmyelinated conduction (saltatory vs. continuous).
**Content/data needed:** Action potential graph with labeled phases; ion channel reference (Na⁺, K⁺, Ca²⁺ channels and their roles); myelination effects on conduction velocity.
**UI components:** AP graph display; phase selector (4 options); ion-channel selector; explanation input or multiple-choice; comparison mode (myelinated vs. unmyelinated scenarios).
**Feedback/scoring logic:** Phase identification validated against voltage-graph features; ion-channel reasoning checked for correct channel-phase pairing; myelination reasoning checked for mention of saltatory conduction and increased velocity.

---

### Tool: Reflex Arc Tracer
**Event:** Anatomy & Physiology C
**Purpose:** Identify the components of a reflex arc (sensory receptor, afferent neuron, interneuron, efferent neuron, effector) and trace signal flow through a given reflex (e.g., knee-jerk, withdrawal, pupillary).
**Core interaction loop:**
1. Tool names a reflex (e.g., "withdrawal reflex from touching a hot surface") and asks the user to identify the five arc components and their sequence.
2. User labels each component on a diagram or sequences the steps.
3. Tool validates the answer and asks: "If the afferent neuron is severed, can the reflex occur? Why?" (no signal reaches the spinal cord).
4. Tool can present scenarios where one component is damaged and asks the user to predict the effect.
**Content/data needed:** Reflex arc component definitions; common reflex types (stretch, withdrawal, crossed-extensor, pupillary, gag); damage-effect mappings.
**UI components:** Reflex arc diagram with draggable labels; reflex-type selector; damage-scenario input; explanation reveal.
**Feedback/scoring logic:** Component identification and sequencing validated; damage-effect predictions checked for correct understanding of where signal flow breaks.

---

### Tool: Cranial Nerve Function & Assessment Tester
**Event:** Anatomy & Physiology C
**Purpose:** Master the 12 cranial nerves — their names, Roman numerals, function (sensory/motor/both), and clinical assessment methods (State/National content).
**Core interaction loop:**
1. Tool presents a cranial nerve (e.g., "CN VII") and asks: "What is its name, function, and one way to clinically assess it?" (Facial, motor (facial muscles) + sensory (taste anterior 2/3 tongue), assess by asking patient to smile/frown).
2. User enters or selects answers.
3. Tool validates with full reference and can ask: "If CN X (vagus) is damaged, what symptoms appear?" (hoarseness, swallowing difficulty, autonomic dysfunction).
**Content/data needed:** Complete cranial nerve table: I-XII, names, type (S/M/B), function, assessment methods, common damage symptoms.
**UI components:** Single-question card; multiple-choice or text input for name/function/assessment; full reference reveal; damage-scenario prompt.
**Feedback/scoring logic:** Each cranial nerve's name, type, and function validated independently; assessment descriptions checked for key actions; damage-effect reasoning checked for clinical accuracy.

---

### Tool: Spinal Cord Tract Identifier
**Event:** Anatomy & Physiology C
**Purpose:** Identify ascending (sensory) and descending (motor) tracts of the spinal cord and their functions (State/National content).
**Core interaction loop:**
1. Tool shows a spinal cord cross-section diagram with a tract highlighted (e.g., "lateral corticospinal tract").
2. User identifies the tract (ascending/descending, sensory/motor, function).
3. Tool validates and explains: "Lateral corticospinal tract — descending, motor, carries voluntary motor commands from cortex to spinal cord."
4. Tool can ask: "If this tract is severed on the left side at T10, what motor deficit occurs and on which side of the body?" (ipsilateral deficit below the lesion).
**Content/data needed:** Spinal cord cross-section diagram with major tracts labeled; tract function reference; lesion-effect mappings.
**UI components:** Cross-section diagram with tract selection; tract metadata input (type, function); lesion-scenario prompt; explanation reveal.
**Feedback/scoring logic:** Tract identification validated; function reasoning checked; lesion-effect predictions checked for ipsilateral vs. contralateral accuracy (ascending tracts decussate at different levels than descending).