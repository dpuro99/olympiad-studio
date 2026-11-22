import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  casesForLevel,
  gradeClassify,
  gradeOrder,
  prepareCase
} from './processPracticeUtils.js';
import {
  Button,
  Card,
  Collapsible,
  HelpText,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Stepper,
  ToolHeader
} from '../../general/ui/primitives';

const SOURCE = `${ACTIVE_SEASON.year} Division C Rules Manual, pp. C3–C5`;
const CASES = ACTIVE_DATA.anatomy.processCases;

const LEVELS = [
  { id: 'base', label: 'Regional / Invitational' },
  { id: 'state', label: 'State & National' },
  { id: 'national', label: 'National' }
];

const STEPS = [
  'Choose a level and one of the manual-listed process cases.',
  'Build the sequence or sort the terms. Your work updates as you go; nothing is graded until you check.',
  'Check to reveal the cited key and the short reason beside each item.'
];

const WORKFLOW = [
  { label: 'Choose a case' },
  { label: 'Order or sort' },
  { label: 'Check and review' }
];

const seededRandom = (text) => {
  let seed = text.split('').reduce((total, char) => total + char.charCodeAt(0), 1) >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

function OrderPanel({ prepared, order, onPick, onUndo }) {
  const byId = new Map(prepared.steps.map((step) => [step.id, step]));
  return (
    <Card style={{ display: 'grid', gap: 12 }}>
      <SectionHeading>Build the sequence</SectionHeading>
      <HelpText>Choose the steps in the order they occur. Already-chosen steps are removed from the list.</HelpText>
      <div role="group" aria-label="Available steps" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {prepared.displayIds.map((id) => {
          const step = byId.get(id);
          if (!step) return null;
          const used = order.includes(id);
          return (
            <Button
              key={id}
              aria-label={`Add ${step.label} to sequence`}
              disabled={used}
              onClick={() => onPick(id)}
              variant={used ? 'secondary' : 'primary'}
            >
              {step.label}
            </Button>
          );
        })}
      </div>
      <div>
        <HelpText>Your sequence ({order.length} of {prepared.steps.length})</HelpText>
        <ol style={{ margin: '8px 0 0', paddingLeft: 22, color: 'var(--color-text-primary)', fontSize: 13, lineHeight: 1.8 }}>
          {order.length === 0
            ? <li style={{ color: 'var(--color-text-tertiary)' }}>No steps chosen yet.</li>
            : order.map((id) => <li key={id}>{byId.get(id)?.label || id}</li>)}
        </ol>
      </div>
      <Button onClick={onUndo} disabled={order.length === 0}>Undo last step</Button>
    </Card>
  );
}

function ClassifyPanel({ prepared, assignments, onAssign }) {
  return (
    <Card style={{ display: 'grid', gap: 12 }}>
      <SectionHeading>Sort the terms</SectionHeading>
      <div style={{ display: 'grid', gap: 10 }}>
        {prepared.items.map((item) => (
          <div
            key={item.id}
            role="group"
            aria-label={`Group for ${item.label}`}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}
          >
            <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{item.label}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {prepared.groups.map((group) => (
                <Button
                  key={group.id}
                  aria-label={`${item.label}: ${group.label}`}
                  aria-pressed={assignments[item.id] === group.id}
                  variant={assignments[item.id] === group.id ? 'primary' : 'secondary'}
                  onClick={() => onAssign(item.id, group.id)}
                >
                  {group.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OrderResult({ prepared, result }) {
  const byId = new Map(prepared.steps.map((step) => [step.id, step]));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <caption style={{ textAlign: 'left', color: 'var(--color-text-tertiary)', fontSize: 12, paddingBottom: 6 }}>
        The manual's topic sequence beside your answer.
      </caption>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>#</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Correct step</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Your pick</th>
        </tr>
      </thead>
      <tbody>
        {result.rows.map((row) => (
          <tr key={row.id}>
            <td style={{ padding: '5px 8px' }}>{row.position}</td>
            <td style={{ padding: '5px 8px' }}>
              <strong>{row.label}</strong>
              {row.detail && <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{row.detail}</div>}
            </td>
            <td style={{ padding: '5px 8px', color: row.correct ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}>
              {row.chosenId ? (byId.get(row.chosenId)?.label || row.chosenId) : 'Not chosen'}{row.correct ? ' ✓' : ' ✕'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClassifyResult({ result }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <caption style={{ textAlign: 'left', color: 'var(--color-text-tertiary)', fontSize: 12, paddingBottom: 6 }}>
        Manual-listed terms with the group each belongs to.
      </caption>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Term</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Correct group</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)' }}>Your group</th>
        </tr>
      </thead>
      <tbody>
        {result.rows.map((row) => (
          <tr key={row.id}>
            <td style={{ padding: '5px 8px' }}>{row.label}</td>
            <td style={{ padding: '5px 8px' }}>{row.expectedGroupName}</td>
            <td style={{ padding: '5px 8px', color: row.correct ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}>
              {row.chosenGroupName}{row.correct ? ' ✓' : ' ✕'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ProcessPractice() {
  const baseCases = casesForLevel(CASES, 'base');
  const [level, setLevel] = useState('base');
  const [caseId, setCaseId] = useState(baseCases[0].id);
  const [order, setOrder] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [result, setResult] = useState(null);

  const visible = casesForLevel(CASES, level);
  const selected = visible.find((entry) => entry.id === caseId) || visible[0];
  // A fresh seeded generator each render keeps the display order stable
  // without a memo the React Compiler cannot preserve across derived arrays.
  const prepared = prepareCase(selected, seededRandom(selected.id));
  const total = prepared.kind === 'order' ? prepared.steps.length : prepared.items.length;
  const workCount = prepared.kind === 'order'
    ? order.length
    : Object.values(assignments).filter(Boolean).length;
  const currentStep = result ? 2 : workCount === total ? 1 : 0;

  const resetWork = () => {
    setOrder([]);
    setAssignments({});
    setResult(null);
  };

  const changeLevel = (next) => {
    setLevel(next);
    setCaseId(casesForLevel(CASES, next)[0].id);
    resetWork();
  };

  const changeCase = (next) => {
    setCaseId(next);
    resetWork();
  };

  const pickStep = (id) => {
    if (order.includes(id)) return;
    setOrder([...order, id]);
    setResult(null);
  };

  const assignGroup = (itemId, groupId) => {
    setAssignments({ ...assignments, [itemId]: groupId });
    setResult(null);
  };

  const checkWork = () => {
    setResult(prepared.kind === 'order' ? gradeOrder(prepared, order) : gradeClassify(prepared, assignments));
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ToolHeader
        purpose="Trace processes and sort terms using only the structures, processes and disorders named in the current manual. Build your answer live, then check it against a cited key."
        steps={STEPS}
        manualReference={SOURCE}
      >
        <StatusMessage>
          Practice only — every term comes from the manual's content outline. The ordering and grouping are study aids, not an official answer key.
        </StatusMessage>
      </ToolHeader>

      <Stepper steps={WORKFLOW} currentStep={currentStep} />

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Choose a case</SectionHeading>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <SelectField label="Level" value={level} onChange={(event) => changeLevel(event.target.value)}>
            {LEVELS.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
          </SelectField>
          <SelectField label="Case" value={selected.id} onChange={(event) => changeCase(event.target.value)}>
            {visible.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
          </SelectField>
        </div>
        <HelpText>{selected.prompt}</HelpText>
      </Card>

      {prepared.kind === 'order'
        ? <OrderPanel prepared={prepared} order={order} onPick={pickStep} onUndo={() => { setOrder(order.slice(0, -1)); setResult(null); }} />
        : <ClassifyPanel prepared={prepared} assignments={assignments} onAssign={assignGroup} />}

      <Card style={{ display: 'grid', gap: 10 }}>
        <StatusMessage>
          {prepared.kind === 'order'
            ? `${order.length} of ${total} steps placed.`
            : `${workCount} of ${total} terms sorted.`}
        </StatusMessage>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={checkWork} disabled={workCount === 0}>
            Check answers
          </Button>
          <Button onClick={resetWork} disabled={workCount === 0 && !result}>Start over</Button>
        </div>
      </Card>

      {result && (
        <Card style={{ display: 'grid', gap: 10 }}>
          <SectionHeading>Key and feedback</SectionHeading>
          <ResultPanel>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>
                {result.correctCount} of {result.total} correct
                {prepared.kind === 'classify' && result.answered < result.total
                  ? ` · ${result.total - result.answered} left unsorted`
                  : ''}
                {prepared.kind === 'order' && !result.complete ? ' · sequence incomplete' : ''}
              </div>
              {prepared.kind === 'order'
                ? <OrderResult prepared={prepared} result={result} />
                : <ClassifyResult result={result} />}
              <Collapsible summary="Manual scope and level note">
                <HelpText>
                  Terms and processes are limited to those the manual names in {selected.citation}. The sequence or
                  grouping follows the manual's own topic order and is a study aid, not text printed in the rules.
                </HelpText>
                <HelpText>
                  Regional/Invitational cases stay first. State/National additions (liver and pancreas cellular detail,
                  detailed immunoglobulin structure, transplantation) and National tumor immunology are level-gated cases,
                  not default practice. Source: {SOURCE}.
                </HelpText>
              </Collapsible>
            </div>
          </ResultPanel>
        </Card>
      )}
    </div>
  );
}
