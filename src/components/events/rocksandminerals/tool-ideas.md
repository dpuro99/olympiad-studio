## Rocks and Minerals C — Tool Specs

### Tool: Mineral Properties Identifier
**Event:** Rocks and Minerals C
**Purpose:** Practice identifying minerals by observable properties (hardness, luster, streak, cleavage, color, etc.) — foundational skill for the 30–50% of event points dedicated to identification.
**Core interaction loop:**
1. Tool presents either: (a) an image of a mineral specimen, or (b) a description of properties ("white, cubic crystals, easily scratched, soluble in water").
2. User identifies the mineral by name from the 2026 National List.
3. Tool validates and reveals the correct answer, highlighting the key identifying properties.
4. For harder cases where observation is insufficient, tool provides diagnostic hints (e.g., "Taste it to distinguish halite from gypsum" — though actual taste-testing is never used in competition).
**Content/data needed:** Image bank covering all minerals on the National Rocks and Minerals List with multiple photos per mineral (various angles, light conditions, size contexts); property datasets for each mineral (color, hardness, luster, streak, cleavage/fracture, density, reaction with HCl).
**UI components:** Specimen image display or property-description text; multiple-choice mineral selector or free-text input; property highlights on reveal (which features made the ID certain?); optional property filter tool (narrow choices by checking specific properties).
**Feedback/scoring logic:** Mineral ID validated against official list; properties highlighted that confirm the ID; alternate likely candidates shown if student was close but wrong (building reasoning for why one mineral was chosen over a similar one).

---

### Tool: Rock Classifier (Igneous/Sedimentary/Metamorphic)
**Event:** Rocks and Minerals C
**Purpose:** Quickly classify rock type by texture and mineral composition, supporting the conceptual (vs. pure ID) portion of the event.
**Core interaction loop:**
1. Tool displays a rock image or description (e.g., "glassy, vesicular texture, dark color") and asks: "Igneous, sedimentary, or metamorphic?"
2. User selects the rock type and optionally identifies the specific rock (basalt, andesite, granite, etc.).
3. Tool validates and explains the reasoning: igneous rocks show interlocking crystals (phaneritic/aphanitic) or glassy/vesicular textures; sedimentary show rounded grains/layers/fossils; metamorphic show foliation/banding.
4. Tool can extend: "What depositional environment or tectonic setting produced this rock?" (reasoning question).
**Content/data needed:** Rock image bank with varied textures and compositions; classification decision tree (start with texture, then composition, etc.); plate-tectonic context for rock formation.
**UI components:** Rock image display; rock-type selector (3 options); specific-rock identifier (multiple-choice or free-text); explanation reveal with texture annotations; tectonic-context map (showing where this rock type typically forms).
**Feedback/scoring logic:** Rock-type classification validated against diagnostic textures; specific-rock ID validated if attempted; tectonic-context reasoning checked for plausibility.

---

### Tool: Feldspar Ternary Diagram Analyzer
**Event:** Rocks and Minerals C
**Purpose:** Interpret feldspar composition using ternary (three-component) diagrams — a specific, testable quantitative skill for mineral chemistry.
**Core interaction loop:**
1. Tool displays a ternary diagram with labeled compositions for potassium feldspar (K-feldspar), plagioclase (Na-feldspar), and anorthite (Ca-feldspar).
2. Tool marks a point on the diagram and asks: "What is the composition in % K, Na, Ca?" or "What feldspar type is this?"
3. User reads the diagram (following the ternary-coordinate rules) and enters the composition.
4. Tool validates and explains ternary-diagram reading (moving parallel to each axis to find the percentage for that component).
**Content/data needed:** Feldspar ternary diagram with compositional fields marked; reference points showing K-feldspar (100% K), plagioclase end-members (100% Na or 100% Ca).
**UI components:** Ternary diagram display; composition readout (grid lines or coordinate tool to help user read the diagram); percentage input fields for each component (K, Na, Ca); solution reveal with coordinate-reading explanation.
**Feedback/scoring logic:** Coordinate reading validated (percentages should sum to 100%); feldspar-type identification checked against compositional fields (e.g., >50% K = K-feldspar).

---

