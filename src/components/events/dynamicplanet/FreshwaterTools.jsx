import { useState } from 'react';
import { calculateStreamDischarge, calculateWaterBudgetChange } from './freshwaterCalculators';

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

function NumericField({ label, value, onChange, unit }) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
      {label} ({unit})
      <input type="number" min="0" step="any" value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function parseMeasurements(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(',').map((item) => Number(item.trim()));
}

export default function FreshwaterTools() {
  const [area, setArea] = useState('');
  const [velocity, setVelocity] = useState('');
  const [discharge, setDischarge] = useState(null);
  const [dischargeError, setDischargeError] = useState('');
  const [inflowText, setInflowText] = useState('');
  const [outflowText, setOutflowText] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('m³');
  const [budget, setBudget] = useState(null);
  const [budgetError, setBudgetError] = useState('');

  const submitDischarge = (event) => {
    event.preventDefault();
    const result = calculateStreamDischarge({
      crossSectionAreaM2: Number(area),
      averageVelocityMps: Number(velocity)
    });
    if (result.error) {
      setDischargeError(result.error);
      setDischarge(null);
    } else {
      setDischargeError('');
      setDischarge(result);
    }
  };

  const submitBudget = (event) => {
    event.preventDefault();
    const result = calculateWaterBudgetChange({
      inflows: parseMeasurements(inflowText),
      outflows: parseMeasurements(outflowText),
      volumeUnit
    });
    if (result.error) {
      setBudgetError(result.error);
      setBudget(null);
    } else {
      setBudgetError('');
      setBudget(result);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 860 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Dynamic Planet C · 2027 freshwater · Manual C24–C25
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Freshwater measurement workbench</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Enter your own measured values to calculate stream discharge or a simple water-budget balance. No preset questions or sample datasets are supplied. Use consistent units and cite the time interval represented by your flows.
        </p>
      </section>

      <form onSubmit={submitDischarge} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 5px', fontSize: 15 }}>Stream discharge from area and velocity</h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
            Enter measured cross-sectional area and average velocity. This uses Q = A × v with SI units; accuracy depends on the measurement method and how representative the average velocity is.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumericField label="Cross-sectional area" value={area} onChange={(event) => { setArea(event.target.value); setDischarge(null); }} unit="m²" />
          <NumericField label="Average velocity" value={velocity} onChange={(event) => { setVelocity(event.target.value); setDischarge(null); }} unit="m/s" />
        </div>
        {dischargeError && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{dischargeError}</div>}
        {discharge && <div role="status" aria-live="polite" style={{ padding: 12, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)', fontSize: 12 }}>{discharge.equation}: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(discharge.dischargeM3PerSec.toPrecision(6))} {discharge.unit}</strong></div>}
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate discharge</button>
      </form>

      <form onSubmit={submitBudget} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 5px', fontSize: 15 }}>User-entered water budget</h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
            Enter comma-separated inflow and outflow measurements over the same interval and in the same volume unit. The calculator reports total inflow minus total outflow; include any terms relevant to your own system in the appropriate list.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>Inflow amounts (comma-separated)
            <input type="text" inputMode="decimal" value={inflowText} onChange={(event) => { setInflowText(event.target.value); setBudget(null); }} placeholder="Enter measured inflows" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>Outflow amounts (comma-separated)
            <input type="text" inputMode="decimal" value={outflowText} onChange={(event) => { setOutflowText(event.target.value); setBudget(null); }} placeholder="Enter measured outflows" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
          <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>Shared volume unit
            <input type="text" value={volumeUnit} onChange={(event) => { setVolumeUnit(event.target.value); setBudget(null); }} placeholder="e.g. m³" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
        </div>
        {budgetError && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{budgetError}</div>}
        {budget && <div role="status" aria-live="polite" style={{ padding: 12, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)', fontSize: 12, lineHeight: 1.6 }}>
          Inflow total: <strong>{Number(budget.totalInflow.toPrecision(6))} {budget.volumeUnit}</strong> · Outflow total: <strong>{Number(budget.totalOutflow.toPrecision(6))} {budget.volumeUnit}</strong><br />
          Net budget change: <strong>{Number(budget.netChange.toPrecision(6))} {budget.volumeUnit}</strong> ({budget.interpretation})
        </div>}
        <button type="submit" style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600 }}>Calculate budget balance</button>
      </form>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Rule source: 2027 Division C Rules Manual §3.f, pp. C24–C25. These are general measurement/calculation aids, not official event scores or a substitute for a specified measurement procedure.
      </p>
    </div>
  );
}
