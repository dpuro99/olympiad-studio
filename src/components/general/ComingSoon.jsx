export default function ComingSoon({ mod }) {
  const rulesYear = mod?.year || 2027;
  const rulesUrl = mod?.rulesUrl || 'https://www.soinc.org/rules-2027';

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 14, textAlign: "center", padding: 24 }}>
      <i className={`ti ${mod?.ti || 'ti-clipboard'}`} style={{ fontSize: 36, color: "var(--color-text-secondary)", opacity: 0.35 }} aria-hidden="true"></i>
      <div style={{ fontSize: 18, fontWeight: 500 }}>{mod?.label || '2027 Event Overview'}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 420, lineHeight: 1.6 }}>{mod?.desc}</div>
      <div style={{ marginTop: 4, padding: "3px 12px", background: "var(--color-background-info)", color: "var(--color-text-info)", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        {rulesYear} rule verification pending
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", fontSize: 12 }}>
        {mod?.eventUrl && <a href={mod.eventUrl} target="_blank" rel="noreferrer">Official event page</a>}
        <a href={rulesUrl} target="_blank" rel="noreferrer">Official 2027 rules</a>
        <a href="https://www.soinc.org/events/rules-clarifications" target="_blank" rel="noreferrer">Rules corrections</a>
        <a href="https://www.soinc.org/frequently_asked_questions" target="_blank" rel="noreferrer">Rules clarifications</a>
      </div>
    </div>
  );
}
