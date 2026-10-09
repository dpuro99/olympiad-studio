# Chemistry Lab C — verified 2027 tools

Source: supplied 2027 Division C Rules Manual, pp. C14–C15. The event requires at least one activity in each of gases and kinetics; time is not scored or a tiebreaker. Nomenclature and stoichiometry are supporting tools that may appear.

## Live: Gas-Law Practice
The calculator supports Boyle, Charles, Gay-Lussac, Avogadro, combined, and ideal gas-law unknown solving; Dalton’s total/partial-pressure remainder calculation; and Graham’s gas-rate ratio from molar masses. It requires positive inputs, tells users to use Kelvin for temperature, states unit conventions, and labels unsupported dimensions/assumptions. It saves explicitly in browser local storage and exports entered values/results as CSV. It is practice, not scoring.

## Live: Reaction-Rate Experiment Notebook — Regional/Invitational focus
This is a user-authored experiment workspace, not a quiz. Students select one manual-listed factor (temperature, concentration, particle size, catalyst), write the condition for each trial, enter their own initial/final measurement and elapsed time, and compare calculated average rates. They record controls and write their own conclusion; the application supplies no preset questions, answers, or simulated measurements.

Rate calculation is limited to the general measured-change-over-time operation, with direction specified by whether a reactant is consumed or a product is formed. Units come from the user. The notebook should clearly identify invalid direction/time inputs and should not interpret experimental results as an official answer.

## Implemented notebook support
Experiment notes and measurements can be explicitly saved/restored in browser local storage or exported to CSV. No experiment data is uploaded. CSV text fields are escaped and protected against spreadsheet formula injection.

## Future work within the requested scope
- If a question feature is requested later, design its content architecture first: curated/reviewed question data with provenance, or a separately approved generation system. Do not add fixed quiz questions directly in the component.
- Add experimental design guidance: change one variable at a time, keep relevant conditions controlled, and measure reaction progress over time using event-supervisor-approved procedures.
- Nomenclature, formula writing and stoichiometry may be added as additional Regional/Invitational practice, but must not displace required gases and kinetics content.
