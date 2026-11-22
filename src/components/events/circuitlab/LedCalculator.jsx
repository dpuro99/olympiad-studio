import { useMemo, useState } from 'react';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  LED_VF_PRESETS,
  calculateLedSeries,
  checkForwardDrop,
  checkOrientation
} from './ledUtils.js';
import {
  Card,
  Collapsible,
  HelpText,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Stepper,
  ToolHeader
} from '../../general/ui/primitives';

const SOURCE = `${ACTIVE_SEASON.year} Division C Rules Manual, pp. C16–C17`;
const DEFAULT_PRESET = 'red';

const WORKFLOW = [
  { label: 'Set the circuit' },
  { label: 'Check assumptions' },
  { label: 'Read the result' }
];

const STEPS = [
  'Pick an LED colour to load a typical forward drop, then enter the supply voltage and target current. Overwrite the forward voltage if your device datasheet says otherwise.',
  'Choose the device orientation and check the forward-drop note. Reverse-biased devices block current in the ideal model.',
  'Read the required series resistor and its dissipation. Everything updates as you type — there is no Calculate button.'
];

const ASSUMPTION_NOTE =
  'Practice calculator — not an official event score. Forward-voltage presets and the E12 series are standard teaching assumptions, not values printed in the rules manual.';
const LEVEL_NOTE =
  'Silicon PN-junction devices including diodes and LEDs are in the Regional written scope. Transistor bias/gain, simple transistor logic and ideal op-amps are State/National extensions and are not modelled here. Unlisted nonlinear devices, AC theory and capacitance are excluded.';

const radioStyle = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
  color: 'var(--color-text-secondary)', cursor: 'pointer'
};

function CircuitSchematic({ supply, vf, resistance, orientation, conducting }) {
  const wire = 'var(--color-text-tertiary)';
  const live = conducting ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)';
  return (
    <svg
      viewBox="0 0 480 150"
      style={{ width: '100%', height: 'auto', maxWidth: 520 }}
      role="img"
      aria-label={`Series circuit: a ${supply} volt supply driving a ${resistance || '?'} ohm resistor and a ${orientation === 'reverse' ? 'reverse-biased' : 'forward-biased'} LED with a ${vf} volt forward drop.`}
    >
      {/* return wire and supply */}
      <path d="M 44 52 L 44 78" stroke={wire} strokeWidth={2} fill="none" />
      <path d="M 56 52 L 56 78" stroke={wire} strokeWidth={2} fill="none" />
      <path d="M 44 118 L 44 78" stroke={wire} strokeWidth={2} fill="none" />
      <path d="M 56 118 L 430 118 L 430 52" stroke={wire} strokeWidth={2} fill="none" />
      <path d="M 44 52 L 120 52" stroke={live} strokeWidth={2} fill="none" />
      {/* battery plates: long = positive rail */}
      <path d="M 32 65 L 68 65" stroke={wire} strokeWidth={3} fill="none" />
      <path d="M 40 76 L 60 76" stroke={wire} strokeWidth={3} fill="none" />
      <text x="50" y="100" fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle">+</text>
      <text x="50" y="140" fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle">{supply} V supply</text>
      {/* resistor zig-zag */}
      <path
        d="M 120 52 L 132 52 L 140 42 L 152 62 L 164 42 L 176 62 L 188 42 L 200 62 L 208 52 L 220 52"
        stroke={live} strokeWidth={2} fill="none" strokeLinejoin="round"
      />
      <text x="170" y="28" fontSize={11} fill="var(--color-text-secondary)" textAnchor="middle">R = {resistance ?? '—'} Ω</text>
      {/* diode / LED: triangle + bar, emission arrows when forward biased */}
      <path d="M 320 40 L 320 64 L 344 52 Z" fill={conducting ? live : 'none'} stroke={live} strokeWidth={2} />
      <path d="M 348 38 L 348 66" stroke={live} strokeWidth={3} fill="none" />
      <path d="M 220 52 L 320 52" stroke={live} strokeWidth={2} fill="none" />
      <path d="M 352 52 L 430 52" stroke={live} strokeWidth={2} fill="none" />
      {conducting && (
        <g stroke={live} strokeWidth={1.5} fill="none">
          <path d="M 356 34 L 366 24 M 362 36 L 372 26" />
          <path d="M 356 70 L 366 80 M 362 68 L 372 78" />
        </g>
      )}
      <text x="336" y="100" fontSize={11} fill="var(--color-text-secondary)" textAnchor="middle">LED · Vf {vf} V</text>
      <text x="336" y="138" fontSize={11} fill="var(--color-text-tertiary)" textAnchor="middle">
        {orientation === 'reverse' ? 'reverse biased — blocks' : 'forward biased'}
      </text>
    </svg>
  );
}

