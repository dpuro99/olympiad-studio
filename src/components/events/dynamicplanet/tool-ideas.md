## Dynamic Planet C — Oceanography — Tool Specs

### Tool: Ocean Circulation Simulator & Visualizer
**Event:** Dynamic Planet C
**Purpose:** Build intuition for surface currents, Coriolis deflection, and thermohaline circulation through interactive visualization of how wind, temperature, and density drive ocean movement.
**Core interaction loop:**
1. Tool displays a simplified ocean basin with controls for: wind direction/strength, heat input (simulated sun), salinity variations, and latitude.
2. User adjusts parameters and observes resulting current patterns (surface gyres, equatorial currents, upwelling zones).
3. Tool highlights features (western intensification, boundary currents, Ekman spiral) as they appear in the simulation.
4. Optional scenario mode: "Match the real-world current pattern for this region" — user adjusts parameters to recreate actual conditions (Gulf Stream, etc.).
**Content/data needed:** Physics model for ocean circulation (simplified Ekman spiral, geostrophic balance, density-driven flow); reference current maps for major gyres and named currents; wind and temperature climate data.
**UI components:** Basin visualization (map or cross-section view); parameter sliders (wind, temperature, latitude, salinity); current vector overlay (arrows showing flow); feature labels and highlights on hover; scenario mode with target pattern to match.
**Feedback/scoring logic:** Simulation accuracy improves with correct physics; scenario mode compares user's parameter choices to real-world values, scoring how close the current pattern matches.

---

### Tool: Thermocline & Density Profile Analyzer
**Event:** Dynamic Planet C
**Purpose:** Practice reading and interpreting vertical profiles of temperature, salinity, and density — data students will encounter in station-based competitions and exam questions.
**Core interaction loop:**
1. Tool displays a depth vs. temperature (or salinity, or density) graph with marked layers (epilimnion, thermocline, hypolimnion for lakes; mixed layer, thermocline, deep water for oceans).
2. User identifies layer names, estimates thermocline depth/strength, predicts stratification stability.
3. Tool can ask: "If a storm mixes this water column, what happens to the thermocline?" or "What is the density at 500m depth?"
4. User can draw or select features on the graph to practice interpretation under time pressure.
**Content/data needed:** Bank of real oceanographic profiles (T-depth, S-depth, density-depth graphs) from diverse settings (tropical, temperate, polar, upwelling regions).
**UI components:** Interactive graph display with layer identification tool (click to label epilimnion, etc.); layer-depth input fields; feature-estimation prompts (e.g., "Where does the thermocline start? End?"); graph overlays showing predicted changes under scenarios (mixing, heating, freshwater input).
**Feedback/scoring logic:** Layer identification validated against standard definitions (e.g., thermocline is the zone of steepest T gradient); quantitative estimates (depth, temperature range) checked within reasonable tolerance.

---

### Tool: Wave Property Calculator
**Event:** Dynamic Planet C
**Purpose:** Master the relationships between wave properties (velocity, wavelength, period, frequency, fetch, height) — core quantitative skill tested in both exam and station formats.
**Core interaction loop:**
1. Tool presents: "A wave has a period of 10 seconds and wavelength of 156 meters. What is its velocity? In deep water, is this a wind wave or swell?" (swell travels much faster than wind waves).
2. User calculates wave speed (v = λ/T) and classifies the wave based on speed/properties.
3. Tool validates and reveals the solution with wave-type explanation.
4. Can extend to: "If fetch increases, what happens to wave height and velocity?" (reasoning question).
**Content/data needed:** Problem bank covering wave calculations (velocity, energy, height relationships), wave-type classification, and effects of fetch/wind speed/water depth on wave properties.
**UI components:** Problem display; formula reference (v=λ/T, v=√(gλ/2π) for deep water waves); input fields for unknown; wave-type classifier (dropdown or explanation); solution reveal.
**Feedback/scoring logic:** Calculation accuracy checked against formula; wave-type classification validated against speed thresholds (wind waves <3m/s, swell >3m/s, etc.); reasoning questions checked for mention of key variables.

---

### Tool: Tidal Pattern Predictor & Analyzer
**Event:** Dynamic Planet C
**Purpose:** Predict tidal patterns (diurnal, semidiurnal, mixed) given location/latitude/moon phase, and interpret real tidal data — a specific, testable skill that directly appears in competition questions.
**Core interaction loop:**
1. Tool presents a scenario: "What tidal pattern occurs at this latitude? Given the current moon phase, predict the range (spring vs. neap tide)."
2. User selects the tidal pattern (from dropdown or text input) and predicts spring/neap.
3. Tool validates and reveals correct pattern with explanation of why that latitude experiences that pattern (due to astronomical geometry and continental shelf effects).
4. Tool can show real tidal prediction data for comparison.
**Content/data needed:** Tidal pattern distribution map (which latitudes have which patterns); moon-phase calendar; real tidal prediction data for reference locations.
**UI components:** Location selector (map or list); moon-phase picker; tidal-pattern selector; spring/neap toggle; explanation reveal; optional real tidal curve overlay for verification.
**Feedback/scoring logic:** Pattern selection validated against latitude; spring/neap selection validated against moon phase; reasoning explanation checked for key terms (sun/moon alignment, constructive/destructive interference).

