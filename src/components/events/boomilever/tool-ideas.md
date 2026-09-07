## Boomilever C — Tool Specs

### Tool: Truss Efficiency Calculator/Simulator
**Event:** Boomilever C
**Purpose:** Let students virtually test truss designs (member layout, angles, cross-sections) to estimate load capacity and mass before committing to physical construction, directly optimizing the load÷mass scoring metric.
**Core interaction loop:**
1. User builds a truss design on a 2D canvas: places joints/nodes, connects them with members, and assigns each member a cross-sectional dimension (width/height) from a provided wood-size picker.
2. Tool runs a simplified structural analysis (method of joints, assuming pin-jointed truss in static equilibrium) using the fixed loading condition (load applied at the specified distance from the wall, per the real event's geometry) to compute force in each member (tension or compression).
3. Tool flags members likely to fail (compression members prone to buckling given their length/cross-section; tension members exceeding estimated wood tensile strength) using reference strength values.
4. Tool computes total estimated structure mass from member volumes and estimated wood density, and displays an estimated max load and resulting load÷mass score.
5. User iterates on the design (add/remove members, resize, retriangulate) and sees updated estimates in real time or on demand.
**Content/data needed:** Reference table of common balsa/basswood properties (density, compressive strength, tensile strength, by grain direction); simplified buckling formula/lookup for compression members; the fixed real-event loading geometry (load position range: 40-45cm from wall, load magnitude up to 15,000g) as simulation constants.
**UI components:** 2D truss-building canvas (place nodes, draw members, snap-to-grid optional); member property editor (cross-section dimensions); results panel showing per-member force/status (safe/at-risk/failing), total estimated mass, estimated max load, and computed score; save/load design capability for iteration tracking.
**Feedback/scoring logic:** Not a quiz — output is the estimated engineering performance of the user's design (per-member stress status + overall score estimate). Accuracy of the underlying simplified physics model should be clearly caveated as an estimate, not a guarantee, since real wood/glue joints introduce variability the model can't fully capture.

---

### Tool: Testing Wall Geometry Visualizer
**Event:** Boomilever C
**Purpose:** Let teams verify their in-progress design satisfies the exact geometric constraints of the Testing Wall (contact zones, mounting point, chain position) before committing to a physical build, avoiding avoidable Tier 2 penalties for geometric non-compliance.
**Core interaction loop:**
1. Tool renders a to-scale diagram of the official Testing Wall: Mounting Bolt location, Vertical Contact Width Lines, Horizontal Contact Depth Lines (10cm/15cm/20cm), and the required chain centerline zone (40-45cm from wall, within 2.5cm of wall centerline).
2. User overlays/sketches their structure's silhouette on the diagram (freeform draw or simple shape placement) to visually check whether it stays within/outside the correct zones per whichever scoring option (Base vs. Bonus) they're targeting.
3. Tool highlights (in a clear pass/fail visual style) whether the user's overlay violates the "must only touch wall outside vertical contact width lines" rule, and whether it satisfies the correct horizontal depth zone for their chosen scoring option.
4. User can toggle between "Base Option" and "Load Scored Bonus Option" constraint overlays to compare what each requires.
**Content/data needed:** Fixed geometric constants from the official rules (wall dimensions, bolt position, contact depth line positions, contact width line positions, valid chain centerline zone) — no external content needed beyond these rule-derived constants.
**UI components:** To-scale 2D diagram canvas with the wall's official markings pre-drawn; freeform draw or shape-overlay tool for the user's structure silhouette; toggle switch for Base vs. Bonus Option constraint mode; pass/fail visual indicator (e.g., green/red zone highlighting) for compliance.
**Feedback/scoring logic:** Simple geometric pass/fail check — does the user's overlaid shape violate any exclusion zone, and does it satisfy the required chain/loading-block position for the selected option. No scoring beyond compliant/non-compliant per rule.

---

### Tool: Structure Mass vs. Load Ratio Tracker
**Event:** Boomilever C
**Purpose:** Give teams a structured log of their physical prototype iterations (mass, tested load, resulting score) so design changes can be evaluated with data instead of guesswork.
**Core interaction loop:**
1. User creates a new prototype entry: names/tags the design (e.g., "v3 - added diagonal bracing"), enters the measured structure mass, and enters the tested load supported (or marks it as untested/pending).
2. Tool auto-calculates the load÷mass score for that entry and adds it to a running list/table of all prototypes.
3. User can view all prototypes sorted by score, mass, or load, to compare iterations side-by-side.
4. User can attach freeform notes to each entry (e.g., what changed from the previous version, why it failed if it failed) for later reference.
**Content/data needed:** No external content needed — this is purely a user-data logging tool. Data model: array of prototype entries `{name, mass, load_supported, score (calculated), notes, date, bonus_option_used (bool)}`.
**UI components:** Entry form (name, mass, load, notes, bonus-option toggle); sortable/filterable table view of all entries; simple chart (e.g., mass vs. load scatter, or score-over-time line) to visualize iteration progress.
**Feedback/scoring logic:** Purely calculated (load÷mass, plus the 5000g bonus if the bonus-option toggle is checked) — no external grading, this is a personal tracking tool.

---

### Tool: Wood/Adhesive Strength Reference Tool
**Event:** Boomilever C
**Purpose:** Give teams quick access to comparative strength-to-weight data for common competition-legal woods and adhesive joint strength, since material choice is one of the few free design variables under the rules' strict material restrictions.
**Core interaction loop:**
1. User browses or searches a reference table of common Boomilever-legal wood types (e.g., balsa, basswood) by property: density, compressive strength (with/against grain), tensile strength (with/against grain), typical size availability.
2. User can similarly browse a comparison of common allowed adhesives (glue, cement, cyanoacrylate, epoxy, hot melt, polyurethane, super glue) by typical joint strength and cure time/working time tradeoffs.
3. Tool may allow simple side-by-side comparison of 2-3 selected materials.
**Content/data needed:** Reference dataset — wood species properties (density, compressive/tensile strength by grain direction) and adhesive properties (joint strength, working time, cure time) sourced from published material science data.
**UI components:** Searchable/filterable table view; optional side-by-side comparison view for selected items; simple detail view per material showing all properties.
**Feedback/scoring logic:** None — pure reference lookup tool, no quiz or grading involved.

---

### Tool: Failure Mode Diagnosis Guide
**Event:** Boomilever C
**Purpose:** Help teams interpret how/why a physically tested prototype failed and suggest likely causes and design fixes, supplementing physical testing with structured troubleshooting guidance.
**Core interaction loop:**
1. User describes the failure: selects the approximate failure location on a simple truss diagram (or from a list: "joint," "member snapped mid-span," "member buckled," "structure came off the wall mount," etc.) and the general loading condition at failure (e.g., "failed under X grams").
2. Tool matches the described symptoms against a set of common Boomilever failure patterns and returns the most likely cause(s) (e.g., "member buckling under compression — likely undersized cross-section or excessive unsupported length") with a suggested fix.
3. User can mark whether the diagnosis matched their actual observation, to refine which fixes get surfaced for similar future reports (optional feedback loop).
**Content/data needed:** A structured knowledge base of common failure patterns: `{failure_description, likely_causes: [], suggested_fixes: []}` — built from established truss engineering failure modes (buckling, tension failure, joint/glue failure, grain-direction weakness).
**UI components:** Simple diagram/selector for failure location and type; text/dropdown input for loading condition at failure; results panel showing likely cause(s) and suggested fixes; optional "was this helpful" feedback control.
**Feedback/scoring logic:** No scoring — this is diagnostic/advisory output, not a quiz. The tool should clearly present its diagnosis as a probabilistic best-guess rather than a certain answer, since real failure diagnosis benefits from physically inspecting the break.

---

### Tool: Design Knowledge Q&A Trainer
**Event:** Boomilever C
**Purpose:** Prepare students to answer Event Supervisor questions about their structure's design, construction, and operation — a standing requirement of the event.
**Core interaction loop:**
1. Tool presents one question at a time about truss theory, tension vs. compression, or why triangulation improves structural efficiency (e.g., "Why does adding a diagonal member to a rectangular truss section improve its load capacity?").
2. User answers via free text or multiple choice.
3. Tool reveals the correct explanation, allowing the user to compare their reasoning to the expected answer.
**Content/data needed:** A question bank covering core truss/structural engineering concepts relevant to Boomilever: `{question, answer_explanation, question_type (MC/short-answer), options (if MC)}`.
**UI components:** Single-question card view; text input or multiple-choice selector; explanation reveal panel; "Next" button.
**Feedback/scoring logic:** Simple per-question accuracy tracking (for MC) or self-assessment against the revealed explanation (for free text, since grading free-text engineering reasoning automatically is unreliable).