## Entomology C — Tool Specs

### Tool: Specimen Visual Identifier (Flash Card Mode)
**Event:** Entomology C
**Purpose:** Build speed and accuracy in visual specimen ID by exposing students to hundreds of insect images and reinforcing family/order recognition through repeated exposure and feedback.
**Core interaction loop:**
1. Tool displays a high-quality image of an insect specimen (or larva/nymph for * marked families).
2. User selects the correct Order, Family, and/or common name from options or types it.
3. Tool shows correct/incorrect immediately; if wrong, reveals the correct ID and a key feature to look for on this specimen.
4. Tool tracks accuracy per family and prioritizes previously-missed families in future sessions.
**Content/data needed:** Image bank covering all 113 families (and larval/nymph forms for * marked families) from the 2026 National Entomology List; multiple images per family when possible (different life stages, angles, color variations within species).
**UI components:** Full-screen specimen image display; multiple-choice or text-input identifier; immediate right/wrong feedback with key features highlighted on image; progress bar showing session accuracy; family-level accuracy summary at session end.
**Feedback/scoring logic:** Per-family accuracy tracking; families <80% correct get prioritized in shuffle; optional difficulty scaling (Regional families only, then State/National additions).


---

### Tool: Dichotomous Key Generator & Practice
**Event:** Entomology C
**Purpose:** Practice using dichotomous keys to ID unfamiliar specimens and build skill in characteristic comparison — a testable skill independent of memorized ID.
**Core interaction loop:**
1. Tool displays a dichotomous key (either a provided official key or a tool-generated key from a subset of 113 families) and a specimen image.
2. User follows the key, selecting between pairs of characteristics (e.g., "Wings present or absent?" → "If present, one or two pairs?").
3. Tool validates each step and leads user to the correct family ID.
4. Alternatively, user can be given a small set of specimens and asked to construct a simple dichotomous key to distinguish them — this tests understanding of discriminating characteristics.
**Content/data needed:** Dichotomous key database (or tool to generate keys from characteristic datasets); specimen images with marked anatomical features; example discriminating characteristics for key construction.
**UI components:** Key-navigation display (numbered steps, pairs of options); specimen image with optional characteristic-highlighting overlay; step-by-step breadcrumb trail showing user's path through key; key-construction mode with characteristic selector and tree builder.
**Feedback/scoring logic:** Key navigation validated at each step (did user select a valid option?); constructed keys checked for logical completeness (every specimen reaches a family endpoint) and efficiency (minimal branching).


---