---

### Tool: Coriolis Effect Visualizer
**Event:** Dynamic Planet C
**Purpose:** Build intuition for Coriolis deflection in both hemispheres through interactive animation — students often struggle with mental rotation of Coriolis effects at different latitudes.
**Core interaction loop:**
1. Tool displays a moving object (current, wind, projectile) in Northern or Southern hemisphere (user can toggle).
2. User predicts the deflection direction before animation plays.
3. Tool animates the Coriolis deflection and confirms user's prediction or reveals the correct deflection direction.
4. Can vary: initial direction, hemisphere, latitude (showing stronger deflection at poles, weaker at equator).
**Content/data needed:** Coriolis parameter vs. latitude curve; reference animations for Northern/Southern hemisphere deflections.
**UI components:** Map/globe view with hemispheric selector; moving-object simulation with direction indicator; user's prediction input (clockwise/counterclockwise, left/right); animation reveal; explanation panel.
**Feedback/scoring logic:** Prediction accuracy tracked; hemisphere swaps and latitudinal changes are introduced after successful predictions at one hemisphere/latitude.

---

### Tool: Geostrophic Current Calculator
**Event:** Dynamic Planet C
**Purpose:** Practice calculating current speed from pressure gradients and latitude using geostrophic balance — a quantitative skill for analyzing real oceanographic data.
**Core interaction loop:**
1. Tool presents ocean data: pressure anomaly (or sea-surface height difference) between two locations, distance, and latitude.
2. User calculates the geostrophic current speed using: u = (g / f) × (Δh / Δx), where f is the Coriolis parameter (2Ω sin(latitude)).
3. Tool validates and reveals the correct solution with step-by-step formula application.
**Content/data needed:** Problem bank with varied pressure gradients, distances, and latitudes; reference Coriolis parameter lookup table or calculator.
**UI components:** Problem display; formula reference with Coriolis parameter for given latitude; calculation workspace; input fields for velocity magnitude and direction; solution reveal.
**Feedback/scoring logic:** Intermediate calculations (Coriolis parameter, pressure gradient) validated independently; final velocity validated against formula.

---

### Tool: ENSO Phase Analyzer & Predictor
**Event:** Dynamic Planet C
**Purpose:** Interpret ENSO (El Niño Southern Oscillation) indices and predict climate/ocean impacts (warm/cold currents, precipitation, sea level, upwelling changes).
**Core interaction loop:**
1. Tool displays ENSO index values (e.g., Oceanic Niño Index) and asks: "Is this El Niño, La Niña, or Neutral phase?"
2. User selects the phase and predicts regional climate impacts (warmer/cooler, wetter/drier in specific regions).
3. Tool validates and reveals the correct phase with global impact map highlighting affected regions.
4. Can ask: "What happens to upwelling off South America during El Niño?" (weakens, less nutrient upwelling, affects fish stocks).
**Content/data needed:** ENSO index threshold definitions; regional climate impacts for each ENSO phase; real ENSO index time series for reference.
**UI components:** ENSO index display with thresholds marked; phase selector; global impact map with regional impacts labeled; explanation of mechanism (warmer equatorial Pacific weakens trade winds, reduces upwelling, etc.).
**Feedback/scoring logic:** Phase identification validated against index thresholds; regional impact predictions checked against established El Niño/La Niña patterns.

---

### Tool: Bathymetric Profile & Ocean Floor Feature Identifier
**Event:** Dynamic Planet C
**Purpose:** Practice identifying ocean floor features (ridge, trench, abyssal plain, continental shelf/slope/rise) from bathymetric (depth) profiles or maps.
**Core interaction loop:**
1. Tool displays a bathymetric cross-section or map and highlights a feature (e.g., a steep gradient, a flat deep basin).
2. User identifies the feature (from multiple choice or text input) and optionally provides depth ranges and formation mechanism (seafloor spreading, subduction, sedimentation).
3. Tool validates and reveals the correct feature ID, depth, and tectonic context.
**Content/data needed:** Bank of bathymetric profiles and maps from diverse settings (mid-ocean ridges, subduction zones, passive margins, abyssal plains); feature definitions and depth ranges.
**UI components:** Bathymetric map/cross-section display; feature identification selector; depth-range input; mechanism-explanation text or multiple-choice; colored overlay showing feature boundaries after reveal.
**Feedback/scoring logic:** Feature identification validated against typical depth and slope characteristics; tectonic context explanation checked for relevant processes (seafloor spreading, sedimentation, subduction).

