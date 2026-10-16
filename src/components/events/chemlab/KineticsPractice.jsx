import { useEffect, useState } from 'react';
import { calculateObservedRate, RATE_FACTORS } from './kinetics';
import {
  buildExperimentCsv,
  createEmptyTrial,
  createEmptyExperiment,
  EXPERIMENT_STORAGE_KEY,
  parseSavedExperiment
} from './experimentNotebook';
import {
  Button, Card, EmptyState, HelpText, SectionHeading,
  SelectField, StatusMessage, TextAreaField, TextField, ToolHeader
} from '../../general/ui/primitives';
import { LineChart } from '../../general/ui/charts';

function getTrialRate(trial, measurementType) {
  if (trial.initialValue === '' || trial.finalValue === '' || trial.elapsedTime === '') return null;
  return calculateObservedRate({
    measurementType,
    initialValue: Number(trial.initialValue),
    finalValue: Number(trial.finalValue),
    elapsedTime: Number(trial.elapsedTime)
  });
}

// One line per complete trial: initial measurement at t=0 to final at elapsed time.
function buildPlotSeries(trials) {
  return trials
    .map((trial, index) => {
      if (trial.initialValue === '' || trial.finalValue === '' || trial.elapsedTime === '') return null;
      const points = [
        { x: 0, y: Number(trial.initialValue) },
        { x: Number(trial.elapsedTime), y: Number(trial.finalValue) }
      ];
      if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null;
      return { label: `Trial ${index + 1}`, points };
    })
    .filter(Boolean);
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

  const updateTrial = (id, field, value) => {
    setExperiment((current) => ({ ...current, trials: current.trials.map((trial) => (trial.id === id ? { ...trial, [field]: value } : trial)) }));
    setMessage('');
  };

  const addTrial = () => {
    setExperiment((current) => ({ ...current, trials: [...current.trials, createEmptyTrial(Math.max(0, ...current.trials.map((trial) => trial.id)) + 1)] }));
    setMessage('');
  };

  const removeTrial = (id) => {
    setExperiment((current) => ({ ...current, trials: current.trials.filter((trial) => trial.id !== id) }));
    setMessage('');
  };

  const saveExperiment = () => {
    try {
      window.localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(experiment));
      setMessage('Experiment notebook saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Export the notebook as CSV instead.');
      setMessageIsError(true);
    }
  };

  const exportCsv = () => {
    const csv = buildExperimentCsv(experiment);
    if (csv.error) {
      setMessage(csv.error);
      setMessageIsError(true);
      return;
    }
    const blob = new Blob([csv.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chemistry-lab-kinetics-notebook.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('CSV exported. It contains only your entered records and calculated rates.');
    setMessageIsError(false);
  };

  const clearNotebook = () => {
    if (!window.confirm('Clear this experiment notebook and its saved copy in this browser?')) return;
    try {
      window.localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
      setExperiment(createEmptyExperiment());
      setMessage('Experiment notebook cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear the saved experiment notebook.');
      setMessageIsError(true);
    }
  };

  const quantityDescription = experiment.measurementType === 'reactant-consumed' ? 'remaining amount' : 'product formed';
  const rateUnit = experiment.quantityUnit && experiment.timeUnit ? `${experiment.quantityUnit}/${experiment.timeUnit}` : 'quantity unit/time unit';
  const plotSeries = buildPlotSeries(experiment.trials);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <ToolHeader
        eyebrow="Chemistry Lab C · 2027 · Manual C14"
        purpose="Design your own reaction-rate investigation and record the measurements you take. Enter initial and final amounts over an elapsed time and the average rate updates as you type."
        manualReference="2027 Division C Rules Manual §3.f, p. C14"
        steps={[
          'Choose the factor you are varying and set the units you will record in.',
          'Add a trial for each run and enter the measured amounts and elapsed time — the average rate appears immediately.',
          'The plot shows each trial’s change in the measured quantity over its elapsed time.',
          'Save to this browser or export the notebook as CSV.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This notebook creates no data: every number comes from you. If a measurement is missing, no rate is shown.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Experiment setup</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <SelectField label="Factor you are varying" value={experiment.factorId} onChange={(event) => updateExperiment('factorId', event.target.value)}>
            {RATE_FACTORS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </SelectField>
          <TextField label="Unit for the factor" value={experiment.factorUnit} onChange={(event) => updateExperiment('factorUnit', event.target.value)} placeholder="e.g. °C, mol/L, g" />
          <SelectField label="Measurement type" value={experiment.measurementType} onChange={(event) => updateExperiment('measurementType', event.target.value)}>
            <option value="reactant-consumed">Reactant remaining over time</option>
            <option value="product-formed">Product formed over time</option>
          </SelectField>
          <TextField label="Measured quantity unit" value={experiment.quantityUnit} onChange={(event) => updateExperiment('quantityUnit', event.target.value)} placeholder="e.g. g, mL, mol/L" />
          <TextField label="Time unit" value={experiment.timeUnit} onChange={(event) => updateExperiment('timeUnit', event.target.value)} placeholder="e.g. s, min" />
        </div>
        <TextField label="Conditions you are holding constant" value={experiment.controls} onChange={(event) => updateExperiment('controls', event.target.value)} placeholder="Describe what you keep the same across trials" />
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <SectionHeading>Your measurements and rates</SectionHeading>
          <Button onClick={addTrial}>Add trial</Button>
        </div>
        {experiment.trials.length === 0 && <EmptyState>Add a trial and enter the amounts you measured to see an average rate.</EmptyState>}
        <div style={{ display: 'grid', gap: 12 }}>
          {experiment.trials.map((trial, index) => {
            const rate = getTrialRate(trial, experiment.measurementType);
            return (
              <div key={trial.id} style={{ display: 'grid', gap: 10, padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>Trial {index + 1}</strong>
                  <Button variant="danger" aria-label={`Remove trial ${index + 1}`} onClick={() => removeTrial(trial.id)} style={{ padding: '2px 10px' }}>×</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                  <TextField label={`Condition (${experiment.factorUnit || factor.label})`} value={trial.condition} onChange={(event) => updateTrial(trial.id, 'condition', event.target.value)} placeholder={factor.label} />
                  <TextField label={`Initial ${quantityDescription} (${experiment.quantityUnit || 'unit'})`} value={trial.initialValue} onChange={(event) => updateTrial(trial.id, 'initialValue', event.target.value)} inputMode="decimal" />
                  <TextField label={`Final ${quantityDescription} (${experiment.quantityUnit || 'unit'})`} value={trial.finalValue} onChange={(event) => updateTrial(trial.id, 'finalValue', event.target.value)} inputMode="decimal" />
                  <TextField label={`Elapsed time (${experiment.timeUnit || 'unit'})`} value={trial.elapsedTime} onChange={(event) => updateTrial(trial.id, 'elapsedTime', event.target.value)} inputMode="decimal" />
                </div>
                {rate && rate.error && <StatusMessage tone="error">{rate.error}</StatusMessage>}
                {rate && !rate.error && <StatusMessage>Average rate: {Number(rate.rate.toPrecision(6))} {rateUnit}</StatusMessage>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Measured quantity over elapsed time</SectionHeading>
        {plotSeries.length > 0 ? (
          <LineChart
            series={plotSeries}
            caption={`Measured ${quantityDescription} over elapsed time for ${plotSeries.length} trial${plotSeries.length === 1 ? '' : 's'}`}
            xLabel={`time (${experiment.timeUnit || 'unit'})`}
            yLabel={`measured (${experiment.quantityUnit || 'unit'})`}
          />
        ) : (
          <HelpText>Complete a trial’s initial amount, final amount, and elapsed time to plot it.</HelpText>
        )}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Your conclusion</SectionHeading>
        <TextAreaField label="What does your data suggest?" value={experiment.conclusion} onChange={(event) => updateExperiment('conclusion', event.target.value)} rows={4} placeholder="Summarize the trend you measured and note any uncertainty or surprises." />
      </Card>

      <Card style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button disabled={!loaded} variant="primary" onClick={saveExperiment}>{loaded ? 'Save in this browser' : 'Loading saved notebook…'}</Button>
          <Button onClick={exportCsv}>Export CSV</Button>
          <Button variant="danger" onClick={clearNotebook}>Clear notebook</Button>
        </div>
        {message && <StatusMessage tone={messageIsError ? 'error' : 'status'}>{message}</StatusMessage>}
      </Card>

      <HelpText>Save explicitly to this browser profile; changes are not auto-saved or uploaded and may be visible to others sharing this profile. CSV export downloads only entered data and calculated results.</HelpText>
    </div>
  );
}
