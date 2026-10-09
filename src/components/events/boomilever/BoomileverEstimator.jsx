import { useState } from 'react';
import { calculateBoomileverScore } from './boomileverScore';

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

export default function BoomileverEstimator() {
  const [loadSupported, setLoadSupported] = useState('');
  const [structureMass, setStructureMass] = useState('');
  const [meetsBonus, setMeetsBonus] = useState(false);
  const [holds15Kg, setHolds15Kg] = useState(false);
  const [tier, setTier] = useState('Tier 1');
  const [estimatedLoad, setEstimatedLoad] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = (event) => {
    event.preventDefault();
    const scoreResult = calculateBoomileverScore({
      loadSupportedGrams: loadSupported === '' ? null : Number(loadSupported),
      structureMassGrams: Number(structureMass),
      meetsBonusRequirements: meetsBonus,
      holds15Kg,
      tier,
      estimatedLoadSupportedGrams: estimatedLoad === '' ? null : Number(estimatedLoad)
    });
    if (scoreResult.error) {
      setError(scoreResult.error);
      setResult(null);
    } else {
      setError('');
      setResult(scoreResult);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Boomilever C · 2027 · Manual C7–C12
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Structure efficiency estimator</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          This is a user-entered design estimator, not an official score or a compliance checker. The 2027 manual defines the Load Scored Bonus as 7,500 g when the 10 cm wall-contact boundary is met and 15 kg is held; the base option uses the 15 cm boundary. Confirm all measurements and tier conditions with the Event Supervisor.
        </p>
      </section>

      <form onSubmit={handleCalculate} style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Measured values</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberInput label="Load supported" value={loadSupported} onChange={(event) => { setLoadSupported(event.target.value); setResult(null); }} unit="g" />
          <NumberInput label="Structure mass" value={structureMass} onChange={(event) => { setStructureMass(event.target.value); setResult(null); }} unit="g" />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
            <input type="checkbox" checked={meetsBonus} onChange={(event) => { setMeetsBonus(event.target.checked); setResult(null); }} />
            <span>Structure meets 10 cm wall-contact boundary for bonus eligibility</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
            <input type="checkbox" checked={holds15Kg} onChange={(event) => { setHolds15Kg(event.target.checked); setResult(null); }} />
            <span>Structure holds 15 kg (required for the 7,500 g bonus)</span>
          </label>
        </div>

        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Tier
          <select value={tier} onChange={(event) => { setTier(event.target.value); setResult(null); }} style={inputStyle}>
            <option value="Tier 1">Tier 1</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Tier 3">Tier 3 (participation only)</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Estimated load supported (optional, for comparison)
          <input type="number" min="0" step="any" value={estimatedLoad} onChange={(event) => { setEstimatedLoad(event.target.value); setResult(null); }} placeholder="e.g. 12000" style={inputStyle} />
        </label>

        {error && <div role="alert" style={{ color: 'var(--color-text-danger)', fontSize: 12 }}>{error}</div>}
        {result && (
          <div role="status" aria-live="polite" style={{ padding: 14, border: '1px solid var(--color-border-info)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-info)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Estimated score</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
              Load Scored: <span style={{ fontFamily: 'var(--font-mono)' }}>{Number(result.loadScored.toFixed(2))} g</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              Score: <span style={{ fontFamily: 'var(--font-mono)' }}>{Number(result.score.toFixed(4))}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              Tier: {result.tier} · Bonus applied: {result.loadScoredBonus > 0 ? 'Yes (7,500 g)' : 'No'} · Load supported capped at 15,000 g
            </div>
            {result.estimatedLoadSupportedGrams !== null && (
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Estimated load: {Number(result.estimatedLoadSupportedGrams.toFixed(2))} g · Difference from supported: {Number(Math.abs(result.loadSupportedGrams - result.estimatedLoadSupportedGrams).toFixed(2))} g
              </div>
            )}
          </div>
        )}
        <button type="submit" style={{ padding: '10px 14px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Calculate efficiency
        </button>
      </form>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: 2027 Division C Rules Manual pp. C7–C12. This is an educational estimator, not an official score or a compliance checker. Confirm measurements, tier conditions, and bonus eligibility with the Event Supervisor.
      </p>
    </div>
  );
}
