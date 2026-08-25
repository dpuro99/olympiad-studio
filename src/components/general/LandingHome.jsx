import logo from '/src/assets/logoRect.png';

export default function LandingHome({ currentUser, onGoToDashboard, onGuestAccess, theme, toggleTheme }) {
  const features = [
    { icon: "ti-vector-triangle", title: "Event Tools", desc: "Support a wide range of preparation needs from modeling and scoring to concept review and test planning." },
    { icon: "ti-cpu", title: "Competition Prep", desc: "Build a consistent workflow for practice, analysis, and readiness across multiple events." },
    { icon: "ti-file-analytics", title: "Progress Tracking", desc: "Keep notes, results, and milestones in one place so your team can improve over time." }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", borderBottom: "0.5px solid var(--color-border-tertiary)", backgroundColor: "var(--color-background-secondary)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Olympiad Studio Logo" style={{ width: "auto", height: 35, objectFit: "contain" }} />
          <span style={{ fontWeight: 600, fontSize: 16 }}>Olympiad Studio</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`} style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", padding: 8, borderRadius: "50%" }}>
            <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true"></i>
          </button>
          <button onClick={currentUser ? onGoToDashboard : onGuestAccess} style={{ padding: "8px 16px", background: "var(--color-background-info)", color: "var(--color-text-info)", border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500, fontSize: 13 }}>Open Dashboard &rarr;</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 80px" }}>
          <div style={{ display: "inline-flex", padding: "6px 12px", background: "var(--color-background-info)", borderRadius: 20, color: "var(--color-text-info)", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Science Olympiad Prep Platform
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 18 }}>
            A competition toolkit for every Science Olympiad event.
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
            Olympiad Studio supports the wide range of preparation styles across Science Olympiad, from analytical study and scoring to design, modeling, and event-specific workflows.
          </p>
          <button onClick={currentUser ? onGoToDashboard : onGuestAccess} style={{ padding: "12px 28px", background: "var(--color-text-info)", color: "#ffffff", border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500, fontSize: 14 }}>
            {currentUser ? "Open Workspace" : "Get Started"}
          </button>
        </div>

        <hr style={{ border: "none", height: "0.5px", background: "var(--color-border-tertiary)", marginBottom: 80 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {features.map((feature) => (
            <div key={feature.title} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--border-radius-md)", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className={`ti ${feature.icon}`} style={{ color: "var(--color-text-info)", fontSize: 18 }} aria-hidden="true"></i>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