### Tool: Phase Diagram Interpreter (T-P and T-Composition)
**Event:** Rocks and Minerals C
**Purpose:** Read and predict phase stability using temperature-pressure diagrams or temperature-composition diagrams — supporting metamorphic and igneous mineral-formation questions.
**Core interaction loop:**
1. Tool displays a phase diagram (e.g., showing olivine-pyroxene stability boundaries, or silica polymorph stability: quartz-coesite-stishovite).
2. User selects a point (e.g., "600°C, 5 kbar") and predicts which phase(s) are stable.
3. Tool validates and explains phase transitions (what happens to the mineral if temperature or pressure changes across a phase boundary).
4. For T-Composition diagrams (like albite-orthoclase feldspar), user predicts cooling crystallization sequence.
**Content/data needed:** Common phase diagrams (silica polymorphs, olivine-pyroxene, feldspar binaries); labeled phase fields and boundaries.
**UI components:** Phase diagram display (with axis labels and phase fields colored); user can click/select a point on the diagram; phase prediction output; boundary-crossing scenario questions (e.g., "Cool from 1200°C to 600°C at constant pressure — what minerals crystallize?").
**Feedback/scoring logic:** Phase selection validated against diagram fields; boundary-crossing predictions checked (user should understand that crossing a phase boundary causes mineral transformation).

---

### Tool: Crystal System Matcher (State/National)
**Event:** Rocks and Minerals C
**Purpose:** Match crystal structures (cubic, hexagonal, tetragonal, orthorhombic, monoclinic, triclinic, trigonal) to crystal shapes and physical properties like cleavage — State/National content.
**Core interaction loop:**
1. Tool displays a crystal image and asks: "What crystal system does this mineral belong to?"
2. User selects from seven crystal-system options, optionally explaining reasoning (cubic crystals show 90° angles, hexagonal show 120° angles, etc.).
3. Tool validates and explains how crystal structure determines crystal shape, cleavage planes, and other physical properties.
4. Tool can reverse-prompt: "If a mineral shows perfect octahedral cleavage, what crystal systems is it likely to belong to?" (cubic, typically).
**Content/data needed:** Crystal images for each system; crystal-system geometric descriptions (axis lengths, angles); cleavage patterns for each system.
**UI components:** Crystal image or diagram display; crystal-system selector (7 options); explanation input or multiple-choice geometric properties (90° angles, etc.); cleavage-pattern reference (showing typical cleavage for each system).
**Feedback/scoring logic:** Crystal-system identification validated against image geometry; property-reasoning checked (e.g., "cubic because all angles are 90°").

---

### Tool: Thin Section Analyzer (State/National)
**Event:** Rocks and Minerals C
**Purpose:** Identify minerals in photomicrographs and distinguish rock types from microscopic texture — State/National-level skill requiring optical identification.
**Core interaction loop:**
1. Tool displays a photomicrograph (mineral or rock) taken in polarized light, showing optical properties (twinning, extinction angles, birefringence colors).
2. User identifies the mineral (if showing a mineral photo) or rock type (if showing a rock section).
3. Tool validates and highlights optical features that confirmed the ID (e.g., "Plagioclase shows polysynthetic twinning visible here").
4. Tool can ask: "Is this igneous basalt or sedimentary sandstone?" (based on texture: interlocking crystals vs. rounded grains).
**Content/data needed:** Photomicrograph bank (polarized-light microscope images) of common minerals and rock types; optical property reference (plagioclase twinning, quartz extinction, garnet isotropy, etc.); rock-texture reference (crystalline vs. detrital).
**UI components:** Photomicrograph display; feature-annotation tool (user can click to highlight visible features); mineral/rock identifier (multiple-choice or free-text); optical-property reference sidebar; solution reveal with feature annotations.
**Feedback/scoring logic:** Mineral/rock ID validated; optical-property reasoning checked (user should identify which visible feature confirmed the ID).

---

