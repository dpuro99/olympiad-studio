export default function AuthRequired({ mod, onLogin }) {
  return (
    <div style={{ maxWidth: 440, padding: 24, background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
      <i className="ti ti-lock" style={{ fontSize: 28, color: "var(--color-text-info)" }} aria-hidden="true"></i>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "12px 0 8px" }}>Sign in to use {mod.label}</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 18 }}>
        Guest mode supports local preparation tools. Sign in with Google to use {mod.label}.
      </p>
      <button type="button" onClick={onLogin} style={{ padding: "9px 14px", background: "var(--color-text-info)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500 }}>
        Sign In with Google
      </button>
    </div>
  );
}
