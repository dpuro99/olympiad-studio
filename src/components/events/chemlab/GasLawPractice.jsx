import { useEffect, useState } from 'react';
import {
  GAS_LAW_DEFINITIONS,
  GAS_VARIABLE_LABELS,
  calculateDaltonPartialPressure,
  calculateGrahamRateRatio,
  solveGasLaw
} from './gasLaws';
import {
  buildGasNotebookCsv,
  createEmptyGasNotebook,
  GAS_NOTEBOOK_STORAGE_KEY,
  parseGasNotebook
} from './gasLawNotebook';
import {
  Button, Card, ResultPanel, SectionHeading, StatusMessage, TextAreaField, ToolHeader
} from '../../general/ui/primitives';

const STORAGE_WARNING = 'Save explicitly to this browser profile; changes are not auto-saved or uploaded and may be visible to others sharing this profile. CSV export downloads only entered data and calculated results.';

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

// Which state panels to draw for a law: one for the ideal gas law, a
// before/after pair for the two-state laws.
function gasPanels(law, state) {
  if (law === 'ideal') {
    return [{ title: 'State', volume: toNumber(state.v), pressure: toNumber(state.p) }];
  }
  return [
    { title: 'Before', volume: toNumber(state.v1), pressure: toNumber(state.p1) },
    { title: 'After', volume: toNumber(state.v2), pressure: toNumber(state.p2) }
  ];
}

