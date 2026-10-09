import { useState } from 'react';
import { calculateEquivalentResistance, calculateOhmsLaw } from './circuitUtils';

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};
const inputStyle = {
  width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)',
  borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)'
};

function NumberInput({ label, value, onChange, unit }) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
      {label} ({unit})
      <input type="number" min="0" step="any" value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function ResultBox({ result, error }) {
  if (error) return <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{error}</div>;
  if (!result) return null;
  return (
    <div role="status" aria-live="polite" style={{ padding: 12, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)', fontSize: 12 }}>
      <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(result.value.toPrecision(6))} {result.unit}</strong>
      <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>{result.equation}</div>
    </div>
  );
}

export default function CircuitLabPractice() {
  const [resistancesText, setResistancesText] = useState('');
  const [resistanceResult, setResistanceResult] = useState(null);
  const [resistanceError, setResistanceError] = useState('');
  const [ohmInputs, setOhmInputs] = useState({ voltage: '', current: '', resistance: '' });
  const [ohmResult, setOhmResult] = useState(null);
  const [ohmError, setOhmError] = useState('');

  const handleResistanceChange = (event) => {
    setResistancesText(event.target.value);
    setResistanceResult(null);
    setResistanceError('');
  };

  const handleOhmChange = (field, value) => {
    setOhmInputs((current) => ({ ...current, [field]: value }));
    setOhmResult(null);
    setOhmError('');
  };

  const submitResistance = (event) => {
    event.preventDefault();
    const values = resistancesText.split(',').map((value) => Number(value.trim())).filter((value) => value !== '');
    const result = calculateEquivalentResistance({ resistances: values });
    if (result.error) {
      setResistanceError(result.error);
      setResistanceResult(null);
    } else {
      setResistanceError('');
      setResistanceResult(result);
    }
  };

  const submitOhm = (event) => {
    event.preventDefault();
    const result = calculateOhmsLaw({
      voltage: ohmInputs.voltage,
      current: ohmInputs.current,
      resistance: ohmInputs.resistance
    });
    if (result.error) {
      setOhmError(result.error);
      setOhmResult(null);
    } else {
      setOhmError('');
      setOhmResult(result);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Circuit Lab C · 2027 · Manual C16–C17
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Circuit practice calculator</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Practice Ohm’s law, series/parallel equivalent resistance, and basic circuit calculations from user-entered measurements. This is a learning calculator, not an official event score or a replacement for hands-on tasks.
        </p>
      </section>

      <form onSubmit={submitResistance} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Equivalent resistance</h3>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Resistance values (comma-separated, Ω)
          <input type="text" value={resistancesText} onChange={handleResistanceChange} placeholder="e.g. 100, 200, 300" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
        </label>
        <ResultBox result={resistanceResult} error={resistanceError} />
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate equivalent resistance</button>
      </form>

      <form onSubmit={submitOhm} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Ohm’s law</h3>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Enter exactly two of voltage, current, and resistance. The calculator solves for the remaining value.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberInput label="Voltage" value={ohmInputs.voltage} onChange={(event) => handleOhmChange('voltage', event.target.value)} unit="V" />
          <NumberInput label="Current" value={ohmInputs.current} onChange={(event) => handleOhmChange('current', event.target.value)} unit="A" />
          <NumberInput label="Resistance" value={ohmInputs.resistance} onChange={(event) => handleOhmChange('resistance', event.target.value)} unit="Ω" />
        </div>
        <ResultBox result={ohmResult} error={ohmError} />
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate unknown</button>
      </form>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: 2027 Division C Rules Manual pp. C16–C17. This is practice, not official event scoring.
      </p>
    </div>
  );
}
