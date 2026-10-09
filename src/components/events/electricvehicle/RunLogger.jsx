import { useEffect, useState } from 'react';
import { calculateRunScore } from './scoreUtils';

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
const inputStyle = {
  width: '100%', padding: 9, background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)',
  borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)'
};
const cardStyle = {
  background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)', padding: 18
};

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
    <label key={name} style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.4 }}>
      {label} ({unit})
      <input name={name} type="number" min="0" step={step} required={!form.failedRun || ['targetTimeSec', 'pusherOpeningWidthCm'].includes(name)} value={form[name]} onChange={update} style={inputStyle} />
    </label>
  );

  const check = (label, name) => (
    <label key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
      <input name={name} type="checkbox" checked={form[name]} onChange={update} />
      <span>{label}</span>
    </label>
  );

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.05em' }}>2027 EV · Personal browser storage</div>
        <h2 style={{ margin: 0, fontSize: 19 }}>Practice run journal</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Records stay in this browser and are not synced to Supabase. Enter the Event Supervisor’s measurements and rulings. The displayed score follows the verified 2027 run formula; it cannot determine rule compliance.
        </p>
      </section>

      <form onSubmit={saveRun} style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Log a run</h3>
        <label style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Session label
          <input name="label" value={form.label} onChange={update} placeholder="e.g. gearing adjustment" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
        </label>
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
        <label style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>Notes
          <textarea name="notes" value={form.notes} onChange={update} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
        </label>
        {score && <div aria-live="polite" style={{ fontSize: 13 }}>Calculated run score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{score.totalScore.toFixed(2)}</strong></div>}
        {error && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{error}</div>}
        {saved && <div role="status" style={{ color: 'var(--color-text-success)', fontSize: 12 }}>Run saved in this browser.</div>}
        <button type="submit" style={{ padding: '10px 14px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save run</button>
      </form>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Saved runs ({runs.length})</h3>
        {runs.length === 0 ? <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>No runs saved in this browser yet.</p> : runs.map((run, index) => (
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
            <button type="button" onClick={() => {
              if (window.confirm('Delete this locally saved run?')) removeRun(index);
            }} style={{ marginTop: 8, padding: '4px 8px', border: '1px solid var(--color-border-secondary)', borderRadius: 4, color: 'var(--color-text-danger)', background: 'transparent', cursor: 'pointer', fontSize: 11 }}>Delete</button>
          </article>
        ))}
      </section>
    </div>
  );
}
