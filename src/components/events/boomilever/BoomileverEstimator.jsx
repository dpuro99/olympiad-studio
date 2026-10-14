import { useState } from 'react';
import { calculateBoomileverScore } from './boomileverScore';
import {
  Card,
  CheckboxField,
  NumberField,
  SelectField,
  ToolHeader
} from '../../general/ui/primitives';

export default function BoomileverEstimator() {
  const [loadSupported, setLoadSupported] = useState('');
  const [structureMass, setStructureMass] = useState('');
  const [meetsBonus, setMeetsBonus] = useState(false);
  const [holds15Kg, setHolds15Kg] = useState(false);
  const [tier, setTier] = useState('Tier 1');
  const [estimatedLoad, setEstimatedLoad] = useState('');

  const massValue = structureMass === '' ? null : Number(structureMass);
  const hasMass = massValue !== null && Number.isFinite(massValue) && massValue > 0;
  const scoreResult = hasMass
    ? calculateBoomileverScore({
      loadSupportedGrams: loadSupported === '' ? null : Number(loadSupported),
      structureMassGrams: massValue,
      meetsBonusRequirements: meetsBonus,
      holds15Kg,
      tier,
      estimatedLoadSupportedGrams: estimatedLoad === '' ? null : Number(estimatedLoad)
    })
    : null;
  const showMassHint = !hasMass && (loadSupported !== '' || meetsBonus || holds15Kg);
  const error = scoreResult?.error || (showMassHint ? 'Enter a positive structure mass (g) to estimate efficiency.' : '');
  const result = scoreResult && !scoreResult.error ? scoreResult : null;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <ToolHeader
        eyebrow="Boomilever C · 2027"
        title="Structure efficiency estimator"
        purpose="Enter a structure's mass and the load it held to see its structural efficiency. The estimate updates as you type."
        manualReference="2027 Division C Rules Manual, pp. C7–C12"
        steps={[
          'Enter the structure mass and the load it supported, in grams.',
          'Tick the bonus boundary and 15 kg conditions if they applied to your test.',
          'Choose the tier the Event Supervisor assigned.',
          'Read the estimated Load Scored and efficiency below. Lower scores win? No — efficiency is Load Scored ÷ mass, so higher is better.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This is a user-entered design estimator, not an official score or a compliance checker. Confirm all measurements and tier conditions with the Event Supervisor.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Load supported" unit="g" value={loadSupported} onChange={(event) => setLoadSupported(event.target.value)} />
          <NumberField label="Structure mass" unit="g" value={structureMass} onChange={(event) => setStructureMass(event.target.value)} help="Required to calculate." />
          <CheckboxField label="Structure meets 10 cm wall-contact boundary for bonus eligibility" checked={meetsBonus} onChange={(event) => setMeetsBonus(event.target.checked)} />
          <CheckboxField label="Structure holds 15 kg (required for the 7,500 g bonus)" checked={holds15Kg} onChange={(event) => setHolds15Kg(event.target.checked)} />
        </div>

        <SelectField label="Tier" value={tier} onChange={(event) => setTier(event.target.value)} style={{ maxWidth: 320 }}>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
          <option value="Tier 3">Tier 3 (participation only)</option>
        </SelectField>

        <NumberField
          label="Estimated load supported"
          value={estimatedLoad}
          onChange={(event) => setEstimatedLoad(event.target.value)}
          placeholder="e.g. 12000"
          help="Optional — compare a predicted load against the measured one."
        />

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
      </Card>
    </div>
  );
}
