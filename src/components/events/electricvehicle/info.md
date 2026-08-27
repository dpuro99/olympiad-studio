# Electric Vehicle C — Event Breakdown

## Overview
- **Team size:** Up to 2 participants
- **Duration:** ~12 minutes (competition/testing time)
- **Format:** Build event — teams design, build, and pre-test an electric-powered vehicle before the tournament, then run it on a track on competition day
- **Impound:** Yes — the vehicle must be impounded before the team's first time slot

## What the Device Must Do
The vehicle must travel a set distance (the **Target Distance**) in a set amount of time (the **Target Time**) using only battery-powered electric propulsion, then stop as close as possible to a **Target Point**, ideally arriving at exactly the right moment. There's also an optional bonus for threading the vehicle between two cans placed on the track.

## Construction Parameters
- **Power source:** A maximum of **8 AA batteries**, and that's it — no lithium or lead-acid batteries allowed (violating this means no run, participation points only)
- **No energy storage that exceeds the batteries' instantaneous output** — explicitly bans things like large capacitors or springs used to "bank" extra energy
- Electronic sighting/alignment/aiming devices may have their own separate power source, but **lasers are prohibited entirely**
- All energy sources must be easily accessible for inspection
- Propulsion energy must be electric and come from the batteries (no other propulsion method)
- Components (motors, wheels, chassis, etc.) may be bought or built; electronic components are allowed
  - If a microprocessor is used, students may communicate with it over WiFi, Bluetooth, or USB (for programming purposes)
- **Size limits:** Length (front of front wheel to back of back wheel) ≤ 70.0 cm; Width ≤ 35.0 cm at any point
- Must have a **Measurement Point (MP)** at the front of the vehicle — used for distance measurement at the end of a run
- **Must NOT be remotely controlled or tethered** — fully autonomous once launched
- All parts must move as a single unit — no anchors, tethers, tie-downs, launch ramps, or other separate pieces; pieces falling off during a run is a construction violation

## Track Setup (provided by Event Supervisor)
- A **Start Point** and **Target Point** marked with tape, separated by the **Target Distance**
- A **Bonus Line** halfway between Start and Target, running perpendicular to the path, at least 1 meter to one side — this is where the optional **Can Bonus** cans sit
- Two **Bonus Cans** (empty cylindrical cans, e.g. corn cans): the **Outer Can** is placed by the Event Supervisor at a fixed distance from the track centerline; the **Inner Can** is placed by the competitors themselves, anywhere between 0 and 100 cm from the outer can
- Track area is at least 2 meters wide and extends at least 1 meter behind the Start Point and beyond the Target Point

## What Actually Happens on Competition Day

1. **Impound (before first time slot):** Team impounds their vehicle, batteries (stored separately from the vehicle, presented for inspection if asked), spare parts, and any papers used. Tools and laptops/computers used for programming do NOT need to be impounded. Inspections do **not** happen at impound — any of the team's 15 possible members can drop off the impound items, so this is a purely logistical checkpoint, not the inspection itself.

2. **Announcement:** After impound but before the first time slot, the **Target Distance** and **Target Time** for the whole tournament are announced and posted — same for every team at that competition. (Target Distance range/precision and Target Time range/precision both get tighter as tournament level increases — Regionals is the coarsest, Nationals is the most precise.)

3. **Check-in:** Only the actual participants enter the competition area (bringing any tools they need). The team retrieves their impounded vehicle/materials when instructed, and the Event Supervisor **now** inspects and measures the vehicle for construction compliance, notifying the team of any violations found at this point.

4. **Event Time begins (8 minutes total, shared across the whole process):**
   - The team may adjust, repair, wire, re-aim, or otherwise work on their vehicle within this window
   - Sighting/aiming/measurement devices (if used) must be placed and used **within the marked track area only** — they can't be secured to the track itself, and any such device left on the vehicle at run time counts as part of the vehicle
   - The team may access the internet **only** to program their device — any other internet use is a competition violation
   - Teams may NOT test/roll their vehicle on the actual floor before their official runs (practice runs elsewhere before the event are fine — this is about testing at the competition track itself)

