## Metric Mastery B — Tool Specs

### Tool: Metric Unit Conversion Sprint
**Event:** Metric Mastery B
**Purpose:** Build speed and accuracy in metric-to-metric prefix conversions (kilo→milli, centi→hecto, etc.) under the strict 5-minute timer that matches Section Two of the event.
**Core interaction loop:**
1. Tool generates 5 metric conversion problems with a countdown timer (5 minutes total).
2. User enters the converted value **and the correct unit** (both must be correct for full credit).
3. Tool provides immediate right/wrong feedback per problem (no partial credit if unit is wrong).
4. Tool tracks which prefix conversions (kilo, centi, mega, micro, etc.) are weak and prioritizes them in future sessions.
**Content/data needed:** Metric prefix table and their multipliers; randomized problem bank covering metric-to-metric conversions only.
**UI components:** Problem display (one at a time); numeric input field for converted value; unit input or selector; per-problem feedback (right/wrong); countdown timer; session summary showing accuracy and weakest prefixes.
**Feedback/scoring logic:** Both value and unit must be correct (0/5 points if either is wrong); timer enforces speed; weak-prefix problems are requeued for extra practice.

---

### Tool: Estimation Calibration Trainer
**Event:** Metric Mastery B
**Purpose:** Build intuition for sensory estimation of mass, volume, length, temperature by practicing on known quantities and receiving quantitative feedback on accuracy percentage.
**Core interaction loop:**
1. Tool presents a known object (mass, volume, or length is provided in advance, e.g., "This 1-liter bottle is shown").
2. User estimates a property (e.g., "Estimate the mass of this bottle of water") without using any measuring device.
3. Tool reveals the actual value and calculates percent error (|estimate - actual| / actual × 100%).
4. User repeats with similar objects, building calibration on that property. Tool highlights if the student is consistently over/under-estimating.
5. After several calibrations, tool tests on new objects: "Based on your calibration, estimate this bottle's mass" — student applies learned heuristics.
**Content/data needed:** Reference set of common objects with known masses, volumes, lengths (coin, water bottle, ruler, textbook, etc.); expected accuracy thresholds by Regional/State/National level (15%/10%/5% for full credit).
**UI components:** Object image or photo; estimation input field (with appropriate unit); actual-value reveal with error percentage; calibration trend display (scatter plot of estimates vs. actual); heuristic hints (e.g., "Water is 1kg/liter").
**Feedback/scoring logic:** Percent-error calculation; trend analysis (is student improving? consistent bias?); optional automated feedback (e.g., "Your estimates are 8% too high on average — adjust by reducing by ~8%").

---

### Tool: Measurement Precision Formatter & Validator
**Event:** Metric Mastery B
**Purpose:** Master the strict precision rules for analog vs. digital instruments (estimated digit for analog, no estimated digit for digital) — getting the format wrong results in full zero credit on that measurement, even if numerically close.
**Core interaction loop:**
1. Tool presents a measurement scenario: "Using an analog ruler, you measure 9.0 cm. Write your answer with proper precision."
2. User enters: "9.00 cm" (three significant figures: 9.0 + one estimated).
3. Tool validates the format (must match instrument resolution + one estimated digit) and marks right/wrong.
4. Tool can show various instruments (analog ruler, digital scale, graduated cylinder) and explains the precision rule for each.
5. User practices reading analog/digital meters and writing results in correct format.
**Content/data needed:** Reference precision rules for common instruments (resolution + 1 estimated digit for analog; resolution only for digital); worked examples showing correct vs. incorrect formatting.
**UI components:** Measurement scenario (instrument type shown); result input field; format-validation checker (explicit notification of required precision); worked examples showing correct formatting; instrument-specific precision rules sidebar.
**Feedback/scoring logic:** Format validated strictly (must match instrument resolution rules); numeric value validated only if format is correct; session feedback highlights systematic format mistakes (e.g., "You're adding extra significant figures to digital readings").

---

### Tool: Significant Figures Calculator
**Event:** Metric Mastery C
**Purpose:** Apply significant figures rules to calculated results — when you multiply/divide measurements, how many sig figs should your answer have?
**Core interaction loop:**
1. Tool presents: "You measure length = 9.2 cm and width = 4.3 cm. Calculate area. How many significant figures should your answer have?"
2. User calculates (area = 9.2 × 4.3 = 39.56) and determines sig figs (both measurements have 2 sig figs, so area should be 40 cm² — 2 sig figs).
3. Tool validates the sig fig reasoning and the rounded result.
4. Tool extends: "If you add 9.2 cm + 4.3 cm, how many decimal places should the sum have?" (2 sig figs for both, but addition rule uses least decimal places, so answer is 13.5 cm, or 14 cm depending on rounding).
**Content/data needed:** Sig fig rules (multiplication/division use least sig figs; addition/subtraction use least decimal places); worked examples for each rule type.
**UI components:** Problem display; calculation workspace; sig-fig-rule selector or free-text reasoning input; result input with sig-fig count; solution reveal with rule explanation.
**Feedback/scoring logic:** Sig-fig reasoning validated against rules; final-result validation (both value and format must be correct).

---

