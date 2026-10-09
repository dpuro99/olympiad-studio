# Electric Vehicle C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C26–C31. The project now implements a 2027 run calculator; old arc/can geometry, scoring and can-bonus assumptions are obsolete.

## Score calculator contract
Run score: `100 + Distance Score + Time Score + Bonuses + Run Penalties`. Distance: `2 × Vehicle Distance (cm) + Bottle Distance (cm)`; failed-run distance is 2500. Bottle distance is 400 cm if the bottle did not pass the Target Point or moving-bottle requirements were violated. Time: `0.5 × abs(Target Time − Run Time)`; failed-run time is 0.00. Bottle fully beyond line: −20. Pusher bonus: `(ES-measured opening width − 35.0) × 1.5`. Run penalties: competition +150, construction +300, non-modification +50. Final: better of two run scores + National-only `(Event Time Used − 480)/30` + 5000 if vehicle was not impounded.

## Logger and checklist
Keep raw ES measurements, failed/successful status, bottle position/handling, violations, kit modification and notes. Distinguish target vs bottle lines and vehicle MP-to-target vs bottle-to-line distances. Eight-AA, 80 cm length, 35 cm width, rigid custom pusher, rear MP, impound, 8-minute/two-run constraints must be displayed. Do not treat a calculated score as an official ES ruling.

The official EV clarification about code contribution by current/non-roster students is linked from the event FAQ; include it in programming guidance.
