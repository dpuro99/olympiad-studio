import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  calculateDarcyFlow,
  calculateFloodRecurrence,
  calculateHydraulicGradient,
  calculateManningFlow,
  calculateResidenceTime,
  calculateSinuosity,
  formatMeasurement,
  fromSI,
  toSI,
  unitOptions
} from './freshwaterToolboxUtils';
import {
  Card,
  HelpText,
  MeasureField,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Tabs,
  ToolHeader
} from '../../general/ui/primitives';

const CALCULATORS = [
  { id: 'sinuosity', label: 'Sinuosity' },
  { id: 'gradient', label: 'Hydraulic gradient' },
  { id: 'darcy', label: 'Darcy flow' },
  { id: 'residence', label: 'Residence time' },
  { id: 'recurrence', label: 'Recurrence interval' },
  { id: 'manning', label: 'Manning flow' }
];

const LENGTH_UNITS = unitOptions('length');
const AREA_UNITS = unitOptions('area');
const VOLUME_UNITS = unitOptions('volume');
const TIME_UNITS = unitOptions('time');
const CONDUCTIVITY_UNITS = unitOptions('conductivity');

const PURPOSE = 'Compute the rest of Dynamic Planet’s quantitative freshwater relationships from your own measurements: channel sinuosity, hydraulic gradient, Darcy groundwater flow, reservoir residence time, flood recurrence, and Manning open-channel flow. Every result is driven entirely by the values you enter; nothing is preloaded, and results are practice, not official answers.';

const STEPS = [
  'Pick a calculator below.',
  'Enter the measurements you took and choose the unit you measured them in — the result updates as you type.',
  'Read the result, the equation it comes from, and the manual section that names the quantity.'
];

const bodyText = { margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 };
const captionText = { ...bodyText, fontSize: 10 };
const readoutLabel = { color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' };
const readoutValue = { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-primary)', overflowWrap: 'anywhere' };
const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 };
const svgStyle = { width: '100%', maxWidth: 380, height: 'auto', display: 'block' };
const citationStyle = { ...bodyText, borderTop: '1px solid var(--color-border-tertiary)', paddingTop: 8 };

const numeric = (raw) => {
  const text = String(raw ?? '').trim();
  if (text === '') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

function Readouts({ items }) {
  return (
    <ResultPanel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'grid', gap: 2, minWidth: 120 }}>
            <span style={readoutLabel}>{item.label}</span>
            <span style={readoutValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </ResultPanel>
  );
}

function Panel({ heading, intro, children, result, error, hint, equation, basis }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SectionHeading>{heading}</SectionHeading>
      <p style={bodyText}>{intro}</p>
      <div style={fieldGrid}>{children}</div>
      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {result}
      {!result && !error && hint && <HelpText>{hint}</HelpText>}
      <HelpText>{equation}</HelpText>
      <p style={citationStyle}>
        <strong>{basis.citation}</strong> — {basis.basis}
      </p>
    </div>
  );
}

function MeanderDiagram({ sinuosity }) {
  const amplitude = Math.max(0, Math.min(30, (sinuosity - 1) * 60));
  const points = [];
  for (let step = 0; step <= 80; step += 1) {
    const t = step / 80;
    points.push(`${(20 + t * 280).toFixed(1)},${(58 - amplitude * Math.sin(t * 4 * Math.PI)).toFixed(1)}`);
  }
  return (
    <div role="img" aria-label={`Schematic meander, not to scale: sinuosity ${formatMeasurement(sinuosity)}`}>
      <svg viewBox="0 0 320 116" aria-hidden="true" style={svgStyle}>
        <line x1="20" y1="58" x2="300" y2="58" stroke="var(--color-border-secondary)" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={`M${points.join(' L')}`} fill="none" stroke="var(--color-text-info)" strokeWidth="2.5" strokeLinejoin="round" />
        <text x="20" y="108" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">
          dashed: valley axis · solid: channel
        </text>
      </svg>
    </div>
  );
}

