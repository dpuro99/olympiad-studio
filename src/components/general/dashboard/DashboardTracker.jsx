import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpText,
  SelectField,
  StatusMessage,
  TextField
} from '../ui/primitives.jsx';
import { LEVEL_LABELS, STATUS_LABELS } from '../referenceCompilerUtils.js';
import {
  buildObjectiveTracker,
  filterObjectiveRows
} from './objectiveTrackerUtils.js';

const chipStyle = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-full)',
  fontSize: 11, fontWeight: 600, border: '1px solid var(--color-border-tertiary)',
  background: 'var(--color-background-tertiary)', color: 'var(--color-text-secondary)'
};

function statusChip(status) {
  return <span style={chipStyle}>{STATUS_LABELS[status]}</span>;
}

function ProgressStat({ label, value, hint, actionLabel, onAction }) {
  return (
    <div role="group" aria-label={label} className={`dashboard-stat${onAction ? ' dashboard-stat-action' : ''}`}>
      <span className="dashboard-stat-value">{value}</span>
      <span className="dashboard-stat-label">{label}</span>
      {hint && <span className="dashboard-stat-hint">{hint}</span>}
      {onAction && (
        <button
          type="button"
          className="dashboard-stat-action-btn"
          onClick={onAction}
          aria-label={actionLabel}
          title={actionLabel}
        >
          Open compiler
          <i className="ti ti-arrow-up-right" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function ObjectiveRows({ rows, onOpenCompiler }) {
  if (rows.length === 0) {
    return <HelpText>No objectives match these filters. Clear the search or choose another status.</HelpText>;
  }
  return (
    <div className="objective-review-table-wrap">
      <table className="objective-review-table">
        <caption>
          {rows.length} objective{rows.length === 1 ? '' : 's'} from the compilers' manual-derived outlines
        </caption>
        <thead>
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Objective</th>
            <th scope="col">Status</th>
            <th scope="col">Notes</th>
            <th scope="col" aria-label="Open compiler" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const objective = row.objective;
            const key = `${row.eventId}:${objective.id}`;
            return (
              <tr key={key}>
                <td>{row.eventName}</td>
                <td>
                  <div className="objective-review-objective">{objective.label}</div>
                  <div className="objective-review-group">
                    {objective.groupLabel} · {LEVEL_LABELS[objective.level] || LEVEL_LABELS.core}
                  </div>
                </td>
                <td>{statusChip(objective.status)}</td>
                <td className="objective-review-count">
                  {objective.blockCount}
                  {objective.needsEvidence && <div className="objective-review-warning">Confident, no note yet</div>}
                </td>
                <td>
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => onOpenCompiler(row.eventId, objective.id)}
                    aria-label={`Open ${objective.label} in ${row.eventName} compiler`}
                  >
                    Open
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The full table lives in a real modal, not at the bottom of the dashboard.
 * It is portalled to the body so the sticky nav cannot paint over it, and it
 * keeps the same read-only rollup and deep links as the rail.
 */
function ObjectiveReviewDialog({
  rows,
  statusFilter,
  onStatusChange,
  query,
  onQueryChange,
  onClose,
  onOpenCompiler,
  openerRef
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = openerRef?.current;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      opener?.focus();
    };
  }, [onClose, openerRef]);

  return createPortal(
    <div className="objective-review-layer">
      <button
        type="button"
        className="objective-review-backdrop"
        aria-label="Close objective review"
        tabIndex={-1}
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        className="objective-review-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="objective-review-heading"
      >
        <header className="objective-review-head">
          <div>
            <p className="dashboard-eyebrow">Study progress</p>
            <h2 id="objective-review-heading">Review all objectives</h2>
            <p className="dashboard-subtitle">
              Read-only statuses from the Reference &amp; Study Compiler sheets saved in this browser.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="objective-review-close"
            onClick={onClose}
            aria-label="Close objective review"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </header>

        <div className="objective-review-filters">
          <SelectField label="Status" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <TextField
            label="Find an objective"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search objective or group"
          />
        </div>

        <ObjectiveRows rows={rows} onOpenCompiler={onOpenCompiler} />
      </section>
    </div>,
    document.body
  );
}

/**
 * A compact, read-only study rollup embedded in the dashboard rail. It reads
 * only the scoped compilers' saved sheets; an unreadable or stale sheet is
 * announced rather than reported as empty.
 */
export default function DashboardTracker({ sources, onOpenCompiler }) {
  const keys = useMemo(() => sources.map((source) => source.config.storageKey), [sources]);
  const keysSignature = keys.join('|');
  const [stored, setStored] = useState({});
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const reads = {};
      let unavailable = false;
      for (const source of sources) {
        try {
          const value = window.localStorage.getItem(source.config.storageKey);
          if (value) reads[source.eventId] = value;
        } catch {
          // A denied read must never be presented as an empty browser.
          unavailable = true;
        }
      }
      setStorageUnavailable(unavailable);
      setStored(reads);
    }, 0);
    return () => window.clearTimeout(timer);
    // keysSignature changes only when the set of scoped compilers changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature]);

  const tracker = useMemo(() => buildObjectiveTracker(sources, stored), [sources, stored]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const reviewButtonRef = useRef(null);
  const closeReview = useCallback(() => setReviewOpen(false), []);
  const rows = useMemo(
    () => filterObjectiveRows(tracker.events, { status: statusFilter, query }),
    [tracker.events, statusFilter, query]
  );
  const showEventTag = sources.length > 1;

  return (
    <section className="dashboard-tracker-panel" aria-labelledby="study-progress-heading">
      <div className="dashboard-tracker-head">
        <div>
          <h2 id="study-progress-heading" className="dashboard-tracker-title">Study progress</h2>
          <p className="dashboard-subtitle">
            From sheets you saved in the Reference &amp; Study Compiler. Unsaved edits don't appear here.
          </p>
        </div>
        <span className="dashboard-stage-chip">Read only</span>
      </div>

      {storageUnavailable && (
        <StatusMessage tone="error">This browser blocked reading saved sheets, so these counts may be incomplete.</StatusMessage>
      )}
      {tracker.totals.unreadable > 0 && (
        <StatusMessage tone="error">
          {tracker.totals.unreadable} saved sheet{tracker.totals.unreadable === 1 ? '' : 's'} could not be read here. Open the compiler to recover it.
        </StatusMessage>
      )}
      {tracker.totals.seasonMismatches > 0 && (
        <StatusMessage tone="error">
          {tracker.totals.seasonMismatches} sheet{tracker.totals.seasonMismatches === 1 ? '' : 's'} were saved under another manual. Review them before relying on these counts.
        </StatusMessage>
      )}

      <div className="dashboard-stats">
        <ProgressStat label="Studying" value={tracker.totals.studying} />
        <ProgressStat label="Confident" value={tracker.totals.confident} />
        <ProgressStat label="Need evidence" value={tracker.totals.needsEvidence} hint="confident, no note" />
        <ProgressStat
          label="Saved sheets"
          value={`${tracker.totals.savedSheets}/${tracker.totals.events}`}
          actionLabel="Open Chemistry Lab Reference and Study Compiler"
          onAction={() => onOpenCompiler('chemlab')}
        />
      </div>

      <div className="dashboard-focus-block">
        <div className="dashboard-focus-head">Next to focus</div>
        {tracker.focus.length === 0 ? (
          <HelpText>Every objective has a confident mark and a note. Nice work.</HelpText>
        ) : (
          <ol className="dashboard-focus-list" aria-label="Suggested next objectives">
            {tracker.focus.slice(0, 4).map((row) => (
              <li key={`${row.eventId}:${row.objective.id}`}>
                <div className="dashboard-focus-main">
                  <span className="dashboard-focus-objective">{row.objective.label}</span>
                  {showEventTag && <span style={chipStyle}>{row.eventName}</span>}
                  {statusChip(row.objective.status)}
                </div>
                <button
                  type="button"
                  className="breadcrumb-link dashboard-focus-open"
                  onClick={() => onOpenCompiler(row.eventId, row.objective.id)}
                  aria-label={`Focus on ${row.objective.label} in ${row.eventName} compiler`}
                >
                  Focus
                  <i className="ti ti-arrow-up-right" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="dashboard-review">
        <button
          ref={reviewButtonRef}
          type="button"
          className="dashboard-review-trigger"
          onClick={() => setReviewOpen(true)}
        >
          <span>Review all objectives</span>
          <span className="dashboard-review-count">{rows.length}</span>
          <i className="ti ti-arrow-up-right" aria-hidden="true" />
        </button>
      </div>

      {reviewOpen && (
        <ObjectiveReviewDialog
          rows={rows}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          query={query}
          onQueryChange={setQuery}
          onClose={closeReview}
          onOpenCompiler={onOpenCompiler}
          openerRef={reviewButtonRef}
        />
      )}
    </section>
  );
}