### Tool: Adult & Larval/Nymph Form Matcher
**Event:** Entomology C
**Purpose:** Master the visual connection between adult and immature forms for families marked with * — a commonly under-prepared skill that appears directly in competition.
**Core interaction loop:**
1. Tool shows an adult insect image and asks: "Which of these three images shows the larval/nymph form?"
2. User selects from multiple-choice options (including distractor options: larvae of related families, or completely unrelated insects).
3. Tool shows correct/incorrect; if wrong, highlights key features to notice (e.g., "Grasshopper nymphs look like wingless adults; aquatic nymph antennae are usually shorter than adults").
4. Reverse mode: show a larva/nymph, ask for the corresponding adult.
**Content/data needed:** Image pairs of adult and immature forms for all * marked families; distinctive features that connect adult/immature forms.
**UI components:** Two-panel display (adult on left, user's selected form on right, or vice versa); multiple-choice selector; feature-highlighting overlay (annotated differences or similarities); feedback on why the correct match is correct.
**Feedback/scoring logic:** Per-family accuracy tracking (student might be strong on Lepidoptera larvae but weak on Hemiptera nymphs, for example); session summary breaks down accuracy by order/family.


---

### Tool: Taxonomy Hierarchizer & Lookup
**Event:** Entomology C
**Purpose:** Quickly navigate from any insect name to its complete taxonomic classification (Subclass → Order → Family → Genus/Species), and practice recognizing hierarchical relationships.
**Core interaction loop:**
1. User searches for an insect (by common name, Order, or Family).
2. Tool displays the full taxonomic hierarchy and marks the family's status (Regional only, or State/National).
3. User can reverse-lookup: "Give me all families in Order Lepidoptera" or "Which Order contains Family Apidae?"
4. Quiz mode: "Complete the hierarchy: Subclass __, Order Diptera, Family __, common name House Fly."
**Content/data needed:** Complete taxonomic database for all 113 families: Subclass, Order, Family, example Genus/species, common names, larval form indicator (*).
**UI components:** Hierarchy tree view (clickable/expandable); search bar for name lookup; quiz mode with blanks to fill; reverse-lookup tool (Order → Families, Family → Order, etc.); quick-reference tables per Order.
**Feedback/scoring logic:** Lookup accuracy validated against official list; quiz blanks checked for correct taxonomic level; optional hierarchy visualization (tree diagram) for visual learners.


---

### Tool: Mouthpart Type Identifier
**Event:** Entomology C
**Purpose:** Identify the five main insect mouthpart types (chewing, piercing-sucking, sponging, siphoning, chewing-lapping) and match them to the orders that possess them — a foundational anatomical concept directly relevant to ID and ecology questions.
**Core interaction loop:**
1. Tool displays an image or description of a mouthpart structure (e.g., "Coiled tube under head, no mandibles visible") and asks: "What type of mouthpart is this, and which Order does it belong to?"
2. User identifies the mouthpart type and associated order (siphoning → Lepidoptera).
3. Tool validates and explains the structure and its feeding function (siphoning: butterflies/moths drink nectar through a coiled proboscis).
4. Tool can ask: "What mouthpart type would you expect in a mosquito? Why?" (piercing-sucking — for drawing blood/nectar through a needle-like stylet).
**Content/data needed:** Reference for 5 mouthpart types with images, structural descriptions, and order associations; feeding ecology for each.
**UI components:** Mouthpart image/description display; type selector (5 options); order selector; explanation reveal; comparison mode (side-by-side mouthpart images across orders).
**Feedback/scoring logic:** Mouthpart type validated against structural features; order association checked; feeding-ecology reasoning validated for correct functional link.


---

### Tool: Wing Morphology & Modification Identifier
**Event:** Entomology C
**Purpose:** Identify wing types and modifications (membranous, elytra, hemelytra, tegmina, halteres, scales) and match them to the orders that bear them — essential for ID and dichotomous key work.
**Core interaction loop:**
1. Tool displays a wing image and asks: "What type of wing is this, and what order does it belong to?" (e.g., "Hardened forewings covering membranous hindwings" → elytra, Coleoptera).
2. User identifies wing type and associated order.
3. Tool validates and explains the modification's function (elytra: protective covers for hindwings and abdomen in beetles).
4. Tool can ask: "Why do flies (Diptera) have only one pair of wings?" (hindwings modified into halteres for balance/stability).
**Content/data needed:** Wing type reference with images; order-wing-type associations; functional explanations.
**UI components:** Wing image display; type selector (membranous, elytra, hemelytra, tegmina, halteres, scaled); order selector; explanation reveal.
**Feedback/scoring logic:** Wing type identification validated against morphology; order association checked; functional reasoning validated for correct adaptive explanation.


---

### Tool: Metamorphosis Type Practice
**Event:** Entomology C
**Purpose:** Distinguish complete metamorphosis (holometabolous: egg → larva → pupa → adult, e.g., beetles, butterflies, flies) from incomplete metamorphosis (hemimetabolous: egg → nymph → adult, e.g., grasshoppers, true bugs) and identify which orders use which type.
**Core interaction loop:**
1. Tool presents a life-cycle description or sequence of images: "Egg → aquatic nymph with gills → winged adult" and asks: "What type of metamorphosis is this? What order?"
2. User identifies metamorphosis type and order (incomplete metamorphosis, aquatic nymph indicates Odonata — dragonflies).
3. Tool validates and explains key distinguishing features (presence/absence of pupal stage; nymph vs. larva morphology; wing development).
4. Tool can ask: "If a larva looks completely different from the adult (e.g., caterpillar vs. butterfly), is this complete or incomplete metamorphosis?" (complete — dramatic morphological change via pupal stage).
**Content/data needed:** Metamorphosis-type definitions; order associations; example life cycles with images.
**UI components:** Life-cycle image sequence or description; metamorphosis-type selector (complete/incomplete); order selector; explanation reveal.
**Feedback/scoring logic:** Metamorphosis type validated against life-cycle features; order association checked; reasoning validated for correct identification of pupal stage presence/absence.

---

### Tool: Anatomy Label & Feature Recognition Tool
**Event:** Entomology C
**Purpose:** Practice identifying anatomical structures (antennae, legs, wings, mouthparts, compound eyes, etc.) used in dichotomous keys and identification — anatomical precision supports ID speed.
**Core interaction loop:**
1. Tool displays a detailed specimen diagram (or photo) with hotspot coordinates for key anatomical features.
2. Mode A: Tool highlights a feature; user types or selects the structure name.
3. Mode B: Tool names a structure; user clicks the correct location on the specimen.
4. Tool can focus on challenging structures (e.g., distinguishing tarsal claws, comparing antennal morphology across orders).
**Content/data needed:** Specimen images with annotated anatomical hotspots; anatomical terminology for insect body parts (segmented, jointed, specialized mouthpart types, etc.).
**UI components:** Specimen image display with clickable/tappable hotspot overlay; structure-name input or selector; visual highlight/marker on reveal; anatomical feature legend (collapsible panel with labeled diagram).
**Feedback/scoring logic:** Per-feature accuracy tracking; frequently-missed features get prioritized in future sessions; optional focus mode (study all antenna types, or all leg morphologies, etc.).


---

### Tool: Ecology & Habitat Matcher
**Event:** Entomology C
**Purpose:** Build knowledge of where insects live and what ecological roles they play — habitat and economic-use questions are guaranteed in competition questions.
**Core interaction loop:**
1. Tool presents: "Which insects are primarily aquatic?" or "Name two insects that are important crop pollinators" or "Which family includes disease vectors (mosquitoes)?"
2. User selects from a list or types the answer(s).
3. Tool reveals correct answers and ecological context (e.g., "Culicidae [mosquitoes] are vectors for malaria, dengue, Zika").
4. Tool can present scenarios: "You find an insect on a flower. What role might it play?" (pollinator, predator, parasite, herbivore).
**Content/data needed:** Database of ecological roles and habitat associations for each family: aquatic, terrestrial, cave-dwelling, parasitic, predatory, herbivorous, pollinator, pest, saprophagous, etc.
**UI components:** Habitat/role selector (dropdown or multi-select); insect family/common name input; ecological context reveal; scenario-based prompt with role prediction input.
**Feedback/scoring logic:** Habitat/role selections validated against biological data; scenario predictions checked for ecological plausibility (e.g., aquatic insects from aquatic families).


---

### Tool: Economic Importance Categorizer
**Event:** Entomology C
**Purpose:** Practice categorizing insects by their benefits/harms to humans — a core content area that pairs with identification and drives real-world context.
**Core interaction loop:**
1. Tool presents an insect (by image or name): "Classify this insect as beneficial, pest, disease vector, food source, or none of the above."
2. User selects category(ies) (an insect may have multiple roles).
3. Tool reveals correct classification(s) and specific examples (e.g., "Ladybugs [Coccinellidae]: beneficial predators of aphids; used in biocontrol").
4. Follow-up: "What is the economic significance of this classification?" (e.g., reduces pesticide need for aphid control).
**Content/data needed:** Database of economic roles for each family: beneficial (pollinator, predator, decomposer), pest (crop-damaging, stored-product pest), disease vector, food/medicine source, waste/leather/silk producer.
**UI components:** Insect image/name display; category selector (checkboxes for multiple selections); economic-significance explanation reveal; chart showing global pest species vs. beneficial species counts.
**Feedback/scoring logic:** Category selection validated against curated database; significance explanations checked for relevance (e.g., "vectors disease" is more significant for a mosquito than "is small").


---

### Tool: Integrated Pest Management (IPM) Strategy Designer
**Event:** Entomology C
**Purpose:** Apply pest-control knowledge to real-world scenarios (National level requires IPM reasoning), considering tradeoffs between chemical, biological, and cultural controls.
**Core interaction loop:**
1. Tool presents a scenario: "Aphids are infesting your tomato crop. Design an IPM strategy."
2. User selects controls: cultural (remove infested leaves), biological (introduce ladybug predators), chemical (insecticidal soap), and temporal (timing of planting/harvest).
3. Tool evaluates the strategy against IPM principles: effectiveness, environmental cost, cost-benefit, sustainability.
4. Tool can ask: "Why might resistant pest populations develop with repeated chemical use?" (selection for resistant phenotypes).
**Content/data needed:** Database of control methods (cultural, biological, chemical) for major pest families; efficacy and environmental/health cost data for each.
**UI components:** Scenario display; control-method selector (checklist or drag-and-drop); strategy-evaluation rubric (effectiveness, cost, environmental impact); feedback on strategy quality and reasoning for improvements.
**Feedback/scoring logic:** Strategy evaluated against IPM best practices (diversity of controls, minimal environmental harm, cost-effective); reasoning explanations checked for understanding of resistance evolution and ecological impacts.


---

### Tool: Behavioral Characteristic Matcher
**Event:** Entomology C
**Purpose:** Build knowledge of insect behavior (feeding, nesting, mating, defense, etc.) as it relates to ecological/economic significance — supports both ID and economic-importance questions.
**Core interaction loop:**
1. Tool presents a behavior: "This insect builds paper nests and can sting multiple times. What family is it?"
2. User selects the family (from multiple choice or types it).
3. Tool reveals the answer (e.g., Vespidae — wasps and paper wasps) and explains the behavior's role in ecology and potential human interaction.
4. Reverse mode: given a family, describe typical behaviors and what they tell us about the insect's ecology.
**Content/data needed:** Database of characteristic behaviors for major families: social vs. solitary nesting, host specificity (parasitoid families), feeding specializations, mating displays, defense mechanisms.
**UI components:** Behavior description display; family selector; behavior-explanation reveal with ecological context; family-description prompt (multiple-choice or free-text).
**Feedback/scoring logic:** Family selection validated against behavior patterns; behavioral explanations checked for ecological plausibility and connection to identified family.