### Tool: Density, Area & Volume Calculator with Precision
**Event:** Metric Mastery B
**Purpose:** Practice calculating derived quantities (density, area, volume) from direct measurements, accounting for measurement uncertainty in the final result.
**Core interaction loop:**
1. Tool presents: "You measure a metal cube: side = 2.5 cm (analog ruler), mass = 39.5 g (digital scale). Calculate density. How many sig figs?"
2. User calculates volume (2.5³ = 15.625 cm³, but only 2 sig figs from measurement), mass (39.5 g, 3 sig figs), density = 39.5/15.625 = 2.528... → 2.5 g/cm³ (2 sig figs).
3. Tool validates the calculation and sig-fig reasoning.
4. Tool can show a "measurement uncertainty" sidebar: explaining that the least-precise input (the ruler reading with 2 sig figs) limits the final precision.
**Content/data needed:** Formulas (density = mass/volume, area = l×w, volume = l×w×h, etc.); measurement datasets with varying sig figs; correct calculated results.
**UI components:** Measurement data display with instruments noted (digital scale, analog ruler, etc.); calculation workspace; formula reference; sig-fig reasoning input; solution reveal with measurement-uncertainty explanation.
**Feedback/scoring logic:** Intermediate calculations checked (volume, area); final sig-fig count determined by least-precise input; precision metadata (which measurement was limiting) validated.

---

### Tool: Force & Spring Constant Calculator
**Event:** Metric Mastery B
**Purpose:** Practice calculating force (weight, normal force, friction) and determining spring constants from displacement data — common calculated-measurement station types.
**Core interaction loop:**
1. Tool presents: "A 500g mass hangs from a spring, stretching it 12.3 cm. Calculate the spring constant (k = F/Δx = mg/Δx)."
2. User calculates force (F = mg = 0.5 × 10 = 5N), then spring constant (k = 5N / 0.123m ≈ 41 N/m).
3. Tool validates the calculation and unit (N/m is critical for spring constants).
4. Tool can extend: "If you add another 500g mass, the spring stretches to 24.6 cm total. Verify that k is consistent" (testing understanding that k is constant for a given spring).
**Content/data needed:** Problem bank for force calculations and spring-constant determination; reference g value (often taken as 10 m/s² for simplicity in Science Olympiad).
**UI components:** Problem display; force calculation workspace (mass × g); spring-constant formula reference; input fields for F and Δx; unit selector (N/m is correct); solution reveal.
**Feedback/scoring logic:** Force calculation checked; spring-constant calculation validated; unit correctness verified (many students forget units, losing points).

---

### Tool: Mechanical Energy (Gravitational PE, Kinetic Energy) Calculator
**Event:** Metric Mastery B
**Purpose:** Practice calculating and comparing gravitational potential energy and kinetic energy — common calculated-measurement tasks in Section Three.
**Core interaction loop:**
1. Tool presents: "A 2kg ball is dropped from 5m height. Calculate its gravitational PE at the start, and the KE just before it hits the ground (assuming no air resistance). Use g=10 m/s²."
2. User calculates PE (mgh = 2 × 10 × 5 = 100 J) and KE (½mv² where v² = 2gh, so KE = mgh = 100 J), verifying energy conservation.
3. Tool validates and extends: "At h = 2.5m (halfway down), what is PE? KE? Total energy?" (Testing that total mechanical energy is conserved).
**Content/data needed:** Problem bank for PE and KE calculations; energy conservation scenarios; derived velocities from energy relationships.
**UI components:** Problem display; formula reference (PE = mgh, KE = ½mv²); input fields for energy values; height-by-height energy breakdown (optional); solution reveal with energy-conservation annotation.
**Feedback/scoring logic:** PE and KE calculations validated independently; total-energy conservation checked (PE + KE = constant); velocity derived correctly from KE.

---

### Tool: Precision Loss Analyzer (Compounding Errors)
**Event:** Metric Mastery B
**Purpose:** Understand how measurement errors compound through calculations — if you measure length and width with ±1mm error each, the area's error is larger.
**Core interaction loop:**
1. Tool presents: "You measure length = 10.0 ± 0.1 cm and width = 5.0 ± 0.1 cm. Calculate area and estimate the uncertainty in area."
2. User calculates nominal area (50 cm²) and maximum/minimum possible area (9.9 × 4.9 = 48.51, 10.1 × 5.1 = 51.51), so uncertainty ≈ ±1.5 cm².
3. Tool validates and visualizes how measurement uncertainty propagates to the final result.
4. Tool highlights: "Small measurement errors in individual values create larger relative errors in calculated values" — important for Section Three measured calculations.
**Content/data needed:** Worked examples of error propagation (multiplication/division multiply relative errors; addition/subtraction add absolute errors).
**UI components:** Measurement display with uncertainty ranges; nominal and worst-case calculations; error-propagation visualization (error bands on results); formula reference for error estimation.
**Feedback/scoring logic:** Nominal calculation checked; min/max scenario calculations validated; uncertainty estimate in final result reasonable (within order of magnitude).

---

### Tool: Station-Time Management Simulator
**Event:** Metric Mastery B
**Purpose:** Practice the time-pressure aspect of Section Three: completing 8–10 stations in 60–90 seconds per station (faster at higher tournament levels).
**Core interaction loop:**
1. Tool simulates a station rotation: displays a measurement task (estimate or measure a property), and a countdown timer (60–90 seconds per Regional, tighter at State/Nationals).
2. User estimates or measures (using a simulated ruler, scale, or thermometer) and enters the result in proper format.
3. Tool marks correct/incorrect and advances to the next station after the time limit or when the user submits.
4. Session summary shows total score and time-penalty analysis (e.g., "You averaged 70 seconds per station but some took >90 seconds").
**Content/data needed:** Bank of 8–10 measurement scenarios (mix of direct and calculated measurements, varying difficulty).
**UI components:** Measurement scenario display; simulated instrument (ruler, scale, etc.) if applicable; result input field (with unit and format requirements); countdown timer; per-station feedback; session summary with score and timing data.
**Feedback/scoring logic:** Each station's answer validated for correctness and format; timing tracked per station and overall; session feedback highlights which station types are slowest (e.g., "Density calculations consistently took 90+ seconds").
