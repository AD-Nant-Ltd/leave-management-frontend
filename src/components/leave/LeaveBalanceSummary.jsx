import { Link } from "react-router-dom";

function LeaveBalanceSummary({
  balance,
  title = "Leave Balance",
  showEmployeeActions = false,
}) {
  return (
    <section
      className="content-section"
      aria-labelledby="leave-balance-heading"
    >
      <div className="section-header">
        <h2 id="leave-balance-heading" className="section-title">
          {title}
        </h2>

        {showEmployeeActions && (
          <div className="d-flex flex-wrap gap-2">
            <Link
              to="/leave/requests"
              className="btn btn-outline-primary"
            >
              My Requests
            </Link>

            <Link
              to="/leave/request"
              className="btn btn-primary"
            >
              Request Leave
            </Link>
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h3 className="summary-card-label">
              Annual Allowance
            </h3>
            <p className="summary-card-value">
              {balance.annual_allowance}
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h3 className="summary-card-label">
              Leave Taken
            </h3>
            <p className="summary-card-value">
              {balance.days_used}
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h3 className="summary-card-label">
              Remaining Leave
            </h3>
            <p className="summary-card-value">
              {balance.days_remaining}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeaveBalanceSummary;