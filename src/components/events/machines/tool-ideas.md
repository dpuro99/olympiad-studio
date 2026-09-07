## Machines C — Tool Specs

### Tool: Lever Equilibrium Problem Solver
**Event:** Machines C
**Purpose:** Master the lever balance equation (effort × effort arm = load × load arm) across all three lever classes — this is the foundation for all Machines event knowledge and appears in both written and device-testing portions.
**Core interaction loop:**
1. Tool displays a lever diagram and presents: "A Class 1 lever has a 1m effort arm and a 0.5m load arm. If the load is 100N, what effort is needed?"
2. User applies the lever equation and solves for the unknown.
3. Tool validates the calculation and reveals the correct answer, then extends: "What is the mechanical advantage?"
4. Tool can show the lever class and ask why that class is suited for that application (load magnification vs. distance magnification).
**Content/data needed:** Lever diagrams for all three classes; problem bank covering mono- and multi-lever scenarios; application context (e.g., "crowbar is a Class 1 lever because...").
**UI components:** Lever diagram display (with fulcrum, effort, load positions marked); equation reference (F_E × d_E = F_L × d_L); input fields for three of four variables; MA calculation (auto-computed or user-entered); solution reveal with diagram annotation.
**Feedback/scoring logic:** Lever equation setup validated (correct identification of effort/load arms); unknown-solving steps validated independently; MA calculation checked (it should equal load_arm / effort_arm for a lever).

---

### Tool: Static Equilibrium Force & Torque Analyzer
**Event:** Machines C
**Purpose:** Analyze complex mechanical systems using torque and force balance (ΣF=0, Στ=0) — a quantitative reasoning skill essential for device testing and exam problems.
**Core interaction loop:**
1. Tool displays a system in equilibrium (e.g., a plank balanced on a fulcrum with masses at various points, or a lever system with multiple applied forces).
2. User writes force and torque equations, selects a pivot point, and solves for unknown forces/distances.
3. Tool validates equation setup and numerical solution.
4. Tool can ask: "If you move the load closer to the fulcrum, what happens to the effort needed?" (reasoning question reinforcing lever mechanics).
**Content/data needed:** Problem bank with varied equilibrium scenarios: simple levers, compound systems, unusual pivot points, asymmetric loading.
**UI components:** System diagram with force vectors and dimensions labeled; equation-builder tool (free text or form-based); force/torque balance validation checker; step-by-step solution reveal.
**Feedback/scoring logic:** Equation setup checked (all forces/torques identified and signed correctly); pivot-point selection validated (user should be able to explain why they chose that pivot); numerical solution validated against algebra.

---

### Tool: Mechanical Advantage Calculator
**Event:** Machines C
**Purpose:** Quickly compute mechanical advantage for each simple machine type (levers, inclined planes, wedges, pulleys, wheel-and-axle, screws) — foundational for exam questions and device analysis.
**Core interaction loop:**
1. Tool presents: "An inclined plane is 5m long and 1m high. What is the MA?" (MA = distance / height = 5).
2. User enters the MA value.
3. Tool validates and reveals the solution, then asks: "If the actual effort needed is 60N for a 200N load (real MA = 200/60 ≈ 3.3), what is the efficiency?" (Real MA / Ideal MA).
4. Can vary by machine type: ramp, wedge, pulley system, gear reduction, screw pitch.
**Content/data needed:** MA formulas for each machine type; problem bank covering all six required types with various dimensions.
**UI components:** Problem display; MA formula reference (selectable by machine type); input field for MA; efficiency calculation (auto or user input); solution reveal with working.
**Feedback/scoring logic:** MA calculation validated per machine-type formula; efficiency calculation checked (should be <1, typically 40-80% for real machines).

---

### Tool: Compound Machine Analyzer
**Event:** Machines C
**Purpose:** Trace force/motion changes through multi-machine systems (e.g., lever connected to pulley system) to compute overall MA and efficiency.
**Core interaction loop:**
1. Tool displays a compound system (e.g., a lever driving a block-and-tackle pulley system).
2. User traces the mechanical advantage through each stage: lever MA × pulley MA = total MA.
3. User calculates overall efficiency as the product of stage efficiencies (if given).
4. Tool validates and extends: "If this compound system has a total MA of 20 and you apply 10N, what load can it lift?" (Ideal load = 10N × 20 = 200N, but real load is less accounting for friction).
**Content/data needed:** Compound machine diagrams and specifications; stage-by-stage efficiency data; problem bank with various configurations.
**UI components:** System diagram with annotated stages (Lever: MA=4, Pulley: MA=5, etc.); step-by-step MA multiplier display; efficiency calculation chain; final-force calculation with and without friction.
**Feedback/scoring logic:** Stage MA values validated per machine-type formulas; overall MA checked (product of stages); efficiency multiplied correctly (accounting for independent friction at each stage).

---

### Tool: Work, Power & Energy Calculator
**Event:** Machines C
**Purpose:** Apply work and energy concepts to machine problems — connecting physics principles to real machine operation and efficiency.
**Core interaction loop:**
1. Tool presents: "A machine lifts a 50kg mass 2m in 5 seconds. What is the power output?" (W = mgh = 50×10×2 = 1000J; P = W/t = 200W).
2. User calculates power and optionally calculates input power (if efficiency is given), then determines power loss to friction.
3. Tool validates and extends: "If the motor input is 300W, what is the efficiency?" (200W out / 300W in = 67%).
**Content/data needed:** Problem bank covering: mechanical work (force × distance), potential/kinetic energy conversions, power calculations, efficiency comparisons.
**UI components:** Problem display; formula reference (W=Fd, PE=mgh, KE=½mv², P=W/t); input fields for unknown; energy diagram (input → useful work → heat loss); solution reveal.
**Feedback/scoring logic:** Intermediate values (work, individual energies) validated independently; efficiency calculation checked (output/input × 100%); energy conservation verified (input energy ≥ output energy + losses).

---

### Tool: Device Testing Mass Ratio Simulator
**Event:** Machines C
**Purpose:** Practice the actual device-testing task: measure mass ratios using lever equilibrium, under simulated competition conditions with timing and precision requirements.
**Core interaction loop:**
1. Tool simulates a compound lever device (matching the official event specs: Class 1 connected to Class 2 or 3).
2. User adjusts lever positions (fulcrums, mass attachments) to balance unknown masses A, B, C.
3. User inputs measured ratios (A/B, B/C) to specified precision.
4. Tool scores accuracy and time, matching the official competition scoring formula (relative accuracy of measured ratio vs. true ratio).
**Content/data needed:** Simulated mass sets with known ratios (at Regional, State, National tightness levels); physics model for lever balancing; competition scoring formula (accuracy-based, with time bonus).
**UI components:** Device visualization (interactive lever diagram); mass attachment position sliders; ratio-input fields; timer (optional); results display (measured ratio, true ratio, accuracy score, time score).
**Feedback/scoring logic:** Balance validation checks (is the lever actually in equilibrium given the positions and masses?); ratio accuracy scored as given in competition rules (closer to true ratio = more points); timing tracked.

---

### Tool: Device Design & Compliance Checker
**Event:** Machines C
**Purpose:** Verify that a pre-built device design meets construction specifications (two lever classes connected, beam lengths ≤40cm each, can accommodate test masses) before physical construction.
**Core interaction loop:**
1. User describes their device design (lever class 1 and which of class 2 or 3, beam lengths, mass attachment points).
2. Tool validates compliance: checks that beams don't exceed 40cm, that the two lever classes are distinct, that mass-attachment geometry is feasible.
3. Tool runs a theoretical equilibrium analysis: "Can this device balance masses up to the 8x (Regional) / 10x (State) / 12x (National) ratio?"
4. Tool flags any design issues (e.g., "Second lever arm too short — won't have enough sensitivity to distinguish small mass differences").
**Content/data needed:** Official Machines C device specifications (requirements for two lever classes, beam length limits, mass-ratio range).
**UI components:** Device-specification input form (lever classes, beam lengths, pivot/attachment positions); compliance checker (pass/fail per requirement); equilibrium simulator showing theoretical range of detectable mass ratios; recommendation panel for design adjustments.
**Feedback/scoring logic:** Compliance checked against explicit rules (beam length ≤40cm, two different lever classes, etc.); theoretical performance estimated using lever equations and typical mass ranges.

---

### Tool: Efficiency Analysis for Friction Losses
**Event:** Machines C
**Purpose:** Estimate and account for real-world friction losses in a machine design, improving predictions of actual vs. ideal performance.
**Core interaction loop:**
1. Tool shows: "An ideal lever system should lift 200N with 50N effort (MA=4). But the actual effort needed is 60N. Calculate efficiency and determine friction losses."
2. User calculates: efficiency = ideal MA / real MA = 50/60 = 83%, so 17% of work is lost to friction.
3. Tool extends: "If friction at the pivot is constant (10N), what would the efficiency be if the load increased to 500N?" (Efficiency improves because friction loss is now smaller relative to total work).
**Content/data needed:** Problem bank covering friction losses in different machine types; typical efficiency ranges (40-80% for real machines).
**UI components:** Problem display; ideal vs. real-effort comparison; efficiency calculation display; friction-loss estimation; graph showing efficiency vs. load (demonstrating how constant friction losses have larger percentage impact at small loads).
**Feedback/scoring logic:** Efficiency calculation validated (real MA / ideal MA); friction loss as percentage of input work correctly computed; reasoning about how friction losses scale with load validated.

---

### Tool: Simple Machine Type Identifier & Classifier
**Event:** Machines C
**Purpose:** Quickly recognize all six required simple machine types and distinguish them, supporting rapid analysis during the exam (at least 6 types guaranteed to appear).
**Core interaction loop:**
1. Tool shows an image of a machine (or a description) and asks: "What type of simple machine is this?"
2. User selects from six options (lever classes 1/2/3, inclined plane, wedge, wheel-and-axle, pulley, screw).
3. Tool validates and reveals the type with a diagram and explanation of how it works (e.g., "This is a Class 2 lever — load is between fulcrum and effort").
4. Tool can ask: "What is the MA equation for this type?" (reasoning).
**Content/data needed:** Images/descriptions of all six types; MA formulas for each; real-world applications and examples.
**UI components:** Machine image/description display; type selector (6-choice multiple-choice); type reveal with working diagram; MA formula display; examples from the real world.
**Feedback/scoring logic:** Type selection validated; explanation of why it's that type checked for correct reasoning (e.g., "lever because it has a fulcrum and rigid bar").

---