function GradientDiagram({ gradient }) {
  const drop = Math.max(0, Math.min(45, Math.abs(gradient) * 220));
  const leftLevel = 36;
  const rightLevel = leftLevel + drop;
  const flowsRight = gradient >= 0;
  return (
    <div
      role="img"
      aria-label={`Schematic well cross-section, not to scale: water-table change ${formatMeasurement(gradient)} metres per metre, ${gradient === 0 ? 'level' : flowsRight ? 'falling to the right' : 'falling to the left'}`}
    >
      <svg viewBox="0 0 320 116" aria-hidden="true" style={svgStyle}>
        <line x1="12" y1="98" x2="308" y2="98" stroke="var(--color-border-secondary)" strokeWidth="1.5" />
        <rect x="54" y="22" width="14" height="76" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" />
        <rect x="252" y="22" width="14" height="76" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" />
        <line x1="61" y1={leftLevel} x2="259" y2={rightLevel} stroke="var(--color-text-info)" strokeWidth="2" />
        <circle cx="61" cy={leftLevel} r="3" fill="var(--color-text-info)" />
        <circle cx="259" cy={rightLevel} r="3" fill="var(--color-text-info)" />
        <line
          x1={flowsRight ? 140 : 180}
          y1={(leftLevel + rightLevel) / 2}
          x2={flowsRight ? 176 : 144}
          y2={(leftLevel + rightLevel) / 2}
          stroke="var(--color-text-info)"
          strokeWidth="2"
          markerEnd="url(#fw-toolbox-arrow)"
        />
        <defs>
          <marker id="fw-toolbox-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-text-info)" />
          </marker>
        </defs>
        <text x="54" y="112" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">Δh</text>
        <text x="236" y="112" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">L</text>
      </svg>
    </div>
  );
}

function SinuosityPanel({ values, set, basis }) {
  const channelValue = numeric(values.channel);
  const valleyValue = numeric(values.valley);
  const channelM = channelValue === null ? null : toSI(channelValue, values.channelUnit, 'length');
  const valleyM = valleyValue === null ? null : toSI(valleyValue, values.valleyUnit, 'length');
  const result = channelM !== null && valleyM !== null
    ? calculateSinuosity({ channelLengthM: channelM, valleyLengthM: valleyM })
    : null;
  const error = result?.error ?? null;
  const ready = result && !result.error;

  return (
    <Panel
      heading="Channel sinuosity"
      intro="Sinuosity compares the distance water travels along the channel with the straight-line distance down the valley axis."
      error={error}
      hint="Enter the channel and valley-axis lengths to read the sinuosity."
      equation="S = channel (thalweg) length ÷ valley-axis length · bands: straight < 1.05, sinuous 1.05–1.5, meandering > 1.5"
      basis={basis}
      result={ready && (
        <>
          <Readouts items={[
            { label: 'Sinuosity', value: formatMeasurement(result.sinuosity) },
            { label: 'Channel pattern', value: result.classification },
            { label: 'Longer than the valley axis', value: `${formatMeasurement(result.percentLonger)}%` }
          ]} />
          <MeanderDiagram sinuosity={result.sinuosity} />
          {result.warning && <StatusMessage>{result.warning}</StatusMessage>}
        </>
      )}
    >
      <MeasureField
        label="Channel (thalweg) length"
        value={values.channel}
        onChange={set('channel')}
        unit={values.channelUnit}
        onUnitChange={set('channelUnit')}
        units={LENGTH_UNITS}
        min="0"
      />
      <MeasureField
        label="Valley-axis length"
        value={values.valley}
        onChange={set('valley')}
        unit={values.valleyUnit}
        onUnitChange={set('valleyUnit')}
        units={LENGTH_UNITS}
        min="0"
      />
    </Panel>
  );
}

function GradientPanel({ values, set, basis }) {
  const headValue = numeric(values.head);
  const pathValue = numeric(values.length);
  const headM = headValue === null ? null : toSI(headValue, values.headUnit, 'length');
  const pathM = pathValue === null ? null : toSI(pathValue, values.lengthUnit, 'length');
  const result = headM !== null && pathM !== null
    ? calculateHydraulicGradient({ headChangeM: headM, flowPathM: pathM })
    : null;
  const error = result?.error ?? null;
  const ready = result && !result.error;
  const direction = ready
    ? result.gradient > 0
      ? 'Head falls along the flow path, so groundwater flows the way the path was measured.'
      : result.gradient < 0
        ? 'Head rises along the path, so groundwater flows in the opposite direction to the path as measured.'
        : 'Head is level between the two points, so there is no gradient-driven flow.'
    : null;

  return (
    <Panel
      heading="Hydraulic gradient"
      intro="The hydraulic gradient is the head difference between two points divided by the distance between them. It drives groundwater flow."
      error={error}
      hint="Enter the head change and the flow-path length to read the gradient."
      equation="i = Δh ÷ L (dimensionless, m/m) · percent = i × 100"
      basis={basis}
      result={ready && (
        <>
          <Readouts items={[
            { label: 'Hydraulic gradient', value: `${formatMeasurement(result.gradient)} m/m` },
            { label: 'As a percentage', value: `${formatMeasurement(result.percent)}%` },
            { label: 'Flow direction', value: result.gradient === 0 ? 'Level' : result.gradient > 0 ? 'Along the path' : 'Against the path' }
          ]} />
          <GradientDiagram gradient={result.gradient} />
          <HelpText>{direction}</HelpText>
        </>
      )}
    >
      <MeasureField
        label="Head change Δh"
        value={values.head}
        onChange={set('head')}
        unit={values.headUnit}
        onUnitChange={set('headUnit')}
        units={LENGTH_UNITS}
        help="Water-table or potentiometric-head difference; enter it as a positive number when the head falls along the path."
      />
      <MeasureField
        label="Flow-path length L"
        value={values.length}
        onChange={set('length')}
        unit={values.lengthUnit}
        onUnitChange={set('lengthUnit')}
        units={LENGTH_UNITS}
        min="0"
      />
    </Panel>
  );
}

