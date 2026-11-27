import { useEffect, useRef, useState } from 'react';
import { EVENT_REGISTRY } from '../../events/registry.js';
import { GENERAL_TOOL_REGISTRY } from '../generalToolRegistry.js';
import EventToolSection from './EventToolSection.jsx';
import GeneralToolSection from './GeneralToolSection.jsx';
import {
  CATALOG_SCOPES,
  CATALOG_TOOL_TYPES,
  catalogCounts,
  filterCatalog
} from './catalogUtils.js';

/**
 * The catalog page: a persistent filter rail beside the full event feed.
 * Filtering still runs over the same registry data; the sidebar only changes
 * which journeys are passed to the shared event section.
 */
export default function AllTools({ profile, onStar, onOpenModule, onOpenGeneral, onOpenCompiler, onDashboard }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [toolType, setToolType] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtersButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const sections = filterCatalog(EVENT_REGISTRY, {
    query,
    scope,
    toolType,
    starred: profile.starredEventIds
  }, GENERAL_TOOL_REGISTRY);
  const counts = catalogCounts(sections);
  const hasFilters = query.trim() !== '' || scope !== 'all' || toolType !== 'all';

  const clearFilters = () => {
    setQuery('');
    setScope('all');
    setToolType('all');
  };

  // The mobile drawer is a real focus stop: Escape closes it, focus starts on
  // the close button, Tab stays inside, and the Filters button gets focus back.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const drawer = drawerRef.current;
    const opener = filtersButtonRef.current;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    // The drawer lives under a transformed page wrapper; lowering the nav keeps
    // the modal above it and makes its controls unclickable while open.
    document.body.classList.add('catalog-drawer-open');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Keep a native type="search" Escape from silently clearing the query.
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;

      const focusable = Array.from(drawer.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((node) => node.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      document.body.classList.remove('catalog-drawer-open');
      opener?.focus();
    };
  }, [drawerOpen]);

  const filters = (
    <>
      <div className="catalog-sidebar-header">
        <div>
          <h2 id="catalog-filters-heading" className="catalog-sidebar-title">Filter Tools</h2>
          <p className="catalog-result-count" role="status">
            {counts.events} {counts.events === 1 ? 'event' : 'events'} · {counts.tools} {counts.tools === 1 ? 'tool' : 'tools'}
          </p>
          <button
            type="button"
            className="catalog-reset-link"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Reset
          </button>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="catalog-drawer-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close filters"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="catalog-fields">
        <div className="catalog-field">
          <span className="catalog-field-label" aria-hidden="true">Search</span>
          <div className="catalog-search">
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events or tools..."
              aria-label="Search events and tools"
            />
            {query && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="catalog-field">
          <span className="catalog-field-label" aria-hidden="true">Division &amp; scope</span>
          <div className="catalog-filter-group" role="group" aria-label="Event scope">
            {CATALOG_SCOPES.map((option) => (
              <button
                key={option.id}
                type="button"
                className="catalog-pill"
                aria-pressed={scope === option.id}
                onClick={() => setScope(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-field">
          <span className="catalog-field-label" aria-hidden="true">Tool type</span>
          <div className="catalog-filter-group" role="group" aria-label="Tool type">
            {CATALOG_TOOL_TYPES.map((option) => (
              <button
                key={option.id}
                type="button"
                className="catalog-pill"
                aria-pressed={toolType === option.id}
                onClick={() => setToolType(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="catalog-sidebar-footer">
        <button
          type="button"
          className="catalog-clear-all-button"
          onClick={clearFilters}
          disabled={!hasFilters}
        >
          Clear all filters
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-page all-tools-page">
      <aside
        id="catalog-filters"
        ref={drawerRef}
        className={`catalog-sidebar${drawerOpen ? ' is-open' : ''}`}
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen ? 'true' : undefined}
        aria-labelledby="catalog-filters-heading"
      >
        <div className="catalog-sidebar-inner">{filters}</div>
      </aside>

      <button
        type="button"
        className="catalog-drawer-backdrop"
        aria-label="Close filter drawer"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={() => setDrawerOpen(false)}
      />

      <div className="catalog-main" id="catalog-feed">
        <header className="catalog-main-header">
          <div className="catalog-header-copy">
            <h1 className="dashboard-title">All Tools</h1>
            <p className="dashboard-subtitle catalog-subtitle">
              Find the right tool for the event you are studying. Star an event to copy its tools onto your dashboard.
            </p>
          </div>
          <div className="catalog-main-actions">
            <button
              ref={filtersButtonRef}
              type="button"
              className="catalog-mobile-filters"
              aria-controls="catalog-filters"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <i className="ti ti-filter" aria-hidden="true" />
              Filters
            </button>
            <button type="button" className="dashboard-hero-link catalog-back" onClick={onDashboard}>
              <i className="ti ti-arrow-left" aria-hidden="true" />
              Dashboard
            </button>
          </div>
        </header>

        {sections.length > 0 ? (
          <div className="dashboard-event-sections catalog-sections">
            {sections.map((section) => section.kind === 'general' ? (
              <GeneralToolSection
                key="general"
                tools={section.tools}
                catalog
                onOpenGeneral={onOpenGeneral}
              />
            ) : (
              <EventToolSection
                key={section.eventId}
                eventId={section.eventId}
                event={section.event}
                steps={section.steps}
                catalog
                starred={profile.starredEventIds.includes(section.eventId)}
                onStar={onStar}
                onOpenModule={onOpenModule}
                onOpenCompiler={onOpenCompiler}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty catalog-empty" role="status">
            <i className="ti ti-search" aria-hidden="true" />
            <div>
              <strong>No tools match these filters.</strong>
              <span>Try another search, or reset the filters to see the full catalog.</span>
            </div>
            <button type="button" className="dashboard-hero-link" onClick={clearFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
