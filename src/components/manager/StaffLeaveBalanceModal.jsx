import LeaveBalanceSummary from "../leave/LeaveBalanceSummary";

function StaffLeaveBalanceModal({
  show,
  employee,
  balance,
  isLoading,
  error,
  onClose,
}) {
  if (!show || !employee) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-leave-balance-modal-title"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2
                id="staff-leave-balance-modal-title"
                className="modal-title fs-5"
              >
                {employee.first_name} {employee.surname} - Leave Balance
              </h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Close staff leave balance"
                onClick={onClose}
                disabled={isLoading}
              />
            </div>

            <div className="modal-body">
              {isLoading && (
                <p className="mb-0">
                  Loading staff leave balance...
                </p>
              )}

              {error && (
                <div
                  className="alert alert-danger mb-0"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {!isLoading && !error && balance && (
                <LeaveBalanceSummary
                  balance={balance}
                  title="Leave Balance"
                />
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

export default StaffLeaveBalanceModal;