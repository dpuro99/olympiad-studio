import { useState } from 'react';
import { calculateBoomileverScore } from './boomileverScore';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  Card,
  CheckboxField,
  Collapsible,
  NumberField,
  ResultPanel,
  SelectField,
  StatusMessage,
  Stepper,
  ToolHeader
} from '../../general/ui/primitives';

const WORKFLOW = [
  { label: 'Weigh and test' },
  { label: 'Add conditions' },
  { label: 'Read efficiency' }
];
const CONDITIONS_SUMMARY = 'Bonus conditions and optional prediction';

export default function BoomileverEstimator() {
  const [loadSupported, setLoadSupported] = useState('');
  const [structureMass, setStructureMass] = useState('');
  const [meetsBonus, setMeetsBonus] = useState(false);
  const [holds15Kg, setHolds15Kg] = useState(false);
  const [tier, setTier] = useState('Tier 1');
  const [estimatedLoad, setEstimatedLoad] = useState('');

  const rules = ACTIVE_DATA.boomilever;
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
  const conditionsActive = meetsBonus || holds15Kg || estimatedLoad !== '';
  const currentStep = result ? 2 : (loadSupported !== '' || structureMass !== '' || conditionsActive || tier !== 'Tier 1') ? 1 : 0;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <ToolHeader
        eyebrow={`Boomilever C · ${ACTIVE_SEASON.year}`}
        title="Structure efficiency estimator"
        purpose="Enter a structure's mass and the load it held to see its structural efficiency. The estimate updates as you type."
        manualReference={`${ACTIVE_SEASON.year} Division C Rules Manual, pp. C7–C12`}
        steps={[
          'Enter the structure mass and the load it supported, in grams, and choose the tier the Event Supervisor assigned.',
          `Expand conditions only if a bonus applied or you want to compare a predicted load; tick the ${rules.bonusHoldsKg} kg condition when it held.`,
          'Read the estimated Load Scored and efficiency below. Efficiency is Load Scored ÷ mass, so higher is better.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          This is a user-entered design estimator, not an official score or a compliance checker. Confirm all measurements and tier conditions with the Event Supervisor.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 4 }}>
        <Stepper steps={WORKFLOW} currentStep={currentStep} />
      </Card>

      <Card style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Load supported" unit="g" value={loadSupported} onChange={(event) => setLoadSupported(event.target.value)} />
          <NumberField label="Structure mass" unit="g" value={structureMass} onChange={(event) => setStructureMass(event.target.value)} help="Required to calculate." />
        </div>

        <SelectField label="Tier" value={tier} onChange={(event) => setTier(event.target.value)} style={{ maxWidth: 320 }}>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
          <option value="Tier 3">Tier 3 (participation only)</option>
        </SelectField>

        <Collapsible summary={CONDITIONS_SUMMARY} defaultOpen={conditionsActive}>
          <div style={{ display: 'grid', gap: 8 }}>
            <CheckboxField label="Structure meets 10 cm wall-contact boundary for bonus eligibility" checked={meetsBonus} onChange={(event) => setMeetsBonus(event.target.checked)} />
            <CheckboxField label={`Structure holds ${rules.bonusHoldsKg} kg (required for the ${rules.loadScoredBonusGrams.toLocaleString('en-US')} g bonus)`} checked={holds15Kg} onChange={(event) => setHolds15Kg(event.target.checked)} />
            <NumberField
              label="Estimated load supported"
              value={estimatedLoad}
              onChange={(event) => setEstimatedLoad(event.target.value)}
              placeholder="e.g. 12000"
              help="Optional — compare a predicted load against the measured one."
            />
          </div>
        </Collapsible>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {result && (
          <ResultPanel>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Estimated score</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
              Load Scored: <span style={{ fontFamily: 'var(--font-mono)' }}>{Number(result.loadScored.toFixed(2))} g</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              Score: <span style={{ fontFamily: 'var(--font-mono)' }}>{Number(result.score.toFixed(4))}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              Tier: {result.tier} · Bonus applied: {result.loadScoredBonus > 0 ? `Yes (${rules.loadScoredBonusGrams.toLocaleString('en-US')} g)` : 'No'} · Load supported capped at {rules.loadSupportedCapGrams.toLocaleString('en-US')} g
            </div>
            {result.estimatedLoadSupportedGrams !== null && (
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Estimated load: {Number(result.estimatedLoadSupportedGrams.toFixed(2))} g · Difference from supported: {Number(Math.abs(result.loadSupportedGrams - result.estimatedLoadSupportedGrams).toFixed(2))} g
              </div>
            )}
          </ResultPanel>
        )}
      </Card>
    </div>
  );
}
