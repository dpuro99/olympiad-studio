import { useEffect, useState } from 'react';
import { buildNotesCsv, safeParseNotes, STORAGE_KEY, SYSTEMS } from './anatomyNotes';
import {
  Button,
  Card,
  SectionHeading,
  SelectField,
  StatusMessage,
  TextAreaField,
  TextField,
  ToolHeader
} from '../../general/ui/primitives';

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

  const systemLabel = (id) => SYSTEMS.find((s) => s.id === id)?.label || id;

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
      <ToolHeader
        eyebrow="Anatomy and Physiology C · 2027 · Manual C3–C5"
        purpose="A user-authored study journal for the 2027 respiratory, digestive, and immune systems. It does not contain preset quiz questions or simulated exam data — save only what you verify."
        manualReference="2027 Division C Rules Manual, pp. C3–C5"
        steps={[
          'Choose the system, then add a note label and a focus/topic.',
          'Record observations, questions, or verified facts from the 2027 manual.',
          'Save in this browser profile (notes are stored locally, not uploaded). Export as CSV when needed.'
        ]}
      />

      <Card as="form" onSubmit={(e) => { e.preventDefault(); if (loaded) saveNotes(); }} style={{ display: 'grid', gap: 14 }}>
        <SectionHeading style={{ fontSize: 15 }}>Add a note</SectionHeading>
        <SelectField label="System" value={systemId} onChange={(event) => { setSystemId(event.target.value); setMessage(''); }}>
          {SYSTEMS.map((system) => <option key={system.id} value={system.id}>{system.label}</option>)}
        </SelectField>
        <TextField label="Note label" value={label} onChange={(event) => { setLabel(event.target.value); setMessage(''); }} placeholder="e.g. respiratory disorders" />
        <TextField label="Focus / topic" value={focus} onChange={(event) => { setFocus(event.target.value); setMessage(''); }} placeholder="e.g. asthma mechanism" />
        <TextAreaField label="Notes" rows={4} value={notesText} onChange={(event) => { setNotesText(event.target.value); setMessage(''); }} placeholder="Record observations, questions, or verified facts from the 2027 manual." />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="submit" variant="primary" disabled={!loaded} style={{ padding: '9px 12px' }}>{loaded ? 'Save in this browser' : 'Loading saved notes…'}</Button>
          <Button type="button" onClick={exportCsv} style={{ padding: '9px 12px' }}>Export CSV</Button>
          <Button type="button" variant="danger" onClick={clearNotes} style={{ padding: '9px 12px' }}>Clear notes</Button>
        </div>
        {message && <StatusMessage tone={messageIsError ? 'error' : 'status'}>{message}</StatusMessage>}
      </Card>

      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading style={{ fontSize: 15 }}>Saved notes ({savedNotes.length})</SectionHeading>
        {savedNotes.length === 0 ? <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 12 }}>No notes saved in this browser yet.</p> : savedNotes.map((note, index) => (
          <article key={index} style={{ padding: 12, border: '1px solid var(--color-border-secondary)', borderRadius: 'var(--border-radius-md)', background: 'var(--color-background-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <strong>{note.label || 'Note'}</strong>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 3 }}>{systemLabel(note.systemId)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, color: 'var(--color-text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <span>Focus: {note.focus || '—'}</span>
            </div>
            {note.notes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{note.notes}</p>}
          </article>
        ))}
      </Card>
    </div>
  );
}
