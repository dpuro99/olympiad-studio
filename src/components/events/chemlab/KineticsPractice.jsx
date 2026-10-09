import { useEffect, useState } from 'react';
import { calculateObservedRate, RATE_FACTORS } from './kinetics';
import {
  buildExperimentCsv,
  createEmptyExperiment,
  createEmptyTrial,
  EXPERIMENT_STORAGE_KEY,
  parseSavedExperiment
} from './experimentNotebook';

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};
const inputStyle = {
  width: '100%',
  padding: '9px 10px',
  background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)',
  color: 'var(--color-text-primary)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'var(--font-mono)'
};

function Field({ label, value, onChange, placeholder, type = 'text', min, step }) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.4 }}>
      {label}
      <input type={type} min={min} step={step} value={value} onChange={onChange} placeholder={placeholder} style={{ ...inputStyle, fontFamily: type === 'number' ? 'var(--font-mono)' : 'var(--font-sans)' }} />
    </label>
  );
}

function getTrialRate(trial, measurementType) {
  if (trial.initialValue === '' || trial.finalValue === '' || trial.elapsedTime === '') return null;
  return calculateObservedRate({
    measurementType,
    initialValue: Number(trial.initialValue),
    finalValue: Number(trial.finalValue),
    elapsedTime: Number(trial.elapsedTime)
  });
}

