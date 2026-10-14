import { useEffect, useState } from 'react';
import { calculateRunScore } from './scoreUtils';
import {
  Button,
  Card,
  CheckboxField,
  EmptyState,
  NumberField,
  SectionHeading,
  StatusMessage,
  TextAreaField,
  TextField,
  ToolHeader
} from '../../general/ui/primitives';

const STORAGE_KEY = 'olympiad-studio.ev-c.2027-practice-runs';
const emptyForm = () => ({
  label: '',
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
  nonModificationPenalty: false,
  notes: ''
});
const numberOrNull = (value) => value === '' ? null : Number(value);

function getScore(form) {
  return calculateRunScore({
    targetTimeSec: numberOrNull(form.targetTimeSec),
    runTimeSec: numberOrNull(form.runTimeSec),
    vehicleDistanceCm: numberOrNull(form.vehicleDistanceCm),
    bottleDistanceCm: numberOrNull(form.bottleDistanceCm),
    pusherOpeningWidthCm: numberOrNull(form.pusherOpeningWidthCm),
    failedRun: form.failedRun,
    bottlePastTarget: form.bottlePastTarget,
    bottleFullyPastLine: form.bottleFullyPastLine,
    movingBottleRequirementsMet: form.movingBottleRequirementsMet,
    competitionViolation: form.competitionViolation,
    constructionViolation: form.constructionViolation,
    nonModificationPenalty: form.nonModificationPenalty
  });
}

export default function RunLogger() {
  const [form, setForm] = useState(emptyForm);
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const score = getScore(form);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setRuns(JSON.parse(stored));
      } catch {
        setError('Saved practice data could not be read from this browser.');
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setError('');
    setSaved(false);
  };

  const saveRun = (event) => {
    event.preventDefault();
    if (!score) {
      setError(form.failedRun
        ? 'Enter a target time and the ES-measured pusher opening width.'
        : 'Enter target/run times, both ES-measured distances, and the pusher opening width.');
      return;
    }

    const entry = {
      ...form,
      score
    };
    const updated = [entry, ...runs];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRuns(updated);
      setForm(emptyForm());
      setSaved(true);
      setError('');
    } catch {
      setError('This browser could not save the run. Check local storage availability.');
    }
  };

  const removeRun = (index) => {
    const updated = runs.filter((_, runIndex) => runIndex !== index);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRuns(updated);
    } catch {
      setError('This browser could not update the saved run history.');
    }
  };

  const field = (label, name, unit, step = 'any') => (
    <NumberField label={label} unit={unit} step={step} name={name} value={form[name]} onChange={update} />
  );

  const check = (label, name) => (
    <CheckboxField key={name} label={label} name={name} checked={form[name]} onChange={update} />
  );

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <ToolHeader
        eyebrow="Electric Vehicle C · 2027 · saved only in this browser"
        title="Practice run journal"
        purpose="Log each practice run with the Event Supervisor's measurements and rulings, and keep a comparable history of scores as you tune the vehicle."
        manualReference="2027 Division C Rules Manual, EV sections 5–8 (pp. C28–C31)"
        steps={[
          'Give the run a short session label (for example, "gearing adjustment").',
          'Enter the measured times and distances the Event Supervisor recorded.',
          'Tick any rulings that applied (failed run, violations, bottle line, moving-bottle requirements).',
          'Optionally add notes, then choose Save run. Every saved run appears below with its calculated score.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Records stay in this browser and are not synced to Supabase. The displayed score follows the verified 2027 run formula; it cannot determine rule compliance.
        </p>
      </ToolHeader>

      <Card as="form" onSubmit={saveRun} noValidate style={{ display: 'grid', gap: 14 }}>
        <SectionHeading as="h3" style={{ fontSize: 15 }}>Log a run</SectionHeading>
        <TextField label="Session label" name="label" value={form.label} onChange={update} placeholder="e.g. gearing adjustment" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {field('Target time', 'targetTimeSec', 's', '0.1')}
          {field('Actual run time', 'runTimeSec', 's', '0.01')}
          {field('Vehicle distance from target', 'vehicleDistanceCm', 'cm', '0.1')}
          {field('Bottle distance from line', 'bottleDistanceCm', 'cm', '0.1')}
          {field('Pusher opening width measured by ES', 'pusherOpeningWidthCm', 'cm', '0.1')}
        </div>
        <div style={{ display: 'grid', gap: 7 }}>
          {check('Failed run', 'failedRun')}
          {check('Bottle fully beyond Bottle Line (earns −20)', 'bottleFullyPastLine')}
          {check('Bottle reached/passed Target Point', 'bottlePastTarget')}
          {check('Moving-bottle requirements met', 'movingBottleRequirementsMet')}
          {check('Competition violation recorded', 'competitionViolation')}
          {check('Construction violation recorded', 'constructionViolation')}
          {check('Non-modification penalty applies', 'nonModificationPenalty')}
        </div>
        <TextAreaField label="Notes" name="notes" rows={3} value={form.notes} onChange={update} />
        {score && <StatusMessage>Calculated run score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{score.totalScore.toFixed(2)}</strong></StatusMessage>}
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {saved && <StatusMessage tone="success">Run saved in this browser.</StatusMessage>}
        <Button type="submit" variant="primary" style={{ justifySelf: 'start', padding: '10px 14px' }}>Save run</Button>
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading as="h3" style={{ fontSize: 15 }}>Saved runs ({runs.length})</SectionHeading>
        {runs.length === 0 ? <EmptyState>No runs saved in this browser yet.</EmptyState> : runs.map((run, index) => (
          <article key={index} style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <strong>{run.label || (run.failedRun ? 'Failed run' : 'Practice run')}</strong>
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{run.score.totalScore.toFixed(2)} pts</strong>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <span>time {run.failedRun ? 'failed' : `${run.runTimeSec} s`}</span><span>vehicle {run.vehicleDistanceCm === '' ? '—' : `${run.vehicleDistanceCm} cm`}</span><span>bottle {run.bottleDistanceCm === '' ? '—' : `${run.bottleDistanceCm} cm`}</span>
            </div>
            {run.notes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{run.notes}</p>}
            <Button
              variant="danger"
              onClick={() => { if (window.confirm('Delete this locally saved run?')) removeRun(index); }}
              style={{ marginTop: 8, padding: '4px 8px', fontSize: 11 }}
            >
              Delete
            </Button>
          </article>
        ))}
      </Card>
    </div>
  );
}
