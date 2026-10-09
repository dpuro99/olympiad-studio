import { calculatePracticeScore } from './scoreUtils';

export default function ScoreCalc() {
  const result = calculatePracticeScore();

  const cardStyle = {
    background: "var(--color-background-secondary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: 20,
    maxWidth: 720
  };

  return (
    <div style={{ ...cardStyle, display: "grid", gap: 16 }}>
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-info)" }}>
        2027 Scoring Verification
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Numeric scoring is not available yet</h2>

      <div role="status" style={{ padding: 14, border: "1px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
        {result.note}
      </div>

      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
        Status: <strong>{result.status}</strong>
      </div>

      <a href="https://www.soinc.org/rules-2027" target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
        Get the official 2027 rules
      </a>
    </div>
  );
}