---

### Tool: Coastal Upwelling & Downwelling Predictor
**Event:** Dynamic Planet C
**Purpose:** Predict when/where upwelling or downwelling occurs based on wind direction and coastal orientation, and explain nutrient/temperature consequences.
**Core interaction loop:**
1. Tool presents: "Wind blows southward along a coast that runs north-south in the Northern Hemisphere. Will upwelling or downwelling occur? Why?"
2. User predicts the circulation response (Ekman transport offshore/onshore) and resulting water column movement.
3. Tool validates and explains using Ekman spiral/Coriolis reasoning, then asks follow-up: "What happens to nutrient availability and sea surface temperature?"
4. Can show real upwelling regions (Peru, California, Benguela coasts) and match them to wind/current drivers.
**Content/data needed:** Ekman-transport logic for different wind directions and hemispheres; real upwelling region data (location, season, wind driver, biological productivity).
**UI components:** Coastal geometry selector (coast orientation); wind direction selector; circulation prediction input (upwelling/downwelling); Ekman-spiral diagram showing transport direction; consequence prediction (nutrient/temperature impact); regional upwelling map.
**Feedback/scoring logic:** Upwelling/downwelling direction validated against Ekman transport logic; consequence predictions checked for understanding of how upwelling brings cold, nutrient-rich deep water to surface.

---

### Tool: Ocean Acidification & Climate Change Impact Calculator
**Event:** Dynamic Planet C
**Purpose:** Understand and calculate ocean pH changes, thermal expansion, and sea level rise from warming scenarios — a quantitative skill for assessing climate impacts.
**Core interaction loop:**
1. Tool presents: "If atmospheric CO₂ increases from 400ppm to 500ppm, ocean pH drops from 8.2 to 8.1. What percentage change in H⁺ concentration is this?" (pH is logarithmic, so small pH changes mean large [H⁺] changes).
2. User calculates the percent change using [H⁺] = 10^(-pH) and compares before/after.
3. Tool validates and explains the logarithmic scale and its implications (why small pH drops are alarming for calcifying organisms).
4. Can extend to thermal expansion: "If global ocean temp rises 2°C, volume increases by ~0.25%. What is sea-level rise contribution from a 1.4 billion km³ ocean?"
**Content/data needed:** pH and [H⁺] relationship; CO₂-pH coupling data; thermal expansion coefficients; sea-level rise data (observed and projected).
**UI components:** Problem display; pH/[H⁺] calculator; thermal expansion calculator; input fields for change quantification; impacts panel (species affected by pH drop, coastal regions affected by sea-level rise).
**Feedback/scoring logic:** pH-to-[H⁺] conversion validated logarithmically; thermal expansion calculation checked against physics formula; impacts explanation checked for relevance to ocean systems.

---

### Tool: Rossby & Kelvin Wave Identifier
**Event:** Dynamic Planet C
**Purpose:** Distinguish Rossby waves (large-scale, westward-propagating, planetary waves) from Kelvin waves (equatorially-trapped, eastward-propagating) and predict their oceanographic effects — explicitly tested at higher levels.
**Core interaction loop:**
1. Tool presents a wave scenario: "A wave with a 2000 km wavelength propagates westward across the North Pacific at ~10 cm/s. Is this a Rossby wave or Kelvin wave? What is its likely oceanographic effect?"
2. User identifies the wave type and predicts effects (Rossby: adjusts large-scale circulation, affects eddy formation; Kelvin: drives ENSO-related eastern Pacific warming, coastal wave propagation).
3. Tool validates and explains: Rossby waves are planetary-scale, propagate westward, are restored by Coriolis force variation with latitude; Kelvin waves are equatorially-trapped, propagate eastward along coasts.
4. Tool can ask: "If a Kelvin wave pulse reaches the coast of South America, what oceanographic change occurs?" (warmer SST, deeper thermocline, suppression of upwelling — characteristic of El Niño onset).
**Content/data needed:** Rossby and Kelvin wave properties (speed, direction, mechanism, typical wavelengths); ENSO-related Kelvin wave dynamics.
**UI components:** Wave-scenario display (wavelength, direction, location); wave-type selector; effects-prompt input; mechanism-explanation panel; ENSO-animation (optional) showing Kelvin wave crossing the Pacific.
**Feedback/scoring logic:** Wave-type identification validated against propagation direction and physical mechanism; effects predictions checked for correct understanding of wave-driven ocean dynamics.

---

