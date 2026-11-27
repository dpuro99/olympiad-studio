import { normalizeStage, stageMeta } from '../stages.js';

/**
 * Cross-event tools are a normal section on both workspace pages. They have no
 * star control: starring belongs to events in Choose events, not to tools that
 * are available to every student.
 */
export default function GeneralToolSection({ tools, onOpenGeneral, catalog = false }) {
  if (!tools?.length) return null;

  return (
    <section
      className={`event-section general-tool-section${catalog ? ' event-section-catalog' : ''}`}
      aria-labelledby="general-tools-heading"
    >
      <header className="event-section-head">
        <div className="event-section-identity">
          <div className="event-section-meta">Cross-event · all divisions</div>
          <h2 id="general-tools-heading" className="event-section-title">General tools</h2>
          <p className="event-section-desc">
            Prep tools that work across events, without needing a starred event.
          </p>
        </div>
      </header>

      <div className="dashboard-grid">
        {tools.map((tool) => {
          const stageId = normalizeStage(tool.stage);
          const stage = stageMeta(stageId);
          return (
            <button
              type="button"
              key={tool.id}
              className={`module-card dashboard-tool-card${catalog ? ' catalog-tool-card' : ''}`}
              onClick={() => onOpenGeneral(tool.id)}
              aria-label={`Open ${tool.label}`}
            >
              <span className="dashboard-tool-name">
                <i className={`ti ${tool.ti}`} aria-hidden="true" style={{ fontSize: 16 }} />
                {tool.label}
              </span>
              {tool.gain && <span className="dashboard-tool-gain">{tool.gain}</span>}
              <span className="dashboard-tool-meta">
                <span className={`dashboard-stage-chip dashboard-stage-${stageId}`}>
                  {stage.short}
                </span>
                {!tool.live && <span className="catalog-planned">Coming Soon</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
