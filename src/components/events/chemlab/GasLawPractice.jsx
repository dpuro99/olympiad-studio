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

function NumberInput({ label, value, onChange, unit }) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
      {label} ({unit})
      <input type="number" min="0" step="any" value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function ResultBox({ result, error, children }) {
  if (error) return <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{error}</div>;
  if (!result) return null;
  return (
    <div role="status" aria-live="polite" style={{ padding: 12, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)', fontSize: 12 }}>
      {children}
    </div>
  );
}

export default function GasLawPractice() {
  const [notebook, setNotebook] = useState(createEmptyGasNotebook);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [daltonResult, setDaltonResult] = useState(null);
  const [daltonError, setDaltonError] = useState('');
  const [grahamResult, setGrahamResult] = useState(null);
  const [grahamError, setGrahamError] = useState('');
  const definition = GAS_LAW_DEFINITIONS[notebook.gasLaw];
  const variables = Object.keys(definition.units);
  const knownVariables = variables.filter((variable) => variable !== notebook.target);

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
    setResult(null);
    setError('');
    setMessage('');
  };

  const handleValueChange = (variable, value) => {
    setNotebook((current) => ({ ...current, values: { ...current.values, [variable]: value } }));
    setResult(null);
    setError('');
    setMessage('');
  };

  const updateDalton = (field, value) => {
    setNotebook((current) => ({ ...current, dalton: { ...current.dalton, [field]: value } }));
    setDaltonResult(null);
    setDaltonError('');
    setMessage('');
  };

  const updateGraham = (field, value) => {
    setNotebook((current) => ({ ...current, graham: { ...current.graham, [field]: value } }));
    setGrahamResult(null);
    setGrahamError('');
    setMessage('');
  };

  const handleGasLawSubmit = (event) => {
    event.preventDefault();
    const calculation = solveGasLaw({ law: notebook.gasLaw, target: notebook.target, values: notebook.values });
    if (calculation.error) {
      setError(calculation.error);
      setResult(null);
    } else {
      setError('');
      setResult(calculation);
    }
  };

  const handleDaltonSubmit = (event) => {
    event.preventDefault();
    const pressures = notebook.dalton.knownPressures.split(',').map((value) => Number(value.trim()));
    const calculation = calculateDaltonPartialPressure({
      totalPressure: Number(notebook.dalton.totalPressure),
      knownPartialPressures: pressures
    });
    if (calculation.error) {
      setDaltonError(calculation.error);
      setDaltonResult(null);
    } else {
      setDaltonError('');
      setDaltonResult(calculation);
    }
  };

  const handleGrahamSubmit = (event) => {
    event.preventDefault();
    const calculation = calculateGrahamRateRatio({
      molarMass1: Number(notebook.graham.molarMass1),
      molarMass2: Number(notebook.graham.molarMass2)
    });
    if (calculation.error) {
      setGrahamError(calculation.error);
      setGrahamResult(null);
    } else {
      setGrahamError('');
      setGrahamResult(calculation);
    }
  };

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
      setResult(null);
      setError('');
      setDaltonResult(null);
      setDaltonError('');
      setGrahamResult(null);
      setGrahamError('');
      setMessage('Gas-law notebook cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear the saved gas-law notebook.');
      setMessageIsError(true);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Chemistry Lab C · 2027 · Manual C14
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Gas-law calculation notebook</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Enter your own values and calculate gas-law results. Keep units consistent; temperatures must be absolute (Kelvin). This is a learning calculator, not an official competition score.
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Save explicitly to this browser profile; changes are not auto-saved or uploaded and may be visible to others sharing this profile. CSV export downloads only entered data and calculated results.
        </p>
      </section>

      <form onSubmit={handleGasLawSubmit} style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Gas-law unknown solver</h3>
        <label style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12 }}>
          Gas law
          <select value={notebook.gasLaw} onChange={handleLawChange} style={inputStyle}>
            {Object.entries(GAS_LAW_DEFINITIONS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
          </select>
        </label>

        <div style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{definition.equation}</div>
          <div style={{ marginTop: 5, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>{definition.description}</div>
        </div>

        <label style={{ display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 12 }}>
          Solve for
          <select value={notebook.target} onChange={(event) => updateNotebook('target', event.target.value)} style={inputStyle}>
            {variables.map((variable) => <option key={variable} value={variable}>{GAS_VARIABLE_LABELS[variable]} ({definition.units[variable]})</option>)}
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {knownVariables.map((variable) => (
            <NumberInput key={variable} label={GAS_VARIABLE_LABELS[variable]} value={notebook.values[variable] || ''} onChange={(event) => handleValueChange(variable, event.target.value)} unit={definition.units[variable]} />
          ))}
        </div>
        {error && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{error}</div>}
        {result && (
          <div role="status" aria-live="polite" style={{ padding: 14, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)' }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{GAS_VARIABLE_LABELS[result.target]}</div>
            <strong style={{ display: 'block', marginTop: 4, color: 'var(--color-text-info)', fontSize: 22, fontFamily: 'var(--font-mono)' }}>{Number(result.value.toPrecision(6))} {result.unit}</strong>
            <div style={{ marginTop: 5, color: 'var(--color-text-secondary)', fontSize: 11 }}>Using {result.equation}</div>
          </div>
        )}
        <button type="submit" style={{ padding: '10px 14px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate unknown</button>
      </form>

      <form onSubmit={handleDaltonSubmit} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 5px', fontSize: 15 }}>Dalton’s law of partial pressures</h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>Enter total pressure and comma-separated known partial pressures, all in kPa.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <NumberInput label="Total pressure" value={notebook.dalton.totalPressure} onChange={(event) => updateDalton('totalPressure', event.target.value)} unit="kPa" />
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
            Known partial pressures (comma-separated)
            <input type="text" inputMode="decimal" value={notebook.dalton.knownPressures} onChange={(event) => updateDalton('knownPressures', event.target.value)} placeholder="Enter measured values" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
        </div>
        <ResultBox error={daltonError} result={daltonResult}>
          <div>{daltonResult?.equation}</div>
          <div style={{ marginTop: 4 }}>Known pressures total: {Number(daltonResult?.knownTotal.toPrecision(6))} kPa</div>
          <strong style={{ display: 'block', marginTop: 4 }}>Remaining partial pressure: {Number(daltonResult?.value.toPrecision(6))} kPa</strong>
        </ResultBox>
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate remaining partial pressure</button>
      </form>

      <form onSubmit={handleGrahamSubmit} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 5px', fontSize: 15 }}>Graham’s law of diffusion and effusion</h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>Enter molar masses in the same units to compare gas rates.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberInput label="Gas 1 molar mass" value={notebook.graham.molarMass1} onChange={(event) => updateGraham('molarMass1', event.target.value)} unit="same units" />
          <NumberInput label="Gas 2 molar mass" value={notebook.graham.molarMass2} onChange={(event) => updateGraham('molarMass2', event.target.value)} unit="same units" />
        </div>
        <ResultBox error={grahamError} result={grahamResult}>
          <div>{grahamResult?.equation}</div>
          <strong style={{ display: 'block', marginTop: 4 }}>r₁/r₂ = {Number(grahamResult?.rateRatio.toPrecision(6))}</strong>
        </ResultBox>
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Compare rates</button>
      </form>

      <label style={{ ...cardStyle, display: 'grid', gap: 5, color: 'var(--color-text-secondary)', fontSize: 11 }}>
        Notes about your own work
        <textarea rows={3} value={notebook.notes} onChange={(event) => updateNotebook('notes', event.target.value)} placeholder="Optional notes" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
      </label>

      <section style={{ ...cardStyle, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" disabled={!loaded} onClick={saveNotebook} style={{ padding: '8px 11px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, fontSize: 12 }}>
            {loaded ? 'Save in this browser' : 'Loading saved notebook…'}
          </button>
          <button type="button" onClick={exportCsv} style={{ padding: '8px 11px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', background: 'transparent', fontSize: 12 }}>Export CSV</button>
          <button type="button" onClick={clearNotebook} style={{ padding: '8px 11px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-danger)', background: 'transparent', fontSize: 12 }}>Clear notebook</button>
        </div>
        {message && <div role={messageIsError ? 'alert' : 'status'} style={{ color: messageIsError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontSize: 11 }}>{message}</div>}
      </section>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>Rule source: 2027 Division C Rules Manual §3.e, p. C14.</p>
    </div>
  );
}
