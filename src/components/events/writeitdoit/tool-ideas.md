## Write It...Do It B — Tool Specs

### Tool: Description Quality Analyzer & Drawing-Rule Validator
**Event:** Write It...Do It B
**Purpose:** Scan written descriptions for subtle implicit drawings or diagram-like language that would violate the strict no-drawings rule — a critical error that results in tier demotion or disqualification.
**Core interaction loop:**
1. User pastes or types their written description into the tool.
2. Tool scans for red-flag language patterns: references to visual layouts (e.g., "arrange in a triangular pattern" might imply a diagram), lists with numbered positions that sound spatial, or ASCII-art-like descriptions.
3. Tool highlights suspicious phrases and asks: "Is this describing a spatial relationship with words, or is it implicitly drawing a picture?"
4. Tool provides guidance: "Saying 'place piece A to the left of piece B' is OK. Saying 'arrange like this: [diagram]' is not."
**Content/data needed:** Language pattern database flagging phrases often confused with drawings; worked examples of allowed spatial description vs. implicit diagrams.
**UI components:** Text-input area (paste/type description); real-time phrase-highlighting scanner; flag list with explanations; allowed-vs.-forbidden examples sidebar.
**Feedback/scoring logic:** Patterns are flagged for user review (not auto-rejected) since context matters; tool provides guidance but human judgment is final (some flagged phrases may be OK).


---

### Tool: Instruction Sequencing Validator
**Event:** Write It...Do It B
**Purpose:** Check that assembly instructions follow a buildable sequence — pieces are introduced/described before being referenced in assembly steps.
**Core interaction loop:**
1. User inputs their description (or tool analyzes provided text).
2. Tool parses the description, extracts all piece names/references and all assembly steps.
3. Tool checks: Is piece "X" introduced in the piece-list section before being referenced in an assembly step? Can you actually build in the order specified, or do you need a piece that hasn't been mentioned yet?
4. Tool highlights sequencing violations (e.g., "Step 3 references 'the green connector,' but the piece list never mentions green parts").
**Content/data needed:** Language parser for extracting piece references and step instructions; logic to track piece introduction vs. use order.
**UI components:** Text input; piece-extraction list (showing all unique pieces identified); step-by-step trace (highlighting potential sequencing issues); suggestions for reordering.
**Feedback/scoring logic:** Sequencing issues flagged where a piece is used before being introduced; suggestions provided but final sequence is user's responsibility.


---

### Tool: Piece Naming Consistency Checker
**Event:** Write It...Do It B
**Purpose:** Ensure systematic, consistent piece-naming throughout the description — inconsistent names (calling something "connector" in the piece list, "the metal part" in step 1, "joint piece" in step 2) create ambiguity and confusion for the builder.
**Core interaction loop:**
1. User provides description; tool extracts all piece names/references.
2. Tool identifies variants (synonyms, abbreviations, color+type combinations) that refer to the same piece.
3. Tool flags inconsistency: "You call this piece 'connector' (line 5), 'metal connector' (line 8), and 'joint' (line 12). Is this the same piece or three different pieces?"
4. User clarifies or tool suggests consistent naming.
**Content/data needed:** Synonym-detection logic; typical naming schemes (e.g., "color + type," "type + size," "numbered pieces") to suggest consistent alternatives.
**UI components:** Text input; piece-name extraction with variant highlighting; synonym-detection flagging; suggested consistent-naming scheme (e.g., "Connector A, Connector B, Connector C" or "Red connector, Blue connector"); help text on naming strategies.
**Feedback/scoring logic:** Inconsistencies flagged; tool suggests consistent schemes but user chooses final naming.


---