export default function LedCalculator() {
  const [supplyVoltage, setSupplyVoltage] = useState('9');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET);
  const [forwardVoltage, setForwardVoltage] = useState(
    String(LED_VF_PRESETS.find((preset) => preset.id === DEFAULT_PRESET).vf)
  );
  const [targetCurrentMa, setTargetCurrentMa] = useState('20');
  const [orientation, setOrientation] = useState('forward');

  const circuit = useMemo(
    () => calculateLedSeries({ supplyVoltage, forwardVoltage, targetCurrentMa }),
    [supplyVoltage, forwardVoltage, targetCurrentMa]
  );
  const orientationCheck = useMemo(
    () => checkOrientation(orientation, circuit),
    [orientation, circuit]
  );
  const dropCheck = useMemo(
    () => checkForwardDrop(presetId, forwardVoltage),
    [presetId, forwardVoltage]
  );

  const allFilled = supplyVoltage.trim() !== '' && forwardVoltage.trim() !== '' && targetCurrentMa.trim() !== '';
  const currentStep = !allFilled ? 0 : circuit.error ? 1 : 2;

  const choosePreset = (id) => {
    setPresetId(id);
    const preset = LED_VF_PRESETS.find((entry) => entry.id === id);
    if (preset) setForwardVoltage(String(preset.vf));
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ToolHeader
        purpose="Size a series resistor for a single LED from a DC supply, then check the device orientation and your forward-drop assumption. The schematic, resistor and power figures update as you type."
        steps={STEPS}
        manualReference={SOURCE}
      >
        <StatusMessage>{ASSUMPTION_NOTE}</StatusMessage>
      </ToolHeader>

      <Stepper steps={WORKFLOW} currentStep={currentStep} />

      <Card style={{ display: 'grid', gap: 14 }}>
        <SectionHeading>Set the circuit</SectionHeading>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <SelectField
            label="LED colour (typical Vf)"
            value={presetId}
            onChange={(event) => choosePreset(event.target.value)}
            help="Loads a typical forward drop; overwrite it with a datasheet value if you have one."
          >
            {LED_VF_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>{preset.label} · {preset.vf} V</option>
            ))}
          </SelectField>
          <NumberField
            label="Supply voltage"
            unit="V"
            value={supplyVoltage}
            onChange={(event) => setSupplyVoltage(event.target.value)}
          />
          <NumberField
            label="LED forward voltage"
            unit="V"
            value={forwardVoltage}
            onChange={(event) => setForwardVoltage(event.target.value)}
          />
          <NumberField
            label="Target current"
            unit="mA"
            value={targetCurrentMa}
            onChange={(event) => setTargetCurrentMa(event.target.value)}
            help="A common indicator range is roughly 10–20 mA."
          />
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          <legend style={{ color: 'var(--color-text-secondary)', fontSize: 12, padding: 0, fontWeight: 500 }}>
            Device orientation
          </legend>
          <div role="radiogroup" aria-label="Device orientation" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={radioStyle}>
              <input
                type="radio" name="led-orientation" value="forward"
                checked={orientation === 'forward'}
                onChange={(event) => setOrientation(event.target.value)}
              />
              Forward biased (anode to +)
            </label>
            <label style={radioStyle}>
              <input
                type="radio" name="led-orientation" value="reverse"
                checked={orientation === 'reverse'}
                onChange={(event) => setOrientation(event.target.value)}
              />
              Reverse biased (cathode to +)
            </label>
          </div>
        </fieldset>

        {dropCheck && (
          <StatusMessage tone={dropCheck.tone === 'warn' ? 'error' : 'success'}>{dropCheck.message}</StatusMessage>
        )}
      </Card>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Series circuit</SectionHeading>
        <CircuitSchematic
          supply={circuit.supply ?? supplyVoltage}
          vf={circuit.vf ?? forwardVoltage}
          resistance={circuit.resistance}
          orientation={orientation}
          conducting={orientationCheck.state === 'conducts'}
        />
        <StatusMessage tone={orientationCheck.state === 'blocked' ? 'error' : 'status'}>
          {orientationCheck.message}
        </StatusMessage>
      </Card>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Your result</SectionHeading>
        {circuit.error ? (
          <HelpText>{circuit.error}</HelpText>
        ) : (
          <ResultPanel>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15 }}>
                R = {circuit.resistance} Ω
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {' '}({circuit.equations.resistance})
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                Resistor dissipation = {circuit.resistorPower} W
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {' '}→ choose at least {circuit.recommendedRatingW ?? 'a suitably large'} W rating (2× margin, common practice — not an event rule)
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 4 }}>
                <caption style={{ textAlign: 'left', color: 'var(--color-text-tertiary)', fontSize: 12, paddingBottom: 6 }}>
                  Ideal-model breakdown at the target current. Values shown with the standard E12 resistor as well.
                </caption>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Quantity</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>At target current</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>With {circuit.standard.value} Ω</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 8px' }}>Current</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.currentMa} mA</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.actualCurrentMa} mA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px' }}>Resistor power</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.resistorPower} W</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.actualResistorPower} W</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px' }}>LED power</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.ledPower} W</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--color-text-tertiary)' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px' }}>Supply power</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{circuit.supplyPower} W</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'var(--color-text-tertiary)' }}>—</td>
                  </tr>
                </tbody>
              </table>
              <Collapsible summary="Equations, assumptions and level note">
                <HelpText>
                  R = (V<sub>supply</sub> − V<sub>f</sub>) ÷ I. Resistor power P = I² × R = (V<sub>supply</sub> − V<sub>f</sub>) × I.{' '}
                  {circuit.equations.power}. Supply power equals LED power plus resistor power in this ideal model.
                </HelpText>
                <HelpText>{LEVEL_NOTE} Source: {SOURCE}.</HelpText>
                <HelpText>
                  The forward-drop presets, the E12 resistor series and the 2× power margin are standard teaching
                  assumptions, not official values or rules printed in the manual.
                </HelpText>
              </Collapsible>
            </div>
          </ResultPanel>
        )}
      </Card>
    </div>
  );
}