export default function KineticsPractice() {
  const [experiment, setExperiment] = useState(createEmptyExperiment);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const factor = RATE_FACTORS.find((item) => item.id === experiment.factorId) || RATE_FACTORS[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(EXPERIMENT_STORAGE_KEY);
        if (stored) {
          const parsed = parseSavedExperiment(stored);
          if (parsed.error) {
            setMessage(parsed.error);
            setMessageIsError(true);
          } else {
            setExperiment(parsed.value);
            setMessage('Your saved experiment was loaded from this browser.');
            setMessageIsError(false);
          }
        }
      } catch {
        setMessage('Local storage is unavailable; you can still export your experiment as CSV.');
        setMessageIsError(true);
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateExperiment = (field, value) => {
    setExperiment((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const updateTrial = (trialId, field, value) => {
    setExperiment((current) => ({
      ...current,
      trials: current.trials.map((trial) => trial.id === trialId ? { ...trial, [field]: value } : trial)
    }));
    setMessage('');
  };

  const addTrial = () => {
    setExperiment((current) => ({
      ...current,
      trials: [...current.trials, createEmptyTrial(Math.max(0, ...current.trials.map((trial) => trial.id)) + 1)]
    }));
    setMessage('');
  };

  const removeTrial = (trialId) => {
    setExperiment((current) => ({
      ...current,
      trials: current.trials.filter((trial) => trial.id !== trialId)
    }));
    setMessage('');
  };

  const saveExperiment = () => {
    try {
      window.localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(experiment));
      setMessage('Experiment saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Export your measurements as CSV instead.');
      setMessageIsError(true);
    }
  };

  const resetNotebook = () => {
    if (!window.confirm('Clear this experiment and its locally saved copy?')) return;
    try {
      window.localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
      setExperiment(createEmptyExperiment());
      setMessage('Experiment cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear the saved experiment from local storage.');
      setMessageIsError(true);
    }
  };

  const exportCsv = () => {
    const result = buildExperimentCsv(experiment);
    if (result.error) {
      setMessage(result.error);
      setMessageIsError(true);
      return;
    }
    const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chemistry-lab-kinetics-experiment.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('CSV exported. The file contains only the experiment data you entered.');
    setMessageIsError(false);
  };

  const quantityDescription = experiment.measurementType === 'reactant-consumed' ? 'reactant remaining' : 'product formed';
  const rateUnit = experiment.quantityUnit && experiment.timeUnit
    ? `${experiment.quantityUnit}/${experiment.timeUnit}`
    : 'quantity unit/time unit';

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Chemistry Lab C · Regional/Invitational workspace · Manual C14
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Reaction-rate experiment notebook</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Define your own experiment and enter your own observations. This tool contains no preset quiz questions or fabricated data; it calculates average rate from measured change over elapsed time. Follow the Event Supervisor’s procedures and safety instructions.
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Save explicitly to this browser profile; changes are not auto-saved or uploaded and may be visible to others sharing this profile. CSV export downloads your entered records and calculated rates.
        </p>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Experiment setup</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Factor you are investigating
            <select value={experiment.factorId} onChange={(event) => updateExperiment('factorId', event.target.value)} style={inputStyle}>
              {RATE_FACTORS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <Field label="Factor unit (optional)" value={experiment.factorUnit} onChange={(event) => updateExperiment('factorUnit', event.target.value)} placeholder="e.g. °C, mol/L, g" />
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Measured quantity
            <select value={experiment.measurementType} onChange={(event) => updateExperiment('measurementType', event.target.value)} style={inputStyle}>
              <option value="reactant-consumed">Reactant consumed (remaining amount decreases)</option>
              <option value="product-formed">Product formed (amount increases)</option>
            </select>
          </label>
          <Field label="Measured quantity unit" value={experiment.quantityUnit} onChange={(event) => updateExperiment('quantityUnit', event.target.value)} placeholder="e.g. g, mL, mol/L" />
          <Field label="Time unit" value={experiment.timeUnit} onChange={(event) => updateExperiment('timeUnit', event.target.value)} placeholder="e.g. s, min" />
        </div>
        <Field label="Other conditions kept constant" value={experiment.controls} onChange={(event) => updateExperiment('controls', event.target.value)} placeholder="Describe the controls you kept the same across trials" />
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Rule-required factors: temperature, concentration, particle size, and catalysts. Change one factor at a time when comparing trials.
        </p>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Your measurements</h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11 }}>Average rate = measured change ÷ elapsed time · rate unit: {rateUnit}</p>
          </div>
          <button type="button" onClick={addTrial} style={{ padding: '8px 11px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', background: 'transparent', fontSize: 12 }}>Add trial</button>
        </div>

        {experiment.trials.length === 0 && <p style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Add a trial row to enter measurements.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
          {experiment.trials.map((trial, index) => {
            const trialRate = getTrialRate(trial, experiment.measurementType);
            return (
              <article key={trial.id} style={{ display: 'grid', gap: 10, padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>Trial {index + 1}</strong>
                  <button type="button" onClick={() => removeTrial(trial.id)} aria-label={`Remove trial ${index + 1}`} style={{ padding: '4px 8px', border: '1px solid var(--color-border-secondary)', borderRadius: 4, color: 'var(--color-text-danger)', background: 'transparent', fontSize: 11 }}>Remove</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 9 }}>
                  <Field label={`${factor.label} condition${experiment.factorUnit ? ` (${experiment.factorUnit})` : ''}`} value={trial.condition} onChange={(event) => updateTrial(trial.id, 'condition', event.target.value)} placeholder="Describe this trial’s condition" />
                  <Field label={`Initial ${quantityDescription}${experiment.quantityUnit ? ` (${experiment.quantityUnit})` : ''}`} type="number" min="0" step="any" value={trial.initialValue} onChange={(event) => updateTrial(trial.id, 'initialValue', event.target.value)} />
                  <Field label={`Final ${quantityDescription}${experiment.quantityUnit ? ` (${experiment.quantityUnit})` : ''}`} type="number" min="0" step="any" value={trial.finalValue} onChange={(event) => updateTrial(trial.id, 'finalValue', event.target.value)} />
                  <Field label={`Elapsed time${experiment.timeUnit ? ` (${experiment.timeUnit})` : ''}`} type="number" min="0" step="any" value={trial.elapsedTime} onChange={(event) => updateTrial(trial.id, 'elapsedTime', event.target.value)} />
                </div>
                {trialRate?.error && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 11 }}>{trialRate.error}</div>}
                {trialRate && !trialRate.error && (
                  <div role="status" aria-live="polite" style={{ color: 'var(--color-text-info)', fontSize: 12 }}>
                    Average rate: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(trialRate.rate.toPrecision(6))} {rateUnit}</strong>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>Analysis notes</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Compare your measured rates across the conditions you entered and write your own conclusion about how {factor.label.toLowerCase()} affected your reaction. The notebook does not supply an answer key or claim an outcome without your data.
        </p>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Your conclusion
          <textarea rows={4} value={experiment.conclusion} onChange={(event) => updateExperiment('conclusion', event.target.value)} placeholder="Summarize what your data suggests. Note uncertainty or unexpected results." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
        </label>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" disabled={!loaded} onClick={saveExperiment} style={{ padding: '8px 11px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: loaded ? 'pointer' : 'wait' }}>
            {loaded ? 'Save in this browser' : 'Loading saved notebook…'}
          </button>
          <button type="button" onClick={exportCsv} style={{ padding: '8px 11px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', background: 'transparent', fontSize: 12 }}>Export CSV</button>
          <button type="button" onClick={resetNotebook} style={{ padding: '8px 11px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-danger)', background: 'transparent', fontSize: 12 }}>Clear notebook</button>
        </div>
        {message && <div role={messageIsError ? 'alert' : 'status'} style={{ color: messageIsError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontSize: 11 }}>{message}</div>}
      </section>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Rule source: 2027 Division C Rules Manual §3.f.i, p. C14. No preset questions, generated prompts, or simulated measurements are used.
      </p>
    </div>
  );
}
