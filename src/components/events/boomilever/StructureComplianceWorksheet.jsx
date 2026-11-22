import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  createEmptyWorksheet,
  evaluateWorksheet,
  setCheckValue,
  setField
} from './complianceUtils';
import {
  Button,
  Card,
  HelpText,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  ToggleSwitch,
  ToolHeader
} from '../../general/ui/primitives';

const choiceStyle = {
  padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13,
  border: '1px solid var(--color-border-secondary)',
  background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)'
};
const selectedStyle = {
  border: '1px solid var(--color-accent-primary)', background: 'var(--color-background-info)', fontWeight: 600
};
const verdictStyle = {
  pass: { color: 'var(--color-text-success)', fontWeight: 700 },
  fail: { color: 'var(--color-text-danger)', fontWeight: 700 },
  unset: { color: 'var(--color-text-tertiary)', fontWeight: 600 }
};
const verdictText = { pass: 'In range', fail: 'Out of range', unset: 'Not measured' };

const CHOICES = [
  { value: true, label: 'Meets rule' },
  { value: false, label: 'Needs work' },
  { value: null, label: 'Not checked' }
];

function Verdict({ status, text }) {
  return <span style={verdictStyle[status]}>{text || verdictText[status]}</span>;
}

function NumericRow({ rule, rawValue, onChange }) {
  const isDepth = rule.id === 'contactDepth';
  return (
    <Card style={{ display: 'grid', gap: 8 }}>
      <NumberField
        label={rule.label}
        unit={rule.unit}
        value={rawValue}
        onChange={(event) => onChange(rule.id, event.target.value)}
      />
      <HelpText>{rule.detail}</HelpText>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
        <strong style={{ fontSize: 13 }}>{isDepth ? 'Contact depth' : 'Live check'}:</strong>
        {isDepth
          ? <span style={verdictStyle[rule.status]}>{rule.status === 'unset' ? 'Not measured' : 'Recorded'}</span>
          : <Verdict status={rule.status} />}
        {isDepth && <HelpText>The contact-depth consequence is shown in the panel above.</HelpText>}
      </div>
      <HelpText><strong>Manual:</strong> {rule.citation}</HelpText>
    </Card>
  );
}

function CheckRow({ check, value, onUpdate }) {
  const status = value === true ? 'pass' : value === false ? 'fail' : 'unset';
  return (
    <Card style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <SectionHeading>{check.label}</SectionHeading>
        <HelpText>{check.detail}</HelpText>
        <HelpText><strong>Manual:</strong> {check.citation}</HelpText>
      </div>
      <div role="group" aria-label={`${check.label} status`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CHOICES.map((choice) => (
          <button
            key={choice.label}
            type="button"
            aria-pressed={status === (choice.value === true ? 'pass' : choice.value === false ? 'fail' : 'unset')}
            onClick={() => onUpdate(choice.value)}
            style={{ ...choiceStyle, ...(status === (choice.value === true ? 'pass' : choice.value === false ? 'fail' : 'unset') ? selectedStyle : {}) }}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function StructureComplianceWorksheet() {
  const boom = ACTIVE_DATA.boomilever;
  const rules = boom.compliance;
  const [sheet, setSheet] = useState(() => createEmptyWorksheet());
  const result = evaluateWorksheet(sheet, rules);

  const reset = () => {
    if (!window.confirm('Reset every measurement and check in this worksheet?')) return;
    setSheet(createEmptyWorksheet());
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow={`Boomilever C · ${ACTIVE_SEASON.year} · Manual C8`}
        purpose="Measure the geometry the manual specifies and confirm each construction rule against your built structure. Every result is a self-check for your own prep — it is not an Event Supervisor inspection and assigns no tier or score."
        manualReference={boom.manualReference}
        steps={[
          'Choose the base option you plan to claim: the 15 cm standard boundary or the 10 cm bonus boundary.',
          'Enter the three measured values; the geometry checks and the contact-depth consequence update live.',
          'Confirm each construction rule with Meets rule / Needs work / Not checked, then read the summary before your meet.'
        ]}
      >
        <StatusMessage>
          Self-check only. This worksheet cannot pre-judge an inspection and does not assign an official tier, bonus or score.
        </StatusMessage>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Base option</SectionHeading>
        <SelectField
          label="Base option"
          value={sheet.baseOption}
          onChange={(event) => setSheet((current) => setField(current, 'baseOption', event.target.value))}
          help="The 15 cm boundary is the standard rule. The 10 cm bonus option also requires holding 15 kg."
        >
          {boom.baseOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </SelectField>
        <HelpText>{rules.consequences.holdKg}</HelpText>
      </Card>

      <ResultPanel>
        <strong>{result.summary.pass} of {result.summary.total} checkable items pass.</strong>
        <p style={{ margin: '8px 0 0' }}>
          {result.summary.ready
            ? 'Every checkable item is recorded as in range or meeting the rule. This is still only your own review.'
            : result.summary.attention.length
              ? `Still needs attention: ${result.summary.attention.join('; ')}.`
              : 'Enter the measurements and confirm the build rules to complete the check.'}
        </p>
        <HelpText>
          {result.summary.fail} out of range · {result.summary.unset} not checked · nothing is stored or uploaded.
        </HelpText>
      </ResultPanel>

      <ResultPanel>
        <strong>Contact depth → {result.tier.label}</strong>
        <p style={{ margin: '8px 0 0' }}>{result.tier.detail}</p>
        {result.bonus && (
          <>
            <p style={{ margin: '8px 0 0' }}><strong>Bonus option → {result.bonus.label}</strong></p>
            <p style={{ margin: '4px 0 0' }}>{result.bonus.detail}</p>
            <div style={{ marginTop: 8 }}>
              <ToggleSwitch
                label="15 kg was held"
                checked={sheet.holds15kg === true}
                onChange={(event) => setSheet((current) => setField(current, 'holds15kg', event.target.checked))}
                help="§3.i.ii — the Load Scored Bonus requires holding 15 kg; not holding it is not a construction violation."
              />
            </div>
          </>
        )}
      </ResultPanel>

      <section style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Measured geometry</SectionHeading>
        {result.numeric.map((rule) => (
          <NumericRow
            key={rule.id}
            rule={rule}
            rawValue={sheet[`${rule.id}Cm`]}
            onChange={(id, value) => setSheet((current) => setField(current, `${id}Cm`, value))}
          />
        ))}
        <HelpText>Depth is measured from the horizontal plane through the Mounting Bolt centerline; the manual’s 15 cm and 10 cm lines are drawn below it (§6.b.iii).</HelpText>
      </section>

      <section style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Build rules</SectionHeading>
        {result.checks.map((check) => (
          <CheckRow
            key={check.id}
            check={check}
            value={sheet.checks[check.id]}
            onUpdate={(value) => setSheet((current) => setCheckValue(current, check.id, value))}
          />
        ))}
      </section>

      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>Official clarifications</SectionHeading>
        <HelpText>Check the official event FAQ for published clarifications before you build; the worksheet paraphrases no FAQ answer.</HelpText>
        <a href={rules.faq.url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{rules.faq.label}</a>
      </Card>

      <div>
        <Button variant="danger" onClick={reset}>Reset worksheet</Button>
      </div>
    </div>
  );
}