### Tool: Spatial Descriptor Vocabulary Builder
**Event:** Write It...Do It B
**Purpose:** Help writers develop a **systematic vocabulary** for spatial descriptions: consistent language for directions (left/right, top/bottom, front/back), orientations (angle, rotation, facing), and connections.
**Core interaction loop:**
1. Tool presents a challenge object to describe (or user uploads an image of their practice object).
2. Tool generates a vocabulary checklist: "Decide NOW — which direction is 'left'? Is it left from the builder's view or from the piece's view? Will you use 'attach,' 'connect,' 'join' consistently?"
3. User defines their vocabulary (e.g., "Left = builder's view, facing the object. I'll always say 'attach piece A to the left side of piece B' in this format").
4. Tool then checks the user's description against their chosen vocabulary (consistency check).
5. User practices describing objects while maintaining the chosen vocabulary.
**Content/data needed:** Templates for spatial vocabulary (reference frames, connection vocabulary, orientation descriptors); example vocabularies for different object types.
**UI components:** Vocabulary-definition worksheet (interactive form); example phrases using defined vocabulary; description-checking tool (flags violations of user's own chosen vocabulary); practice objects to describe.
**Feedback/scoring logic:** Consistency validated against user's declared vocabulary (not a universal standard, but consistent within the description).


---

### Tool: Color & Orientation Explicit Reminder
**Event:** Write It...Do It B
**Purpose:** Flag places where the description mentions a piece but doesn't explicitly specify its color or orientation — these are separately scored dimensions that builders often miss without explicit mention.
**Core interaction loop:**
1. Tool parses the description and identifies piece mentions.
2. For each piece mention, tool checks: Is the color explicitly stated? Is the orientation/rotation explicitly stated? (e.g., "Place the connector" is vague; "Place the red connector with the opening facing upward" is explicit).
3. Tool highlights vague mentions and suggests explicit revisions: "You say 'place the connector.' Add: what color? What direction is it facing?"
4. User revises for clarity.
**Content/data needed:** Language patterns for color mention (e.g., "the red X," "the blue piece"), orientation mention (e.g., "facing up," "rotated 90 degrees," "with the hole on top").
**UI components:** Text input; piece-mention highlighting; per-mention checklist (color? orientation? position?); suggestion prompts for clearer phrasing.
**Feedback/scoring logic:** Flags where color/orientation are not explicitly mentioned; provides phrasing suggestions but user decides whether a piece's color/orientation is unambiguous without saying so.


---

### Tool: Description Structure Analyzer & Scaffolder
**Event:** Write It...Do It B
**Purpose:** Guide writers toward a systematic structure: piece introduction → detailed assembly sequence → final checks. Unstructured descriptions are harder for builders to follow.
**Core interaction loop:**
1. Tool provides a structured template: (1) Piece list and introduction (colors, sizes, distinguishing features), (2) Assembly sequence (step by step, in buildable order), (3) Final orientation/checks.
2. User can fill in the template or paste their existing description for the tool to analyze and suggest restructuring.
3. Tool checks: Are all pieces introduced before first use? Is there a clear first step? A last step? Is the sequence logical (can you actually build it in this order)?
4. Tool provides a reorganized version (suggestion) that user can adopt or adapt.
**Content/data needed:** Template structure; reorganization algorithm to reorder steps if sequencing is out of order.
**UI components:** Template form (fillable sections) or paste-and-analyze mode; current-description structure visualization (showing where pieces are introduced, where first used, etc.); suggested reorganization display (side-by-side with original).
**Feedback/scoring logic:** Structure analyzed for piece-introduction-before-use, logical step ordering, and narrative flow (not a style score, just a logical-completeness check).


---

### Tool: Description Completeness Checker (Piece-by-Piece)
**Event:** Write It...Do It B
**Purpose:** Verify that every piece in the original object has been mentioned in the description — missing pieces mean lost points since scoring is piece-by-piece.
**Core interaction loop:**
1. User provides a description; tool references the original object (image provided alongside the description).
2. Tool identifies all pieces in the original object (from the image, via user input or pre-tagged object metadata).
3. Tool extracts all piece mentions from the description and checks which pieces were not mentioned.
4. Tool reports: "You mentioned 8/10 pieces. Missing: 'small green connector' and 'yellow wheel' — these will score 0."
5. Tool can highlight which mentioned pieces lack color/orientation specifications.
**Content/data needed:** Object-piece metadata (list of all pieces per object); description parsing logic.
**UI components:** Original-object reference image; description input; piece-mention extraction; missing-piece list; solution reveal with side-by-side comparison.
**Feedback/scoring logic:** Missing pieces flagged; scoring impact estimated (missing piece = 0 for size, color, location, orientation, connection — 5× the point loss); tool can estimate total potential score if all missing pieces were added.


---

### Tool: Writer Time-Allocation Coach
**Event:** Write It...Do It B
**Purpose:** Help writers pace their 25-minute writing phase effectively — many students either rush through piece descriptions and run out of time for assembly steps, or spend too long on one section.
**Core interaction loop:**
1. Tool sets a 25-minute countdown timer and provides phase milestones (e.g., "By minute 8, you should have described all pieces; by minute 20, you should have completed assembly steps; minutes 20-25 reserved for review and clarification").
2. As user writes, tool tracks time spent in each phase (estimated from text-input position) and gives gentle nudges if behind schedule.
3. At end of 25 min, tool provides a phase-time breakdown: "You spent 12 min on piece descriptions, 10 min on assembly, 3 min on review."
4. Tool can recommend a personalized time allocation strategy based on object complexity (more pieces → more time on description; complex connections → more time on assembly).
**Content/data needed:** Phase time-allocation templates for different object complexities; milestone timing recommendations.
**UI components:** Countdown timer with phase markers; soft-nudge notifications; phase-time tracking; post-session breakdown chart.
**Feedback/scoring logic:** Time allocation evaluated against recommended template; tool provides feedback on whether pacing was efficient (not too fast/slow per phase).


---

### Tool: Practice Object Library
**Event:** Write It...Do It B
**Purpose:** Provide a diverse collection of novel objects (different each time) for repeated practice describing — the only way to genuinely test whether a written description is unambiguous before handing it to a real builder.
**Core interaction loop:**
1. Tool shows a randomly-selected practice object image (or user can browse a library and select one).
2. User writes a full description (25 minutes simulated, or untimed practice mode).
3. **Critical step:** User hands the description (without re-reading it) to a peer (live person or simulated builder) who attempts to build from the description alone, without asking clarifying questions.
4. Builder's reconstruction is compared to the original object — mismatches reveal where the description was ambiguous.
5. User revises the description to clarify ambiguities and re-tests with a fresh builder (if possible, or with the tool's feedback).
**Content/data needed:** Library of diverse practice objects (K'nex structures, Lego builds, everyday items assembled in unusual ways, abstract arrangements); multiple object sets so users practice fresh objects each session.
**UI components:** Object image display (clear, from multiple angles if possible); description input area; optional timer (25 min for timed practice); builder-feedback display (showing what was built vs. original); mismatch identification ("The builder put the red piece on the left, but your description said right").
**Feedback/scoring logic:** Simulated builder reconstructions are approximate (not perfect logic, but realistic human interpretation); mismatches highlighted to show ambiguities; user iterates and improves.


---

### Tool: Builder Phase Practice (20-Minute Reconstruction)
**Event:** Write It...Do It B
**Purpose:** Practice the builder role in isolation — given only a written description (no access to the original object), reconstruct the object in 20 minutes. This is a distinct skill from writing.
**Core interaction loop:**
1. Tool provides a written description (from a previous writer's session, or a sample description from the library).
2. User (as builder) reads the description and attempts to build the object using available materials, within a 20-minute timer.
3. Tool checks the build against the original object and provides feedback: "You built the structure correctly, but the orientation of the red piece was wrong — the description said 'facing up' but you placed it sideways."
4. Tool can also measure: time spent re-reading the description (good builders read it fully before starting), time stuck on ambiguous steps, etc.
**Content/data needed:** Sample descriptions paired with original objects; materials list for builds; builder-strategy tips.
**UI components:** Description display; countdown timer; builder-strategy hints (e.g., "Read fully first, then start building"); build-result input/photo; feedback display.
**Feedback/scoring logic:** Builder accuracy per piece validated; builder strategy evaluated (e.g., did they read fully first? did they reference the description multiple times?); time management within 20 min checked.

---

### Tool: Builder Feedback Simulator
**Event:** Write It...Do It B
**Purpose:** Simulate what happens when a real builder reads the description — highlight where ambiguity causes incorrect interpretation or lost time.
**Core interaction loop:**
1. User provides a description and selects a simulated builder "profile" (careful/slow/careful-listener, fast/impatient, visual-thinker, literal-interpreter).
2. Tool "builds" from the description, making realistic mistakes where ambiguities exist (e.g., if the description says "attach the piece," a literal-interpreter might attach it in the wrong orientation).
3. Tool shows the built result and highlights: "Your description said 'attach the connector.' Builder assumed it was upright, but you meant tilted 45°. Builder's result doesn't match."
4. User revises description to eliminate the ambiguity (e.g., "attach the connector with the opening facing forward and tilted 45° upward").
5. User re-tests with the same or a different simulated builder.
**Content/data needed:** Simulated-builder "logic" (decision tree for how to interpret vague instructions); object-building simulation; comparison logic (built object vs. original).
**UI components:** Description input; builder-profile selector; built-object visualization (showing what builder created from the description); mismatch highlighting with explanations; revision input; re-test functionality.
**Feedback/scoring logic:** Simulated-builder accuracy varies by clarity of description (clear descriptions = consistent results across profiles; ambiguous descriptions = different builders interpret differently, shown as mismatches).


---

### Tool: Competition Simulation (Full Event Mock)
**Event:** Write It...Do It B
**Purpose:** Run a full, realistic Write It Do It simulation: writer describes an object in 25 minutes, hands to builder, builder builds in 20 minutes, results are scored piece-by-piece like competition scoring.
**Core interaction loop:**
1. Tool selects a practice object.
2. Timer starts (25 min for writing phase); user writes description with all tools available (structure scaffolder, vocabulary checker, etc.).
3. After 25 min, description is locked and handed to a peer builder (or simulated builder).
4. Builder timer starts (20 min for building phase); builder attempts to reconstruct the object.
5. At end, tool compares built object to original piece-by-piece, scoring: correct size, color, location, orientation, connection for each piece (as per official rules).
6. Score is calculated and displayed with feedback on which pieces were correct/incorrect.
**Content/data needed:** Practice objects; competition scoring rubric (piece-by-piece: size/color/location/orientation/connection); official timing (25 min writing, 20 min building).
**UI components:** Full event simulation interface (writing phase with tools, timer, description submission; building phase with object visualization, timer, scoring result); score breakdown (per-piece feedback); post-event analysis and suggestions for improvement.
**Feedback/scoring logic:** Scoring follows official rules (per-piece, multi-dimensional); feedback highlights which dimensions (color, orientation, connection) were most often missed, suggesting focus areas for description clarity.


---

### Tool: Peer Review & Collaborative Editing
**Event:** Write It...Do It B
**Purpose:** Enable students to share descriptions with peers for review — a builder peer can catch ambiguities that the writer missed.
**Core interaction loop:**
1. User writes a description and optionally shares it with a peer (study partner, teammate, or coach).
2. Peer reads the description WITHOUT seeing the object and provides feedback: "Which steps are unclear? Which piece names are confusing? Where did you get stuck?"
3. Peer optionally attempts to build from the description (if they have the materials) to provide real feedback.
4. Writer collects feedback and revises.
5. Revised description can be re-shared and re-tested.
**Content/data needed:** Platform for sharing descriptions and collecting feedback; no specific content, just a collaboration framework.
**UI components:** Description-sharing link generator; feedback-input form for reviewer (free-text or structured checklist); version history (showing original vs. revisions); re-test function after revision.
**Feedback/scoring logic:** Feedback is qualitative (peer insights); version history shows iterative improvement; this is a practice tool, not a scoring tool.

