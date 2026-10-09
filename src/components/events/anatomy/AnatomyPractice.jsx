import { useEffect, useState } from 'react';
import { buildNotesCsv, safeParseNotes, STORAGE_KEY, SYSTEMS } from './anatomyNotes';

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

export default function AnatomyPractice() {
  const [systemId, setSystemId] = useState('respiratory');
  const [label, setLabel] = useState('');
  const [focus, setFocus] = useState('');
  const [notesText, setNotesText] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = safeParseNotes(stored);
          if (parsed.error) {
            if (!cancelled) {
              setMessage(parsed.error);
              setMessageIsError(true);
            }
          } else if (!cancelled) {
            setSavedNotes(parsed.value.notes || []);
            setMessage('Saved anatomy notes loaded from this browser.');
          }
        }
      } catch {
        if (!cancelled) {
          setMessage('Local storage unavailable; you can still export notes as CSV.');
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

  const saveNotes = () => {
    const entry = { systemId, label, focus, notes: notesText };
    const updated = [entry, ...savedNotes];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes: updated }));
      setSavedNotes(updated);
      setLabel('');
      setFocus('');
      setNotesText('');
      setMessage('Note saved in this browser.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not save locally. Export notes as CSV instead.');
      setMessageIsError(true);
    }
  };

  const exportCsv = () => {
    const result = buildNotesCsv(savedNotes);
    const blob = new Blob([result], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'anatomy-c-2027-notes.csv';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Notes exported as CSV. The file contains only your entered notes.');
    setMessageIsError(false);
  };

  const clearNotes = () => {
    if (!window.confirm('Clear all saved anatomy notes in this browser?')) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setSavedNotes([]);
      setMessage('Notes cleared.');
      setMessageIsError(false);
    } catch {
      setMessage('Could not clear saved notes.');
      setMessageIsError(true);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <section style={{ ...cardStyle, display: 'grid', gap: 8 }}>
        <div style={{ color: 'var(--color-text-info)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          Anatomy and Physiology C · 2027 · Manual C3–C5
        </div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Practice notes</h2>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
          This is a user-authored study journal for the 2027 respiratory, digestive, and immune systems. It does not contain preset quiz questions or simulated exam data. Save notes explicitly in this browser profile; they are not uploaded and may be visible to others sharing this profile. Export notes as CSV.
        </p>
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Add a note</h3>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          System
          <select value={systemId} onChange={(event) => { setSystemId(event.target.value); setMessage(''); }} style={inputStyle}>
            {SYSTEMS.map((system) => <option key={system.id} value={system.id}>{system.label}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Note label
          <input value={label} onChange={(event) => { setLabel(event.target.value); setMessage(''); }} placeholder="e.g. respiratory disorders" style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Focus / topic
          <input value={focus} onChange={(event) => { setFocus(event.target.value); setMessage(''); }} placeholder="e.g. asthma mechanism" style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 4, color: 'var(--color-text-secondary)', fontSize: 11 }}>
          Notes
          <textarea value={notesText} onChange={(event) => { setNotesText(event.target.value); setMessage(''); }} rows={4} placeholder="Record observations, questions, or verified facts from the 2027 manual." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" disabled={!loaded} onClick={saveNotes} style={{ padding: '9px 12px', border: 0, borderRadius: 'var(--border-radius-md)', background: 'var(--color-text-info)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: loaded ? 'pointer' : 'wait' }}>
            {loaded ? 'Save in this browser' : 'Loading saved notes…'}
          </button>
          <button type="button" onClick={exportCsv} style={{ padding: '9px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-primary)', background: 'transparent', fontSize: 12 }}>Export CSV</button>
          <button type="button" onClick={clearNotes} style={{ padding: '9px 12px', border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-danger)', background: 'transparent', fontSize: 12 }}>Clear notes</button>
        </div>
        {message && <div role={messageIsError ? 'alert' : 'status'} style={{ color: messageIsError ? 'var(--color-text-danger)' : 'var(--color-text-secondary)', fontSize: 11 }}>{message}</div>}
      </section>

      <section style={{ ...cardStyle, display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Saved notes ({savedNotes.length})</h3>
        {savedNotes.length === 0 ? <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>No notes saved in this browser yet.</p> : savedNotes.map((note, index) => (
          <article key={index} style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <strong>{note.label || 'Note'}</strong>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 3 }}>{note.systemId}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <span>Focus: {note.focus || '—'}</span>
            </div>
            {note.notes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{note.notes}</p>}
          </article>
        ))}
      </section>

      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Source: 2027 Division C Rules Manual pp. C3–C5. This is a study journal, not an exam or official score.
      </p>
    </div>
  );
}
