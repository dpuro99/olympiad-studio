## Chemistry Lab C — Tool Specs

### Tool: Ion Nomenclature & Charge Drill
**Event:** Chemistry Lab C
**Purpose:** Master the foundational nomenclature and charges for all required polyatomic ions — this is the single most-tested prerequisite skill across both stoichiometry and reaction-prediction tasks.
**Core interaction loop:**
1. Tool flashes a polyatomic ion formula (e.g., SO₄²⁻) or name (e.g., "sulfate") and asks for the alternate form.
2. User types or selects the correct answer.
3. On submit, tool shows correct/incorrect immediately, and if wrong, displays the correct ion and charge together.
4. Tool tracks accuracy per ion and prioritizes previously-missed ions in future sessions (spaced repetition).
**Content/data needed:** JSON array of required ions from the event: `{formula, name, charge}` covering nitrate, carbonate, phosphate, acetate, sulfate, ammonium, bicarbonate, hydroxide — plus any others added by the Event Supervisor.
**UI components:** Single-question card view; text input or multiple-choice selector; immediate right/wrong feedback; progress bar showing which ions have been drilled; optional audio pronunciation.
**Feedback/scoring logic:** Per-ion accuracy tracking; ions scoring <80% accuracy get prioritized in shuffle order; optional session-end summary showing weakest ions.


---

### Tool: Stoichiometry Problem Solver
**Event:** Chemistry Lab C
**Purpose:** Practice the full pipeline of stoichiometry problems: interpreting balanced equations, converting between moles/grams/liters, identifying limiting reagents, and calculating percent yield.
**Core interaction loop:**
1. Tool presents a stoichiometry word problem (e.g., "12.0 g of sodium chloride reacts with silver nitrate. How many grams of silver chloride precipitate are formed?").
2. User enters the final numerical answer or works through the problem step-by-step, entering intermediate values (molar mass, moles of reactant, moles of product, grams of product).
3. On submit, tool validates the answer and shows step-by-step solution with molar masses, conversion factors, and stoichiometric ratios highlighted.
4. Tool optionally asks follow-up questions from the same scenario (e.g., "What was the limiting reagent?" or "If 8.2 g of product actually formed, what was the percent yield?").
**Content/data needed:** Problem bank covering: simple mole-to-mole conversions, mole-to-mass conversions, limiting-reagent scenarios, percent-yield calculations, and mixed scenarios (given volume of solution, concentration, or gas at STP). Organize by difficulty and type.
**UI components:** Problem statement display; input field(s) for answer or step-by-step work; optional scaffold mode with guided prompts (e.g., "What is the molar mass of the product?"); solution reveal with full working and intermediate values called out; optional step-by-step checker that validates each step.
**Feedback/scoring logic:** Per-problem accuracy; wrong answers trigger reveal of worked solution; problems scored wrong are queued for replay; optional session summary showing which problem types (mole-to-mass, limiting-reagent, etc.) need more practice.


---

### Tool: Reaction Type Classifier & Product Predictor
**Event:** Chemistry Lab C
**Purpose:** Practice predicting products for metathesis reactions using solubility rules, and balance the resulting net ionic equations — a core reasoning skill tested in the event.
**Core interaction loop:**
1. Tool gives molecular reactants (e.g., "BaCl₂ + Na₂CO₃ → ?").
2. User predicts the products (in molecular form) and then selects or types the net ionic equation.
3. On submit, tool validates the products against solubility rules, shows the ionic form, and reveals the correct net ionic equation.
4. Tool optionally asks follow-up questions (e.g., "Is this reaction spontaneous? Why?" or "What is the precipitate?").
**Content/data needed:** Solubility rule reference (what combinations form precipitates, strong acids/bases, etc.); problem bank of metathesis reactions covering common precipitation, acid-base, and gas-forming scenarios at Regional level, plus redox at State/Nationals.
**UI components:** Reactant display; free-text or dropdown product selector; ionic-equation editor (multi-part form: molecular → total ionic → net ionic); solubility rule reference panel (collapsible or always-visible); explanation reveal.
**Feedback/scoring logic:** Per-equation accuracy; accuracy tracked separately for product prediction vs. net ionic simplification (user might predict correct products but write wrong net ionic, or vice versa — each gets feedback); problems missed are queued for review.


---

