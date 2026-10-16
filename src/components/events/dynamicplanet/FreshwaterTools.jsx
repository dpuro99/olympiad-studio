import { useState } from 'react';
import { calculateStreamDischarge, calculateWaterBudgetChange } from './freshwaterCalculators';
import {
  BarChart
} from '../../general/ui/charts';
import {
  Card,
  HelpText,
  ListField,
  NumberField,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  TextField,
  ToolHeader
} from '../../general/ui/primitives';

const toMeasurements = (rows) => rows
  .filter((row) => row !== '')
  .map((row) => Number(row))
  .filter((value) => Number.isFinite(value));

// Schematic channel cross-section: the flow arrow length tracks the entered
// average velocity so the student sees the input they are varying. Not to scale.
function ChannelCrossSection({ area, velocity }) {
  const areaNumber = Number(area);
  const velocityNumber = Number(velocity);
  const hasArea = Number.isFinite(areaNumber) && areaNumber > 0;
  const hasVelocity = Number.isFinite(velocityNumber) && velocityNumber >= 0;
  const arrowLength = hasVelocity ? Math.max(6, Math.min(120, velocityNumber * 24)) : 6;

  return (
    <div role="img"
      aria-label={`Schematic channel cross-section (not to scale)${hasArea ? `, cross-sectional area ${areaNumber} square metres` : ''}${hasVelocity ? `, average velocity ${velocityNumber} metres per second` : ''}`}>
      <svg viewBox="0 0 220 110" aria-hidden="true" style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block' }}>
        <path d="M10 20 L60 92 L160 92 L210 20" fill="none" stroke="var(--color-border-secondary)" strokeWidth="2" />
        <path d="M18 32 L61 88 L159 88 L202 32 Z" fill="var(--color-background-info)" stroke="var(--color-text-info)" strokeWidth="1" />
        <line x1="30" y1="30" x2={30 + arrowLength} y2="30" stroke="var(--color-text-info)" strokeWidth="3" markerEnd="url(#fw-arrow)" />
        <defs>
          <marker id="fw-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-text-info)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function FreshwaterTools() {
  const [area, setArea] = useState('');
  const [velocity, setVelocity] = useState('');
  const [inflowRows, setInflowRows] = useState(['']);
  const [outflowRows, setOutflowRows] = useState(['']);
  const [volumeUnit, setVolumeUnit] = useState('m³');

  const dischargeFilled = String(area).trim() !== '' && String(velocity).trim() !== '';
  const dischargeComputation = dischargeFilled
    ? calculateStreamDischarge({ crossSectionAreaM2: Number(area), averageVelocityMps: Number(velocity) })
    : null;
  const discharge = dischargeComputation && !dischargeComputation.error ? dischargeComputation : null;
  const dischargeError = dischargeComputation && dischargeComputation.error ? dischargeComputation.error : null;

  const hasBudgetInput = String(volumeUnit).trim() !== '' && (inflowRows.some((row) => row !== '') || outflowRows.some((row) => row !== ''));
  const budgetComputation = hasBudgetInput
    ? calculateWaterBudgetChange({ inflows: toMeasurements(inflowRows), outflows: toMeasurements(outflowRows), volumeUnit })
    : null;
  const budget = budgetComputation && !budgetComputation.error ? budgetComputation : null;
  const budgetError = budgetComputation && budgetComputation.error ? budgetComputation.error : null;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
      <ToolHeader
        eyebrow="Dynamic Planet C · 2027 · Manual C24–C25"
        purpose="Enter your own measurements: read stream discharge as you type, then total an inflow/outflow set to see the net water-budget change. Every result is driven entirely by the values you measure; the tool contains no preset scenarios or fabricated data."
        manualReference="2027 Division C Rules Manual §3.a.ii, §3.f.ii–iii, and §3.h.ii (pp. C24–C25)"
        steps={[
          'Discharge: enter cross-sectional area and average velocity; Q = A × v updates immediately.',
          'Add as many inflow and outflow amounts as your system needs and choose the shared volume unit.',
          'Compare total inflow with total outflow and read the net change.'
        ]}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Results are for learning and are labeled as practice; they are not an official competition score.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Stream discharge</SectionHeading>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Uses Q = A × v with SI units. The cross-section below is a schematic, not to scale.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Cross-sectional area" unit="m²" value={area} onChange={(event) => setArea(event.target.value)} />
          <NumberField label="Average velocity" unit="m/s" value={velocity} onChange={(event) => setVelocity(event.target.value)} />
        </div>
        <ChannelCrossSection area={area} velocity={velocity} />
        {dischargeError && <StatusMessage tone="error">{dischargeError}</StatusMessage>}
        {discharge && (
          <ResultPanel>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(discharge.dischargeM3PerSec.toPrecision(6))} {discharge.unit}</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}> — from Q = A × v</span>
          </ResultPanel>
        )}
        {!discharge && !dischargeError && <HelpText>Enter area and velocity to read the discharge.</HelpText>}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Water budget</SectionHeading>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          Add each inflow and outflow term for your system over the same interval and in the same volume unit.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <ListField label="Inflow amounts" values={inflowRows} onChange={setInflowRows} addLabel="Add inflow" placeholder="e.g. 1200" />
          <ListField label="Outflow amounts" values={outflowRows} onChange={setOutflowRows} addLabel="Add outflow" placeholder="e.g. 1000" />
          <TextField label="Shared volume unit" value={volumeUnit} onChange={(event) => setVolumeUnit(event.target.value)} placeholder="e.g. m³" />
        </div>
        {budgetError && <StatusMessage tone="error">{budgetError}</StatusMessage>}
        {budget && (
          <>
            <BarChart
              bars={[
                { label: 'Inflow', value: budget.totalInflow },
                { label: 'Outflow', value: budget.totalOutflow }
              ]}
              caption={`Water budget totals: inflow ${budget.totalInflow} versus outflow ${budget.totalOutflow} ${budget.volumeUnit}`}
              yLabel={budget.volumeUnit}
            />
            <ResultPanel style={{ lineHeight: 1.6 }}>
              Inflow total: <strong>{Number(budget.totalInflow.toPrecision(6))} {budget.volumeUnit}</strong> · Outflow total: <strong>{Number(budget.totalOutflow.toPrecision(6))} {budget.volumeUnit}</strong><br />
              Net budget change: <strong>{Number(budget.netChange.toPrecision(6))} {budget.volumeUnit}</strong> ({budget.interpretation})
            </ResultPanel>
          </>
        )}
        {!budget && !budgetError && <HelpText>Enter at least one inflow or outflow amount to read the net change.</HelpText>}
      </Card>
    </div>
  );
}
