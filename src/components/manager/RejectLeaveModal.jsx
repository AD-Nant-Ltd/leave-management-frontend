import { useState } from "react";

function RejectLeaveModal({
  show,
  request,
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const [reason, setReason] = useState("");

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