### Tool: Chemical Equation Balancer & Classifier
**Event:** Chemistry Lab C
**Purpose:** Practice balancing equations by type (acid-base, redox, metathesis, combustion, decomposition) and understand why certain equations are tricky to balance (odd-numbered atoms, polyatomic ion units).
**Core interaction loop:**
1. Tool displays an unbalanced equation (or a word description of a reaction: "Potassium permanganate reacts with hydrogen peroxide in acidic solution").
2. User balances the equation by typing coefficients.
3. On submit, tool validates the balance (atom count on each side), checks for lowest whole-number ratios, and reveals the correct balanced form.
4. Tool classifies the equation type and highlights key features (e.g., "This is a redox reaction — note the change in oxidation states for Mn and H").
**Content/data needed:** Equation bank covering all required reaction types: acid-base, metathesis (including precipitation), redox, decomposition, synthesis — each with multiple examples, increasing in difficulty (simple → complex with polyatomic ions → complex with odd-numbered atoms).
**UI components:** Equation display area with blank coefficient boxes before each compound; coefficient input fields; visual atom-count checker (shows atom tallies on each side as user enters coefficients, greens them when balanced); explanation panel on reveal.
**Feedback/scoring logic:** Per-equation accuracy; equations scored wrong are queued for later in same session and prioritized in future sessions; optional difficulty scaling (Regional: basic equations only; State/Nationals: includes complex balancing).


---

### Tool: Kinetics Rate Law Solver
**Event:** Chemistry Lab C
**Purpose:** Derive rate laws from experimental data (concentration vs. time or rate vs. [reactant]) and calculate rate constants with correct units — a State/National-level quantitative skill Regional-level prep often lacks.
**Core interaction loop:**
1. Tool presents experimental data: either a table of [reactant] and time, or a table of initial [reactants] and initial rates.
2. User determines reaction order (0, 1, 2, or mixed), writes the rate law, and calculates the rate constant with correct units.
3. Tool validates the rate law, checks order determination (using graphing or ratio methods), and confirms unit correctness.
4. Tool can ask follow-up questions (e.g., "If [reactant] doubles, how does the rate change?" or "What is the half-life at [reactant]=0.5M?").
**Content/data needed:** Experimental kinetics datasets (concentration vs. time, or rate vs. concentration) for 0th, 1st, and 2nd-order reactions; datasets requiring multi-step order determination (e.g., 2nd order overall: 1st in A, 1st in B); rate constant reference values for common reaction types.
**UI components:** Data table display; graph tool (optional — auto-generate graphs of [A] vs. t, ln[A] vs. t, 1/[A] vs. t to help students identify order); rate law input fields (e.g., "Rate = k[A]^m[B]^n"); rate constant input with unit selector; step-by-step solution reveal.
**Feedback/scoring logic:** Order determination graded separately from rate constant calculation (user might get order right but calculate k with wrong units, for example); incorrect orders trigger hint about which graph linearizes the data.


---

### Tool: Solubility Rule Practice & Precipitation Predictor
**Event:** Chemistry Lab C
**Purpose:** Drill the solubility rules (always soluble: Group 1, NH₄⁺, NO₃⁻; usually soluble: Cl⁻, SO₄²⁻; usually insoluble: CO₃²⁻, PO₄³⁻, OH⁻, S²⁻) and predict whether mixing two solutions forms a precipitate.
**Core interaction loop:**
1. Tool presents two ionic compounds dissolved in water (e.g., "AgNO₃ + NaCl") and asks: "Does a precipitate form? If so, what is it?"
2. User applies solubility rules, identifies the potentially-insoluble combination, and names the precipitate.
3. Tool validates and reveals the correct answer with the solubility rule cited (e.g., "AgCl is insoluble — all chlorides are soluble except Ag⁺, Pb²⁺, Hg₂²⁺").
4. Tool can ask: "Write the net ionic equation for the precipitation."
**Content/data needed:** Solubility rule table (with exceptions clearly noted); problem bank of ion combinations covering all major rule categories and their exceptions.
**UI components:** Ion pair display; precipitation prediction (yes/no); precipitate name input; net ionic equation editor; solubility rule reference (collapsible).
**Feedback/scoring logic:** Precipitation prediction validated against rules; precipitate name checked for correct cation-anion pairing; net ionic equation validated for correct spectator ion removal.

---

### Tool: Oxidation State Assigner & Redox Half-Reaction Balancer
**Event:** Chemistry Lab C
**Purpose:** Practice assigning oxidation states to atoms in molecules/ions, identifying oxidation/reduction, and balancing redox half-reactions in acidic or basic solution — core redox skills required at all levels.
**Core interaction loop:**
1. Tool presents a molecule or polyatomic ion (e.g., "MnO₄⁻" or "Cr₂O₇²⁻") and asks the user to assign oxidation states to the central atom.
2. User enters the oxidation state and optionally identifies which species is oxidized/reduced in a given reaction.
3. Tool validates and reveals the correct oxidation state with the standard rules applied (e.g., O is -2 except in peroxides; sum equals charge for ion).
4. Tool can present a full redox reaction and ask user to balance it using the half-reaction method (separate oxidation and reduction, balance atoms/charge, combine).
**Content/data needed:** Set of molecules/ions with varied oxidation states (transition metals in multiple oxidation states, polyatomic ions, peroxides); common redox reactions in acidic and basic solution.
**UI components:** Molecule/ion display with atom-selection tool; oxidation state input field; reaction display with half-reaction editor (oxidation/reduction sides, electron balance, atom/charge balancing); solution reveal with rules reference.
**Feedback/scoring logic:** Oxidation state assignment validated per atom using standard rules; half-reaction balancing checked for correct atom and charge balance; electron transfer validated (electrons lost = electrons gained).


