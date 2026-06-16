import React from 'react';

export default function Home({ MODS, CATS, onNav }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>EV Build Platform</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.7, maxWidth: 460, margin: 0 }}>
          A design aid for Science Olympiad Electric Vehicle teams. Plan your build, visualize arc geometry, tune your controller, and prepare for competition day.
        </p>
      </div>
      
      {CATS.map(cat => {
        const mods = MODS.filter(m => m.cat === cat);
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontFamily: "var(--font-mono)" }}>{cat}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {mods.map(m => (
                <div key={m.id} onClick={() => onNav(m.id)}
                  style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 14, cursor: "pointer", opacity: m.live ? 1 : 0.5, transition: "border-color 0.15s" }}
                  onMouseEnter={e => { if (m.live) e.currentTarget.style.borderColor = "var(--color-border-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-tertiary)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <i className={`ti ${m.ti}`} style={{ fontSize: 15, color: "var(--color-text-secondary)" }} aria-hidden="true"></i>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
                  {m.live && <div style={{ marginTop: 8, display: "inline-block", padding: "2px 8px", background: "var(--color-background-success)", color: "var(--color-text-success)", borderRadius: 10, fontSize: 10, fontFamily: "var(--font-mono)" }}>Live</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
