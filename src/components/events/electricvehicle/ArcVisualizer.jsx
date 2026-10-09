export default function ArcVisualizer() {
  const card = {
    background: "var(--color-background-secondary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: 20,
    maxWidth: 720
  };

  const taskSteps = [
    "Use electrical energy as the vehicle’s sole means of propulsion.",
    "Travel in a set amount of time and push a bottle past a line.",
    "Move backward and stop close to a Target Point."
  ];

  return (
    <div style={{ ...card, display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-info)", marginBottom: 12 }}>
          Verified 2027 Event-Page Summary
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Electric Vehicle task</h2>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
          This is a high-level summary from the official Science Olympiad event page, not a substitute for the current Rules Manual. No dimensions, construction limits, scoring formula, or penalties are asserted here.
        </p>
      </div>

      <ol style={{ display: "grid", gap: 10, paddingLeft: 22, margin: 0 }}>
        {taskSteps.map((item) => <li key={item} style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6 }}>{item}</li>)}
      </ol>

      <a href="https://www.soinc.org/electric-vehicle-c" target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
        Official Electric Vehicle event page
      </a>
    </div>
  );
}
