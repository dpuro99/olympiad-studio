// One event, one field guide.
//
// The spine is the event's real tool order with a single computed "next" step;
// the rail reports the work actually saved in this browser. Nothing is gated:
// every row is a plain button, and no step requires the one before it.
import { useMemo } from 'react';
import { buildJourney, summarizeJourney } from './journeyUtils';
import { progressLabel, readEventProgress, withProgress } from './eventProgress';

function ExternalLink({ href, icon, children }) {
  return (
    <a className="field-link" href={href} target="_blank" rel="noreferrer">
      <i className={`ti ${icon}`} aria-hidden="true" />
      <span>{children}</span>
      <i className="ti ti-external-link field-link-mark" aria-hidden="true" />
    </a>
  );
}

export default function EventHome({ eventId, event, onNav }) {
  const steps = useMemo(() => {
    const progress = readEventProgress(eventId, event);
    return withProgress(buildJourney(event), progress);
  }, [eventId, event]);

  const summary = summarizeJourney(steps);
  const savedWork = steps.filter((step) => step.progress.started);
  const unreadable = steps.some((step) => step.progress.unavailable);
  const nextStep = steps.find((step) => step.id === summary.nextStepId) || null;

  return (
    <div className="field-guide">
      <header className="field-guide-header">
        <div className="field-guide-eyebrow">
          <span>Division {event.division}</span>
          <span aria-hidden="true">·</span>
          <span>{event.code}</span>
          <span aria-hidden="true">·</span>
          <span>{event.year} manual</span>
        </div>
        <h1 className="field-guide-title">{event.name}</h1>
        <p className="field-guide-lede">{event.description}</p>
        <div className="field-guide-links">
          <ExternalLink href={event.eventUrl} icon="ti-world">Event page</ExternalLink>
          <ExternalLink href={event.rulesUrl} icon="ti-file-text">Rules manual</ExternalLink>
          <span className="field-guide-cite">{event.manualReference}</span>
        </div>
      </header>

      <div className="field-guide-body">
        <ol className="field-spine" aria-label={`${event.name} tools, in order`}>
          {steps.map((step) => {
            const chip = progressLabel(step.progress);
            const isNext = step.id === summary.nextStepId;
            return (
              <li key={step.id} className="field-step-row">
                <button
                  type="button"
                  className={`module-card field-step${isNext ? ' field-step-next' : ''}`}
                  onClick={() => onNav(step.id)}
                  aria-label={`Open ${step.module.label}`}
                  data-stage={step.stage}
                >
                  <span className="field-step-number" aria-hidden="true">
                    {String(step.index).padStart(2, '0')}
                  </span>
                  <span className="field-step-main">
                    <span className="field-step-top">
                      <i className={`ti ${step.module.ti} field-step-icon`} aria-hidden="true" />
                      <span className="field-step-name">{step.module.label}</span>
                      <span className="field-step-stage">{step.stageLabel}</span>
                      {isNext && (
                        <span className="field-next">
                          <i className="ti ti-arrow-narrow-right" aria-hidden="true" />
                          Next
                        </span>
                      )}
                      {!step.live && <span className="field-step-soon">Coming soon</span>}
                    </span>
                    {step.gain && <span className="field-step-gain">{step.gain}</span>}
                    {chip && (
                      <span className="field-step-saved">
                        <i className="ti ti-database" aria-hidden="true" />
                        {chip}
                      </span>
                    )}
                  </span>
                  <i className="ti ti-chevron-right field-step-open" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>

        <aside className="field-rail" aria-label="Your saved work">
          <h2 className="field-rail-title">Your work</h2>
          {unreadable ? (
            <p className="field-rail-note field-rail-warn">
              This browser would not let the app read saved data. The tools still work;
              their history may not appear here.
            </p>
          ) : null}

          {savedWork.length > 0 ? (
            <ul className="field-rail-list">
              {savedWork.map((step) => (
                <li key={step.id}>
                  <span className="field-rail-label">{step.module.label}</span>
                  <span className="field-rail-count">{progressLabel(step.progress)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-rail-note">
              Nothing saved in this browser yet. Each tool saves locally as you use it.
            </p>
          )}

          {nextStep ? (
            <div className="field-rail-next">
              <span className="field-rail-next-label">Next step</span>
              <button type="button" className="field-rail-next-button" onClick={() => onNav(nextStep.id)}>
                {nextStep.module.label}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </button>
            </div>
          ) : summary.withWork > 0 ? (
            <p className="field-rail-note">Every step with saved work has something in it. Keep going.</p>
          ) : null}

          <p className="field-rail-foot">
            Saved in this browser only — nothing is uploaded.
          </p>
        </aside>
      </div>

      <details className="field-index">
        <summary>
          <span className="field-index-summary">All {steps.length} tools in {event.name}</span>
          <span className="field-index-hint">Stage, what goes in, what comes out</span>
        </summary>
        <ul className="field-index-list">
          {steps.map((step) => (
            <li key={step.id} className="field-index-row">
              <span className="field-index-stage">{step.stageLabel}</span>
              <button type="button" className="field-index-name" onClick={() => onNav(step.id)}>
                {step.module.label}
              </button>
              <span className="field-index-gain">{step.gain || step.module.desc}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
