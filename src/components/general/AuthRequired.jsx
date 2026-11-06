export default function AuthRequired({ mod, onLogin }) {
  return (
    <div style={{ maxWidth: 440, padding: 24, background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--color-accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, border: "1px solid var(--color-border-warning)" }}>
        <i className="ti ti-lock" style={{ fontSize: 22, color: "var(--color-accent-primary)" }} aria-hidden="true"></i>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Sign in to use {mod.label}</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 18px" }}>
        Guest mode supports local preparation tools. Sign in with Google to use {mod.label}.
      </p>
      <button type="button" aria-label="Sign in with Google to unlock this tool" onClick={onLogin} style={{ padding: "10px 16px", background: "var(--color-accent-primary)", color: "var(--color-text-inverse)", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
        Sign in with Google
      </button>
    </div>
  );
}
