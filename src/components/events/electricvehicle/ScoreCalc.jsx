import { useState } from 'react';
import { calculateFinalScore, calculateRunScore } from './scoreUtils';

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
const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};
const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)',
  color: 'var(--color-text-primary)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-mono)'
};
const labelStyle = {
  display: 'block',
  marginBottom: 5,
  color: 'var(--color-text-secondary)',
  fontSize: 11,
  lineHeight: 1.4
};

function NumberField({ label, value, onChange, unit, step = 'any', max }) {
  return (
    <label style={labelStyle}>
      {label}{unit ? ` (${unit})` : ''}
      <input type="number" min="0" max={max} step={step} value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

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
      <div style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          2027 Rules Manual · EV C 5.a–5.l
        </div>
        <h2 style={{ margin: 0, fontSize: 19 }}>Electric Vehicle score calculator</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Lower score wins. Enter distances in centimeters and times in seconds. This implements the 2027 manual’s run formula and National event-time bonus; it does not determine whether a run or construction is rule-compliant. Confirm measurements, failed-run status, and violations with the Event Supervisor.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {runs.map((run, index) => {
          const result = runResults[index];
          const setNumber = (field) => (event) => updateRun(index, field, event.target.value);
          const setCheck = (field) => (event) => updateRun(index, field, event.target.checked);
          return (
            <section key={index} style={{ ...cardStyle, display: 'grid', gap: 12, alignContent: 'start' }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Run {index + 1}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 10 }}>
                <NumberField label="Target time" unit="s" value={run.targetTimeSec} onChange={setNumber('targetTimeSec')} step="0.1" />
                <NumberField label="Actual run time" unit="s" value={run.runTimeSec} onChange={setNumber('runTimeSec')} step="0.01" />
                <NumberField label="Vehicle distance from target" unit="cm" value={run.vehicleDistanceCm} onChange={setNumber('vehicleDistanceCm')} step="0.1" />
                <NumberField label="Bottle distance from bottle line" unit="cm" value={run.bottleDistanceCm} onChange={setNumber('bottleDistanceCm')} step="0.1" />
                <NumberField label="Pusher foremost opening width measured by ES" unit="cm" value={run.pusherOpeningWidthCm} onChange={setNumber('pusherOpeningWidthCm')} step="0.1" />
              </div>
              <div style={{ display: 'grid', gap: 7 }}>
                <CheckField label="Failed run (manual assigns 2500 distance points and 0.00 s run time)" checked={run.failedRun} onChange={setCheck('failedRun')} />
                <CheckField label="Bottle fully beyond the Bottle Line (−20 points)" checked={run.bottleFullyPastLine} onChange={setCheck('bottleFullyPastLine')} />
                <CheckField label="Bottle reached/passed the Target Point" checked={run.bottlePastTarget} onChange={setCheck('bottlePastTarget')} />
                <CheckField label="Moving Water Bottle Requirements were followed" checked={run.movingBottleRequirementsMet} onChange={setCheck('movingBottleRequirementsMet')} />
                <CheckField label="One or more Competition Violations recorded (+150)" checked={run.competitionViolation} onChange={setCheck('competitionViolation')} />
                <CheckField label="One or more Construction Violations recorded (+300)" checked={run.constructionViolation} onChange={setCheck('constructionViolation')} />
                <CheckField label="Non-modification penalty applies (+50)" checked={run.nonModificationPenalty} onChange={setCheck('nonModificationPenalty')} />
              </div>
              {result ? (
                <div aria-live="polite">
                  <ScoreRow label="Base score" value={result.baseScore} />
                  <ScoreRow label="Distance score" value={result.distanceScore} />
                  <ScoreRow label="Time score" value={result.timeScore} />
                  <ScoreRow label="Bottle bonus" value={result.bottleBonus} />
                  <ScoreRow label="Pusher bonus" value={result.pusherBonus} />
                  <ScoreRow label="Run penalties" value={result.competitionViolationPenalty + result.constructionViolationPenalty + result.nonModificationPenaltyPoints} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 15 }}>
                    <strong>Run score</strong><strong style={{ fontFamily: 'var(--font-mono)' }}>{result.totalScore.toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>Enter target time and pusher opening width; successful runs also need run time and both measured distances.</p>
              )}
            </section>
          );
        })}
      </div>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Final score</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <NumberField label="Event time used" unit="s" value={eventTimeUsedSec} onChange={(event) => setEventTimeUsedSec(event.target.value)} step="1" max="480" />
          <CheckField label="National Tournament (apply event-time bonus)" checked={nationalTournament} onChange={(event) => setNationalTournament(event.target.checked)} />
          <CheckField label="Vehicle was not impounded (+5000 final penalty)" checked={vehicleNotImpounded} onChange={(event) => setVehicleNotImpounded(event.target.checked)} />
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
          Rule source: 2027 Division C manual §§5–8 (pp. C28–C31). The calculator applies the manual’s numeric rules only; it cannot judge course measurements, failed-run rulings, or violations.
        </p>
      </section>
    </div>
  );
}
