import { useState } from 'react';

export default function RunLogger() {
  const [formData, setFormData] = useState({
    sessionLabel: '',
    focus: '',
    notes: ''
  });

  const cardStyle = {
    background: "var(--color-background-secondary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: 20,
    maxWidth: 720
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    background: "var(--color-background-tertiary)",
    border: "1px solid var(--color-border-secondary)",
    color: "var(--color-text-primary)",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "var(--font-sans)"
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ ...cardStyle, display: "grid", gap: 18 }}>
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-info)", marginBottom: 8 }}>
          General Testing Journal
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Record observations without unverified score fields</h2>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
        This free-form journal does not encode event dimensions, run limits, penalties, or scoring. Those details must be taken from the official 2027 Rules Manual and current clarifications.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-mono)" }}>Session label</label>
          <input name="sessionLabel" value={formData.sessionLabel} onChange={handleChange} placeholder="e.g. drive test" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-mono)" }}>Main focus</label>
          <input name="focus" value={formData.focus} onChange={handleChange} placeholder="What are you testing?" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-mono)" }}>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={5} placeholder="Record observations and cite the rule provision relevant to your test." style={{ ...inputStyle, resize: "vertical", minHeight: 110 }} />
        </div>
      </div>
    </div>
  );
}
