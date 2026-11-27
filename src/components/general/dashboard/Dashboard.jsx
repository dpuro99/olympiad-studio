import { EVENT_REGISTRY } from '../../events/registry.js';
import { GENERAL_TOOL_REGISTRY } from '../generalToolRegistry.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import { scopedEventIds } from './profileUtils.js';
import { scopeSources } from './objectiveTrackerUtils.js';
import { StatusMessage } from '../ui/primitives.jsx';
import DashboardTracker from './DashboardTracker.jsx';
import EventPicker from './EventPicker.jsx';
import EventToolSection from './EventToolSection.jsx';
import GeneralToolSection from './GeneralToolSection.jsx';

/**
 * The main workbench. Starred events' tools sit in the left column and the
 * read-only study-progress rollup sits in the right rail. The nav's only job
 * here is to get back; starring and tool selection both happen on this surface.
 */
export default function Dashboard({
  profile,
  profileError,
  sources,
  onStar,
  onOpenModule,
  onOpenGeneral,
  onOpenCompiler,
  onAllTools
}) {
  const allIds = Object.keys(EVENT_REGISTRY);
  const starred = scopedEventIds(profile, allIds);
  const scopedSources = scopeSources(sources, starred);
  const generalTools = Object.values(GENERAL_TOOL_REGISTRY);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero" aria-labelledby="dashboard-heading">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">Your workbench · {ACTIVE_SEASON.year} season</p>
          <h1 id="dashboard-heading" className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Your starred events and their tools, with study progress alongside.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <EventPicker profile={profile} onStar={onStar} />
          <button type="button" className="dashboard-hero-link" onClick={onAllTools}>
            All Tools
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </section>

      <div className="dashboard-main">
        {profileError && (
          <StatusMessage tone="error">
            This browser blocked reading your saved profile, so no events are starred right now.
          </StatusMessage>
        )}

        {starred.length === 0 ? (
          <section className="dashboard-empty dashboard-onboard" aria-labelledby="onboard-heading">
            <span className="onboard-icon" aria-hidden="true"><i className="ti ti-star" /></span>
            <h2 id="onboard-heading">Build your dashboard</h2>
            <p>
              Star an event to build your dashboard. Use <strong>Choose events</strong> above — its tools will appear here, grouped by event.
            </p>
            <button type="button" className="dashboard-hero-link" onClick={onAllTools}>
              Browse every tool
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </section>
        ) : (
          <div className="dashboard-event-sections">
            {starred.map((eventId) => (
              <EventToolSection
                key={eventId}
                eventId={eventId}
                event={EVENT_REGISTRY[eventId]}
                starred
                onStar={onStar}
                onOpenModule={onOpenModule}
                onOpenCompiler={onOpenCompiler}
              />
            ))}
          </div>
        )}

        <GeneralToolSection tools={generalTools} onOpenGeneral={onOpenGeneral} />
      </div>

      <aside className="dashboard-rail">
        <DashboardTracker sources={scopedSources} onOpenCompiler={onOpenCompiler} />
      </aside>
    </div>
  );
}