// A piston per gas state, gas height scaled against the largest volume shown so
// the before/after comparison is meaningful. Quantity labels keep it honest.
function GasPistonDiagram({ law, state, unit }) {
  const panels = gasPanels(law, state);
  const scale = Math.max(1, ...panels.map((panel) => panel.volume || 0));
  const innerTop = 22;
  const innerHeight = 120;

  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }} role="img"
      aria-label={`Gas state diagram for ${law === 'ideal' ? 'one state' : 'before and after'} with scaled piston volumes`}>
      {panels.map((panel) => {
        const volume = panel.volume;
        const height = volume === null ? innerHeight * 0.6 : Math.max(16, Math.min(innerHeight, (volume / scale) * innerHeight));
        return (
          <div key={panel.title} style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
            <svg viewBox="0 0 100 170" width="100" aria-hidden="true" style={{ height: 'auto', display: 'block' }}>
              <rect x={20} y={innerTop} width={60} height={innerHeight} fill="var(--color-background-tertiary)" stroke="var(--color-border-secondary)" strokeWidth={2} />
              <rect x={20} y={innerTop + innerHeight - height} width={60} height={height} fill="var(--color-background-info)" stroke="var(--color-text-info)" strokeWidth={1} />
              <rect x={14} y={innerTop + innerHeight - height - 8} width={72} height={8} rx={2} fill="var(--color-text-secondary)" />
            </svg>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{panel.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-primary)' }}>
              {volume === null ? 'V constant' : `${Number(volume.toPrecision(4))} ${unit}`}
            </div>
            {panel.pressure !== null && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                {Number(panel.pressure.toPrecision(4))} kPa
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GasLawPractice() {
  const [notebook, setNotebook] = useState(createEmptyGasNotebook);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(GAS_NOTEBOOK_STORAGE_KEY);
        if (stored) {
          const parsed = parseGasNotebook(stored);
          if (parsed.error) {
            setMessage(parsed.error);
            setMessageIsError(true);
          } else {
            setNotebook(parsed.value);
            setMessage('Your saved gas-law notebook was loaded from this browser.');
          }
        }
      } catch {
        setMessage('Local storage is unavailable; you can still export this notebook as CSV.');
        setMessageIsError(true);
      } finally {
        setLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const definition = GAS_LAW_DEFINITIONS[notebook.gasLaw];
  const variables = Object.keys(definition.units);
  const knownVariables = variables.filter((variable) => variable !== notebook.target);

  const updateNotebook = (field, value) => {
    setNotebook((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const handleLawChange = (event) => {
    const nextLaw = event.target.value;
    setNotebook((current) => ({
      ...current,
      gasLaw: nextLaw,
      target: Object.keys(GAS_LAW_DEFINITIONS[nextLaw].units)[0],
      values: {}
    }));
    setMessage('');
  };

  const handleValueChange = (variable, value) => {
    setNotebook((current) => ({ ...current, values: { ...current.values, [variable]: value } }));
    setMessage('');
  };

  const updateDalton = (field, value) => {
    setNotebook((current) => ({ ...current, dalton: { ...current.dalton, [field]: value } }));
    setMessage('');
  };

  const updateGraham = (field, value) => {
    setNotebook((current) => ({ ...current, graham: { ...current.graham, [field]: value } }));
    setMessage('');
  };

  // Live derivations: solve as the student types, with a neutral hint while the
  // inputs are still incomplete and an error only once they are all filled.
  const allKnownFilled = knownVariables.every((variable) => String(notebook.values[variable] ?? '').trim() !== '');
  const gasComputation = allKnownFilled
    ? solveGasLaw({ law: notebook.gasLaw, target: notebook.target, values: notebook.values })
    : null;
  const gasResult = gasComputation && !gasComputation.error ? gasComputation : null;
  const gasError = gasComputation && gasComputation.error ? gasComputation.error : null;
  const state = { ...notebook.values, ...(gasResult ? { [gasResult.target]: gasResult.value } : {}) };

  const daltonFilled = String(notebook.dalton.totalPressure).trim() !== '' && String(notebook.dalton.knownPressures).trim() !== '';
  const daltonComputation = daltonFilled
    ? calculateDaltonPartialPressure({
      totalPressure: Number(notebook.dalton.totalPressure),
      knownPartialPressures: notebook.dalton.knownPressures.split(',').map((value) => Number(value.trim()))
    })
    : null;
  const daltonResult = daltonComputation && !daltonComputation.error ? daltonComputation : null;
  const daltonError = daltonComputation && daltonComputation.error ? daltonComputation.error : null;

  const grahamFilled = String(notebook.graham.molarMass1).trim() !== '' && String(notebook.graham.molarMass2).trim() !== '';
  const grahamComputation = grahamFilled
    ? calculateGrahamRateRatio({ molarMass1: Number(notebook.graham.molarMass1), molarMass2: Number(notebook.graham.molarMass2) })
    : null;
  const grahamResult = grahamComputation && !grahamComputation.error ? grahamComputation : null;
  const grahamError = grahamComputation && grahamComputation.error ? grahamComputation.error : null;

  const saveNotebook = () => {
    try {
      window.localStorage.setItem(GAS_NOTEBOOK_STORAGE_KEY, JSON.stringify(notebook));
      setMessage('Gas-law notebook saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Export the notebook as CSV instead.');
      setMessageIsError(true);
    }
  };

  const exportCsv = () => {
    const resultCsv = buildGasNotebookCsv(notebook);
    if (resultCsv.error) {
      setMessage(resultCsv.error);
      setMessageIsError(true);
      return;
    }
    const blob = new Blob([resultCsv.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chemistry-lab-gas-law-notebook.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('CSV exported. It contains only entered values, calculations, and notes.');
    setMessageIsError(false);
  };

  const clearNotebook = () => {
    if (!window.confirm('Clear the gas-law notebook and its locally saved copy?')) return;
    try {
      window.localStorage.removeItem(GAS_NOTEBOOK_STORAGE_KEY);
      setNotebook(createEmptyGasNotebook());
      setMessage('Gas-law notebook cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear the saved gas-law notebook.');
      setMessageIsError(true);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <ToolHeader
        eyebrow="Chemistry Lab C · 2027 · Manual C14"
        purpose="Enter your own values and read gas-law results as you type. Keep units consistent; temperatures must be absolute (Kelvin). This is a learning calculator, not an official competition score."
        manualReference="2027 Division C Rules Manual §3.e, p. C14"
        steps={[
          'Pick a gas law, choose which quantity to solve for, and enter the known values — the answer updates as you type.',
          'The piston diagram scales the gas volumes so you can compare the before and after states.',
          'Save the notebook to this browser, export it as CSV, or clear it at any time.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>{STORAGE_WARNING}</p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Gas-law unknown solver</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12 }}>
            Gas law
            <select value={notebook.gasLaw} onChange={handleLawChange} aria-label="Gas law"
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13 }}>
              {Object.entries(GAS_LAW_DEFINITIONS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12 }}>
            Solve for
            <select value={notebook.target} onChange={(event) => updateNotebook('target', event.target.value)} aria-label="Solve for"
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13 }}>
              {variables.map((variable) => <option key={variable} value={variable}>{GAS_VARIABLE_LABELS[variable]} ({definition.units[variable]})</option>)}
            </select>
          </label>
        </div>

        <div style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{definition.equation}</div>
          <div style={{ marginTop: 5, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>{definition.description}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {knownVariables.map((variable) => (
            <label key={variable} style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
              {GAS_VARIABLE_LABELS[variable]} ({definition.units[variable]})
              <input type="number" min="0" step="any" value={notebook.values[variable] || ''}
                aria-label={`${GAS_VARIABLE_LABELS[variable]} (${definition.units[variable]})`}
                onChange={(event) => handleValueChange(variable, event.target.value)}
                style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)' }} />
            </label>
          ))}
        </div>

        <GasPistonDiagram law={notebook.gasLaw} state={state} unit={definition.units.v1 || definition.units.v || 'L'} />

        {gasError && <StatusMessage tone="error">{gasError}</StatusMessage>}
        {gasResult && (
          <ResultPanel>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{GAS_VARIABLE_LABELS[gasResult.target]}</div>
            <strong style={{ display: 'block', marginTop: 4, color: 'var(--color-text-info)', fontSize: 22, fontFamily: 'var(--font-mono)' }}>{Number(gasResult.value.toPrecision(6))} {gasResult.unit}</strong>
            <div style={{ marginTop: 5, color: 'var(--color-text-secondary)', fontSize: 11 }}>Using {gasResult.equation}</div>
          </ResultPanel>
        )}
        {!gasError && !gasResult && <StatusMessage tone="status">Enter every known value to solve for {GAS_VARIABLE_LABELS[notebook.target]}.</StatusMessage>}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Dalton’s law of partial pressures</SectionHeading>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>Enter total pressure and comma-separated known partial pressures, all in kPa.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Total pressure (kPa)
            <input type="number" min="0" step="any" value={notebook.dalton.totalPressure} aria-label="Total pressure (kPa)"
              onChange={(event) => updateDalton('totalPressure', event.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)' }} />
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Known partial pressures (comma-separated)
            <input type="text" inputMode="decimal" value={notebook.dalton.knownPressures} aria-label="Known partial pressures (comma-separated)"
              onChange={(event) => updateDalton('knownPressures', event.target.value)} placeholder="Enter measured values"
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13 }} />
          </label>
        </div>
        {daltonError && <StatusMessage tone="error">{daltonError}</StatusMessage>}
        {daltonResult && (
          <ResultPanel>
            <div>{daltonResult.equation}</div>
            <div style={{ marginTop: 4 }}>Known pressures total: {Number(daltonResult.knownTotal.toPrecision(6))} kPa</div>
            <strong style={{ display: 'block', marginTop: 4 }}>Remaining partial pressure: {Number(daltonResult.value.toPrecision(6))} kPa</strong>
          </ResultPanel>
        )}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Graham’s law of diffusion and effusion</SectionHeading>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>Enter molar masses in the same units to compare gas rates.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Gas 1 molar mass (same units)
            <input type="number" min="0" step="any" value={notebook.graham.molarMass1} aria-label="Gas 1 molar mass (same units)"
              onChange={(event) => updateGraham('molarMass1', event.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)' }} />
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Gas 2 molar mass (same units)
            <input type="number" min="0" step="any" value={notebook.graham.molarMass2} aria-label="Gas 2 molar mass (same units)"
              onChange={(event) => updateGraham('molarMass2', event.target.value)}
              style={{ width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)', border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)' }} />
          </label>
        </div>
        {grahamError && <StatusMessage tone="error">{grahamError}</StatusMessage>}
        {grahamResult && (
          <ResultPanel>
            <div>{grahamResult.equation}</div>
            <strong style={{ display: 'block', marginTop: 4 }}>r₁/r₂ = {Number(grahamResult.rateRatio.toPrecision(6))}</strong>
          </ResultPanel>
        )}
      </Card>

      <TextAreaField label="Notes about your own work" rows={3} value={notebook.notes} placeholder="Optional notes"
        onChange={(event) => updateNotebook('notes', event.target.value)} />

      <Card style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button variant="primary" disabled={!loaded} onClick={saveNotebook}>{loaded ? 'Save in this browser' : 'Loading saved notebook…'}</Button>
          <Button onClick={exportCsv}>Export CSV</Button>
          <Button variant="danger" onClick={clearNotebook}>Clear notebook</Button>
        </div>
        {message && <StatusMessage tone={messageIsError ? 'error' : 'status'}>{message}</StatusMessage>}
      </Card>
    </div>
  );
}
