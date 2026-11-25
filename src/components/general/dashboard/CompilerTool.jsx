import { EVENT_REGISTRY } from '../../events/registry.js';
import { OBJECTIVE_TRACKER_SOURCES } from './objectiveTrackerSources.js';

/**
 * One full-screen compiler surface for all six study events. The event
 * switcher changes only which config the shared compiler renders — it never
 * moves sheet data between events, because each config owns its own storage key.
 */
export default function CompilerTool({ eventId, onOpenCompiler, onBack }) {
  const sources = OBJECTIVE_TRACKER_SOURCES;
  const currentId = sources.some((source) => source.eventId === eventId)
    ? eventId
    : sources[0].eventId;

  const moduleFor = (id) => Object.values(EVENT_REGISTRY)
    .flatMap((event) => event.modules)
    .find((module) => module.id === `${id}-reference-compiler`);

  const activeModule = moduleFor(currentId);
  const Compiler = activeModule?.component;

  return (
    <>
      <section className="dashboard-band" aria-label="Compiler event selection" style={{ marginBottom: 18 }}>
        <div className="dashboard-band-head">
          <div>
            <p className="dashboard-subtitle">
              Build the notes sheet or binder you're allowed to bring. Choose which event you're compiling below.
            </p>
          </div>
          <label className="compiler-switch" htmlFor="compiler-event-select">
            <span>Compiler event</span>
            <select
              id="compiler-event-select"
              value={currentId}
              onChange={(event) => onOpenCompiler(event.target.value)}
            >
              {sources.map((source) => (
                <option key={source.eventId} value={source.eventId}>{source.eventName}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {Compiler ? (
        <Compiler mod={activeModule} />
      ) : (
        <div className="dashboard-empty" role="alert">
          <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 22, color: 'var(--color-text-warning)' }} />
          <strong>That compiler isn't available.</strong>
          <span>The event's compiler module could not be found in the registry.</span>
          <button type="button" className="breadcrumb-link dashboard-inline-action" onClick={onBack}>
            Back to your page
          </button>
        </div>
      )}
    </>
  );
}
