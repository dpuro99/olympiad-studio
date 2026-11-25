import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * A small in-app confirmation dialog. It mirrors the objective-review modal's
 * focus contract, but stays deliberately lightweight for one-decision actions
 * like adding or removing a starred event.
 */
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  openerRef
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const opener = openerRef?.current;
    const focusFrame = window.requestAnimationFrame(() => cancelRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
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
      if (opener?.isConnected) opener.focus();
    };
  }, [onCancel, openerRef]);

  return createPortal(
    <div className="confirm-layer" onPointerDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="confirm-backdrop"
        aria-label="Cancel confirmation"
        tabIndex={-1}
        onClick={onCancel}
      />
      <section
        ref={dialogRef}
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <span className="confirm-icon" aria-hidden="true">
          <i className="ti ti-star" />
        </span>
        <h2 id="confirm-dialog-title" className="confirm-title">{title}</h2>
        <p id="confirm-dialog-description" className="confirm-description">{description}</p>
        <div className="confirm-actions">
          <button
            ref={cancelRef}
            type="button"
            className="confirm-button confirm-button-secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-button confirm-button-primary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
