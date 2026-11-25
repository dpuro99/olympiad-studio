import { useEffect, useRef, useState } from 'react';

/**
 * One nav-bar popover: labelled trigger, dialog panel, Escape/outside-click
 * close, and focus returned to the trigger. Children may be a function that
 * receives `close` so panel actions can dismiss it after acting.
 */
export default function NavPopover({ label, panelLabel, trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={`nav-popover nav-popover-${align}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`app-nav-btn nav-popover-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <div className="nav-popover-panel" role="dialog" aria-label={panelLabel}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
