import { useState } from 'react';
import { calculateStreamDischarge, calculateWaterBudgetChange } from './freshwaterCalculators';
import {
  Button,
  Card,
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

export default function FreshwaterTools() {
  const [area, setArea] = useState('');
  const [velocity, setVelocity] = useState('');
  const [discharge, setDischarge] = useState(null);
  const [dischargeError, setDischargeError] = useState('');
  const [inflowRows, setInflowRows] = useState(['']);
  const [outflowRows, setOutflowRows] = useState(['']);
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
      inflows: toMeasurements(inflowRows),
      outflows: toMeasurements(outflowRows),
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
      <ToolHeader
        eyebrow="Dynamic Planet C · 2027 freshwater · Manual C24–C25"
        title="Freshwater measurement workbench"
        purpose="Two calculators driven entirely by the values you measure: stream discharge from area and velocity, and a simple water-budget balance from inflows and outflows. No preset questions or pre-filled data are supplied."
        manualReference="2027 Division C Rules Manual §3.a.ii, §3.f.ii–iii, §3.h.ii (pp. C24–C25)"
        steps={[
          'Discharge: enter the measured cross-sectional area and average velocity to get Q = A × v.',
          'Budget: add one row per inflow and per outflow, all in the same volume unit and time interval.',
          'Set the shared volume unit, then choose Calculate budget balance to see total inflow − total outflow.',
          'Keep units consistent and record the time interval your flow values represent.'
        ]}
      />

      <Card as="form" onSubmit={submitDischarge} style={{ display: 'grid', gap: 12 }}>
        <div>
          <SectionHeading style={{ fontSize: 15 }}>Stream discharge from area and velocity</SectionHeading>
          <p style={{ margin: '5px 0 0', color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
            This uses Q = A × v with SI units; accuracy depends on the measurement method and how representative the average velocity is.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <NumberField label="Cross-sectional area" unit="m²" value={area} onChange={(event) => { setArea(event.target.value); setDischarge(null); }} />
          <NumberField label="Average velocity" unit="m/s" value={velocity} onChange={(event) => { setVelocity(event.target.value); setDischarge(null); }} />
        </div>
        {dischargeError && <StatusMessage tone="error">{dischargeError}</StatusMessage>}
        {discharge && (
          <ResultPanel>
            {discharge.equation}: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(discharge.dischargeM3PerSec.toPrecision(6))} {discharge.unit}</strong>
          </ResultPanel>
        )}
        <Button type="submit" variant="primary" style={{ justifySelf: 'start' }}>Calculate discharge</Button>
      </Card>

      <Card as="form" onSubmit={submitBudget} style={{ display: 'grid', gap: 12 }}>
        <div>
          <SectionHeading style={{ fontSize: 15 }}>User-entered water budget</SectionHeading>
          <p style={{ margin: '5px 0 0', color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
            Add each inflow and outflow term relevant to your system, over the same time interval and in the same volume unit.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <ListField label="Inflow amounts" values={inflowRows} onChange={(rows) => { setInflowRows(rows); setBudget(null); }} addLabel="Add inflow" placeholder="e.g. 1200" />
          <ListField label="Outflow amounts" values={outflowRows} onChange={(rows) => { setOutflowRows(rows); setBudget(null); }} addLabel="Add outflow" placeholder="e.g. 1000" />
          <TextField label="Shared volume unit" value={volumeUnit} onChange={(event) => { setVolumeUnit(event.target.value); setBudget(null); }} placeholder="e.g. m³" />
        </div>
        {budgetError && <StatusMessage tone="error">{budgetError}</StatusMessage>}
        {budget && (
          <ResultPanel style={{ lineHeight: 1.6 }}>
            Inflow total: <strong>{Number(budget.totalInflow.toPrecision(6))} {budget.volumeUnit}</strong> · Outflow total: <strong>{Number(budget.totalOutflow.toPrecision(6))} {budget.volumeUnit}</strong><br />
            Net budget change: <strong>{Number(budget.netChange.toPrecision(6))} {budget.volumeUnit}</strong> ({budget.interpretation})
          </ResultPanel>
        )}
        <Button type="submit" variant="primary" style={{ justifySelf: 'start' }}>Calculate budget balance</Button>
      </Card>
    </div>
  );
}
