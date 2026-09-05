import { useEffect, useRef } from "react";

function ConfirmationModal({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  processingLabel = "Processing...",
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    // Remember the element that opened the modal so focus can be
    // returned to it when the modal closes.
    previouslyFocusedElementRef.current = document.activeElement;

    const modalElement = modalRef.current;

    if (!modalElement) {
      return undefined;
    }

    const getFocusableElements = () =>
      Array.from(
        modalElement.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    // Move focus into the modal when it opens.
    // Prefer the non-destructive action.
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    } else {
      modalElement.focus();
    }

    const handleKeyDown = (event) => {
      // Allow Escape to dismiss the modal when no action is processing.
      if (event.key === "Escape" && !isProcessing) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Trap Shift + Tab at the beginning of the modal.
      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      // Trap Tab at the end of the modal.
      if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Return focus to the control that originally opened the modal.
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [show, isProcessing, onCancel]);

  if (!show) {
    return null;
  }

  return (
    <>
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="confirmation-modal-title"
                className="modal-title fs-5"
              >
                {title}
              </h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
                disabled={isProcessing}
              />
            </div>

            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>

            <div className="modal-footer">
              <button
                ref={cancelButtonRef}
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={isProcessing}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={onConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? processingLabel : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

export default ConfirmationModal;