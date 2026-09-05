import { useEffect, useRef, useState } from "react";

function RejectLeaveModal({
  show,
  request,
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const [reason, setReason] = useState("");

  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!show || !request) {
      return undefined;
    }

    // Remember the control that opened the modal so focus can
    // return to it when the modal closes.
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
    // Prefer the safe/non-destructive action.
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    } else {
      modalElement.focus();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isProcessing) {
        event.preventDefault();
        setReason("");
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
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [show, request, isProcessing, onCancel]);

  if (!show || !request) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    onConfirm(reason.trim());
    setReason("");
  }

  function handleCancel() {
    setReason("");
    onCancel();
  }

  return (
    <>
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-leave-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2
                  className="modal-title fs-5"
                  id="reject-leave-modal-title"
                >
                  Reject Leave Request
                </h2>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCancel}
                  disabled={isProcessing}
                />
              </div>

              <div className="modal-body">
                <p>
                  Reject leave request for{" "}
                  <strong>
                    {request.user.first_name}{" "}
                    {request.user.surname}
                  </strong>
                  ?
                </p>

                <div className="mb-3">
                  <label
                    htmlFor="rejection-reason"
                    className="form-label"
                  >
                    Reason for rejection (optional)
                  </label>

                  <textarea
                    id="rejection-reason"
                    className="form-control"
                    rows="3"
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value)
                    }
                    disabled={isProcessing}
                    placeholder="Enter a reason for rejecting this request"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  Keep Pending
                </button>

                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Rejecting..."
                    : "Reject Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

export default RejectLeaveModal;