import React from 'react';

export default function Home({ MODS, CATS, onNav, selectedEventId, EVENT_REGISTRY, onSelectEvent }) {
  // --- LEVEL 1: MULTI-EVENT HUB ---
  if (!selectedEventId) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Hub Welcome Banner */}
        <div style={{
          padding: "32px 28px",
          background: "linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-tertiary) 100%)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>
          <span style={{ 
            fontSize: 10, 
            fontFamily: "var(--font-mono)", 
            color: "var(--color-text-info)", 
            background: "var(--color-background-info)",
            padding: "4px 8px",
            borderRadius: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Dashboard
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 8, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Science Olympiad Engineering Studio
          </h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: "640px" }}>
            Access specialized physical calculators, track simulators, and hardware optimization planners across multiple Division B and Division C engineering events.
          </p>
        </div>

        {/* Available Events Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-text-secondary)",
            borderBottom: "1px solid var(--color-border-tertiary)",
            paddingBottom: 6
          }}>
            Active Event Workspaces
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {Object.keys(EVENT_REGISTRY).map(key => {
              const evt = EVENT_REGISTRY[key];
              const totalTools = evt.modules.length;
              const liveTools = evt.modules.filter(m => m.live).length;
              
              return (
                <div
                  key={key}
                  onClick={() => onSelectEvent(key)}
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "1px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-lg)",
                    padding: 24,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "220px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-text-info)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-secondary)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: evt.division === "C" ? "var(--color-background-info)" : "var(--color-background-tertiary)",
                        color: evt.division === "C" ? "var(--color-text-info)" : "var(--color-text-secondary)"
                      }}>
                        Division {evt.division}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {liveTools}/{totalTools} Live Tools
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8 }}>
                      {evt.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {evt.description}
                    </p>
                  </div>

                  {/* Tiny progress bar */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ height: 4, background: "var(--color-background-tertiary)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(liveTools/totalTools)*100}%`, background: "var(--color-text-success)", transition: "width 0.3s" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--color-text-info)", fontWeight: 500 }}>Open Workspace &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 2: EVENT-SPECIFIC WORKSPACE ---
  const groupedModules = CATS.reduce((acc, cat) => {
    acc[cat] = MODS.filter(m => m.cat === cat);
    return acc; // Correctly returning the accumulator map
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Workspace Welcome Banner */}
      <div style={{
        padding: "24px",
        background: "var(--color-background-secondary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--color-text-primary)" }}>
          Workspace Modules
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, maxWidth: "600px" }}>
          Select any of the engineering tools below or use the sidebar menu to begin calibrating, modeling, and configuring your design parameters.
        </p>
      </div>

      {/* Dynamic Categories & Cards */}
      {CATS.map(cat => {
        const modulesInCat = groupedModules[cat] || [];
        if (modulesInCat.length === 0) return null;

        return (
          <div key={cat} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Category Header */}
            <div style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-text-secondary)",
              borderBottom: "1px solid var(--color-border-tertiary)",
              paddingBottom: 6
            }}>
              {cat} Modules
            </div>

            {/* Modules Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16
            }}>
              {modulesInCat.map(mod => (
                <div
                  key={mod.id}
                  onClick={() => onNav(mod.id)} // Fully clickable for both Ready and Under Dev tools!
                  style={{
                    background: "var(--color-background-secondary)",
                    border: mod.live ? "1px solid var(--color-border-secondary)" : "1px dashed var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    padding: 16,
                    cursor: "pointer", // All cards are now clickable
                    opacity: mod.live ? 1 : 0.65,
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-text-info)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = mod.live ? "var(--color-border-secondary)" : "var(--color-border-tertiary)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--border-radius-md)",
                        background: mod.live ? "var(--color-background-info)" : "var(--color-background-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <i className={`ti ${mod.ti}`} style={{
                          color: mod.live ? "var(--color-text-info)" : "var(--color-text-secondary)",
                          fontSize: 16
                        }}></i>
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{mod.label}</h3>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: 16 }}>
                      {mod.desc}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      borderRadius: 12,
                      background: mod.live ? "var(--color-background-success)" : "var(--color-background-tertiary)",
                      color: mod.live ? "var(--color-text-success)" : "var(--color-text-secondary)"
                    }}>
                      {mod.live ? "Ready" : "Under Dev"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-text-info)" }}>
                      {mod.live ? "Open Tool" : "View Timeline"} &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