function DarcyPanel({ values, set, basis }) {
  const conductivity = numeric(values.k);
  const area = numeric(values.area);
  const head = numeric(values.head);
  const pathLength = numeric(values.length);
  const porosity = numeric(values.porosity);
  const ready = conductivity !== null && area !== null && head !== null && pathLength !== null;

  const result = ready
    ? calculateDarcyFlow({
      conductivityMps: toSI(conductivity, values.kUnit, 'conductivity'),
      areaM2: toSI(area, values.areaUnit, 'area'),
      headChangeM: toSI(head, values.headUnit, 'length'),
      flowPathM: toSI(pathLength, values.lengthUnit, 'length'),
      porosity: values.porosity.trim() === '' ? null : porosity
    })
    : null;
  const error = result?.error ?? null;
  const ok = result && !result.error;

  return (
    <Panel
      heading="Darcy groundwater flow"
      intro="Darcy’s law turns a hydraulic gradient and a conductivity into a specific discharge, and multiplying by the flow area gives the total discharge."
      error={error}
      hint="Enter conductivity, flow area, head change, and flow-path length to read the Darcy flux and discharge."
      equation="q = K · i,  Q = q · A,  v = q ÷ n (seepage velocity, when porosity is given)"
      basis={basis}
      result={ok && (
        <Readouts items={[
          { label: 'Hydraulic gradient', value: `${formatMeasurement(result.gradient)} m/m` },
          { label: 'Specific discharge q', value: `${formatMeasurement(result.specificDischargeMps)} m/s` },
          { label: 'Total discharge Q (per second)', value: `${formatMeasurement(result.dischargeM3PerSec)} m³/s` },
          { label: 'Total discharge Q (per day)', value: `${formatMeasurement(result.dischargeM3PerSec * 86400)} m³/day` },
          ...(result.seepageVelocityMps === null
            ? []
            : [{ label: 'Seepage velocity v', value: `${formatMeasurement(result.seepageVelocityMps)} m/s` }])
        ]} />
      )}
    >
      <MeasureField
        label="Hydraulic conductivity K"
        value={values.k}
        onChange={set('k')}
        unit={values.kUnit}
        onUnitChange={set('kUnit')}
        units={CONDUCTIVITY_UNITS}
        min="0"
      />
      <MeasureField
        label="Flow cross-sectional area A"
        value={values.area}
        onChange={set('area')}
        unit={values.areaUnit}
        onUnitChange={set('areaUnit')}
        units={AREA_UNITS}
        min="0"
      />
      <MeasureField
        label="Head change Δh"
        value={values.head}
        onChange={set('head')}
        unit={values.headUnit}
        onUnitChange={set('headUnit')}
        units={LENGTH_UNITS}
      />
      <MeasureField
        label="Flow-path length L"
        value={values.length}
        onChange={set('length')}
        unit={values.lengthUnit}
        onUnitChange={set('lengthUnit')}
        units={LENGTH_UNITS}
        min="0"
      />
      <NumberField
        label="Effective porosity n (optional)"
        value={values.porosity}
        onChange={set('porosity')}
        help="A fraction, not a percentage (0.25 = 25%). Leave blank to skip the seepage velocity."
      />
    </Panel>
  );
}