### Tool: State/National Advanced Topics (Non-Equilibrium Dynamics)
**Event:** Machines C
**Purpose:** Support students advancing from Regional (equilibrium-focused) to State/Nationals by introducing dynamics of non-equilibrium machines (acceleration, velocity, momentum).
**Core interaction loop:**
1. Tool presents: "A 5kg mass is pushed by a 30N force up a 30° incline. Calculate the net force, acceleration, and time to travel 2m."
2. User breaks problem into components: gravity component along incline, net force, then kinematics.
3. Tool validates step-by-step and reveals the solution.
**Content/data needed:** Problem bank for dynamics (forces, Newton's 2nd law, kinematics) applied to machine scenarios; inclined-plane dynamics at various angles.
**UI components:** Problem display; free-body diagram tool (user can draw or adjust force vectors); force-component calculator; net-force and acceleration computation; kinematics solver; solution reveal with annotated free-body diagram.
**Feedback/scoring logic:** Free-body diagram validated (all forces correctly identified); force components calculated correctly (mg sin θ along incline, mg cos θ perpendicular); net force and acceleration derived from F_net = ma; kinematics applied correctly.

---

### Tool: Pulley System Analyzer (Fixed, Movable, Block & Tackle)
**Event:** Machines C
**Purpose:** Analyze pulley systems and determine mechanical advantage based on rope count and configuration — pulleys are explicitly listed as one of the required simple machine types.
**Core interaction loop:**
1. Tool displays a pulley configuration (single fixed pulley, single movable pulley, block and tackle with 2/3/4 supporting ropes, compound systems).
2. User identifies the mechanical advantage by counting the number of rope segments supporting the load.
3. User calculates the required effort force (Effort = Load / MA) and the distance the effort must move (Distance = Load distance × MA).
4. Tool validates and explains the underlying logic (each rope segment supports an equal share of the load; more segments = more MA but more effort distance).
**Content/data needed:** Pulley configuration diagrams; MA rules (fixed pulley: MA=1, movable pulley: MA=2, block-and-tackle: MA = number of supporting rope segments); typical real-world applications.
**UI components:** Pulley diagram display (with rope count visible); MA input field; effort and distance calculators; solution reveal with rope-segment highlighting.
**Feedback/scoring logic:** MA validated against correct rope-segment count (a common mistake is miscounting supporting vs. non-supporting segments); effort/distance calculations checked using MA relationships.

---

### Tool: Wheel-and-Axle & Gear System Analyzer
**Event:** Machines C
**Purpose:** Calculate mechanical advantage and speed ratios for wheel-and-axle systems and gear trains — the event explicitly requires knowledge of wheel and axle (including gears).
**Core interaction loop:**
1. Tool presents: "A wheel with 50cm radius drives an axle with 10cm radius. What is the MA? If the wheel rotates once, how many times does the axle rotate?"
2. User calculates MA (50/10 = 5) and gear ratio (5:1, axle rotates 5× per wheel rotation).
3. User applies the same logic to a gear train: "Gear A (20 teeth) drives Gear B (60 teeth). What is the speed ratio and torque ratio?" (speed ratio 3:1 reduction, torque ratio 3:1 increase).
4. Tool validates and extends: "If the input gear rotates at 60 RPM, what is the output RPM?" (20 RPM, applying 3:1 reduction).
**Content/data needed:** Wheel-axle MA formula (radius_wheel / radius_axle); gear ratio formula (teeth_driver / teeth_driven); relationship between speed, torque, and gear ratio.
**UI components:** System diagram with radius/tooth-count labels; MA and speed-ratio input fields; solution reveal with gear-train visualization.
**Feedback/scoring logic:** MA validated against radius or tooth-count ratio; speed ratio checked (input/output teeth or radii); torque ratio validated as inverse of speed ratio (conservation of power).

---

### Tool: Angle of Repose & Self-Locking Calculator
**Event:** Machines C
**Purpose:** Practice calculating the angle of repose (steepest stable angle of a granular material) and determining whether a screw/wedge machine is self-locking — explicitly required event content.
**Core interaction loop:**
1. Tool presents: "A pile of sand has a coefficient of static friction μ = 0.6 between grains. What is the angle of repose?" (θ = arctan(μ) = arctan(0.6) ≈ 31°).
2. User calculates the angle of repose and explains its physical meaning (steeper angles cause avalanching).
3. Tool validates and extends: "A screw has a lead angle of 20° and friction angle of 15°. Is it self-locking?" (Self-locking if friction angle > lead angle — here 15 < 20, so NOT self-locking, it will back-drive).
**Content/data needed:** Angle of repose formula (θ = arctan(μ)); self-locking criterion (friction angle > lead angle for screws/wedges); typical coefficients of friction.
**UI components:** Problem display; angle calculator (arctan function); self-locking criterion selector; solution reveal with physical interpretation.
**Feedback/scoring logic:** Angle of repose validated against arctan(μ); self-locking determination checked against friction angle vs. lead angle comparison; physical interpretation validated for understanding of when systems back-drive.
