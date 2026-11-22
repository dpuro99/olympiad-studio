import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  applicableChecks,
  createCheckState,
  summarizeChecklist,
  updateCheckState
} from './complianceUtils';
import {
  Button,
  Card,
  HelpText,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  TextField,
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

function CheckRow({ check, entry, onUpdate }) {
  return (
    <Card style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <SectionHeading>{check.label}</SectionHeading>
        <HelpText>{check.detail}</HelpText>
        <HelpText><strong>Manual:</strong> {check.citation} · <strong>Consequence:</strong> {check.consequence}</HelpText>
      </div>
      <div role="group" aria-label={`${check.label} status`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          aria-pressed={entry.status === 'ok'}
          onClick={() => onUpdate({ status: 'ok' })}
          style={{ ...choiceStyle, ...(entry.status === 'ok' ? selectedStyle : {}) }}
        >
          Compliant
        </button>
        <button
          type="button"
          aria-pressed={entry.status === 'fix'}
          onClick={() => onUpdate({ status: 'fix' })}
          style={{ ...choiceStyle, ...(entry.status === 'fix' ? selectedStyle : {}) }}
        >
          Needs work
        </button>
        <button
          type="button"
          aria-pressed={entry.status === 'unreviewed'}
          onClick={() => onUpdate({ status: 'unreviewed' })}
          style={{ ...choiceStyle, ...(entry.status === 'unreviewed' ? selectedStyle : {}) }}
        >
          Not reviewed
        </button>
      </div>
      <TextField
        label={`Note for ${check.label}`}
        value={entry.note}
        onChange={(event) => onUpdate({ note: event.target.value })}
        placeholder="What did you document or still need to change?"
      />
    </Card>
  );
}

export default function KitComplianceChecklist() {
  const ev = ACTIVE_DATA.electricvehicle;
  const [usesKit, setUsesKit] = useState(true);
  const [state, setState] = useState(() => createCheckState(ev.compliance.checks));
  const visible = applicableChecks(ev.compliance.checks, usesKit);
  const summary = summarizeChecklist(ev.compliance.checks, state, usesKit);
  const attentionLabels = summary.attention.map((id) => visible.find((check) => check.id === id)?.label).filter(Boolean);

  const reset = () => {
    if (!window.confirm('Reset every status and note in this self-check?')) return;
    setState(createCheckState(ev.compliance.checks));
    setUsesKit(true);
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow={`Electric Vehicle C · ${ACTIVE_SEASON.year} · Manual C27`}
        purpose="Review the kit-modification and program rules clause by clause, record what your team documented, and see which checks still need attention. Every result is a self-check — it is not an inspection ruling or an official score."
        manualReference={ev.manualReference}
        steps={[
          'Say whether your vehicle is built from a purchased or open-source kit; kit-only clauses hide when it is not.',
          'Mark each applicable clause compliant, needs work, or not reviewed, and note what was documented.',
          'Read the live summary and the linked official clarification before impound.'
        ]}
      >
        <StatusMessage>
          Self-check only. This tool cannot pre-judge an Event Supervisor inspection and assigns no points.
        </StatusMessage>
      </ToolHeader>

      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Scope</SectionHeading>
        <ToggleSwitch
          label="We used a purchased or open-source kit"
          checked={usesKit}
          onChange={(event) => setUsesKit(event.target.checked)}
          help="When off, §3.k kit clauses are excluded; the §3.l program rule still applies."
        />
        {!usesKit && <HelpText>Kit clauses are excluded from the counts. Turn the switch back on if any kit parts were used.</HelpText>}
      </Card>

      <ResultPanel>
        <strong>{summary.ok} of {summary.applicable} applicable checks marked compliant.</strong>
        <p style={{ margin: '8px 0 0' }}>
          {summary.ready
            ? 'Every applicable check is marked compliant with no flagged issues. This is still only your own review.'
            : `Still needs attention: ${attentionLabels.join('; ') || 'mark the remaining checks'}.`}
        </p>
        <HelpText>
          {summary.fix} flagged · {summary.unreviewed} not reviewed · {summary.withNotes} with notes. Nothing is stored or uploaded.
        </HelpText>
      </ResultPanel>

      <div style={{ display: 'grid', gap: 12 }}>
        {visible.map((check) => (
          <CheckRow
            key={check.id}
            check={check}
            entry={state[check.id] || { status: 'unreviewed', note: '' }}
            onUpdate={(patch) => setState((current) => updateCheckState(current, check.id, patch))}
          />
        ))}
      </div>

      <Card style={{ display: 'grid', gap: 8 }}>
        <SectionHeading>Official clarification</SectionHeading>
        <HelpText>{ev.compliance.clarification.text}</HelpText>
        <a href={ev.compliance.clarification.url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
          Read the official EV FAQ clarification
        </a>
        <HelpText>
          The FAQ is an official clarification, not text printed in the Rules Manual; check the linked page for the precise interpretation.
        </HelpText>
      </Card>

      <div>
        <Button variant="danger" onClick={reset}>Reset checklist</Button>
      </div>
    </div>
  );
}
