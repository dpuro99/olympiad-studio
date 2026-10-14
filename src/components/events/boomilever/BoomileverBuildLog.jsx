import { useEffect, useState } from 'react';
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

const cardStyle = {
  background: 'var(--color-background-secondary)',
  border: '1px solid var(--color-border-tertiary)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 18
};
const inputStyle = {
  width: '100%', padding: '9px 10px', background: 'var(--color-background-tertiary)',
  border: '1px solid var(--color-border-secondary)', color: 'var(--color-text-primary)',
  borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)'
};
const checkStyle = {
  display: 'flex', alignItems: 'flex-start', gap: 8,
  color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.5
};
const fieldStyle = { display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 };

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
    link.download = 'boomilever-c-2027-build-log.csv';
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

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 960 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Boomilever C · 2027 · Manual C7–C12
        </div>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          Log each prototype you build and test so designs can be compared across iterations. Records stay in this browser and are not uploaded. Efficiency follows the verified formula (Load Scored ÷ Structure Mass with the optional 7,500 g bonus); it is a practice record, not an Event Supervisor ruling.
        </p>
      </section>

      <form onSubmit={saveEntry} style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Log a build &amp; test</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <label style={fieldStyle}>Prototype label
            <input name="label" value={form.label} onChange={update} placeholder="e.g. balsa box beam v2" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
          <label style={fieldStyle}>Structure mass (g)
            <input name="structureMassGrams" type="number" min="0" step="any" value={form.structureMassGrams} onChange={update} placeholder="e.g. 6.4" style={inputStyle} />
          </label>
          <label style={fieldStyle}>Members &amp; material
            <input name="memberDescription" value={form.memberDescription} onChange={update} placeholder="e.g. 3.2 mm balsa box beam" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
          </label>
          <label style={fieldStyle}>Wall-contact base option
            <select name="baseOption" value={form.baseOption} onChange={update} style={inputStyle}>
              {BASE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <h3 style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>Test result (leave blank until tested)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <label style={fieldStyle}>Load supported (g)
            <input name="loadSupportedGrams" type="number" min="0" step="any" value={form.loadSupportedGrams} onChange={update} placeholder="e.g. 12000" style={inputStyle} />
          </label>
          <label style={fieldStyle}>Tier
            <select name="tier" value={form.tier} onChange={update} style={inputStyle}>
              {TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
            </select>
          </label>
        </div>
        <label style={checkStyle}>
          <input name="holds15Kg" type="checkbox" checked={form.holds15Kg} onChange={update} />
          <span>Structure held 15 kg (required for the 7,500 g bonus)</span>
        </label>
        <label style={fieldStyle}>Failure mode / where it broke
          <input name="failureMode" value={form.failureMode} onChange={update} placeholder="e.g. tension member snapped above the bolt" style={{ ...inputStyle, fontFamily: 'var(--font-sans)' }} />
        </label>
        <label style={fieldStyle}>Changes made for the next build
          <textarea name="changes" value={form.changes} onChange={update} rows={3} placeholder="Record what you will change and why." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
        </label>

        {hasMass && previewSummary.tested && (
          <div aria-live="polite" style={{ fontSize: 13 }}>
            Efficiency: <strong style={{ fontFamily: 'var(--font-mono)' }}>{efficiencyText(previewSummary)}</strong>
            {previewSummary.scored && previewSummary.loadScoredBonus > 0 ? ' (bonus applied)' : ''}
          </div>
        )}
        {message && <div role={messageIsError ? 'alert' : 'status'} style={{ color: messageIsError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontSize: 11 }}>{message}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="submit" disabled={!loaded} style={{ padding: '10px 14px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: loaded ? 'pointer' : 'wait' }}>
            {loaded ? 'Save build' : 'Loading…'}
          </button>
          <button type="button" onClick={exportCsv} disabled={entries.length === 0} style={{ padding: '9px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', background: 'transparent', fontSize: 12, cursor: entries.length ? 'pointer' : 'not-allowed', opacity: entries.length ? 1 : 0.6 }}>Export CSV</button>
          <button type="button" onClick={clearLog} disabled={entries.length === 0} style={{ padding: '9px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-danger)', background: 'transparent', fontSize: 12, cursor: entries.length ? 'pointer' : 'not-allowed', opacity: entries.length ? 1 : 0.6 }}>Clear log</button>
        </div>
      </form>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Saved builds ({entries.length})</h2>
        {entries.length === 0 ? <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>No builds saved in this browser yet.</p> : entries.map((entry, index) => {
          const summary = summaries[index];
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
                <span>15 kg {summary.tested ? (entry.holds15Kg ? 'held' : 'no') : '—'}</span>
                <span>{summary.tested ? entry.tier : 'untested'}</span>
              </div>
              {entry.memberDescription && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>Members: {entry.memberDescription}</div>}
              {entry.failureMode && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Failure: {entry.failureMode}</div>}
              {entry.changes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{entry.changes}</p>}
              <button type="button" onClick={() => {
                if (window.confirm('Delete this locally saved build?')) removeEntry(index);
              }} style={{ marginTop: 8, padding: '4px 8px', border: '1px solid var(--color-border-secondary)', borderRadius: 4, color: 'var(--color-text-danger)', background: 'transparent', cursor: 'pointer', fontSize: 11 }}>Delete</button>
            </article>
          );
        })}
      </section>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: 2027 Division C Rules Manual pp. C7–C12. This is a build/test notebook, not an official score or a compliance checker. Confirm measurements, tier conditions, and bonus eligibility with the Event Supervisor.
      </p>
    </div>
  );
}
