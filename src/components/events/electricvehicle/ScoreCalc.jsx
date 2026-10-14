import { useState } from 'react';
import { calculateFinalScore, calculateRunScore } from './scoreUtils';
import {
  Card,
  CheckboxField,
  NumberField,
  ResultPanel,
  SectionHeading,
  ToolHeader
} from '../../general/ui/primitives';

const createEmptyRun = () => ({
  targetTimeSec: '',
  runTimeSec: '',
  vehicleDistanceCm: '',
  bottleDistanceCm: '',
  pusherOpeningWidthCm: '',
  failedRun: false,
  bottlePastTarget: false,
  bottleFullyPastLine: false,
  movingBottleRequirementsMet: true,
  competitionViolation: false,
  constructionViolation: false,
  nonModificationPenalty: false
});

const numberOrNull = (value) => value === '' ? null : Number(value);

function ScoreRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '5px 0', borderBottom: '1px solid var(--color-border-tertiary)', fontSize: 12 }}>
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <strong style={{ fontFamily: 'var(--font-mono)' }}>{value.toFixed(2)}</strong>
    </div>
  );
}

export default function ScoreCalc() {
  const [runs, setRuns] = useState([createEmptyRun(), createEmptyRun()]);
  const [eventTimeUsedSec, setEventTimeUsedSec] = useState('');
  const [nationalTournament, setNationalTournament] = useState(false);
  const [vehicleNotImpounded, setVehicleNotImpounded] = useState(false);

  const updateRun = (index, field, value) => {
    setRuns((current) => current.map((run, runIndex) => (
      runIndex === index ? { ...run, [field]: value } : run
    )));
  };

  const runResults = runs.map((run) => calculateRunScore({
    targetTimeSec: numberOrNull(run.targetTimeSec),
    runTimeSec: numberOrNull(run.runTimeSec),
    vehicleDistanceCm: numberOrNull(run.vehicleDistanceCm),
    bottleDistanceCm: numberOrNull(run.bottleDistanceCm),
    pusherOpeningWidthCm: numberOrNull(run.pusherOpeningWidthCm),
    failedRun: run.failedRun,
    bottlePastTarget: run.bottlePastTarget,
    bottleFullyPastLine: run.bottleFullyPastLine,
    movingBottleRequirementsMet: run.movingBottleRequirementsMet,
    competitionViolation: run.competitionViolation,
    constructionViolation: run.constructionViolation,
    nonModificationPenalty: run.nonModificationPenalty
  }));
  const completedRunScores = runResults.filter(Boolean).map((result) => result.totalScore);
  const finalResult = calculateFinalScore({
    runScores: completedRunScores,
    eventTimeUsedSec: numberOrNull(eventTimeUsedSec),
    nationalTournament,
    vehicleNotImpounded
  });

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 1000 }}>
      <ToolHeader
        eyebrow="Electric Vehicle C · 2027"
        title="Electric Vehicle score calculator"
        purpose="Enter each run's measured distances and times to see the run score, then combine them into the final score. Lower scores win."
        manualReference="2027 Division C Rules Manual, EV sections 5–8 (pp. C28–C31)"
        steps={[
          'Measure distances in centimeters and times in seconds and enter them for Run 1 (and Run 2 if the team runs twice).',
          'Tick any rulings the Event Supervisor recorded (failed run, violations, bottle line, moving-bottle requirements).',
          'Read the Run score at the bottom of each run panel.',
          'Enter the Event Time used and any tournament/impound conditions to see the final score.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This applies the manual&rsquo;s numeric rules only. It cannot judge course measurements, failed-run rulings, or violations — confirm those with the Event Supervisor.
        </p>
      </ToolHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {runs.map((run, index) => {
          const result = runResults[index];
          const setNumber = (field) => (event) => updateRun(index, field, event.target.value);
          const setCheck = (field) => (event) => updateRun(index, field, event.target.checked);
          return (
            <Card key={index} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <SectionHeading as="h3" style={{ fontSize: 15 }}>Run {index + 1}</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 10 }}>
                <NumberField label="Target time" unit="s" step="0.1" value={run.targetTimeSec} onChange={setNumber('targetTimeSec')} />
                <NumberField label="Actual run time" unit="s" step="0.01" value={run.runTimeSec} onChange={setNumber('runTimeSec')} />
                <NumberField label="Vehicle distance from target" unit="cm" step="0.1" value={run.vehicleDistanceCm} onChange={setNumber('vehicleDistanceCm')} />
                <NumberField label="Bottle distance from bottle line" unit="cm" step="0.1" value={run.bottleDistanceCm} onChange={setNumber('bottleDistanceCm')} help="Distance the bottle stopped from the Bottle Line." />
                <NumberField label="Pusher foremost opening width measured by ES" unit="cm" step="0.1" value={run.pusherOpeningWidthCm} onChange={setNumber('pusherOpeningWidthCm')} help="Width of the pusher's foremost opening, measured by the Event Supervisor." />
              </div>
              <div style={{ display: 'grid', gap: 7 }}>
                <CheckboxField label="Failed run (manual assigns 2500 distance points and 0.00 s run time)" checked={run.failedRun} onChange={setCheck('failedRun')} />
                <CheckboxField label="Bottle fully beyond the Bottle Line (−20 points)" checked={run.bottleFullyPastLine} onChange={setCheck('bottleFullyPastLine')} />
                <CheckboxField label="Bottle reached/passed the Target Point" checked={run.bottlePastTarget} onChange={setCheck('bottlePastTarget')} />
                <CheckboxField label="Moving Water Bottle Requirements were followed" checked={run.movingBottleRequirementsMet} onChange={setCheck('movingBottleRequirementsMet')} />
                <CheckboxField label="One or more Competition Violations recorded (+150)" checked={run.competitionViolation} onChange={setCheck('competitionViolation')} />
                <CheckboxField label="One or more Construction Violations recorded (+300)" checked={run.constructionViolation} onChange={setCheck('constructionViolation')} />
                <CheckboxField label="Non-modification penalty applies (+50)" checked={run.nonModificationPenalty} onChange={setCheck('nonModificationPenalty')} />
              </div>
              {result ? (
                <ResultPanel style={{ padding: 0, background: 'transparent', border: 'none' }}>
                  <ScoreRow label="Base score" value={result.baseScore} />
                  <ScoreRow label="Distance score" value={result.distanceScore} />
                  <ScoreRow label="Time score" value={result.timeScore} />
                  <ScoreRow label="Bottle bonus" value={result.bottleBonus} />
                  <ScoreRow label="Pusher bonus" value={result.pusherBonus} />
                  <ScoreRow label="Run penalties" value={result.competitionViolationPenalty + result.constructionViolationPenalty + result.nonModificationPenaltyPoints} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 15 }}>
                    <strong>Run score</strong><strong style={{ fontFamily: 'var(--font-mono)' }}>{result.totalScore.toFixed(2)}</strong>
                  </div>
                </ResultPanel>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>Enter target time and pusher opening width; successful runs also need run time and both measured distances.</p>
              )}
            </Card>
          );
        })}
      </div>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading as="h3" style={{ fontSize: 15 }}>Final score</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <NumberField label="Event time used" unit="s" step="1" max="480" value={eventTimeUsedSec} onChange={(event) => setEventTimeUsedSec(event.target.value)} />
          <CheckboxField label="National Tournament (apply event-time bonus)" checked={nationalTournament} onChange={(event) => setNationalTournament(event.target.checked)} />
          <CheckboxField label="Vehicle was not impounded (+5000 final penalty)" checked={vehicleNotImpounded} onChange={(event) => setVehicleNotImpounded(event.target.checked)} />
        </div>
        {finalResult ? (
          <div aria-live="polite" style={{ display: 'grid', gap: 4 }}>
            <ScoreRow label="Better entered run score" value={finalResult.bestRunScore} />
            <ScoreRow label="National-only event-time bonus" value={finalResult.eventTimeBonus} />
            <ScoreRow label="Not-impounded penalty" value={finalResult.notImpoundedPenalty} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: 17 }}>
              <strong>Final score</strong><strong style={{ fontFamily: 'var(--font-mono)' }}>{finalResult.finalScore.toFixed(2)}</strong>
            </div>
          </div>
        ) : <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>Complete at least one run and enter event time to calculate the final score.</p>}
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Per the manual, a team with only one successful run is assessed a Failed Run for the second run score — mark Run 2 as failed in that case.
        </p>
      </Card>
    </div>
  );
}
