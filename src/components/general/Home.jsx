import EventHome from './EventHome';

export default function Home({ onNav, selectedEventId, EVENT_REGISTRY, onSelectEvent }) {
  // --- LEVEL 1: MULTI-EVENT HUB ---
  if (!selectedEventId) {
    const events = Object.keys(EVENT_REGISTRY).map((key) => ({ key, evt: EVENT_REGISTRY[key] }));
    const totalLive = events.reduce((n, { evt }) => n + evt.modules.filter((m) => m.live).length, 0);
    const totalModules = events.reduce((n, { evt }) => n + evt.modules.length, 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Hub Welcome Banner */}
        <div className="lobby-hero-grid" style={{
          padding: "24px 24px",
          background: "linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background-elevated) 60%, color-mix(in srgb, var(--color-accent-muted) 55%, transparent) 100%)",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div>
            <span style={{
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              color: "var(--color-accent-primary)",
              background: "var(--color-accent-muted)",
              padding: "5px 10px",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              border: "1px solid var(--color-border-warning)"
            }}>
              <i className="ti ti-layout-dashboard" style={{ fontSize: 13 }} aria-hidden="true"></i>
              Your workspace
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, marginTop: 14, marginBottom: 8, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: "16ch" }}>
              Pick an event. Open a tool. Get to work.
            </h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: "58ch", margin: 0 }}>
              Calculators, practice logs, drills, and study aids — organized by event and grounded in the official rules.
            </p>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "Events", value: events.length, icon: "ti-folders" },
              { label: "Tools ready", value: `${totalLive}/${totalModules}`, icon: "ti-bolt" },
              { label: "Data", value: "Local to your browser", icon: "ti-device-floppy" }
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-secondary)", background: "color-mix(in srgb, var(--color-background-primary) 35%, transparent)" }}>
                <i className={`ti ${stat.icon}`} style={{ color: "var(--color-accent-primary)", fontSize: 17 }} aria-hidden="true"></i>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-sans)", fontWeight: 600 }}>{stat.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Events Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div style={{
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-tertiary)",
              fontWeight: 700
            }}>
              Event workspaces
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Choose a workspace to see its tools</div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16
          }}>
            {events.map(({ key, evt }) => {
              const totalTools = evt.modules.length;
              const liveTools = evt.modules.filter(m => m.live).length;

              return (
                <button
                  key={key}
                  type="button"
                  className="event-card"
                  onClick={() => onSelectEvent(key)}
                  aria-label={`${evt.name} workspace, Division ${evt.division}, ${liveTools} of ${totalTools} tools ready`}
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "1px solid var(--color-border-tertiary)",
                    borderRadius: "var(--radius-lg)",
                    padding: 22,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "200px",
                    boxShadow: "var(--shadow-sm)",
                    textAlign: "left"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        padding: "3px 9px",
                        borderRadius: "var(--radius-full)",
                        background: evt.division === "C" ? "var(--color-background-info)" : "var(--color-background-tertiary)",
                        color: evt.division === "C" ? "var(--color-text-info)" : "var(--color-text-secondary)",
                        border: `1px solid ${evt.division === "C" ? "var(--color-border-info)" : "var(--color-border-secondary)"}`
                      }}>
                        Division {evt.division}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
                        {liveTools} of {totalTools} tools ready
                      </span>
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                      {evt.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                      {evt.description}
                    </p>
                    {liveTools > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }} aria-label="Ready tools">
                        {evt.modules.filter((m) => m.live).slice(0, 3).map((m) => (
                          <span key={m.id} style={{ fontSize: 11, padding: "3px 8px", borderRadius: "var(--radius-full)", background: "var(--color-background-tertiary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-secondary)", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {m.label}
                          </span>
                        ))}
                        {liveTools > 3 && <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", padding: "3px 2px" }}>+{liveTools - 3} more</span>}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ height: 5, background: "var(--color-background-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(liveTools / Math.max(totalTools, 1)) * 100}%`, background: "var(--color-accent-primary)", transition: "width 0.3s", borderRadius: "var(--radius-full)" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--color-accent-primary)", fontWeight: 600 }}>Open workspace</span>
                      <i className="ti ti-arrow-right" style={{ color: "var(--color-accent-primary)", fontSize: 15 }} aria-hidden="true"></i>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 2: EVENT FIELD GUIDE ---
  // One page per event: the numbered tool spine, the saved-work rail, and the
  // full index. All of it is derived from the registry entry.
  return (
    <EventHome
      eventId={selectedEventId}
      event={EVENT_REGISTRY[selectedEventId]}
      onNav={onNav}
    />
  );
}
