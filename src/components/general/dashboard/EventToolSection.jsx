import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import { buildJourney } from '../journeyUtils.js';

const COMPILER_SUFFIX = '-reference-compiler';

function EventLink({ href, icon, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="dashboard-event-link">
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 14 }} />
      {children}
    </a>
  );
}

/**
 * One starred event's tools on the dashboard (or one event on All Tools).
 * Purely presentational: ordering comes from the registry's journey and every
 * tool is a plain button, so nothing here gates access to a tool.
 */
export default function EventToolSection({
  eventId,
  event,
  starred = true,
  onStar,
  onOpenModule,
  onOpenCompiler,
  steps,
  catalog = false
}) {
  // All Tools passes its filtered journey; the Dashboard builds its own.
  const journey = Array.isArray(steps) ? steps : buildJourney(event);

  const openTool = (step) => {
    if (step.id.endsWith(COMPILER_SUFFIX)) onOpenCompiler(eventId);
    else onOpenModule(eventId, step.id);
  };

  return (
    <section
      className={`event-section${catalog ? ' event-section-catalog' : ''}`}
      aria-labelledby={`event-${eventId}-heading`}
    >
      <header className="event-section-head">
        <div className="event-section-identity">
          <div className="event-section-meta">
            Division {event.division} · {event.code} · {ACTIVE_SEASON.year}
          </div>
          <h2 id={`event-${eventId}-heading`} className="event-section-title">{event.name}</h2>
          <p className="event-section-desc">{event.description}</p>
        </div>
        <div className="event-section-actions">
          {typeof onStar === 'function' && (
            <button
              type="button"
              className={`event-star-button${catalog ? '' : ' event-star-icon-only'}`}
              aria-label={`${starred ? 'Unstar' : 'Star'} ${event.name}`}
              aria-pressed={starred}
              onClick={() => onStar(eventId)}
              title={starred ? 'Remove from My Events' : 'Add to My Events'}
            >
              <i
                className={`ti ${starred ? 'ti-star-filled' : (catalog ? 'ti-plus' : 'ti-star')}`}
                aria-hidden="true"
              />
              <span className="event-star-label">{starred ? 'In My Events' : 'Add to My Events'}</span>
            </button>
          )}
          <div className="dashboard-event-links event-section-links">
            {event.eventUrl && <EventLink href={event.eventUrl} icon="ti-external-link">Event page</EventLink>}
            {event.rulesUrl && <EventLink href={event.rulesUrl} icon="ti-book">Rules manual</EventLink>}
            {event.clarificationsUrl && <EventLink href={event.clarificationsUrl} icon="ti-info-circle">Clarifications</EventLink>}
          </div>
          {event.manualReference && <span className="dashboard-event-cite">{event.manualReference}</span>}
        </div>
      </header>

      {Array.isArray(event.ruleSummary) && event.ruleSummary.length > 0 && (
        <details className="event-rules">
          <summary>Event rules at a glance</summary>
          <ul className="dashboard-rule-summary">
            {event.ruleSummary.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        </details>
      )}

      {journey.length > 0 ? (
        <div className="dashboard-grid">
          {journey.map((step) => (
            <button
              type="button"
              key={step.id}
              className={`module-card dashboard-tool-card${catalog ? ' catalog-tool-card' : ''}`}
              onClick={() => openTool(step)}
              aria-label={`Open ${step.module.label}`}
            >
              <span className="dashboard-tool-name">
                <i className={`ti ${step.module.ti}`} aria-hidden="true" style={{ fontSize: 16 }} />
                {step.module.label}
              </span>
              {step.gain && <span className="dashboard-tool-gain">{step.gain}</span>}
              <span className="dashboard-tool-meta">
                <span className={`dashboard-stage-chip dashboard-stage-${step.stage}`}>
                  {step.stageLabel}
                </span>
                {!step.live && <span className="catalog-planned">Coming Soon</span>}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty">
          This event is an overview only right now — there are no study tools to open.
        </div>
      )}
    </section>
  );
}