### Tool: Bowen's Reaction Series Simulator
**Event:** Rocks and Minerals C
**Purpose:** Understand crystallization order in cooling magma using Bowen's Reaction Series — foundational for igneous rock/mineral formation questions.
**Core interaction loop:**
1. Tool displays a temperature scale and Bowen's Reaction Series (continuous feldspar series, discontinuous olivine-pyroxene-amphibole-biotite series).
2. User predicts: "If magma cools from 1300°C to 600°C, which minerals crystallize in order?"
3. User arranges mineral names in crystallization order, or tool prompts with temperature points and asks what mineral crystallizes at each.
4. Tool validates and explains why olivine forms first (highest temp, highest density), why biotite forms last (lowest temp).
**Content/data needed:** Bowen's Reaction Series diagram with temperature scale; mineral properties (density, melting temp) explaining why series is ordered that way.
**UI components:** Bowen's series display (visual or listed); temperature scale; mineral-sequencing input (drag-and-drop or selection); cooling-scenario prompts; solution reveal with reasoning.
**Feedback/scoring logic:** Crystallization order validated against series; reasoning checked for understanding of temperature control (higher temp = earlier crystallization).

---

### Tool: Metamorphic Facies & Grade Identifier
**Event:** Rocks and Minerals C
**Purpose:** Use mineral assemblages and index minerals to determine metamorphic grade (low/medium/high) and facies (greenschist, amphibolite, granulite, blueschist, eclogite) — a conceptually challenging content area.
**Core interaction loop:**
1. Tool presents a metamorphic rock with labeled minerals (e.g., "Garnet + mica + quartz in a foliated band").
2. User identifies the metamorphic grade (presence of garnet suggests medium-to-high grade) and probable facies.
3. Tool validates and reveals the correct facies, then shows a T-P diagram with the P-T conditions that produce this facies.
4. Tool can ask: "If this rock formed at 600°C, 1 kbar, what facies is it?" (using index minerals to constrain the conditions).
**Content/data needed:** Index-mineral table showing which minerals indicate low/medium/high metamorphic grade; facies diagram (T-P grid with colored facies fields); metamorphic rock images with mineral labels.
**UI components:** Rock image or mineral list display; grade/facies selector; T-P diagram overlay (showing where this facies occurs); index-mineral reference table (collapsible).
**Feedback/scoring logic:** Grade determination validated (presence of diagnostic index minerals); facies selection checked against T-P conditions shown on diagram.

---

### Tool: Protolith Predictor
**Event:** Rocks and Minerals C
**Purpose:** Given a metamorphic rock, deduce the parent rock (protolith) type — a reasoning skill based on mineral composition and rock type.
**Core interaction loop:**
1. Tool presents: "This metamorphic rock contains quartz, feldspar, and mica in thin layers. What was the protolith?"
2. User selects the protolith type (shale, sandstone, limestone, basalt, granite, etc.) and optionally explains reasoning.
3. Tool validates (shale → slate, phyllite, schist; sandstone → quartzite; limestone → marble; granite → gneiss by analogy).
**Content/data needed:** Metamorphic-protolith correspondence table (shale→slate, granite→gneiss, basalt→amphibolite, etc.); reasoning: mica in a schist indicates the protolith had clay minerals (shale).
**UI components:** Rock description or image display; protolith selector (multiple-choice); reasoning input or explanation reveal; composition-to-protolith mapping reference.
**Feedback/scoring logic:** Protolith selection validated against expected compositions; reasoning explanation checked for logical connection (e.g., "contains quartz and feldspar → likely derived from granitic rock").

---

### Tool: Formation Environment Matcher
**Event:** Rocks and Minerals C
**Purpose:** Match rock types to their likely depositional or metamorphic settings based on mineral content and texture — bridging mineralogy and plate tectonics.
**Core interaction loop:**
1. Tool presents a rock (igneous granite) and asks: "What tectonic setting likely produced this rock?" (convergent boundary, subduction zone, etc.) or a sedimentary rock: "What depositional environment?" (river, beach, deep ocean, etc.).
2. User selects from multiple-choice options.
3. Tool validates and explains the connection (e.g., "Granite forms in continental crust from magma melting — common at convergent boundaries where crust is thick and hot").
4. Reverse mode: "Show me a rock that forms in a mid-ocean ridge setting" (basalt).
**Content/data needed:** Rock-formation context database (igneous: mid-ocean ridge/subduction/hotspot → basalt/andesite/rhyolite; sedimentary: environment → sandstone/shale/conglomerate; metamorphic: convergent/transform → schist/gneiss/slate).
**UI components:** Rock image/description display; tectonic-setting or depositional-environment selector; explanation reveal; plate-tectonics map (showing where this rock type forms); reverse-lookup (user given a setting, predicts rock type).
**Feedback/scoring logic:** Setting selection validated against rock mineralogy/texture; reasoning checked for understanding of geologic process (e.g., how subduction produces andesite through partial melting of basalt).

