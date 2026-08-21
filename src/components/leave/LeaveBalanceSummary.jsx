import { Link } from "react-router-dom";

function LeaveBalanceSummary({
  balance,
  title = "Leave Balance",
  showEmployeeActions = false,
}) {
  return (
    <section aria-labelledby="leave-balance-heading">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 id="leave-balance-heading" className="h4 mb-0">
          {title}
        </h2>

        {showEmployeeActions && (
          <div className="d-flex gap-2">
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
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Annual Allowance</h3>
              <p className="fs-3 mb-0">
                {balance.annual_allowance}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Leave Taken</h3>
              <p className="fs-3 mb-0">
                {balance.days_used}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h6">Remaining Leave</h3>
              <p className="fs-3 mb-0">
                {balance.days_remaining}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LeaveBalanceSummary;