import React from 'react';
import logo from '/src/assets/logoRect.png';

export default function LandingHome({ onLogin, authLoading, currentUser, onGoToDashboard, theme, toggleTheme }) {
  const features = [
    { icon: "ti-vector-triangle", title: "Arc Visualizer", desc: "Compute center and wheel paths to maintain strict track alignment." },
    { icon: "ti-trophy", title: "Score Calculator", desc: "Instantly evaluate time and target distance error combinations." },
    { icon: "ti-cpu", title: "Hardware Planner", desc: "Select and balance battery capacity, wheel sizes, and motor RPMs." },
    { icon: "ti-file-analytics", title: "Cloud Run Logger", desc: "Save calibration metrics directly to your secure team profile." }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>
      
      {/* Horizontal Navigation Bar */}
      <header style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "16px 40px", borderBottom: "0.5px solid var(--color-border-tertiary)", 
        backgroundColor: "var(--color-background-secondary)", position: "sticky", top: 0, zIndex: 100 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Olympiad Studio Logo" style={{ width: "auto", height: 35, objectFit: "contain" }} />
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>Olympiad Studio</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-text-secondary)", padding: "8px", borderRadius: "50%",
              transition: "color 0.2s"
            }} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <svg style={{ pointerEvents: "none" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42 1.42"/></svg>
            ) : (
              <svg style={{ pointerEvents: "none" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {currentUser ? (
            <button onClick={onGoToDashboard} style={{
              padding: "8px 16px", background: "var(--color-background-info)", color: "var(--color-text-info)",
              border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13
            }}>
              Go to Dashboard &rarr;
            </button>
          ) : (
            <button onClick={onLogin} disabled={authLoading} style={{
              padding: "8px 16px", background: "#ffffff", color: "#1f1f1f",
              border: "none", borderRadius: "var(--border-radius-md)", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <svg width="14" height="14" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.96v2.32C2.44 15.09 5.47 18 9 18z" fill="#34A853"/>
                <path d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.96A8.977 8.977 0 0 0 0 9c0 1.48.36 2.9 1 4.14l2.95-2.4z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.42 0 9 0 5.47 0 2.44 2.91.96 5.34l2.95 2.32C4.66 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {authLoading ? 'Connecting...' : 'Sign In with Google'}
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Container */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 80px" }}>
          <div style={{ display: "inline-flex", padding: "6px 12px", background: "var(--color-background-info)", borderRadius: 20, color: "var(--color-text-info)", fontSize: 11, fontWeight: 500, fontFamily: "var(--font-mono)", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Science Olympiad Electric Vehicle Workspace
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 18 }}>
            Engineering precision for competitive edge.
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
            An all-in-one physics simulation, calculation, and data-logging ecosystem engineered to maximize your vehicle's scoring potential and runtime efficiency.
          </p>
          <button onClick={currentUser ? onGoToDashboard : onLogin} style={{
            padding: "12px 28px", background: "var(--color-text-info)", color: "#ffffff", border: "none",
            borderRadius: "var(--border-radius-md)", fontWeight: 500, fontSize: 14, cursor: "pointer"
          }}>
            {currentUser ? "Open Workspace" : "Get Started"}
          </button>
        </div>

        <hr style={{ border: "none", height: "0.5px", background: "var(--color-border-tertiary)", marginBottom: 80 }} />

        {/* Dynamic Feature Grid Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {features.map((feat, i) => (
            <div key={i} style={{ 
              background: "var(--color-background-secondary)", 
              border: "0.5px solid var(--color-border-tertiary)", 
              borderRadius: "var(--border-radius-lg)", 
              padding: 24
            }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--border-radius-md)", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className={`ti ${feat.icon}`} style={{ color: "var(--color-text-info)", fontSize: 18 }}></i>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