function ResidencePanel({ values, set, basis }) {
  const storage = numeric(values.storage);
  const throughput = numeric(values.throughput);
  const ready = storage !== null && throughput !== null;
  const result = ready
    ? calculateResidenceTime({
      storageM3: toSI(storage, values.storageUnit, 'volume'),
      throughputM3PerSec: toSI(throughput, values.throughputUnit, 'volume') / toSI(1, values.per, 'time')
    })
    : null;
  const error = result?.error ?? null;
  const ok = result && !result.error;

  return (
    <Panel
      heading="Reservoir residence time"
      intro="Residence time is how long, on average, water stays in a reservoir before it leaves. Divide the water stored by the rate at which water passes through."
      error={error}
      hint="Enter the stored volume and the throughput rate to read the residence time."
      equation="τ = storage volume ÷ throughput (volume per unit time)"
      basis={basis}
      result={ok && (
        <Readouts items={[
          { label: `Residence time (${values.show})`, value: `${formatMeasurement(fromSI(result.seconds, values.show, 'time'))} ${values.show}` },
          // The chosen display unit already shows days when it is the one selected,
          // so only add the alternative scales that are not already on screen.
          ...(values.show === 'day' ? [] : [{ label: 'In days', value: `${formatMeasurement(result.days)} day` }]),
          ...(values.show === 'yr' ? [] : [{ label: 'In years', value: `${formatMeasurement(result.years)} yr` }])
        ]} />
      )}
    >
      <MeasureField
        label="Stored volume"
        value={values.storage}
        onChange={set('storage')}
        unit={values.storageUnit}
        onUnitChange={set('storageUnit')}
        units={VOLUME_UNITS}
        min="0"
      />
      <MeasureField
        label="Throughput"
        value={values.throughput}
        onChange={set('throughput')}
        unit={values.throughputUnit}
        onUnitChange={set('throughputUnit')}
        units={VOLUME_UNITS}
        min="0"
      />
      <SelectField label="Throughput time base" value={values.per} onChange={set('per')}>
        {TIME_UNITS.map((unit) => <option key={unit} value={unit}>per {unit}</option>)}
      </SelectField>
      <SelectField label="Show the residence time in" value={values.show} onChange={set('show')}>
        {TIME_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
      </SelectField>
    </Panel>
  );
}

function RecurrencePanel({ values, set, basis }) {
  const percent = numeric(values.probability);
  const years = numeric(values.years);
  const ready = percent !== null && years !== null;
  const result = ready
    ? calculateFloodRecurrence({ annualExceedanceProbability: percent / 100, periodYears: years })
    : null;
  const error = result?.error ?? null;
  const ok = result && !result.error;

  return (
    <Panel
      heading="Flood recurrence interval"
      intro="A recurrence interval is the average time between floods of a given size. It is the reciprocal of the annual chance of that flood being equalled or exceeded."
      error={error}
      hint="Enter the annual exceedance probability to read the return period, and a period of interest for the chance of at least one such flood."
      equation="T = 1 ÷ P,  P(at least once in n years) = 1 − (1 − P)ⁿ"
      basis={basis}
      result={ok && (
        <Readouts items={[
          { label: 'Return period T', value: `${formatMeasurement(result.returnPeriodYears)} yr` },
          { label: `Chance in ${formatMeasurement(result.periodYears)} yr`, value: `${formatMeasurement(result.chanceAtLeastOncePercent)}%` },
          { label: 'Annual exceedance probability', value: `${formatMeasurement(result.annualExceedanceProbability * 100)}%` }
        ]} />
      )}
    >
      <NumberField
        label="Annual exceedance probability"
        unit="%"
        value={values.probability}
        onChange={set('probability')}
        help="The chance of a flood of this size or larger in any one year, in percent."
      />
      <NumberField
        label="Period of interest"
        unit="yr"
        value={values.years}
        onChange={set('years')}
        help="How many years ahead to report the chance of at least one exceedance."
      />
    </Panel>
  );
}

function ManningPanel({ values, set, basis }) {
  const area = numeric(values.area);
  const perimeter = numeric(values.perimeter);
  const slope = numeric(values.slope);
  const roughness = numeric(values.roughness);
  const ready = area !== null && perimeter !== null && slope !== null && roughness !== null;
  const result = ready
    ? calculateManningFlow({
      areaM2: toSI(area, values.areaUnit, 'area'),
      wettedPerimeterM: toSI(perimeter, values.perimeterUnit, 'length'),
      slope,
      roughnessN: roughness
    })
    : null;
  const error = result?.error ?? null;
  const ok = result && !result.error;

  return (
    <Panel
      heading="Manning open-channel flow"
      intro="Manning’s equation estimates average velocity in an open channel from its shape, slope, and roughness, and multiplying by the cross-sectional area gives discharge."
      error={error}
      hint="Enter flow area, wetted perimeter, channel slope, and Manning roughness to read the velocity and discharge."
      equation="R = A ÷ P,  v = (1/n) · R^(2/3) · S^(1/2),  Q = A · v"
      basis={basis}
      result={ok && (
        <Readouts items={[
          { label: 'Hydraulic radius R', value: `${formatMeasurement(result.hydraulicRadiusM)} m` },
          { label: 'Average velocity v', value: `${formatMeasurement(result.velocityMps)} m/s` },
          { label: 'Discharge Q', value: `${formatMeasurement(result.dischargeM3PerSec)} m³/s` }
        ]} />
      )}
    >
      <MeasureField
        label="Flow cross-sectional area A"
        value={values.area}
        onChange={set('area')}
        unit={values.areaUnit}
        onUnitChange={set('areaUnit')}
        units={AREA_UNITS}
        min="0"
      />
      <MeasureField
        label="Wetted perimeter P"
        value={values.perimeter}
        onChange={set('perimeter')}
        unit={values.perimeterUnit}
        onUnitChange={set('perimeterUnit')}
        units={LENGTH_UNITS}
        min="0"
      />
      <NumberField
        label="Channel slope S"
        unit="m/m"
        value={values.slope}
        onChange={set('slope')}
        help="Rise over run along the channel: 0.001 means 1 m of fall per kilometre."
      />
      <NumberField
        label="Manning roughness n"
        value={values.roughness}
        onChange={set('roughness')}
        help="A clean straight channel is about 0.03; a natural stream with stones and weeds is about 0.03–0.05. Use the value your problem gives."
      />
    </Panel>
  );
}

export default function FreshwaterToolbox() {
  const [mode, setMode] = useState('sinuosity');
  const [values, setValues] = useState({
    sinuosity: { channel: '', channelUnit: 'km', valley: '', valleyUnit: 'km' },
    gradient: { head: '', headUnit: 'm', length: '', lengthUnit: 'm' },
    darcy: { k: '', kUnit: 'm/day', area: '', areaUnit: 'm²', head: '', headUnit: 'm', length: '', lengthUnit: 'm', porosity: '' },
    residence: { storage: '', storageUnit: 'm³', throughput: '', throughputUnit: 'm³', per: 's', show: 'day' },
    recurrence: { probability: '', years: '10' },
    manning: { area: '', areaUnit: 'm²', perimeter: '', perimeterUnit: 'm', slope: '', roughness: '' }
  });

  const set = (section) => (key) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({ ...previous, [section]: { ...previous[section], [key]: value } }));
  };

  const toolbox = ACTIVE_DATA.dynamicplanet.toolbox;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 860 }}>
      <ToolHeader
        eyebrow={`Dynamic Planet C · ${ACTIVE_SEASON.year} · Manual C24–C25`}
        purpose={PURPOSE}
        steps={STEPS}
        manualReference={ACTIVE_DATA.dynamicplanet.manualReference}
      >
        <p style={captionText}>
          Results are for learning and are labeled as practice; they are not an official competition score.
        </p>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 12 }}>
        <Tabs tabs={CALCULATORS} active={mode} onChange={setMode} ariaLabel="Freshwater calculators" />
        {mode === 'sinuosity' && <SinuosityPanel values={values.sinuosity} set={set('sinuosity')} basis={toolbox.sinuosity} />}
        {mode === 'gradient' && <GradientPanel values={values.gradient} set={set('gradient')} basis={toolbox.hydraulicGradient} />}
        {mode === 'darcy' && <DarcyPanel values={values.darcy} set={set('darcy')} basis={toolbox.darcyFlow} />}
        {mode === 'residence' && <ResidencePanel values={values.residence} set={set('residence')} basis={toolbox.residenceTime} />}
        {mode === 'recurrence' && <RecurrencePanel values={values.recurrence} set={set('recurrence')} basis={toolbox.recurrenceInterval} />}
        {mode === 'manning' && <ManningPanel values={values.manning} set={set('manning')} basis={toolbox.manningFlow} />}
        <p style={captionText}>
          Unit conversions use exact SI definitions; a year is the Julian year (365.25 days).
        </p>
      </Card>
    </div>
  );
}