### Tool: Oceanic Sediment & Turbidite Identifier
**Event:** Dynamic Planet C
**Purpose:** Identify ocean sediment types (terrigenous, biogenic, hydrogenous, cosmogenous) and recognize turbidite sequences (graded bedding from turbidity currents) — tested in station-based and exam questions.
**Core interaction loop:**
1. Tool displays a sediment description or core photo: "This core shows coarse sand at the bottom grading up to fine mud at the top, with sharp basal contact. What depositional event produced this?"
2. User identifies the sediment type and depositional process (turbidite from turbidity current; graded bedding from waning flow).
3. Tool validates and explains: turbidity currents are sediment-laden gravity flows that deposit coarse material first as they slow, then progressively finer material (Bouma sequence).
4. Tool can extend: "Where in the ocean are turbidites most common?" (continental rise, abyssal plains near submarine canyons).
**Content/data needed:** Sediment type classifications and their typical compositions; turbidite Bouma sequence (Ta-e); ocean floor settings for each sediment type.
**UI components:** Sediment/core description display; sediment-type selector; depositional-process input; solution reveal with Bouma-sequence diagram; setting prediction (where in the ocean).
**Feedback/scoring logic:** Sediment type validated against composition; depositional process checked for correct flow mechanism; setting prediction validated against typical ocean-floor locations.

---

### Tool: Estuarine Circulation & Mixing Analyzer
**Event:** Dynamic Planet C
**Purpose:** Predict estuarine circulation patterns (salt-wedge, partially-mixed, well-mixed, fjord) based on river inflow and tidal strength, and explain stratification effects.
**Core interaction loop:**
1. Tool presents an estuary scenario: "An estuary has strong river inflow and weak tidal mixing. What circulation pattern develops?"
2. User predicts the pattern (salt-wedge: river water flows seaward on top, denser saltwater intrudes along bottom as a sharp wedge) and explains why.
3. Tool validates and shows the salinity profile (sharp halocline in salt-wedge; gradual gradient in partially-mixed; nearly uniform in well-mixed).
4. Tool can ask: "In a salt-wedge estuary, where would you expect to find the saltiest bottom water?" (furthest upstream, where the wedge tip extends).
**Content/data needed:** Estuary classification criteria (river inflow vs. tidal mixing strength); salinity profiles for each type; fjord characteristics (deep, sill-restricted, deep-water renewal).
**UI components:** River/tidal parameter sliders; estuary-type selector; salinity profile display; explanation input; solution reveal with cross-section diagram.
**Feedback/scoring logic:** Estuary type validated against parameter combinations; salinity profile prediction checked; reasoning validated for understanding of buoyancy vs. mixing forces.

---

### Tool: Estuarine & Coastal Landform Identifier
**Event:** Dynamic Planet C
**Purpose:** Identify coastal depositional landforms (barrier islands, spits, tombolos, deltas) and erosional features (sea cliffs, wave-cut platforms, sea stacks, marine terraces) — common station/exam content.
**Core interaction loop:**
1. Tool displays a coastal image or description and asks: "Is this a depositional or erosional landform? What specific feature is it?"
2. User identifies the feature and explains its formation (e.g., "Spit — longshore currents deposit sand extending from a headland into open water").
3. Tool validates and provides formation context.
4. Tool can ask: "What conditions favor barrier island formation vs. delta formation?" (barrier islands: wave-dominated, low sediment supply; deltas: river-dominated, high sediment supply).
**Content/data needed:** Coastal landform image bank; formation mechanisms (wave action, longshore drift, river deposition, tectonic uplift).
**UI components:** Coastal image/description display; landform-type selector (depositional/erosional); specific-feature name input; formation-mechanism explanation; solution reveal with annotated cross-section.
**Feedback/scoring logic:** Feature identification validated against morphology; formation mechanism checked for relevant processes; comparison questions (barrier vs. delta) checked for correct dominance criteria.

---

### Tool: Coral Reef & Atoll Formation Simulator
**Event:** Dynamic Planet C
**Purpose:** Understand coral reef types (fringing, barrier, atoll) and how Darwin's subsidence theory explains atoll formation as volcanic islands sink below sea level.
**Core interaction loop:**
1. Tool presents: "A volcanic island with a fringing reef slowly subsides over millions of years. What reef stages does it pass through?"
2. User sequences the stages: fringing reef → barrier reef (as island sinks and reef grows upward) → atoll (when island fully submerges, leaving a ring reef around a central lagoon).
3. Tool validates and animates the process showing the volcano sinking and reef growing.
4. Tool can ask: "What conditions are required for healthy coral growth?" (warm water 20-30°C, clear shallow water, normal salinity, sunlight for symbiotic algae).
**Content/data needed:** Darwin's subsidence theory visualization; coral growth requirements; reef-type definitions.
**UI components:** Scenario display; stage-sequencing input (drag-and-drop); solution reveal with time-lapse animation; coral-health requirements quiz.
**Feedback/scoring logic:** Stage sequence validated against Darwin's theory; coral-health reasoning checked for mention of all key conditions (temperature, light, salinity).
