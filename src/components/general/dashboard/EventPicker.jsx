import { EVENT_REGISTRY } from '../../events/registry.js';
import { scopedEventIds } from './profileUtils.js';
import NavPopover from '../nav/NavPopover.jsx';

/**
 * The event chooser lives on the Dashboard, not in the nav bar. Every row is
 * one button: icon, name and division all toggle that event's starred state.
 */
export default function EventPicker({ profile, onStar }) {
  const allIds = Object.keys(EVENT_REGISTRY);
  const starred = scopedEventIds(profile, allIds);
  const starredSet = new Set(starred);

  const eventRow = (eventId) => {
    const event = EVENT_REGISTRY[eventId];
    const isStarred = starredSet.has(eventId);
    return (
      <button
        type="button"
        className="scope-row"
        key={eventId}
        aria-label={`${isStarred ? 'Unstar' : 'Star'} ${event.name}`}
        aria-pressed={isStarred}
        onClick={() => onStar(eventId)}
      >
        <span className="scope-star" aria-hidden="true">
          <i className={`ti ${isStarred ? 'ti-star-filled' : 'ti-star'}`} />
        </span>
        <span className={`scope-name picker-name${isStarred ? ' is-starred' : ''}`}>
          {event.name}
          <span className="picker-name-meta">Div {event.division}</span>
        </span>
      </button>
    );
  };

  return (
    <NavPopover
      label={`Choose events (${starred.length})`}
      panelLabel="Choose events"
      align="left"
      trigger={
        <>
          <i className="ti ti-star" aria-hidden="true" />
          <span className="picker-trigger-label">Choose events</span>
          <span className="picker-count">{starred.length}</span>
          <i className="ti ti-chevron-down" aria-hidden="true" />
        </>
      }
    >
      {() => (
        <div className="picker-panel">
          <div className="scope-section-label">My Events ({starred.length})</div>
          {starred.length === 0
            ? <p className="scope-hint">Nothing starred yet. Star an event below to begin.</p>
            : starred.map(eventRow)}
          <div className="scope-section-label">All events</div>
          {allIds.filter((eventId) => !starredSet.has(eventId)).map(eventRow)}
        </div>
      )}
    </NavPopover>
  );
}
