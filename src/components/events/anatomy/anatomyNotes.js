export const STORAGE_KEY = 'olympiad-studio-anatomy-c-2027-notebook';

export const SYSTEMS = [
  { id: 'respiratory', label: 'Respiratory system' },
  { id: 'digestive', label: 'Digestive system' },
  { id: 'immune', label: 'Immune system' }
];

export function createEmptyNote() {
  return { systemId: 'respiratory', label: '', focus: '', notes: '' };
}

export function safeParseNotes(serialized) {
  try {
    const data = JSON.parse(serialized);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Saved anatomy notes have an unsupported format.' };
    }
    if (data.notes !== undefined && !Array.isArray(data.notes)) {
      return { error: 'Saved anatomy notes have an unsupported format.' };
    }
    return { value: { ...createEmptyNote(), ...data, notes: Array.isArray(data.notes) ? data.notes : [] } };
  } catch {
    return { error: 'Saved anatomy notes could not be read.' };
  }
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function buildNotesCsv(notes) {
  const headers = ['system', 'label', 'focus', 'notes'];
  const rows = notes.map((note) => [note.systemId, note.label, note.focus, note.notes]);
  return [headers.join(','), ...rows.map((row) => row.map(safeCsvCell).join(','))].join('\r\n');
}
