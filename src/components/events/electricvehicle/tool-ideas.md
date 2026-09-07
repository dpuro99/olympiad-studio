## Electric Vehicle C — Tool Specs

### Tool: Range & Efficiency Calculator
**Event:** Electric Vehicle C
**Purpose:** Estimate vehicle range given battery capacity, motor efficiency, and driving conditions — a core planning metric for competition strategy and real-world EV understanding.
**Core interaction loop:**
1. Tool prompts: "Your EV has a 50Wh battery and runs at 10W/km on flat ground. How far will it travel?"
2. User enters battery capacity and known efficiency to calculate range, or enters desired range to back-calculate required battery capacity.
3. Tool can account for terrain: "On a hill with 5% grade, power consumption increases to 15W/km. New range?"
4. User adjusts for environmental factors (speed, temperature, rolling resistance).
**Content/data needed:** Reference efficiency data for different motor types and driving conditions; energy consumption per terrain grade; battery capacity specifications.
**UI components:** Battery capacity input; efficiency/consumption rate input; terrain selector (flat, hill grade, obstacle course); range output display; range vs. speed graph (showing how range decreases at higher speeds due to increased power draw).
**Feedback/scoring logic:** Calculations validated against physics (range = battery energy / consumption rate); terrain adjustments checked for reasonable efficiency changes.

---

### Tool: Battery State-of-Charge Tracker
**Event:** Electric Vehicle C
**Purpose:** Simulate battery depletion over a multi-stage race course, allowing teams to plan pit stops and power management strategy.
**Core interaction loop:**
1. Tool displays a race course profile (distance segments, elevation changes, obstacles).
2. User inputs starting battery charge and motor power consumption.
3. Tool calculates remaining charge after each segment, highlighting when battery reaches low levels (e.g., 20% remaining).
4. User can adjust motor power or select regenerative braking to simulate different energy-recovery strategies.
5. Tool predicts finish state-of-charge or whether recharging is needed mid-race.
**Content/data needed:** Race course profiles (distance, elevation, terrain type per segment); motor efficiency data; regenerative braking efficiency coefficients.
**UI components:** Course profile display (elevation/distance graph); battery state-of-charge gauge (visual, with percentage); stage-by-stage SoC table; energy recovery toggle (shows SoC improvement if regenerative braking is used); finish-state predictions.
**Feedback/scoring logic:** SoC calculations validated per segment using power consumption and distance; regenerative recovery calculations account for typical efficiency (~50-70%).

---

### Tool: Motor Power & Torque Calculator
**Event:** Electric Vehicle C
**Purpose:** Understand motor performance metrics (power output, torque, RPM) and how gear ratios affect vehicle speed and acceleration.
**Core interaction loop:**
1. Tool presents: "A motor delivers 200W at 3000 RPM. What is the output torque?" (τ = P / ω, in SI units: τ = 60P / (2πn) in W and RPM).
2. User calculates motor torque, then applies a gear ratio: "If the motor drives through a 10:1 gearbox, what is the torque at the wheel?"
3. Tool validates and reveals the solution, then asks: "With a 0.2m wheel radius, what force is applied to the ground?"
4. Can extend to vehicle acceleration: "Given this force and vehicle mass, what is the acceleration?"
**Content/data needed:** Motor power/RPM/torque reference data for common EV motors; gear reduction ratios.
**UI components:** Problem display; formula reference (P=τω, τ reduction through gears, F=τ/r); input fields for motor specs and gear ratio; output display for torque/force/acceleration; calculation workspace.
**Feedback/scoring logic:** Motor torque calculation validated against formula; gear reduction checked (output torque = input torque × gear ratio); force/acceleration calculations validated using F=ma.

---

### Tool: Speed & Acceleration Performance Predictor
**Event:** Electric Vehicle C
**Purpose:** Predict vehicle speed and acceleration given motor power, mass, and resistance forces — combining physics and practical EV dynamics.
**Core interaction loop:**
1. Tool asks: "Your EV has 300W motor power, 5kg mass, and 2N rolling resistance. What max speed can it achieve?"
2. At terminal velocity, driving force equals resistance: P / v = F_resistance, so v_max = P / F_resistance.
3. User calculates max speed and acceleration from rest (F_net = ma, where F_net = P/v - resistance).
4. Tool can ask: "If you add 1kg of weight, what happens to acceleration?" (decreases proportionally).
**Content/data needed:** Motor power specifications; typical rolling resistance coefficients; reference vehicle masses.
**UI components:** Problem display; formula reference (terminal velocity, acceleration from force/mass); input fields for power, mass, resistance; speed and acceleration outputs; optional graph showing v(t) and a(t) curves.
**Feedback/scoring logic:** Terminal velocity calculation checked (P/v = resistance); acceleration calculation validated using Newton's second law; sensitivity to weight changes checked for proportionality.