5. **Each individual run:**
   - Team places the vehicle's Measurement Point directly above the Start Point, in the ready-to-run configuration, and it must be able to sit there without being touched until triggered
   - Team notifies the Event Supervisor when ready — the Supervisor then checks the vehicle one more time in this exact ready-to-run state for any violations (announced only at the *end* of the run, not before, though teams may ask about specific known concerns beforehand)
   - Team decides per-run whether to attempt the Can Bonus (no penalty either way for skipping it)
   - The run is started using an **unsharpened #2 pencil** to physically trigger the vehicle — this is the ONLY thing allowed to touch it to start it
   - If the vehicle doesn't move when triggered, that attempt doesn't count as a used run — the team can keep working on it within their remaining Event Time
   - **Once a run starts, competitors cannot use, view, or access their programming tools at all** until the vehicle is retrieved
   - The Event Supervisor determines if the run was Successful or Failed, and records: run time, final vehicle distance from the Target Point, whether it passed through the can bonus zone correctly, and any violations

6. **Run limit:** The Event Time ends after 2 runs are completed OR the 8-minute window runs out, whichever comes first.

## Scoring
- **Low score wins** (this is a "lower is better" event) — final score is the **better of the team's two Run Scores**, plus any Final Score Penalties
- **Run Score = 100 + Distance Score + Time Score + Bonuses + Run Penalties**
- **Distance Score = 2.0 points per cm** the vehicle stopped away from the Target Point (Failed Runs get a flat 2500-point Distance Score — a huge penalty)
- **Time Score = |Target Time − actual Run Time|** (absolute difference in seconds; Failed Runs get Run Time recorded as 0.00, making this term large)
- **Can Bonus = −0.5 × (110 − Inside Can Distance)** — this is a *negative* number (i.e., a bonus that lowers your score, which is good since low score wins), and its magnitude depends on how far apart the team chose to place the cans
- **Event Time Bonus (Nationals only) = (Event Time Used − 480) / 30** — rewards teams who use up more of their allotted time efficiently at Nationals specifically
- **Run Penalties (added, i.e., bad):**
  - Competition Violation: +150 points per run with 1+ violations
  - Construction Violation: +300 points per run with 1+ violations
  - Failed runs can still be hit with both penalty types on top of their automatic Distance/Time penalties
- **Final Score Penalty:** +5000 points if the vehicle wasn't impounded at all
- **Tiebreakers (in order):** better Vehicle Distance on the scored run → lower Time Score on the scored run → better Vehicle Distance on the non-scored run → better Time Score on the non-scored run

## Key Competitive Realities
- **This is a precision-tuning event, not a speed event** — the scoring formula punishes both overshoot AND undershoot equally (absolute value), and rewards hitting the *exact* Target Time as much as the exact Target Distance, so a vehicle needs to be tuned to a specific, announced target rather than just built to go "fast and far."
- **The Target Distance/Time aren't known until the day of competition** (though the *range* they'll fall in is known in advance), so teams need a vehicle design that can be **calibrated on the spot** — e.g., via a repeatable relationship between battery count/gearing/wheel size and resulting speed/distance, rather than a single fixed hard-coded run.
- **Failed runs are catastrophic to score** (flat 2500-point distance penalty plus a large time penalty), so reliability of the mechanism (not stalling, not veering off course, actually stopping under its own power) matters as much as raw tuning accuracy.
- **The Can Bonus is a real strategic trade-off** — attempting it adds difficulty (must travel precisely between two cans) but the potential score reduction (−0.5 × up to 110) can be meaningful; teams need to decide per-run whether the risk is worth it given how dialed-in their vehicle currently is.
- **Programming/tuning happens live within a shared 8-minute Event Time** that also has to cover physical adjustments, sighting/aiming setup, AND the two actual runs — meaning time management during the event itself (not just pre-competition prep) is a real skill, especially since accessing programming tools is completely locked out once a run starts.