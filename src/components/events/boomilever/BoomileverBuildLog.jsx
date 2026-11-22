import { useEffect, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import { fileStem } from '../../../seasons/storageKeys.js';
import {
  BASE_OPTIONS,
  STORAGE_KEY,
  TIERS,
  baseOptionLabel,
  buildBuildLogCsv,
  createEmptyEntry,
  safeParseEntries,
  summarizeEntry
} from './buildLogUtils';
import {
  Button,
  Card,
  CheckboxField,
  Collapsible,
  EmptyState,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Stepper,
  TextAreaField,
  TextField,
  ToolHeader
} from '../../general/ui/primitives';

const WORKFLOW = [
  { label: 'Weigh the build' },
  { label: 'Record the test' },
  { label: 'Save & compare' }
];

function efficiencyText(summary) {
  if (!summary.tested) return 'not yet tested';
  if (!summary.scored) return 'needs structure mass';
  return `${Number(summary.score.toFixed(4))}`;
}

export default function BoomileverBuildLog() {
  const [form, setForm] = useState(createEmptyEntry);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = safeParseEntries(stored);
          if (parsed.error) {
            if (!cancelled) {
              setMessage(parsed.error);
              setMessageIsError(true);
            }
          } else if (!cancelled) {
            setEntries(parsed.value);
            setMessage('Build log loaded from this browser.');
          }
        }
      } catch {
        if (!cancelled) {
          setMessage('Local storage unavailable; you can still export the build log as CSV.');
          setMessageIsError(true);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setMessage('');
    setMessageIsError(false);
  };

  const mass = Number(form.structureMassGrams);
  const hasMass = form.structureMassGrams !== '' && Number.isFinite(mass) && mass > 0;
  const previewSummary = summarizeEntry(form);

  const saveEntry = (event) => {
    event.preventDefault();
    if (!hasMass) {
      setMessage('Enter a positive structure mass (g) before saving.');
      setMessageIsError(true);
      return;
    }
    const updated = [form, ...entries];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEntries(updated);
      setForm(createEmptyEntry());
      setMessage('Build saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Export the build log as CSV instead.');
      setMessageIsError(true);
    }
  };

  const removeEntry = (index) => {
    const updated = entries.filter((_, entryIndex) => entryIndex !== index);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEntries(updated);
    } catch {
      setMessage('Could not update the saved build log.');
      setMessageIsError(true);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([buildBuildLogCsv(entries)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileStem('boomilever', 'build-log')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Build log exported as CSV. The file contains only your entered measurements.');
    setMessageIsError(false);
  };

  const clearLog = () => {
    if (!window.confirm('Clear all saved builds in this browser?')) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setEntries([]);
      setMessage('Build log cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear the saved build log.');
      setMessageIsError(true);
    }
  };

  const summaries = entries.map(summarizeEntry);
  const bestScore = summaries.reduce((best, summary) => (summary.scored && (best === null || summary.score > best) ? summary.score : best), null);
  const currentStep = !hasMass ? 0 : (previewSummary.tested ? 2 : 1);
  const recentEntries = entries.slice(0, 2);
  const olderEntries = entries.slice(2);

  const entryCard = (entry, index, summary) => {
    const isBest = summary.scored && bestScore !== null && summary.score === bestScore;
    return (
      <article key={index} style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <div>
            <strong>{entry.label || 'Prototype'}</strong>
            {isBest && <span style={{ marginLeft: 8, color: 'var(--color-text-success)', fontSize: 11, fontWeight: 600 }}>Best efficiency</span>}
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 3 }}>{baseOptionLabel(entry.baseOption)}</div>
          </div>
          <strong style={{ fontFamily: 'var(--font-mono)' }}>{efficiencyText(summary)}</strong>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <span>mass {entry.structureMassGrams || '—'} g</span>
          <span>load {summary.tested ? `${entry.loadSupportedGrams} g` : '—'}</span>
          <span>{ACTIVE_DATA.boomilever.bonusHoldsKg} kg {summary.tested ? (entry.holds15Kg ? 'held' : 'no') : '—'}</span>
          <span>{summary.tested ? entry.tier : 'untested'}</span>
        </div>
        {entry.memberDescription && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>Members: {entry.memberDescription}</div>}
        {entry.failureMode && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Failure: {entry.failureMode}</div>}
        {entry.changes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{entry.changes}</p>}
        <Button
          variant="danger"
          onClick={() => { if (window.confirm('Delete this locally saved build?')) removeEntry(index); }}
          style={{ marginTop: 8, padding: '4px 8px', fontSize: 11 }}
        >
          Delete
        </Button>
      </article>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <ToolHeader
        eyebrow={`Boomilever C · ${ACTIVE_SEASON.year} · Manual C7–C12 · saved in this browser`}
        purpose={`Log each prototype you build and test so designs can be compared across iterations. Records stay in this browser and are not uploaded. Efficiency follows the verified formula (Load Scored ÷ Structure Mass with the optional ${ACTIVE_DATA.boomilever.loadScoredBonusGrams.toLocaleString('en-US')} g bonus); it is a practice record, not an Event Supervisor ruling.`}
        manualReference={`${ACTIVE_SEASON.year} Division C Rules Manual, pp. C7–C12`}
        steps={[
          'Weigh the structure and give the prototype a short label.',
          'After testing, record the load held, the tier, and whether the bonus mass condition was met.',
          'Save the build, then compare efficiencies in the history below. Export as CSV when you want a backup.'
        ]}
      />

      <Card style={{ display: 'grid', gap: 0 }}>
        <Stepper steps={WORKFLOW} currentStep={currentStep} />
        <form onSubmit={saveEntry} style={{ display: 'grid', gap: 14 }}>
          <SectionHeading as="h3" style={{ fontSize: 15 }}>Log a build &amp; test</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <TextField label="Prototype label" name="label" value={form.label} onChange={update} placeholder="e.g. balsa box beam v2" />
            <NumberField label="Structure mass (g)" name="structureMassGrams" value={form.structureMassGrams} onChange={update} placeholder="e.g. 6.4" />
            <SelectField label="Wall-contact base option" name="baseOption" value={form.baseOption} onChange={update}>
              {BASE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </SelectField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <NumberField label="Load supported (g)" name="loadSupportedGrams" value={form.loadSupportedGrams} onChange={update} placeholder="e.g. 12000" />
            <SelectField label="Tier" name="tier" value={form.tier} onChange={update}>
              {TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
            </SelectField>
          </div>
          <CheckboxField
            label={`Structure held ${ACTIVE_DATA.boomilever.bonusHoldsKg} kg (required for the ${ACTIVE_DATA.boomilever.loadScoredBonusGrams.toLocaleString('en-US')} g bonus)`}
            name="holds15Kg"
            checked={form.holds15Kg}
            onChange={update}
          />
          <Collapsible summary="Build notes (expand only if you want to record them)">
            <div style={{ display: 'grid', gap: 10 }}>
              <TextField label="Members & material" name="memberDescription" value={form.memberDescription} onChange={update} placeholder="e.g. 3.2 mm balsa box beam" />
              <TextField label="Failure mode / where it broke" name="failureMode" value={form.failureMode} onChange={update} placeholder="e.g. tension member snapped above the bolt" />
              <TextAreaField label="Changes made for the next build" name="changes" value={form.changes} onChange={update} rows={3} placeholder="Record what you will change and why." />
            </div>
          </Collapsible>
          {hasMass && previewSummary.tested && (
            <ResultPanel>
              Efficiency: <strong style={{ fontFamily: 'var(--font-mono)' }}>{efficiencyText(previewSummary)}</strong>
              {previewSummary.scored && previewSummary.loadScoredBonus > 0 ? ' (bonus applied)' : ''}
            </ResultPanel>
          )}
          {message && <StatusMessage tone={messageIsError ? 'error' : 'status'}>{message}</StatusMessage>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="submit" variant="primary" disabled={!loaded} style={{ padding: '10px 14px' }}>
              {loaded ? 'Save build' : 'Loading…'}
            </Button>
            <Button onClick={exportCsv} disabled={entries.length === 0}>Export CSV</Button>
            <Button variant="danger" onClick={clearLog} disabled={entries.length === 0}>Clear log</Button>
          </div>
        </form>
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading as="h3" style={{ fontSize: 15 }}>Saved builds ({entries.length})</SectionHeading>
        {entries.length === 0
          ? <EmptyState>No builds saved in this browser yet.</EmptyState>
          : recentEntries.map((entry, index) => entryCard(entry, index, summaries[index]))}
        {olderEntries.length > 0 && (
          <Collapsible summary={`Older builds (${olderEntries.length}) — expand to compare`}>
            <div style={{ display: 'grid', gap: 10 }}>
              {olderEntries.map((entry, offset) => entryCard(entry, offset + 2, summaries[offset + 2]))}
            </div>
          </Collapsible>
        )}
      </Card>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: {ACTIVE_SEASON.year} Division C Rules Manual pp. C7–C12. This is a build/test notebook, not an official score or a compliance checker. Confirm measurements, tier conditions, and bonus eligibility with the Event Supervisor.
      </p>
    </div>
  );
}