---

### Tool: Energy Consumption Tracker & Optimizer
**Event:** Electric Vehicle C
**Purpose:** Monitor cumulative energy use across a multi-segment race, identify inefficiencies, and suggest optimization strategies.
**Core interaction loop:**
1. User logs energy consumption data for each race segment (distance, time, power used).
2. Tool calculates efficiency (distance per Wh) and cumulative energy budget remaining.
3. Tool identifies outliers (segments with higher-than-expected energy use) and suggests causes: high speed, steep terrain, poor motor performance.
4. User can adjust strategy (reduce speed on high-consumption segments, increase regenerative braking, optimize motor RPM) and see projected impact on total range.
**Content/data needed:** Historical efficiency benchmarks for common EV designs; reference power consumption for typical motor/terrain combinations.
**UI components:** Segment-by-segment data table (distance, time, power, efficiency); cumulative energy graph; anomaly highlighting (flags high-consumption segments); efficiency vs. speed curve; total-range projection.
**Feedback/scoring logic:** Efficiency calculations validated (efficiency = distance / energy); anomaly detection flagged segments >110% of expected consumption; optimization suggestions checked for physics validity.

---

### Tool: Racetrack Course Analyzer & Performance Predictor
**Event:** Electric Vehicle C
**Purpose:** Analyze a specific competition course profile (distance, turns, hills, obstacles) and predict overall performance including finish time and remaining battery.
**Core interaction loop:**
1. Tool imports or user draws the course profile (elevation, distance, terrain type).
2. User inputs vehicle specs (battery capacity, motor power, weight, efficiency).
3. Tool simulates vehicle performance segment-by-segment (accounting for hills, terrain type, turn slowdowns).
4. Tool outputs: estimated finish time, remaining battery percentage, energy efficiency, segments requiring optimization.
5. User can iterate: adjust motor power, reduce weight, optimize speed profile, and see impact on predictions.
**Content/data needed:** Motor efficiency data by RPM and load; terrain-type efficiency modifiers; elevation-grade energy penalties.
**UI components:** Course-profile input/import tool (distance, elevation, terrain-type markup); vehicle-specs input panel; simulation-results display (time, battery remaining, segment-by-segment breakdown); performance optimization suggestions.
**Feedback/scoring logic:** Segment simulations validated against physics (gravity on slopes, motor efficiency curves); finish time and battery remaining checked for consistency (if too fast, motor likely overloaded; if too slow, wasting time).

---

### Tool: Motor Efficiency Optimization Guide
**Event:** Electric Vehicle C
**Purpose:** Help teams understand motor operating points, find the sweet spot (RPM/load) for maximum efficiency, and design transmissions to keep motors in efficient range.
**Core interaction loop:**
1. Tool displays a motor efficiency map (torque vs. RPM, with efficiency contours — showing where a motor runs most efficiently).
2. User marks their target operating point (e.g., "I want 150W output at 2000 RPM for steady cruising").
3. Tool shows the efficiency at that point and suggests nearby points with better efficiency.
4. User can then design a gearbox: "I want to cruise at 1 m/s. What gear ratio keeps my motor at peak efficiency?"
5. Tool calculates the required gear reduction and checks if it's feasible.
**Content/data needed:** Motor efficiency maps (typical brushed/brushless DC motor curves); example gear ratios for common reduction.
**UI components:** Interactive motor efficiency map (heatmap or contour plot); cursor showing user's selected operating point with efficiency reading; gear-ratio calculator; target-speed input with gear-ratio recommendation.
**Feedback/scoring logic:** Efficiency lookup validated against map; gear-ratio calculation checked (motor RPM × gear ratio = wheel RPM, via v = ω × r).

---

### Tool: Weight vs. Performance Tradeoff Analyzer
**Event:** Electric Vehicle C
**Purpose:** Visualize the tradeoff between adding weight (for durability/shock absorption) vs. reducing weight (for efficiency) and help teams make design decisions.
**Core interaction loop:**
1. Tool displays: current vehicle mass, projected battery range at that mass, and what happens if mass increases/decreases by 10%, 20%, etc.
2. User can toggle components on/off (e.g., "add shock absorber +50g") and see real-time impact on range and acceleration.
3. Tool calculates the "cost" of added weight in terms of energy/range and helps user prioritize which components are worth the weight penalty.
**Content/data needed:** Reference vehicle masses and masses of common components; power consumption scaling with mass (roughly linear for rolling resistance, nonlinear for hill climbing).
**UI components:** Mass breakdown chart (pie/bar chart); mass vs. range curve; mass vs. acceleration graph; component-toggle checklist showing individual mass contribution and range impact.
**Feedback/scoring logic:** Range recalculation validated using P/F = v logic (increased resistance from weight linearly reduces top speed and range); acceleration impact checked for F=ma consistency.
