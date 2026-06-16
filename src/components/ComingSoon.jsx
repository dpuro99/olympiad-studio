import React from 'react';

export default function ComingSoon({ mod, WEEK }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyCentering: "center", minHeight: 280, gap: 14, textAlign: "center", justifyContent: "center" }}>
      <i className={`ti ${mod.ti}`} style={{ fontSize: 36, color: "var(--color-text-secondary)", opacity: 0.35 }} aria-hidden="true"></i>
      <div style={{ fontSize: 18, fontWeight: 500 }}>{mod.label}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 320, lineHeight: 1.6 }}>{mod.desc}</div>
      <div style={{ marginTop: 4, padding: "3px 12px", background: "var(--color-background-info)", color: "var(--color-text-info)", borderRadius: 20, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        {`Coming soon — week ${WEEK[mod.id]}`}
      </div>
    </div>
  );
}