---

### Tool: Limiting Reagent Visualizer
**Event:** Chemistry Lab C
**Purpose:** Make limiting-reagent problems intuitive by visualizing how much product each reactant can make, and which reactant runs out first — a high-frequency testable skill in stoichiometry.
**Core interaction loop:**
1. Tool presents a balanced equation with given masses/moles of each reactant (e.g., "2H₂ + O₂ → 2H₂O, starting with 4g H₂ and 32g O₂").
2. Tool visualizes each reactant as a "supply" and shows how much product each can theoretically make (as horizontal bars or numerical output).
3. User identifies the limiting reagent and calculates the maximum product amount.
4. Tool validates and shows the limiting reagent with a visual "running out first" indicator, and calculates the actual yield.
5. Tool can ask: "How much of the excess reagent remains unreacted?"
**Content/data needed:** Problem bank with varied limiting-reagent scenarios: 1:1 ratios, 2:1 ratios, 3:2 ratios, with mass or mole inputs.
**UI components:** Equation display; reactant amount inputs; visual bar chart showing product capacity from each reactant; limiting-reagent selector; excess-remainder calculator; solution reveal.
**Feedback/scoring logic:** Limiting-reagent identification validated (the one with lower theoretical yield); product amount validated from limiting reagent; excess calculation checked (starting minus consumed).


---

### Tool: Reaction Condition Effect Explainer
**Event:** Chemistry Lab C
**Purpose:** Build conceptual understanding of how temperature, concentration, particle size, and catalysts affect reaction rate, and why — aligned with the event's emphasis on explaining mechanism, not just naming.
**Core interaction loop:**
1. Tool presents a scenario (e.g., "Increasing temperature increases the reaction rate. Explain why in terms of particle collisions and activation energy").
2. User enters a free-text explanation.
3. Tool reveals a correct explanation emphasizing collision theory (more kinetic energy → more frequent/energetic collisions → more successful collisions per unit time).
4. User is asked to apply the same reasoning to a new scenario (e.g., "How would adding a catalyst change the rate? Why?").
**Content/data needed:** Set of mechanism-based explanation prompts (temperature, concentration, particle size, catalyst, solvent polarity) with model answers emphasizing collision theory and activation energy.
**UI components:** Scenario prompt display; free-text input area for explanation; model explanation reveal; optional follow-up prompt for application to related scenario.
**Feedback/scoring logic:** No automatic grading of free-text responses; user compares their explanation to the model explanation; optional keyword checker (highlights if explanation mentions "activation energy," "collision frequency," etc.).


---

### Tool: Lab Safety Compliance Checker
**Event:** Chemistry Lab C
**Purpose:** Ensure students understand the dress code and safe material-handling requirements before competition — violations result in real penalties or disqualification.
**Core interaction loop:**
1. Tool presents a scenario (e.g., "You arrive at the event with shoulder-length hair. Can you compete?") or a dress-code checklist.
2. User selects compliant/non-compliant or answers yes/no questions about safety requirements.
3. Tool reveals correct answers and explains why (e.g., "No — hair must be tied back to prevent it catching fire or being exposed to chemicals").
4. Tool can simulate a full safety inspection (user goes through checklist of goggles, apron, skin coverage, hair, equipment).
**Content/data needed:** Official dress code requirements from the event rules; common mistake scenarios; reference list of required vs. prohibited equipment.
**UI components:** Scenario cards or checklist view; simple yes/no or compliant/non-compliant selector; explanation reveal; optional full-competition checklist view.
**Feedback/scoring logic:** Simple right/wrong per scenario; no partial credit, since safety is binary. Summary at end shows any areas of misunderstanding.


---

### Tool: Equipment & Procedure Reference Guide
**Event:** Chemistry Lab C
**Purpose:** Give students quick lookup access to required lab equipment and correct procedure (safe and accurate measurement techniques) for tasks likely to appear in the event.
**Core interaction loop:**
1. User searches or browses the equipment list: glassware (beakers, Erlenmeyer flasks, graduated cylinders, burettes, pipettes), heating apparatus, safety gear.
2. For each item, tool shows: image/diagram, volume/capacity ranges, typical use case, and correct handling (e.g., "Graduated cylinders: read at meniscus, at eye level, ±0.5 mL precision").
3. Tool includes animated procedure demonstrations for common lab tasks: measuring liquids, heating, titration setup, safe chemical handling.
**Content/data needed:** Images/diagrams of all equipment on the Division C Chemistry Lab Equipment List; reference accuracy tolerances for each piece; video or step-by-step animation of common procedures.
**UI components:** Searchable/browsable equipment library with images; procedure video/animation carousel; reference tolerances and safe-handling notes for each item.
**Feedback/scoring logic:** Pure reference tool — no scoring, just lookup and demonstration.