---

### Tool: Sedimentary Depositional Environment Identifier
**Event:** Rocks and Minerals C
**Purpose:** Match sedimentary rock types and primary structures to their depositional environment (alluvial fan, delta, river, beach, shallow marine, deep marine, etc.) — explicitly required content with multiple environments and structures.
**Core interaction loop:**
1. Tool presents a sedimentary rock or structure description: "This sandstone shows crossbedding with grain sizes indicating moderate energy. What environment?" (likely fluvial or aeolian).
2. User identifies the depositional environment from a comprehensive list (alluvial fan, river, delta, beach, shallow marine, deep marine, etc.).
3. Tool validates and explains the reasoning: crossbedding + moderate energy + sand = fluvial or aeolian; crossbedding direction can distinguish (unidirectional = river, multidirectional = wind).
4. Tool can present primary structures (ripple marks, mud cracks, graded bedding, fossil tracks) and ask which environment they indicate.
**Content data needed:** Environment-rocks-structure correlations; primary structure interpretations (e.g., mud cracks = subaerial exposure, graded bedding = turbidity current); grain-size energy relationships.
**UI components:** Rock/structure image or description; environment selector; primary-structure selector; solution reveal with cross-section of depositional environment.
**Feedback/scoring logic:** Environment identification validated against rock type and structures; reasoning checked for understanding of energy, transport mechanism, and depositional setting.

---

### Tool: Sedimentary Structure Identifier
**Event:** Rocks and Minerals C
**Purpose:** Identify primary sedimentary structures (plane bedding, crossbedding, ripple marks, mud cracks, graded bedding, fossil tracks) and interpret their depositional implications.
**Core interaction loop:**
1. Tool displays an image of a sedimentary structure and asks: "What is this structure, and what does it tell you about the depositional environment?"
2. User identifies the structure and explains its significance (e.g., "Mud cracks — formed by drying of fine sediment in subaerial exposure; indicates an environment that alternates wet and dry, like a tidal flat or floodplain").
3. Tool validates and provides the full environmental interpretation.
4. Tool can ask: "If you find graded bedding in a deep-marine sequence, what process deposited this?" (turbidity current — sediment settles out as flow wanes, coarse first then fine).
**Content/data needed:** Image bank of primary sedimentary structures; environmental interpretations; depositional process explanations.
**UI components:** Structure image display; structure name input; environmental-interpretation input; solution reveal with formation-process diagram.
**Feedback/scoring logic:** Structure identification validated against visual features; environmental interpretation checked for correct process and setting linkage.

---

### Tool: Economic & Industrial Use Matcher
**Event:** Rocks and Minerals C
**Purpose:** Connect minerals and rocks to their economic/industrial uses (ores, building stone, gemstones, agriculture, fossil fuels, manufacturing) — explicitly required content with significant application breadth.
**Core interaction loop:**
1. Tool presents a mineral or rock (e.g., "Hematite" or "Granite") and asks: "What is/are the major economic use(s) of this material?"
2. User selects from categories: ore/ metal source, building/construction, jewelry/gemstone, industrial mineral, agricultural (fertilizer, soil), energy/fossil fuel, manufacturing/electronics.
3. Tool validates and provides specific examples (hematite = iron ore for steel; granite = dimension stone for buildings/countertops).
4. Tool can ask: "Which minerals from the list are sources of lithium for batteries?" or "Which rocks are commonly used as building stones?" (targeted application questions).
**Content/data needed:** Database of economic uses for each mineral and rock on the National List; gemstone varieties (emerald, ruby, sapphire, etc.); industrial applications.
**UI components:** Mineral/rock image or name display; use-category selector (checkboxes for multiple uses); specific-application input; solution reveal with use descriptions.
**Feedback/scoring logic:** Use category validated against actual applications; specific application examples checked for accuracy; gemstone/precious-metal identifications validated.
